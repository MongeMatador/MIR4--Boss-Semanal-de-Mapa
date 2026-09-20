import React, { useMemo, useState } from 'react';
import { MarketplaceCharacter, GRADE_COLORS, InventoryItem, EquipmentItem } from '../../types/marketplace';
import { useCharacterDetail } from '../../hooks/useCharacterDetail';
import { PlayerHistoryPanel } from '../PlayerLookup/PlayerHistoryPanel';
import { PlayerProgressionPanel } from '../PlayerLookup/PlayerProgressionPanel';
import { TabErrorBoundary } from '../PlayerLookup/ErrorBoundary';

interface CharacterDetailModalProps {
  character: MarketplaceCharacter;
  onClose: () => void;
}

// Agrupa itens de inventário repetidos (o codex costuma ter dezenas de
// cópias do mesmo item) pra não virar uma lista gigante e ilegível.
function groupInventory(items: InventoryItem[]) {
  const map = new Map<string, InventoryItem & { count: number }>();
  for (const item of items) {
    const key = `${item.itemName}__${item.grade}__${item.tier}__${item.enhance}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { ...item, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.grade - a.grade || b.count - a.count);
}

// Cores de glow por grade (1=comum a 5=lendário) — o item em si (itemPath)
// já é a imagem oficial do jogo, mas ela sozinha não carrega o "fundo"
// colorido de raridade que sites como mir4tracker/xdraco desenham por
// fora do ícone. Reproduzimos esse efeito aqui com CSS puro (radial
// gradient + box-shadow), sem depender de nenhum asset extra.
const GRADE_GLOW: Record<number, string> = {
  1: 'shadow-[inset_0_0_12px_rgba(148,163,184,0.35)] bg-gradient-to-br from-slate-700/40 to-slate-900',
  2: 'shadow-[inset_0_0_14px_rgba(34,197,94,0.45)] bg-gradient-to-br from-green-900/50 to-slate-900',
  3: 'shadow-[inset_0_0_14px_rgba(59,130,246,0.5)] bg-gradient-to-br from-blue-900/50 to-slate-900',
  4: 'shadow-[inset_0_0_16px_rgba(168,85,247,0.55)] bg-gradient-to-br from-purple-900/50 to-slate-900',
  // Lendário (grade 5): amarelo puro e bem saturado (rgb 250,204,21 = Tailwind
  // yellow-400), com glow mais forte que as outras raridades — é a cor
  // "chamativa" que aparece na referência do mir4tracker, em vez do âmbar
  // apagado usado antes.
  5: 'shadow-[inset_0_0_22px_rgba(250,204,21,0.85)] bg-gradient-to-br from-yellow-500/30 to-slate-900',
};

const ItemImage: React.FC<{ src: string; alt: string; grade: number }> = ({ src, alt, grade }) => (
  <div className={`relative w-14 h-14 rounded-lg border-2 flex-shrink-0 overflow-hidden ${GRADE_COLORS[grade] ?? 'border-slate-600'} ${GRADE_GLOW[grade] ?? 'bg-slate-900'}`}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-contain p-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]"
      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  </div>
);

const EquipmentGrid: React.FC<{ items: EquipmentItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return <p className="text-slate-500 text-sm italic">Nenhum item equipado.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div key={`${item.slot}-${i}`} className="flex items-center gap-2 bg-slate-900/60 rounded-lg p-2 border border-slate-700">
          <ItemImage src={item.itemPath} alt={item.itemName} grade={item.grade} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate" title={item.itemName}>{item.itemName}</p>
            {item.enhance > 0 && <p className="text-[11px] text-emerald-400">+{item.enhance}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const InventoryGrid: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
  const grouped = useMemo(() => groupInventory(items), [items]);

  if (grouped.length === 0) {
    return <p className="text-slate-500 text-sm italic">Inventário vazio.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {grouped.map((item, i) => (
        <div key={i} className="relative flex flex-col items-center text-center">
          <ItemImage src={item.itemPath} alt={item.itemName} grade={item.grade} />
          {item.count > 1 && (
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {item.count > 99 ? '99+' : item.count}
            </span>
          )}
          <p className="text-[10px] text-slate-400 mt-1 truncate w-full" title={item.itemName}>{item.itemName}</p>
        </div>
      ))}
    </div>
  );
};

type TabKey = 'equipment' | 'inventory' | 'historico' | 'progressao';

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('equipment');
  const { detail, isLoading, error } = useCharacterDetail(character.seq, character.transportID);

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[1000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho — flex-shrink-0 em todo o "chrome" fixo (cabeçalho,
            stats, abas) é essencial: sem isso, o flexbox por padrão também
            tenta ENCOLHER esses blocos quando o conteúdo total passa de
            max-h-[85vh], e era isso que fazia a barra de abas encolher até
            sobrepor visualmente a linha de HP/MP/ATK/DEF. Só o painel de
            conteúdo (mais abaixo, com flex-1) deve encolher/rolar. */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-start flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{character.characterName}</h2>
            <p className="text-sm text-slate-400">
              {character.className} · Lv.{character.level} · Power Score {character.powerScore.toLocaleString('pt-BR')}
            </p>
            <p className="text-amber-400 font-bold mt-1">{character.priceWemix.toLocaleString('pt-BR')} WEMIX</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none">&times;</button>
        </div>

        {character.stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 py-3 bg-slate-800/50 border-b border-slate-700 text-center text-xs flex-shrink-0">
            <div><p className="text-slate-500">HP</p><p className="text-slate-200 font-semibold">{character.stats.hp.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-slate-500">MP</p><p className="text-slate-200 font-semibold">{character.stats.mp.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-slate-500">ATK Fís.</p><p className="text-slate-200 font-semibold">{character.stats.physAtk.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-slate-500">ATK Mag.</p><p className="text-slate-200 font-semibold">{character.stats.spellAtk.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-slate-500">DEF Fís.</p><p className="text-slate-200 font-semibold">{character.stats.physDef.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-slate-500">DEF Mag.</p><p className="text-slate-200 font-semibold">{character.stats.spellDef.toLocaleString('pt-BR')}</p></div>
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b border-slate-700 overflow-x-auto flex-shrink-0 bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-2 ${activeTab === 'equipment' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            Equipamento {detail && `(${detail.equipment.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-2 ${activeTab === 'inventory' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            Inventário / Codex {detail && `(${detail.inventory.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-2 ${activeTab === 'historico' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            Histórico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('progressao')}
            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-2 ${activeTab === 'progressao' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            Progressão
          </button>
        </div>

        {/* Conteúdo — cada aba fica isolada num Error Boundary próprio, para
            que um formato inesperado vindo do mir4tracker em UMA aba nunca
            derrube as outras nem o próprio conjunto de abas. */}
        <div className="p-5 overflow-y-auto flex-1">
          {(activeTab === 'equipment' || activeTab === 'inventory') && (
            <>
              {isLoading && (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  Carregando detalhes do personagem...
                </div>
              )}
              {error && (
                <div className="text-red-400 text-sm text-center py-8">
                  Não foi possível carregar os detalhes agora. Tente novamente em instantes.
                </div>
              )}
              {detail && !isLoading && (
                activeTab === 'equipment'
                  ? <EquipmentGrid items={detail.equipment} />
                  : <InventoryGrid items={detail.inventory} />
              )}
            </>
          )}
          {activeTab === 'historico' && (
            // key={character.seq} força o React a remontar o Error Boundary
            // (e resetar seu estado de erro) sempre que o personagem muda —
            // sem isso, um erro no PRIMEIRO personagem aberto deixava a aba
            // travada mostrando "não foi possível exibir" pra sempre, mesmo
            // depois de fechar o modal e abrir outro personagem diferente.
            <TabErrorBoundary label="Histórico" key={`hist-${character.seq}`}>
              <PlayerHistoryPanel characterName={character.characterName} />
            </TabErrorBoundary>
          )}
          {activeTab === 'progressao' && (
            <TabErrorBoundary label="Progressão" key={`prog-${character.seq}`}>
              <PlayerProgressionPanel transportID={character.transportID} />
            </TabErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
};
