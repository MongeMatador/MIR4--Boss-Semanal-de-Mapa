import React, { useState } from 'react';
import {
  useItemMarket,
  DEFAULT_ITEM_MARKET_FILTERS,
  ItemMarketFilters,
  ItemMarketServer,
  ITEM_CATEGORIES,
  ITEM_GRADES,
  ITEM_TIERS,
  ITEM_CLASSES,
} from '../../hooks/useItemMarket';
import { GRADE_COLORS } from '../../types/marketplace';
import { REGION_NAMES } from '../../constants/regions';

// Tradução dos nomes de item pra português: investigado nesta rodada e NÃO é
// possível a partir dos dados públicos disponíveis — o próprio JSON do
// item-market só traz `engilishItemName` e `chinessItemName` (confirmado ao
// vivo), sem nenhum campo em português. Fazer isso exigiria montar um
// dicionário EN→PT manual (arriscado de ficar incompleto/errado com +4.800
// itens diferentes) — por pedido explícito do usuário ("se não for possível,
// deixe assim mesmo"), a tela continua mostrando o nome em inglês.

// Mesmo tratamento visual de raridade usado no Marketplace de personagens
// (CharacterDetailModal) — glow mais forte pra lendário (grade 5, amarelo
// puro), pra manter consistência visual entre as duas telas do site.
const GRADE_GLOW: Record<number, string> = {
  1: 'shadow-[inset_0_0_10px_rgba(148,163,184,0.3)] bg-gradient-to-br from-slate-700/40 to-slate-900',
  2: 'shadow-[inset_0_0_12px_rgba(34,197,94,0.4)] bg-gradient-to-br from-green-900/50 to-slate-900',
  3: 'shadow-[inset_0_0_12px_rgba(59,130,246,0.45)] bg-gradient-to-br from-blue-900/50 to-slate-900',
  4: 'shadow-[inset_0_0_14px_rgba(168,85,247,0.5)] bg-gradient-to-br from-purple-900/50 to-slate-900',
  5: 'shadow-[inset_0_0_20px_rgba(250,204,21,0.8)] bg-gradient-to-br from-yellow-500/30 to-slate-900',
};

const GRADE_NAMES: Record<number, string> = { 1: 'Comum', 2: 'Incomum', 3: 'Raro', 4: 'Épico', 5: 'Lendário' };

function formatPrice(p: number) {
  return p.toLocaleString('pt-BR');
}

export const ItemMarketPage: React.FC = () => {
  const [filters, setFilters] = useState<ItemMarketFilters>(DEFAULT_ITEM_MARKET_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const { items, page, totalPages, totalElements, isLoading, error, goToPage } = useItemMarket(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, query: searchInput.trim() }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Item Market</h1>
      <p className="text-slate-400 text-sm mb-6">
        Listagens de itens avulsos em todos os servidores — armas, armaduras, pedras místicas,
        materiais e mais. {totalElements !== null && `${totalElements.toLocaleString('pt-BR')} itens no total.`}
      </p>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Filtros</h2>
        <form onSubmit={handleSearch} className="mb-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nome do item... (ex.: Sword, Mythic Ring)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Servidor</label>
            <select
              value={filters.server}
              onChange={(e) => setFilters((f) => ({ ...f, server: e.target.value as ItemMarketServer }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="">Todos os servidores</option>
              {REGION_NAMES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={filters.tabCategory}
              onChange={(e) => setFilters((f) => ({ ...f, tabCategory: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="">Todas as categorias</option>
              {ITEM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Nota</label>
            <select
              value={filters.grade}
              onChange={(e) => setFilters((f) => ({ ...f, grade: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="">Todas as notas</option>
              {ITEM_GRADES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Nível</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="">Todos os níveis</option>
              {ITEM_TIERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1" title="Só afeta itens de equipamento com classe restrita — manuais, materiais e pedras mágicas aparecem sempre, pois não têm classe associada.">
              Aula
            </label>
            <select
              value={filters.classCode}
              onChange={(e) => setFilters((f) => ({ ...f, classCode: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="">Todas as turmas</option>
              {ITEM_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Ordenar por</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as ItemMarketFilters['sortBy'] }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="lastUpdated">Mais recentes</option>
              <option value="price">Preço</option>
              <option value="grade">Grade</option>
              <option value="tier">Tier</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Ordem</label>
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, asc: !f.asc }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 text-left"
            >
              {filters.asc ? '↑ Baixo → Alto' : '↓ Alto → Baixo'}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-slate-500 text-[11px]" title="A 'Aula' é filtrada aqui no navegador (o servidor não tem esse filtro) — pode demorar um instante extra na primeira vez que é escolhida.">
            {filters.classCode ? 'Filtro de Aula aplicado no navegador — itens sem classe restrita continuam aparecendo.' : ''}
          </p>
          <button
            type="button"
            onClick={() => { setFilters(DEFAULT_ITEM_MARKET_FILTERS); setSearchInput(''); }}
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12 text-slate-400">Carregando itens...</div>}
      {error && <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar o mercado agora.</div>}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 hover:border-cyan-500 transition-colors">
                <div className={`relative w-full aspect-square rounded-lg border-2 mb-2 overflow-hidden ${GRADE_COLORS[item.grade] ?? 'border-slate-600'} ${GRADE_GLOW[item.grade] ?? 'bg-slate-900'}`}>
                  <img
                    src={item.imgPath}
                    alt={item.engilishItemName}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
                  <span className="absolute top-1 right-1 bg-slate-950/80 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">T{item.tier}</span>
                </div>
                <p className="text-slate-200 text-xs font-medium truncate" title={item.engilishItemName}>{item.engilishItemName}</p>
                <p className="text-slate-500 text-[10px] mb-1">{GRADE_NAMES[item.grade] ?? '—'} · {item.server}</p>
                <p className="text-amber-400 font-bold text-sm">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <p className="text-slate-400">Nenhum item encontrado para essa busca.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mb-8">
            <button type="button" disabled={page <= 0} onClick={() => goToPage(page - 1)} className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300">← Anterior</button>
            <span className="text-slate-500 text-xs">Página {page + 1}{totalPages !== null && ` de ${totalPages}`}</span>
            <button type="button" disabled={totalPages !== null && page + 1 >= totalPages} onClick={() => goToPage(page + 1)} className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300">Próxima →</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemMarketPage;
