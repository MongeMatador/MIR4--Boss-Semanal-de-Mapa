import React, { useMemo, useState } from 'react';
import { useServerTransfers } from '../../hooks/useServerTransfers';
import { TabErrorBoundary } from '../PlayerLookup/ErrorBoundary';
import { REGIONS, REGION_NAMES } from '../../constants/regions';

type Direction = 'all' | 'in' | 'out';

const ResultsList: React.FC<{ worldgroup: string; world: string; direction: Direction }> = ({ worldgroup, world, direction }) => {
  const { transfers, isLoading, error } = useServerTransfers(worldgroup, world);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Carregando transferências...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar as transferências agora.</div>;
  }

  const target = `-${world}`;
  const filtered = transfers.filter((t) => {
    const entering = t.newServer?.endsWith(target) || t.newServer === world;
    const leaving = t.oldServer?.endsWith(target) || t.oldServer === world;
    if (direction === 'in') return entering;
    if (direction === 'out') return leaving;
    return entering || leaving;
  });

  if (filtered.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8 italic">Nenhuma transferência encontrada para {worldgroup}/{world} com esse filtro.</p>;
  }

  return (
    <div className="space-y-1.5">
      {filtered.map((t, i) => {
        const entering = t.newServer?.endsWith(target) || t.newServer === world;
        return (
          <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
            <div className="min-w-0">
              <span className="text-slate-200 font-medium">{t.name}</span>
              <span className="text-slate-500"> · {t._class}</span>
              <span className="text-slate-500"> · Power {t.power}</span>
              <span className="text-slate-500"> · Clã: {t.oldClan} → {t.newClan}</span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entering ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {entering ? 'ENTROU' : 'SAIU'}
              </span>
              <span className="text-slate-400">{t.oldServer} → {t.newServer}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const TransfersPage: React.FC = () => {
  const [region, setRegion] = useState('');
  const [server, setServer] = useState('');
  const [query, setQuery] = useState<{ worldgroup: string; world: string } | null>(null);
  const [direction, setDirection] = useState<Direction>('all');

  const serversForRegion = useMemo(() => (region ? REGIONS[region] ?? [] : []), [region]);

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setServer(''); // muda a região, zera o servidor escolhido — a lista antiga não vale mais
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !server) return;
    setQuery({ worldgroup: region, world: server });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Transferências diárias</h1>
      <p className="text-slate-400 text-sm mb-1">
        Veja quais jogadores entraram e quais saíram de um servidor — útil pra saber se algum
        concorrente ou inimigo migrou pro seu servidor, e pra onde foi quem saiu.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
        >
          <option value="">Selecione a região</option>
          {REGION_NAMES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={server}
          onChange={(e) => setServer(e.target.value)}
          disabled={!region}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        >
          <option value="">{region ? 'Selecione o servidor' : 'Escolha a região primeiro'}</option>
          {serversForRegion.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!region || !server}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Buscar
        </button>
      </form>

      {query && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">{query.worldgroup}/{query.world}</h2>
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
              {(['all', 'in', 'out'] as Direction[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${direction === d ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {d === 'all' ? 'Todos' : d === 'in' ? 'Entradas' : 'Saídas'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <TabErrorBoundary label="Transferências" key={`${query.worldgroup}-${query.world}`}>
              <ResultsList worldgroup={query.worldgroup} world={query.world} direction={direction} />
            </TabErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
