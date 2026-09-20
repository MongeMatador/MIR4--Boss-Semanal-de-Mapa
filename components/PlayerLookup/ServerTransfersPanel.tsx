import React from 'react';
import { useServerTransfers } from '../../hooks/useServerTransfers';

interface Props {
  worldgroup: string;
  world: string;
}

// Lista de transferências recentes de entrada/saída de um servidor
// (endpoint /api/transfers/{worldgroup}/{world} do mir4tracker.xyz,
// confirmado ao vivo — ver netlify/functions/mir4tracker-transfers.js).
export const ServerTransfersPanel: React.FC<Props> = ({ worldgroup, world }) => {
  const { transfers, isLoading, error } = useServerTransfers(worldgroup, world);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Carregando transferências...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-6">Não foi possível carregar as transferências agora.</div>;
  }
  if (transfers.length === 0) {
    return <p className="text-slate-500 text-sm italic">Nenhuma transferência registrada recentemente para este servidor.</p>;
  }

  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto">
      {transfers.map((t, i) => {
        const enteringHere = t.newServer?.endsWith(`-${world}`) || t.newServer === world;
        return (
          <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <div className="min-w-0">
              <span className="text-slate-200 font-medium">{t.name}</span>
              <span className="text-slate-500"> · {t._class}</span>
              <span className="text-slate-500"> · Power {t.power}</span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 text-slate-400">
              <span className={enteringHere ? 'text-red-400' : 'text-emerald-400'}>{t.oldServer}</span>
              <span>→</span>
              <span className={enteringHere ? 'text-emerald-400' : 'text-red-400'}>{t.newServer}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
