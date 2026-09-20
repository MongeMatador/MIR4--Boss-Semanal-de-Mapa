
import React from 'react';
import { BossSpawn } from '../types';
import { StarIcon } from './StarIcon';
import { SkullIcon } from './SkullIcon';
import { ClipboardIcon } from './ClipboardIcon';

interface BossTableProps {
    bosses: BossSpawn[];
    favoritedBosses: Set<string>;
    onToggleFavorite: (bossName: string) => void;
    killedBosses: Set<string>;
    onToggleKilled: (bossNames: string[]) => void;
}

export const BossTable: React.FC<BossTableProps> = ({ bosses, favoritedBosses, onToggleFavorite, killedBosses, onToggleKilled }) => {
    
    const copySingle = (boss: BossSpawn) => {
        const text = `${boss.time} - ${boss.bossesString} (W${boss.map}) @ ${boss.location}`;
        navigator.clipboard.writeText(text);
    };

    if (bosses.length === 0) {
        // This case should ideally not be hit if the parent component handles filtering,
        // but it's a good fallback.
        return null;
    }

    return (
        <div className="mt-6">
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-hidden shadow-xl rounded-xl border border-slate-700 bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/80">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Mapa</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Camada</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Localização</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Bosses</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Horário</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Respawn</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-cyan-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 bg-slate-800">
                            {bosses.map((boss, index) => {
                                const isKilled = boss.bosses.some(b => killedBosses.has(b));
                                const isNext = index === 0 && !isKilled;
                                const rowClasses = `
                                    transition-colors duration-200 
                                    ${isKilled ? 'bg-slate-900/40 opacity-60' : (isNext ? 'bg-emerald-900/10' : 'hover:bg-slate-700/30')}
                                `;
                                const textClasses = isKilled ? 'line-through decoration-slate-500' : '';

                                return (
                                    <tr key={boss.id} className={rowClasses}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded font-bold text-xs ${isKilled ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-slate-300'}`}>
                                                W{boss.map}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${boss.tier === 1 ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>
                                                Camada {boss.tier}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClasses} ${isKilled ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {boss.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                {boss.bosses.map(b => (
                                                    <div key={b} className="flex items-center gap-2 group">
                                                        <button onClick={() => onToggleFavorite(b)} className="focus:outline-none transform hover:scale-110 transition-transform">
                                                            <StarIcon isFavorite={favoritedBosses.has(b)} />
                                                        </button>
                                                        <span className={`text-sm font-semibold ${isKilled ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-cyan-300 transition-colors'}`}>
                                                            {b}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClasses} ${isKilled ? 'text-slate-500' : 'text-slate-300'}`}>
                                            {boss.time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-mono font-bold text-sm px-2 py-1 rounded ${isKilled ? 'text-slate-500 bg-slate-800' : 'text-emerald-400 bg-emerald-900/20'}`}>
                                                {boss.countdown}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => copySingle(boss)}
                                                    className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                                                    title="Copiar"
                                                >
                                                    <ClipboardIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => onToggleKilled(boss.bosses)} 
                                                    className={`p-1.5 rounded-full transition-all ${isKilled ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-slate-500 hover:text-red-400 hover:bg-slate-700'}`}
                                                    title={isKilled ? "Marcar como vivo" : "Marcar como morto"}
                                                >
                                                    <SkullIcon isKilled={isKilled} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-3">
                {bosses.map((boss, index) => {
                    const isKilled = boss.bosses.some(b => killedBosses.has(b));
                    const isNext = index === 0 && !isKilled;
                    
                    return (
                        <div 
                            key={boss.id} 
                            className={`
                                relative rounded-lg border p-4 shadow-lg transition-all
                                ${isKilled 
                                    ? 'bg-slate-900/50 border-slate-800 opacity-75' 
                                    : (isNext 
                                        ? 'bg-gradient-to-br from-slate-800 to-slate-800 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                                        : 'bg-slate-800 border-slate-700')
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center justify-center h-6 w-8 rounded text-xs font-bold ${isKilled ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-slate-200'}`}>
                                            W{boss.map}
                                        </span>
                                        <div className="text-sm font-medium text-slate-400 truncate max-w-[150px] sm:max-w-xs">
                                            {boss.location}
                                        </div>
                                    </div>
                                    <div className={`mt-1 ml-1 text-xs font-semibold uppercase tracking-wider ${isKilled ? 'text-slate-600' : 'text-slate-500'}`}>
                                        {boss.layer} • Camada {boss.tier}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <div className={`font-mono text-lg font-bold ${isKilled ? 'text-slate-600 line-through' : 'text-emerald-400'}`}>
                                        {boss.countdown}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                {boss.bosses.map(b => (
                                    <div key={b} className="flex items-center justify-between mb-1">
                                        <span className={`text-lg font-bold ${isKilled ? 'text-slate-600 line-through' : 'text-white'}`}>
                                            {b}
                                        </span>
                                        <button onClick={() => onToggleFavorite(b)} className="p-1">
                                            <StarIcon isFavorite={favoritedBosses.has(b)} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-2">
                                <div className="text-sm text-slate-500">
                                    Spawn: <span className="text-slate-300 font-medium">{boss.time}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => copySingle(boss)}
                                        className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-600 transition-colors"
                                    >
                                        <ClipboardIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => onToggleKilled(boss.bosses)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            isKilled 
                                                ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40' 
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-red-400'
                                        }`}
                                    >
                                        <SkullIcon isKilled={isKilled} className="w-5 h-5" />
                                        {isKilled ? 'Morto' : 'Matar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};