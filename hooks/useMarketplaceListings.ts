import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketplaceCharacter, CLASS_NAMES, NftStatus } from '../types/marketplace';

// listType (rodada 7): CONFIRMADO AO VIVO que 'sale' devolve listagens ativas
// (item plano, com sealedDT = data do anúncio) e que 'recent'/'topTraded'
// devolvem NFTs JÁ VENDIDOS (item vem envolto em {seller, info}, com
// info.tradeDT = data da venda) — duas coisas bem diferentes, apesar de
// ambas passarem por este mesmo endpoint. 'recommended' também é do tipo
// "à venda" (mesmo shape plano de 'sale').
export type MarketplaceListType = 'sale' | 'recent' | 'topTraded';

export interface MarketplaceFilters {
  classId: number; // 0 = todas
  levMin: number;
  levMax: number;
  priceMin: number;
  priceMax: number;
  powerMin: number;
  powerMax: number;
  sort: 'latest' | 'priceAsc' | 'priceDesc' | 'powerAsc' | 'powerDesc';
  listType: MarketplaceListType;
}

export const DEFAULT_FILTERS: MarketplaceFilters = {
  classId: 0,
  levMin: 0,
  levMax: 0,
  priceMin: 0,
  priceMax: 0,
  powerMin: 0,
  powerMax: 0,
  sort: 'latest',
  listType: 'sale',
};

interface RawStatEntry {
  statName: string;
  statValue: number;
}

// Shape "plano" (listType=sale/recommended).
interface RawListItemFlat {
  nftID: string;
  seq: number;
  transportID: number;
  characterName: string;
  class: number;
  lv: number;
  powerScore: number;
  price: number;
  sealedDT: number;
  stat?: RawStatEntry[];
}

// Shape "vendido" (listType=recent/topTraded) — vem envolto em info/seller.
interface RawListItemSold {
  info: {
    nftID: string;
    seq: number;
    transportID: number;
    characterName: string;
    class: number;
    lv: number;
    powerScore: number;
    price: number;
    tradeDT: number;
    stat?: RawStatEntry[];
  };
  seller?: { worldName?: string };
}

type RawListItem = RawListItemFlat | RawListItemSold;

function mapStats(stat?: RawStatEntry[]): MarketplaceCharacter['stats'] {
  if (!stat || stat.length === 0) return null;
  const find = (name: string) => stat.find(s => s.statName === name)?.statValue ?? 0;
  return {
    hp: find('HP'),
    mp: find('MP'),
    physAtk: find('PHYS ATK'),
    spellAtk: find('Spell ATK'),
    physDef: find('PHYS DEF'),
    spellDef: find('Spell DEF'),
  };
}

function mapRawItem(r: RawListItem, status: NftStatus): MarketplaceCharacter {
  const src = 'info' in r ? r.info : r;
  return {
    nftID: src.nftID,
    seq: src.seq,
    transportID: src.transportID,
    characterName: src.characterName,
    classId: src.class,
    className: CLASS_NAMES[src.class] ?? 'Desconhecida',
    level: src.lv,
    powerScore: src.powerScore,
    priceWemix: src.price,
    sealedDT: 'sealedDT' in src ? src.sealedDT : 0,
    stats: mapStats(src.stat),
    status,
    tradeDT: 'tradeDT' in src ? src.tradeDT : null,
  };
}

// Depois de quantas páginas buscadas sem preencher a cota mínima o
// auto-load-more desiste — evita um loop de requisições sem fim quando o
// filtro escolhido pelo usuário simplesmente não tem nenhum personagem
// correspondente em nenhuma página (ex.: Power Score mín. maior que o
// mais forte já listado).
const MAX_AUTO_LOAD_PAGES = 15;
const MIN_RESULTS_TARGET = 12;

/**
 * Busca listagens do marketplace (paginado), com suporte a "carregar mais".
 * Reseta a paginação sempre que os filtros mudam.
 */
