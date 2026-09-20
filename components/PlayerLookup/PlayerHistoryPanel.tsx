import React, { useEffect } from 'react';
import { usePlayerHistory } from '../../hooks/usePlayerHistory';
import { PlayerProfile } from '../../types/history';

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('pt-BR');
  } catch {
    return d;
  }
}

interface Props {
  characterName: string;
  // A página de consulta avulsa (/consulta) precisa do `seq` mais recente
  // dentro de nftHistory pra tentar resolver o transportID e mostrar a aba
  // de Progressão também — em vez de duplicar o fetch, expomos o profile
  // já carregado aqui via callback.
  onProfileLoaded?: (profile: PlayerProfile | null) => void;
  // A página de consulta já mostra a fonte no cabeçalho — evita repetir o
  // aviso "via mir4tracker.xyz" dentro do próprio painel nesse contexto.
  hideSourceNote?: boolean;
}

// Painel de histórico (Power Score diário, preço/relistagem de NFT, level
// track, nomes anteriores, clã/servidor) — usado tanto no modal do
// Marketplace quanto na página de consulta avulsa (/consulta), já que os
// dois casos só precisam do NOME do personagem, não do seq/transportID.
export const PlayerHistoryPanel: React.FC<Props> = ({ characterName, onProfileLoaded, hideSourceNote }) => {
  const { profile, isLoading, error, notFound } = usePlayerHistory(characterName);

  useEffect(() => {
    onProfileLoaded?.(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Carregando histórico...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar o histórico agora. Tente novamente em instantes.</div>;
  }
  if (notFound || !profile) {
    return <div className="text-slate-500 text-sm text-center py-8">Nenhum histórico público encontrado para este nome.</div>;
  }

  const sortedPower = [...(profile.powerHistory || [])].sort((a, b) => a.localDate.localeCompare(b.localDate));
  const recentPower = sortedPower.slice(-15).reverse();
  const sortedNft = [...(profile.nftHistory || [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedLevel = [...(profile.levelTrack || [])].sort((a, b) => b.localDate.localeCompare(a.localDate));
  const sortedNames = [...(profile.nameTrack || [])].sort((a, b) => b.localDate.localeCompare(a.localDate));
  const sortedClanServer = [...(profile.clanServerHistory || [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {!hideSourceNote && (
        <p className="text-[11px] text-slate-500 italic">
          Status atual: <span className="text-slate-300">{profile.status}</span>.
          Preços no histórico de NFT refletem valor <strong>anunciado</strong> no evento, não necessariamente venda confirmada.
        </p>
      )}

      {(profile.currentPower !== null || profile.peakPower !== null) && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
            <p className="text-slate-500 text-xs">Power Score atual</p>
            <p className="text-slate-100 font-bold text-lg">{profile.currentPower?.toLocaleString('pt-BR') ?? '—'}</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
            <p className="text-slate-500 text-xs">Pico histórico</p>
            <p className="text-amber-400 font-bold text-lg">{profile.peakPower?.toLocaleString('pt-BR') ?? '—'}</p>
          </div>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Histórico de preço/relistagem de NFT ({sortedNft.length})</h3>
        {sortedNft.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Sem eventos de NFT registrados (pode ser a primeira listagem do personagem, ou ele nunca foi vendido como NFT).</p>
        ) : (
          <div className="space-y-2">
            {sortedNft.map((ev, i) => {
              const prevPrice = i < sortedNft.length - 1 ? Number(sortedNft[i + 1].price) : null;
              const price = Number(ev.price);
              const delta = prevPrice !== null && prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : null;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate" title={ev.name}>{ev.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(ev.date)} · Power {Number(ev.power).toLocaleString('pt-BR')}
                      {ev.totalCodex !== null && ev.totalCodex !== undefined && ` · Códex ${ev.totalCodex}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-amber-400 font-bold">{price.toLocaleString('pt-BR')} DRACO</p>
                    {delta !== null && (
                      <p className={`text-[11px] font-medium ${delta < 0 ? 'text-red-400' : delta > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {Math.abs(delta).toFixed(1)}% vs. evento anterior
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Power Score diário (últimos {recentPower.length} registros)</h3>
        {recentPower.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Sem histórico de Power Score.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 text-left"><th className="pb-1 pr-3">Data</th><th className="pb-1 pr-3">Power Score</th><th className="pb-1">Rank</th></tr>
              </thead>
              <tbody>
                {recentPower.map((p, i) => (
                  <tr key={i} className="border-t border-slate-800 text-slate-300">
                    <td className="py-1 pr-3">{formatDate(p.localDate)}</td>
                    <td className="py-1 pr-3">{p.powerScore.toLocaleString('pt-BR')}</td>
                    <td className="py-1">{p.rank ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {sortedLevel.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Histórico de nível ({sortedLevel.length})</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {sortedLevel.slice(0, 20).map((l, i) => (
              <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                {formatDate(l.localDate)}: {l.oldLevel} → {l.newLevel}
              </span>
            ))}
          </div>
        </section>
      )}

      {sortedNames.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Histórico de nomes ({sortedNames.length})</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {sortedNames.map((n, i) => (
              <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                {formatDate(n.localDate)}: {n.oldName} → {n.newName}
              </span>
            ))}
          </div>
        </section>
      )}

      {sortedClanServer.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Histórico de clã/servidor ({sortedClanServer.length})</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {sortedClanServer.map((c, i) => (
              <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                {formatDate(c.date)}: {c.clanFrom ?? '—'}@{c.serverFrom ?? '—'} → {c.clanTo ?? '—'}@{c.serverTo ?? '—'}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
