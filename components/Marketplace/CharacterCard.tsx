import React from 'react';
import { MarketplaceCharacter } from '../../types/marketplace';

interface CharacterCardProps {
  character: MarketplaceCharacter;
  onClick: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-slate-800/70 border border-slate-700 rounded-xl p-4 hover:border-cyan-500 hover:bg-slate-800 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          character.status === 'sale' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/40 text-slate-300'
        }`}>
          {character.status === 'sale' ? 'À VENDA' : 'VENDIDO'}
        </span>
        {character.status === 'sold' && character.tradeDT && (
          <span className="text-slate-500 text-[10px]">
            {new Date(character.tradeDT * 1000).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-slate-100 truncate max-w-[160px]" title={character.characterName}>
            {character.characterName}
          </h3>
          <p className="text-xs text-slate-400">{character.className} · Lv.{character.level}</p>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
          PS {character.powerScore.toLocaleString('pt-BR')}
        </span>
      </div>

      {character.stats && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-2">
          <span>ATK Fís. <b className="text-slate-300">{character.stats.physAtk.toLocaleString('pt-BR')}</b></span>
          <span>ATK Mag. <b className="text-slate-300">{character.stats.spellAtk.toLocaleString('pt-BR')}</b></span>
          <span>DEF Fís. <b className="text-slate-300">{character.stats.physDef.toLocaleString('pt-BR')}</b></span>
          <span>DEF Mag. <b className="text-slate-300">{character.stats.spellDef.toLocaleString('pt-BR')}</b></span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
        <span className="text-amber-400 font-bold text-lg">
          {character.priceWemix.toLocaleString('pt-BR')}
        </span>
        <span className="text-slate-500 text-xs">WEMIX</span>
      </div>
    </button>
  );
};
