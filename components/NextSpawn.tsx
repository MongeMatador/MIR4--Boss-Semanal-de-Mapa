import React, { useState } from 'react';
import { BossSpawn } from '../types';
import { ClipboardIcon } from './ClipboardIcon';

interface NextSpawnProps {
    bosses: BossSpawn[];
    isImminent: boolean;
}

export const NextSpawn: React.FC<NextSpawnProps> = ({ bosses, isImminent }) => {
    const [copied, setCopied] = useState(false);

    if (bosses.length === 0) {
        return null; 
    }

    const firstBoss = bosses[0];

    // Create a text summary for discord/game chat
    const handleCopy = () => {
        const lines = bosses.map(b => `${b.time} - ${b.bossesString} (W${b.map})`);
        const text = `⚠️ Próximos Bosses:\n${lines.join('\n')}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const containerClasses = `
        relative overflow-hidden rounded-xl p-6 mb-6 shadow-2xl transition-all duration-500
        ${isImminent 
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]' 
            : 'bg-gradient-to-br from-slate-800 to-slate-800/80 border border-slate-700'}
    `;

    return (
        <div className={containerClasses.trim()}>
             {/* Background glow effect for imminent spawns */}
             {isImminent && (
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
            )}

            <div className="flex justify-between items-center mb-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold uppercase text-cyan-400 tracking-widest">
                        Próximos Spawns
                    </h2>
                    {isImminent && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                    )}
                 </div>
                 
                 {isImminent && (
                    <span className="text-xs font-bold uppercase text-yellow-300 bg-yellow-900/30 border border-yellow-700/50 px-3 py-1 rounded-full shadow-sm">
                        Spawn Iminente
                    </span>
                 )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex-grow space-y-4 w-full">
                    {bosses.map((boss) => (
                        <div key={boss.id} className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-slate-700/30 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded">W{boss.map}</span>
                                <p className="text-xl sm:text-2xl font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                                    {boss.bossesString}
                                </p>
                            </div>
                            <p className="text-sm text-slate-400">
                                em <span className="text-slate-300">{boss.location}</span>
                            </p>
                        </div>
                    ))}
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <div className="text-left md:text-right">
                        <p className={`text-4xl sm:text-5xl font-mono font-bold tracking-tighter ${isImminent ? 'text-yellow-400' : 'text-emerald-400'}`}>
                            {firstBoss.countdown}
                        </p>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            Horário: <span className="text-slate-200">{firstBoss.time}</span>
                        </p>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all text-sm font-medium group"
                        title="Copiar lista para o Discord"
                    >
                        <ClipboardIcon className={`w-4 h-4 ${copied ? 'text-emerald-400' : 'group-hover:text-cyan-400'}`} />
                        {copied ? 'Copiado!' : 'Copiar Info'}
                    </button>
                </div>
            </div>
        </div>
    );
};