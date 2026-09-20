import React from 'react';
import { CLASS_NAMES } from '../../types/marketplace';
import { MarketplaceFilters } from '../../hooks/useMarketplaceListings';
import { RangeSlider } from './RangeSlider';

interface FilterBarProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
}

const labelClass = 'block text-sm font-medium text-slate-400 mb-1';
const selectClass = 'w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3';
const inputClass = selectClass;

// Faixas usadas nos controles deslizantes — level vai até 200 (limite atual
// do jogo) e power score até 1.000.000 (mesma faixa usada pelo próprio
// filtro oficial do XDRACO, ver screenshot de referência do usuário).
const LEVEL_MAX = 200;
const POWER_MAX = 1_000_000;

const LIST_TYPE_LABELS: Record<MarketplaceFilters['listType'], string> = {
  sale: 'À venda',
  recent: 'Vendidos recentemente',
  topTraded: 'Maiores vendas',
};

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const update = (patch: Partial<MarketplaceFilters>) => onChange({ ...filters, ...patch });

  return (
    <div>
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit mb-4">
        {(Object.keys(LIST_TYPE_LABELS) as MarketplaceFilters['listType'][]).map((lt) => (
          <button
            key={lt}
            type="button"
            onClick={() => update({ listType: lt })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filters.listType === lt ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {LIST_TYPE_LABELS[lt]}
          </button>
        ))}
      </div>
      <p className="text-slate-500 text-[11px] mb-4">
        {filters.listType === 'sale'
          ? 'Personagens anunciados agora, com preço fixo (o marketplace do MIR4 não usa leilão/lances — não encontramos status de "licitação em andamento" ou "sem lances" na API oficial).'
          : 'Vendas já concluídas — útil pra ver por quanto personagens parecidos realmente venderam, não só o que está sendo pedido.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className={labelClass}>Classe</label>
        <select
          className={selectClass}
          value={filters.classId}
          onChange={(e) => update({ classId: Number(e.target.value) })}
        >
          {Object.entries(CLASS_NAMES).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div>
            <label className={labelClass}>Preço mín. (WEMIX)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={filters.priceMin || ''}
              placeholder="0"
              onChange={(e) => update({ priceMin: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelClass}>Preço máx. (WEMIX)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={filters.priceMax || ''}
              placeholder="Sem limite"
              onChange={(e) => update({ priceMax: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 justify-center">
        <RangeSlider
          label="Level"
          min={0}
          max={LEVEL_MAX}
          step={1}
          valueMin={filters.levMin}
          valueMax={filters.levMax}
          onChange={(min, max) => update({ levMin: min, levMax: max })}
        />
        <RangeSlider
          label="Power Score"
          min={0}
          max={POWER_MAX}
          step={1000}
          valueMin={filters.powerMin}
          valueMax={filters.powerMax}
          onChange={(min, max) => update({ powerMin: min, powerMax: max })}
        />
      </div>

      <div>
        <label className={labelClass}>Ordenar por</label>
        <select
          className={selectClass}
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as MarketplaceFilters['sort'] })}
        >
          <option value="latest">Mais recentes</option>
          <option value="priceAsc">Menor preço</option>
          <option value="priceDesc">Maior preço</option>
          <option value="powerAsc">Menor Power Score</option>
          <option value="powerDesc">Maior Power Score</option>
        </select>

        {(filters.levMin > 0 || filters.levMax > 0 || filters.powerMin > 0 || filters.powerMax > 0) && (
          <button
            type="button"
            onClick={() => update({ levMin: 0, levMax: 0, powerMin: 0, powerMax: 0 })}
            className="mt-4 text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Limpar filtros de level/power
          </button>
        )}
      </div>
      </div>
    </div>
  );
};
