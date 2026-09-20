
import React, { useState, useMemo, FormEvent } from 'react';
import { BossRewards } from '../types';
import { LootIcon } from './LootIcon';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    bosses: string[];
    allRewards: BossRewards;
    onUpdateRewards: (bossName: string, newRewards: string[]) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, bosses, allRewards, onUpdateRewards }) => {
    const [newReward, setNewReward] = useState('');

    const rewardsToShow = useMemo(() => {
        // For spawns with multiple bosses, we merge their reward lists.
        const rewardSet = new Set<string>();
        bosses.forEach(bossName => {
            const bossLoot = allRewards[bossName] || [];
            bossLoot.forEach(item => rewardSet.add(item));
        });
        return Array.from(rewardSet).sort();
    }, [bosses, allRewards]);

    const handleAddReward = (e: FormEvent) => {
        e.preventDefault();
        if (!newReward.trim() || bosses.length === 0) return;

        // When adding a reward, we add it to the primary boss of the spawn group.
        const primaryBoss = bosses[0];
        const currentRewards = allRewards[primaryBoss] || [];
        
        // Avoid duplicates
        if (!currentRewards.map(r => r.toLowerCase()).includes(newReward.trim().toLowerCase())) {
            const updatedRewards = [...currentRewards, newReward.trim()];
            onUpdateRewards(primaryBoss, updatedRewards);
        }
        setNewReward('');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100 truncate pr-4">Recompensas de {bosses.join(', ')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    {rewardsToShow.length > 0 ? (
                        <ul className="space-y-2">
                            {rewardsToShow.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                                    <LootIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <span className="text-slate-200 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center text-slate-500 py-8">
                            <p>Nenhuma recompensa registrada para este boss ainda.</p>
                            <p className="text-sm">Seja o primeiro a adicionar uma!</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-900 sticky bottom-0">
                    <form onSubmit={handleAddReward} className="flex gap-2">
                        <input
                            type="text"
                            value={newReward}
                            onChange={e => setNewReward(e.target.value)}
                            placeholder="Adicionar nova recompensa..."
                            className="flex-grow bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3"
                        />
                        <button 
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            disabled={!newReward.trim()}
                        >
                            Adicionar
                        </button>
                    </form>
                    <p className="text-xs text-slate-500 mt-2">Sua contribuição fica salva no seu navegador.</p>
                </div>
            </div>
        </div>
    );
};
