import { useState, useEffect, useCallback, useRef } from 'react';

export interface ItemMarketEntry {
  chinessItemName: string;
  engilishItemName: string;
  grade: number;
  id: number;
  imgPath: string;
  itemType: number;
  itemUID: string;
  lastUpdated: string;
  mainType: number;
  price: number;
  saleQuantity: string;
  server: string;
  tabCategory: number;
  tier: string;
}

// server = filtro de continente/região (worldgroup) — CONFIRMADO AO VIVO em
// 2026-09-19 (rodada 6) que o endpoint upstream aceita esse parâmetro e
// filtra de fato (totalElements muda e bate exatamente com a soma de todos
// os worldgroups) — ver comentário em mir4tracker-item-market.js.
export type ItemMarketServer = '' | 'NA1' | 'EU1' | 'ASIA1' | 'ASIA2' | 'ASIA3' | 'SA1' | 'INMENA1';

// Categoria (tabCategory) — CONFIRMADO AO VIVO em 2026-09-19 (rodada 7),
// testando tabCategory=1..24 e observando o(s) item(ns) reais retornados em
// cada valor. Só os códigos abaixo tinham listagens no momento do teste;
// os demais (1, 10, 13-16, 18, 19, 23, 24) voltaram 0 itens — podem
// simplesmente estar vazios agora, ou ser categorias sem uso — não incluídos
// pra não inventar um rótulo sem evidência real.
export const ITEM_CATEGORIES: { value: string; label: string }[] = [
  { value: '2', label: 'Arma' },
  { value: '3', label: 'Armadura' },
  { value: '4', label: 'Acessório' },
  { value: '5', label: 'Pílula (Yin/Yang)' },
  { value: '6', label: 'Consumível' },
  { value: '7', label: 'Item Especial' },
  { value: '8', label: 'Pedra Mágica' },
  { value: '9', label: 'Material' },
  { value: '11', label: 'Montaria' },
  { value: '12', label: 'Manual de Habilidade' },
  { value: '17', label: 'Material de Aprimoramento' },
  { value: '20', label: 'Arma Secundária' },
  { value: '21', label: 'Peça Mística' },
  { value: '22', label: 'Artefato de Dragão' },
];

export const ITEM_GRADES: { value: string; label: string }[] = [
  { value: '1', label: 'Comum' },
  { value: '2', label: 'Incomum' },
  { value: '3', label: 'Raro' },
  { value: '4', label: 'Épico' },
  { value: '5', label: 'Lendário' },
];

export const ITEM_TIERS: { value: string; label: string }[] = [
  { value: '1', label: 'T1' },
  { value: '2', label: 'T2' },
  { value: '3', label: 'T3' },
  { value: '4', label: 'T4' },
];

// Aula/Classe — NÃO existe como parâmetro server-side deste endpoint
// (testado ao vivo, ver comentário em mir4tracker-item-market.js). O
// próprio mir4tracker filtra isso no CLIENTE, detectando a classe pelo
// nome do arquivo do ícone do item (padrão `_Pc{letra}_`, ex.:
// "Item_Equip_Pcw_01" = Warrior). Replicado aqui com a mesma tabela
// (`IM_CLASS_CODE_MAP` no `app.js` deles). Itens sem código de classe
// detectável no ícone (manuais, materiais, pedras mágicas, etc.) não têm
// restrição de classe e aparecem em qualquer filtro selecionado — mesma
// regra "soft pass" que eles usam.
const CLASS_CODE_MAP: Record<string, string> = {
  PCW: 'Warrior',
  PCM: 'Sorcerer',
  PCT: 'Taoist',
  PCZ: 'Lancer',
  PCA: 'Arbalist',
  PCD: 'Darkist',
  PCL: 'Lionheart',
};

export const ITEM_CLASSES: { value: string; label: string }[] = [
  { value: 'Warrior', label: 'Guerreiro' },
  { value: 'Sorcerer', label: 'Feiticeiro' },
  { value: 'Taoist', label: 'Taoísta' },
  { value: 'Lancer', label: 'Lanceiro' },
  { value: 'Arbalist', label: 'Arcobalista' },
  { value: 'Darkist', label: 'Darkista' },
  { value: 'Lionheart', label: 'Coração de Leão' },
];

function detectItemClass(imgPath: string): string | null {
  const m = /_(Pc[a-z])_/i.exec(imgPath || '');
  if (!m) return null;
  return CLASS_CODE_MAP[m[1].toUpperCase()] ?? null;
}