export function useMarketplaceListings(filters: MarketplaceFilters) {
  const [characters, setCharacters] = useState<MarketplaceCharacter[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita condição de corrida se o usuário mudar o filtro enquanto uma
  // requisição anterior ainda está em andamento.
  const requestId = useRef(0);
  const autoLoadAttempts = useRef(0);

  const fetchPage = useCallback(async (targetPage: number, replace: boolean) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        listType: filters.listType,
        class: String(filters.classId),
        // levMin/levMax funcionam no servidor (confirmado ao vivo) — ainda
        // mandamos, é só que também refiltramos no cliente abaixo como
        // segunda camada de segurança (ver comentário do filtro).
        levMin: String(filters.levMin),
        levMax: String(filters.levMax),
        priceMin: String(filters.priceMin),
        priceMax: String(filters.priceMax),
        // powerMin/powerMax NÃO têm efeito no servidor (confirmado ao vivo,
        // ver useEffect abaixo) — mandamos mesmo assim (não faz mal), mas o
        // filtro real acontece no cliente.
        powerMin: String(filters.powerMin),
        powerMax: String(filters.powerMax),
        sort: 'latest', // ordenação client-side abaixo, cobre price/power também
        page: String(targetPage),
      });

      // cache: 'no-store' (rodada 8) — o usuário relatou que trocar de aba
      // (À venda/Vendidos recentemente/Maiores vendas) às vezes não
      // atualizava a lista. Não achamos bug de estado no React (o fetch já
      // muda de URL por completo a cada aba, então por padrão o navegador
      // já trataria como uma requisição nova), mas forçar no-store elimina
      // de vez qualquer chance de o navegador (ou um proxy local do
      // `netlify dev`) servir uma resposta antiga em cache pra essa URL.
      const res = await fetch(`/.netlify/functions/xdraco-lists?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erro ${res.status} ao buscar listagens`);
      const json = await res.json();

      if (currentRequestId !== requestId.current) return; // resposta obsoleta, ignora

      if (json.code !== 200) throw new Error('API do marketplace retornou erro');

      const status: NftStatus = filters.listType === 'sale' ? 'sale' : 'sold';
      const mapped = (json.data.lists as RawListItem[]).map((it) => mapRawItem(it, status));
      setCharacters(prev => (replace ? mapped : [...prev, ...mapped]));
      setHasMore(Boolean(json.data.more));
      setTotalCount(json.data.totalCount ?? null);
      setPage(targetPage);
    } catch (err) {
      if (currentRequestId === requestId.current) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  // Refaz a busca do zero sempre que os filtros mudam
  useEffect(() => {
    autoLoadAttempts.current = 0;
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.classId, filters.levMin, filters.levMax, filters.priceMin, filters.priceMax, filters.powerMin, filters.powerMax, filters.sort, filters.listType]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPage(page + 1, false);
    }
  }, [fetchPage, page, isLoading, hasMore]);

  // Ordenação client-side (a API só ordena por "latest" de forma confiável)
  const sortedCharacters = [...characters].sort((a, b) => {
    if (filters.sort === 'priceAsc') return a.priceWemix - b.priceWemix;
    if (filters.sort === 'priceDesc') return b.priceWemix - a.priceWemix;
    if (filters.sort === 'powerAsc') return a.powerScore - b.powerScore;
    if (filters.sort === 'powerDesc') return b.powerScore - a.powerScore;
    return 0; // 'latest' já vem ordenado da API
  });

  // Filtro no CLIENTE, de propósito, pra power E level:
  // - Power: testado ao vivo (curl direto em webapi.mir4global.com/nft/lists)
  //   — powerMin/powerMax NÃO têm nenhum efeito no servidor, sempre volta o
  //   mesmo total independente deles.
  // - Level: levMin/levMax funcionam no servidor na maioria dos casos, mas
  //   refiltrar aqui também é uma segunda camada de segurança sem custo —
  //   garante que nunca aparece personagem fora da faixa escolhida, mesmo
  //   se algum dia a API mudar de comportamento.
  const filteredCharacters = sortedCharacters.filter((c) => {
    if (filters.powerMin > 0 && c.powerScore < filters.powerMin) return false;
    if (filters.powerMax > 0 && c.powerScore > filters.powerMax) return false;
    if (filters.levMin > 0 && c.level < filters.levMin) return false;
    if (filters.levMax > 0 && c.level > filters.levMax) return false;
    return true;
  });

  // Como o filtro real acontece depois de já ter buscado a página, uma
  // página inteira pode "sumir" mesmo havendo mais personagens compatíveis
  // nas páginas seguintes. Busca automaticamente mais páginas até atingir
  // a cota mínima de resultados — mas com um limite de tentativas, pra não
  // martelar a API pra sempre quando o filtro não bate com nada.
  const usingNarrowFilter = filters.powerMin > 0 || filters.powerMax > 0 || filters.levMin > 0 || filters.levMax > 0;
  useEffect(() => {
    if (
      usingNarrowFilter &&
      !isLoading &&
      hasMore &&
      filteredCharacters.length < MIN_RESULTS_TARGET &&
      autoLoadAttempts.current < MAX_AUTO_LOAD_PAGES
    ) {
      autoLoadAttempts.current += 1;
      fetchPage(page + 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingNarrowFilter, isLoading, hasMore, filteredCharacters.length, page]);

  return { characters: filteredCharacters, isLoading, error, hasMore, totalCount, loadMore };
}
