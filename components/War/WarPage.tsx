import React, { useState } from 'react';
import { useWarData } from '../../hooks/useWarData';
import { useHiddenValley, ValleyHolder } from '../../hooks/useHiddenValley';
import { TabErrorBoundary } from '../PlayerLookup/ErrorBoundary';

function formatTimestamp(ts: number | null) {
  if (!ts) return null;
  try {
    return new Date(ts * 1000).toLocaleString('pt-BR');
  } catch {
    return null;
  }
}

const SiegeTable: React.FC<{ type: 'castle' | 'sabuk' }> = ({ type }) => {
  const { results, rounds, fetchedAt, isLoading, error } = useWarData(type);
  const [serverFilter, setServerFilter] = useState('');

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Carregando dados de guerra...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar os dados agora. Tente novamente em instantes.</div>;
  }
  if (results.length === 0) {
    return <div className="text-slate-500 text-sm text-center py-8">Nenhum dado disponível no momento.</div>;
  }

  const filtered = serverFilter.trim()
    ? results.filter((r) => r.server.toLowerCase().includes(serverFilter.trim().toLowerCase()))
    : results;

  const sorted = [...filtered].sort((a, b) => b.power - a.power);
  const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <input
          type="text"
          value={serverFilter}
          onChange={(e) => setServerFilter(e.target.value)}
          placeholder="Filtrar por servidor (ex.: NA011, ASIA034)"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 sm:w-72"
        />
        <p className="text-slate-500 text-xs">
          {sorted.length} clãs
          {latestRound && type === 'sabuk' && ` · última rodada conhecida: ${latestRound.name}`}
          {fetchedAt && ` · atualizado ${formatTimestamp(fetchedAt)}`}
        </p>
      </div>

      <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
        {sorted.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${r.isCastle ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-slate-200 font-medium truncate" title={r.clan}>
                  {r.clan}
                  {r.isCastle && <span className="ml-1.5 text-amber-400">🏰 Dono do castelo</span>}
                  {r.newEntry && <span className="ml-1.5 text-emerald-400">Novo</span>}
                </p>
                <p className="text-slate-500">
                  Líder {r.leader} · Nv.{r.level} · {r.member} membros · {r.server}
                  {r.gateway !== undefined && ` · Portão ${r.gateway}`}
                </p>
              </div>
            </div>
            <p className="text-amber-400 font-bold flex-shrink-0">{r.power.toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ZONE_LABELS: { key: 'bicheon' | 'redMoon' | 'snakePit'; label: string; icon: string }[] = [
  { key: 'bicheon', label: 'Bicheon', icon: '🌊' },
  { key: 'redMoon', label: 'Lua Vermelha', icon: '🌕' },
  { key: 'snakePit', label: 'Covil da Serpente', icon: '🐍' },
];

const ZoneHolder: React.FC<{ holder: ValleyHolder | null }> = ({ holder }) => {
  if (!holder) {
    return <p className="text-slate-600 text-[11px] italic">Sem detentor no momento</p>;
  }
  return (
    <div>
      <p className="text-slate-200 font-medium truncate" title={holder.clan}>
        {holder.clan}
        {holder.isNew && <span className="ml-1.5 text-emerald-400 text-[10px]">Novo</span>}
      </p>
      <p className="text-slate-500 text-[11px]">
        Líder {holder.leader} · Nv.{holder.level} · {holder.members} membros
      </p>
      <p className="text-amber-400 font-bold text-xs">{holder.power.toLocaleString('pt-BR')}</p>
    </div>
  );
};

const ValleyTable: React.FC = () => {
  const { servers, captureDate, fetchedAt, isLoading, error } = useHiddenValley();
  const [serverFilter, setServerFilter] = useState('');

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Carregando dados do Vale Oculto...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar os dados agora. Tente novamente em instantes.</div>;
  }
  if (servers.length === 0) {
    return <div className="text-slate-500 text-sm text-center py-8">Nenhum dado disponível no momento.</div>;
  }

  const filtered = serverFilter.trim()
    ? servers.filter((s) => s.server.toLowerCase().includes(serverFilter.trim().toLowerCase()))
    : servers;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <input
          type="text"
          value={serverFilter}
          onChange={(e) => setServerFilter(e.target.value)}
          placeholder="Filtrar por servidor (ex.: NA011, ASIA034)"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 sm:w-72"
        />
        <p className="text-slate-500 text-xs">
          {filtered.length} servidores
          {captureDate && ` · captura: ${captureDate}`}
          {fetchedAt && ` · atualizado ${formatTimestamp(fetchedAt)}`}
        </p>
      </div>

      <div className="space-y-2 max-h-[32rem] overflow-y-auto">
        {filtered.map((s) => (
          <div key={s.server} className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-300 font-semibold text-sm mb-2">{s.server}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ZONE_LABELS.map(({ key, label, icon }) => (
                <div key={key} className="bg-slate-800/60 rounded-lg p-2">
                  <p className="text-slate-400 text-[11px] font-semibold mb-1">{icon} {label}</p>
                  <ZoneHolder holder={s[key]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'castle' | 'sabuk' | 'valley'>('castle');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Guerra: Castelo, Sabuk &amp; Vale</h1>
      <p className="text-slate-400 text-sm mb-6">
        Situação atual do Cerco ao Castelo, do Cerco de Sabuk e do Vale Oculto em todos os servidores — quem
        controla cada área e o poder de combate de cada clã.
      </p>

      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('castle')}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'castle' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          🏰 Cerco ao Castelo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sabuk')}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'sabuk' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          ⚔️ Cerco de Sabuk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('valley')}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'valley' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          🗺️ Vale Oculto
        </button>
      </div>

      <TabErrorBoundary label="Guerra" key={activeTab}>
        {activeTab === 'valley' ? <ValleyTable /> : <SiegeTable type={activeTab} />}
      </TabErrorBoundary>
    </div>
  );
};

export default WarPage;