export interface ItemMarketFilters {
  query: string;
  sortBy: 'price' | 'lastUpdated' | 'grade' | 'tier';
  asc: boolean;
  server: ItemMarketServer;
  tabCategory: string; // '' = todas
  grade: string; // '' = todas
  tier: string; // '' = todas
  classCode: string; // '' = todas — filtrado no CLIENTE (ver detectItemClass)
}

export const DEFAULT_ITEM_MARKET_FILTERS: ItemMarketFilters = {
  query: '',
  sortBy: 'lastUpdated',
  asc: false,
  server: '',
  tabCategory: '',
  grade: '',
  tier: '',
  classCode: '',
};

const PAGE_SIZE = 30;
// Quando um filtro de classe está ativo, pedimos um lote bem maior de uma
// vez (mesma técnica do próprio mir4tracker, que usa 2000 — aqui um teto
// menor pra não estourar o tempo/tamanho de resposta da Netlify Function) e
// paginamos localmente depois de filtrar.
const CLASS_FILTER_BATCH_SIZE = 300;

// Mercado de itens avulsos (armas, armaduras, pedras, etc.), via
// /.netlify/functions/mir4tracker-item-market — proxy confirmado ao vivo de
// /api/item-market do mir4tracker.xyz (CORS fechado, por isso o proxy).
export function useItemMarket(filters: ItemMarketFilters) {
  const [items, setItems] = useState<ItemMarketEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [totalElements, setTotalElements] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  // Guarda o lote grande já filtrado por classe, pra paginar localmente sem
  // rebuscar a cada "Próxima" — só refaz a busca quando o filtro muda.
  const classFilteredCache = useRef<ItemMarketEntry[]>([]);

  const fetchPage = useCallback((targetPage: number) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    const hasClassFilter = Boolean(filters.classCode);

    const qs = new URLSearchParams({
      query: filters.query,
      sortBy: filters.sortBy,
      asc: String(filters.asc),
      // Com filtro de classe ativo, buscamos um lote grande (page 0) e
      // paginamos localmente; sem ele, usamos a paginação nativa do
      // upstream normalmente.
      page: hasClassFilter ? '0' : String(targetPage),
      size: hasClassFilter ? String(CLASS_FILTER_BATCH_SIZE) : String(PAGE_SIZE),
    });
    if (filters.server) qs.set('server', filters.server);
    if (filters.tabCategory) qs.set('tabCategory', filters.tabCategory);
    if (filters.grade) qs.set('grade', filters.grade);
    if (filters.tier) qs.set('tier', filters.tier);

    fetch(`/.netlify/functions/mir4tracker-item-market?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (currentRequestId !== requestId.current) return;
        const content: ItemMarketEntry[] = Array.isArray(data?.content) ? data.content : [];

        if (hasClassFilter) {
          // Filtro "soft pass": itens sem classe detectável no ícone
          // (manuais, materiais, pedras mágicas...) aparecem em qualquer
          // classe escolhida — mesma regra do próprio mir4tracker.
          const matched = content.filter((it) => {
            const detected = detectItemClass(it.imgPath);
            return detected === null || detected === filters.classCode;
          });
          classFilteredCache.current = matched;
          const start = targetPage * PAGE_SIZE;
          setItems(matched.slice(start, start + PAGE_SIZE));
          setTotalElements(matched.length);
          setTotalPages(Math.max(1, Math.ceil(matched.length / PAGE_SIZE)));
        } else {
          setItems(content);
          setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : null);
          setTotalElements(typeof data?.totalElements === 'number' ? data.totalElements : null);
        }
        setPage(targetPage);
      })
      .catch((err) => {
        if (currentRequestId === requestId.current) setError(err instanceof Error ? err.message : 'Erro ao buscar itens');
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query, filters.sortBy, filters.asc, filters.server, filters.tabCategory, filters.grade, filters.tier, filters.classCode]);

  const goToPage = useCallback((p: number) => {
    if (p < 0) return;
    if (filters.classCode) {
      // Já temos o lote inteiro filtrado em cache — só reagina localmente.
      if (totalPages !== null && p >= totalPages) return;
      const start = p * PAGE_SIZE;
      setItems(classFilteredCache.current.slice(start, start + PAGE_SIZE));
      setPage(p);
      return;
    }
    if (totalPages !== null && p >= totalPages) return;
    fetchPage(p);
  }, [fetchPage, totalPages, filters.classCode]);

  return { items, page, totalPages, totalElements, isLoading, error, goToPage };
}
