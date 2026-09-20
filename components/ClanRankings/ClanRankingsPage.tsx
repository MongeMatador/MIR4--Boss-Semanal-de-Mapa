import React, { useMemo, useState } from 'react';
import { useClanRankingList, useClanPowerGrowth, useClanRankChanges } from '../../hooks/useClanRankings';
import { REGIONS, REGION_NAMES, MACRO_GROUPS, macroGroup } from '../../constants/regions';
import { TabErrorBoundary } from '../PlayerLookup/ErrorBoundary';

const ListTab: React.FC = () => {
  const [macro, setMacro] = useState('');
  const [world, setWorld] = useState('');
  const [server, setServer] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const worlds = useMemo(() => (macro ? REGION_NAMES.filter((w) => macroGroup(w) === macro) : REGION_NAMES), [macro]);
  const servers = useMemo(() => {
    if (world) return REGIONS[world] ?? [];
    if (macro) return worlds.flatMap((w) => REGIONS[w] ?? []);
    return [];
  }, [world, macro, worlds]);

  const scope = server ? `server:${server}` : world ? `world:${world}` : 'global';
  const { rankings, captureDate, isLoading, error } = useClanRankingList(scope);

  const changeMacro = (v: string) => { setMacro(v); setWorld(''); setServer(''); setPage(1); };
  const changeWorld = (v: string) => { setWorld(v); setServer(''); setPage(1); };
  const changeServer = (v: string) => { setServer(v); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(rankings.length / PAGE_SIZE));
  const pageItems = rankings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select value={macro} onChange={(e) => changeMacro(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">
          <option value="">Todas as regiões</option>
          {MACRO_GROUPS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={world} onChange={(e) => changeWorld(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">
          <option value="">Todos os worlds</option>
          {worlds.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={server} onChange={(e) => changeServer(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">
          <option value="">Todos os servidores</option>
          {servers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12 text-slate-400">Carregando clãs...</div>}
      {error && <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar agora.</div>}

      {!isLoading && !error && (
        <>
          <p className="text-slate-500 text-xs mb-2">
            {rankings.length.toLocaleString('pt-BR')} clãs{captureDate && ` · snapshot de ${captureDate}`}
          </p>
          <div className="space-y-1.5">
            {pageItems.map((r) => (
              <div key={`${r.rank}-${r.clan}`} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-10 text-amber-400 font-bold">#{r.rank}</span>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate" title={r.clan}>{r.clan}</p>
                    <p className="text-slate-500">Líder {r.leader} · {r.server}</p>
                  </div>
                </div>
                <p className="text-amber-400 font-bold flex-shrink-0">{r.power.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300">← Anterior</button>
            <span className="text-slate-500 text-xs">Página {page} de {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 text-slate-300">Próxima →</button>
          </div>
        </>
      )}
    </div>
  );
};

const GrowthTab: React.FC = () => {
  const { growth, isLoading, error } = useClanPowerGrowth();
  if (isLoading) return <div className="flex items-center justify-center py-12 text-slate-400">Carregando...</div>;
  if (error) return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar agora.</div>;
  return (
    <div className="space-y-1.5 max-h-[36rem] overflow-y-auto">
      {growth.map((g, i) => (
        <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="text-slate-200 font-medium truncate" title={g.clan}>{g.clan}</p>
            <p className="text-slate-500">Líder {g.leader} · rank atual #{g.currentRank}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-emerald-400 font-bold">+{g.gained.toLocaleString('pt-BR')}</p>
            <p className="text-slate-500 text-[11px]">{g.previousPower.toLocaleString('pt-BR')} → {g.currentPower.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChangesTab: React.FC = () => {
  const { climbers, isLoading, error } = useClanRankChanges();
  if (isLoading) return <div className="flex items-center justify-center py-12 text-slate-400">Carregando...</div>;
  if (error) return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar agora.</div>;
  return (
    <div className="space-y-1.5 max-h-[36rem] overflow-y-auto">
      {climbers.map((c, i) => (
        <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="text-slate-200 font-medium truncate" title={c.clan}>{c.clan}</p>
            <p className="text-slate-500">Líder {c.leader}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-emerald-400 font-bold">▲ {c.delta.toLocaleString('pt-BR')}</p>
            <p className="text-slate-500 text-[11px]">#{c.previousRank} → #{c.currentRank}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ClanRankingsPage: React.FC = () => {
  const [tab, setTab] = useState<'list' | 'growth' | 'changes'>('list');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Clan Rankings</h1>
      <p className="text-slate-400 text-sm mb-6">
        Todos os clãs por Power Score — snapshot diário, com quem mais cresceu e quem mais subiu de
        posição desde o snapshot anterior.
      </p>

      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        <button type="button" onClick={() => setTab('list')} className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${tab === 'list' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>Todos os clãs</button>
        <button type="button" onClick={() => setTab('growth')} className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${tab === 'growth' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>Maior crescimento</button>
        <button type="button" onClick={() => setTab('changes')} className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${tab === 'changes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>Maiores saltos de rank</button>
      </div>

      <TabErrorBoundary label="Clan Rankings" key={tab}>
        {tab === 'list' ? <ListTab /> : tab === 'growth' ? <GrowthTab /> : <ChangesTab />}
      </TabErrorBoundary>
    </div>
  );
};

export default ClanRankingsPage;
