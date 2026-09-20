import React, { useState } from 'react';
import { useGlobalBoard, useRegionList, useRegionNotables, CLASS_IDS } from '../../hooks/useGlobalRankings';
import { TabErrorBoundary } from '../PlayerLookup/ErrorBoundary';

const RANK_MOVE_BADGE: Record<string, string> = {
  up: '▲ subiu',
  new: '★ novo',
};

const GlobalBoardTab: React.FC = () => {
  const [classFilter, setClassFilter] = useState<string>('Overall');
  const [page, setPage] = useState(1);
  const classId = classFilter === 'Overall' ? null : CLASS_IDS[classFilter];
  const { entries, isLoading, error } = useGlobalBoard(classId, page);

  const changeClass = (c: string) => { setClassFilter(c); setPage(1); };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['Overall', ...Object.keys(CLASS_IDS)].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => changeClass(c)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${classFilter === c ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex items-center justify-center py-12 text-slate-400">Carregando ranking...</div>}
      {error && <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar o ranking agora.</div>}

      {!isLoading && !error && (
        <>
          <div className="space-y-1.5 max-h-[36rem] overflow-y-auto">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-8 text-amber-400 font-bold">#{e.rank}</span>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate" title={e.name}>
                      {e.name}
                      {e.rankMove && RANK_MOVE_BADGE[e.rankMove] && (
                        <span className="ml-1.5 text-emerald-400 text-[10px]">{RANK_MOVE_BADGE[e.rankMove]}</span>
                      )}
                    </p>
                    <p className="text-slate-500">{e.clan} · {e.server}</p>
                  </div>
                </div>
                <p className="text-slate-200 font-bold flex-shrink-0">{e.power}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300"
            >
              ← Anterior
            </button>
            <span className="text-slate-500 text-xs">Página {page}</span>
            <button
              type="button"
              disabled={entries.length < 100}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300"
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const RegionNotablesTab: React.FC = () => {
  const { regions } = useRegionList();
  const [region, setRegion] = useState<string | null>(null);
  const { players, captureDate, isLoading, error } = useRegionNotables(region);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${region === r.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {!region && <p className="text-slate-500 text-sm italic text-center py-8">Escolha uma região acima.</p>}
      {region && isLoading && <div className="flex items-center justify-center py-12 text-slate-400">Carregando...</div>}
      {region && error && <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar agora.</div>}
      {region && !isLoading && !error && (
        <>
          {captureDate && <p className="text-slate-500 text-xs mb-2">Captura: {captureDate}</p>}
          <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-8 text-amber-400 font-bold">#{p.rank}</span>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate" title={p.name}>{p.name}</p>
                    <p className="text-slate-500">{p.job} · {p.clan} · {p.server}</p>
                  </div>
                </div>
                <p className="text-slate-200 font-bold flex-shrink-0">{p.power.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const GlobalRankingsPage: React.FC = () => {
  const [tab, setTab] = useState<'board' | 'regions'>('board');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Global Rankings</h1>
      <p className="text-slate-400 text-sm mb-6">
        Top jogadores por Power Score em todos os servidores — ranking geral, por classe, ou os
        destaques de cada região.
      </p>

      <div className="flex border-b border-slate-700 mb-6">
        <button
          type="button"
          onClick={() => setTab('board')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'board' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          Global Board
        </button>
        <button
          type="button"
          onClick={() => setTab('regions')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'regions' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          Region Notables
        </button>
      </div>

      <TabErrorBoundary label="Global Rankings" key={tab}>
        {tab === 'board' ? <GlobalBoardTab /> : <RegionNotablesTab />}
      </TabErrorBoundary>
    </div>
  );
};

export default GlobalRankingsPage;
