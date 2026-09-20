
import React from 'react';
import { BellIcon, BellSlashIcon } from './BellIcon';
import { SkullIcon } from './SkullIcon';

interface ExtraControlsProps {
    showFavoritesOnly: boolean;
    onShowFavoritesOnlyChange: (value: boolean) => void;
    isSoundEnabled: boolean;
    onIsSoundEnabledChange: (value: boolean) => void;
    favoritesCount: number;
    hideKilled: boolean;
    onHideKilledChange: (value: boolean) => void;
    onResetKilled: () => void;
}

export const ExtraControls: React.FC<ExtraControlsProps> = ({
    showFavoritesOnly,
    onShowFavoritesOnlyChange,
    isSoundEnabled,
    onIsSoundEnabledChange,
    favoritesCount,
    hideKilled,
    onHideKilledChange,
    onResetKilled
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-x-6 gap-y-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
                <label htmlFor="hide-killed-toggle" className="flex items-center cursor-pointer select-none group">
                    <span className="mr-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        Ocultar Mortos
                    </span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="hide-killed-toggle"
                            className="sr-only"
                            checked={hideKilled}
                            onChange={(e) => onHideKilledChange(e.target.checked)}
                        />
                        <div className={`block w-11 h-6 rounded-full transition-colors ${hideKilled ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform duration-300 ease-in-out"
                             style={{ transform: hideKilled ? 'translateX(125%)' : 'translateX(0)' }}></div>
                    </div>
                </label>

                <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer select-none group">
                    <span className="mr-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        Apenas Favoritos ({favoritesCount})
                    </span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="favorites-toggle"
                            className="sr-only"
                            checked={showFavoritesOnly}
                            onChange={(e) => onShowFavoritesOnlyChange(e.target.checked)}
                        />
                        <div className={`block w-11 h-6 rounded-full transition-colors ${showFavoritesOnly ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform duration-300 ease-in-out"
                             style={{ transform: showFavoritesOnly ? 'translateX(125%)' : 'translateX(0)' }}></div>
                    </div>
                </label>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onResetKilled}
                    title="Resetar todos os bosses mortos"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 hover:border-red-500/50 text-slate-300 hover:text-red-400 rounded-lg transition-all text-sm font-bold shadow-sm"
                >
                    <SkullIcon isKilled={false} className="w-4 h-4" />
                    Resetar Mortos
                </button>

                <button
                    onClick={() => onIsSoundEnabledChange(!isSoundEnabled)}
                    aria-label={isSoundEnabled ? "Desativar alertas sonoros" : "Ativar alertas sonoros"}
                    className={`p-2 rounded-lg border transition-all duration-200 shadow-sm ${
                        isSoundEnabled
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    {isSoundEnabled ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};
