import React from 'react';
import { useCharacterProgression } from '../../hooks/useCharacterProgression';

interface Props {
  transportID: number;
}

// O formato exato de cada endpoint wemix-nft-* não está 100% documentado
// (ver mapa-fontes-campos-publicos-mir4.md, seção 18.7/9) — em vez de supor
// "é sempre um array" ou "é sempre um objeto" e quebrar a tela inteira
// quando vier diferente, essas funções aceitam os dois formatos.
function toEntries(value: unknown): Array<{ key: string | null; data: Record<string, unknown> }> {
  if (Array.isArray(value)) {
    return value.map((item, i) => ({
      key: typeof item === 'object' && item && 'name' in item ? String((item as any).name) : String(i),
      data: (item && typeof item === 'object') ? (item as Record<string, unknown>) : { value: item },
    }));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, v]) => ({
      key,
      data: (v && typeof v === 'object') ? (v as Record<string, unknown>) : { value: v },
    }));
  }
  return [];
}

function fmtKey(k: string) {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// magicorb/magicstone/mysticalpiece/spirit guardam VÁRIOS "decks" (sets de
// composição — o jogo deixa montar mais de uma composição e trocar entre
// elas), não só um conjunto de itens. Um flatten "ingênuo" (percorrer tudo
// recursivamente) mostrava o MESMO item repetido uma vez por deck — o
// usuário notou exatamente isso ("as pedras/peça mística/orb/espíritos
// estão se repetindo"). A correção: escolher só o deck ATIVO
// (`activeDeck`, vindo do próprio JSON de magicorb/magicstone/mysticalpiece
// e reaproveitado pra spirit) em cada nível de aninhamento, com fallback
// pro deck "1" quando aquele nível específico não tiver o deck ativo (ex.:
// magicorb tem uma categoria de slot que só existe como deck único "1").
//
// Duas formas observadas ao vivo (mapa-fontes-campos-publicos-mir4.md
// seção 23): magicorb é slotType -> deck -> slot -> item (3 níveis);
// magicstone/mysticalpiece/spirit.equip são slot -> deck -> item (2 níveis).
// Em vez de tratar cada shape com código duplicado, a função desce nó por
// nó: se o valor do "deck" já parece um item (tem itemName/petName), é o
// shape de 2 níveis; senão, mais um nível pra achar os itens desse deck.
interface FlatEquipItem {
  itemName?: string;
  grade?: string | number;
  itemPath?: string;
  tier?: string | number;
  itemLv?: number;
  petName?: string;
  petOrigin?: string;
  transcend?: number;
  iconPath?: string;
}

function isItemLike(node: unknown): node is FlatEquipItem {
  return Boolean(node && typeof node === 'object' && ('itemName' in (node as object) || 'petName' in (node as object)));
}

function pickActiveDeckItems(equipItem: unknown, activeDeck: number | null): FlatEquipItem[] {
  if (!equipItem || typeof equipItem !== 'object') return [];
  const deckKey = activeDeck !== null ? String(activeDeck) : null;
  const results: FlatEquipItem[] = [];

  for (const topValue of Object.values(equipItem as Record<string, unknown>)) {
    if (!topValue || typeof topValue !== 'object') continue;
    const decks = topValue as Record<string, unknown>;
    const chosen = (deckKey && decks[deckKey]) ?? decks['1'] ?? Object.values(decks)[0];
    if (!chosen) continue;

    if (isItemLike(chosen)) {
      results.push(chosen);
    } else if (typeof chosen === 'object') {
      for (const slotItem of Object.values(chosen as Record<string, unknown>)) {
        if (isItemLike(slotItem)) results.push(slotItem);
      }
    }
  }
  return results;
}

const GRADE_TEXT_COLOR: Record<string, string> = {
  '1': 'text-slate-300',
  '2': 'text-emerald-400',
  '3': 'text-blue-400',
  '4': 'text-purple-400',
  '5': 'text-amber-300',
};

const EquipItemGrid: React.FC<{ items: FlatEquipItem[] }> = ({ items }) => {
  if (items.length === 0) return <p className="text-slate-500 text-sm italic">Sem dados.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
      {items.map((it, i) => {
        const name = it.itemName ?? it.petName ?? '—';
        const grade = it.grade !== undefined ? String(it.grade) : null;
        return (
          <div key={i} className="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
            {(it.itemPath || it.iconPath) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.itemPath ?? it.iconPath} alt="" className="w-7 h-7 object-contain flex-shrink-0" loading="lazy" />
            )}
            <div className="min-w-0">
              <p className={`truncate font-medium ${grade ? (GRADE_TEXT_COLOR[grade] ?? 'text-slate-200') : 'text-slate-200'}`} title={name}>
                {name}
              </p>
              <p className="text-slate-500">
                {it.petOrigin ? `${it.petOrigin}` : grade ? `Grade ${grade}` : ''}
                {it.tier !== undefined ? ` · T${it.tier}` : ''}
                {it.itemLv !== undefined ? ` · Lv ${it.itemLv}` : ''}
                {it.transcend !== undefined ? ` · Transcend ${it.transcend}` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Renderiza um valor de forma segura, recursivamente — alguns nós vêm
// aninhados em mais de um nível (ex.: Constituição = nó → sub-nó →
// {trainingTotal, trainingValue}), e antes disso a 2ª camada virava
// "[object Object]" porque só o primeiro nível era desembrulhado.
const RecursiveValue: React.FC<{ value: unknown; depth?: number }> = ({ value, depth = 0 }) => {
  if (value === null || value === undefined) return <>—</>;
  if (typeof value === 'number') return <>{value.toLocaleString('pt-BR')}</>;
  if (typeof value !== 'object') return <>{String(value)}</>;

  if (depth > 3) return <>{JSON.stringify(value)}</>;

  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-0.5">
      {entries.map(([k, v]) => (
        <span key={k}>
          <span className="text-slate-500">{fmtKey(k)}:</span>{' '}
          <span className="text-slate-200 font-semibold"><RecursiveValue value={v} depth={depth + 1} /></span>
        </span>
      ))}
    </span>
  );
};

const GenericEntryGrid: React.FC<{ entries: Array<{ key: string | null; data: Record<string, unknown> }> }> = ({ entries }) => {
  if (entries.length === 0) return <p className="text-slate-500 text-sm italic">Sem dados.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      {entries.map((e, i) => (
        <div key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
          {e.key && <p className="text-slate-300 font-medium mb-0.5 truncate" title={e.key}>{fmtKey(e.key)}</p>}
          <div className="text-slate-400">
            <RecursiveValue value={e.data} depth={1} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const PlayerProgressionPanel: React.FC<Props> = ({ transportID }) => {
  const { progression, isLoading, error } = useCharacterProgression(transportID);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Carregando progressão...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar a progressão agora. Tente novamente em instantes.</div>;
  }
  if (!progression) return null;

  const codexEntries = toEntries(progression.codex);
  const holystuffEntries = toEntries(progression.holystuff);
  const dragonEntries = toEntries(progression.dragon);
  const assetsEntries = progression.assets ? Object.entries(progression.assets).filter(([, v]) => v !== undefined) : [];

  const heaven = progression.heaven as Record<string, unknown> | null;
  const circleEntries = heaven ? toEntries((heaven as any).circle) : [];
  const trainingEntries = heaven ? toEntries((heaven as any).training) : [];

  const potential = progression.potential as Record<string, number> | null;
  const scriptureEntries = toEntries(progression.scripture);
  const activeDeck = progression.activeDeck;
  const magicorbItems = pickActiveDeckItems((progression.magicorb as any)?.equipItem, activeDeck);
  const magicstoneItems = pickActiveDeckItems((progression.magicstone as any)?.equipItem, activeDeck);
  const mysticalpieceItems = pickActiveDeckItems((progression.mysticalpiece as any)?.equipItem, activeDeck);
  const spiritEquip = pickActiveDeckItems((progression.spirit as any)?.equip, activeDeck);
  const spiritInven = Array.isArray((progression.spirit as any)?.inven) ? ((progression.spirit as any).inven as FlatEquipItem[]) : [];
  const martialArts = progression.training as Record<string, unknown> | null;
  const martialForces = martialArts
    ? Object.entries(martialArts).filter(([k]) => /^\d+$/.test(k)).map(([, v]) => v as { forceName?: string; forceLevel?: string | number })
    : [];
  const statsData = progression.stats as { lists?: Array<{ statName: string; statValue: string; iconPath?: string }> } | null;
  const statsList = statsData?.lists ?? [];

  const hasAny = codexEntries.length || holystuffEntries.length || circleEntries.length || trainingEntries.length
    || dragonEntries.length || assetsEntries.length || Boolean(potential) || scriptureEntries.length
    || magicorbItems.length || magicstoneItems.length || mysticalpieceItems.length
    || spiritEquip.length || spiritInven.length || martialForces.length || statsList.length;

  if (!hasAny) {
    return <div className="text-slate-500 text-sm text-center py-8">Dados de progressão não publicamente acessíveis para este personagem no momento.</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-[11px] text-slate-500 italic">
        Dados públicos de Códex, Antiguidade, Constituição/Chi, Artefato de Dragão, Recursos, Potencial,
        Salão das Escrituras, Orbe Mágica, Pedra Mágica, Peça Mística, Espíritos, Artes Marciais e Atributos de Combate.
        Equipamento de Transferência (E.T.) completo e Mapa de Manifestação Divina ainda não têm fonte pública
        conhecida — só visíveis ao dono logado no cliente do jogo.
      </p>

      {codexEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Códex</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {codexEntries.map((e, i) => {
              const d = e.data as any;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
                  <p className="text-slate-300 truncate" title={d.codexName ?? e.key ?? ''}>{d.codexName ?? e.key}</p>
                  <p className="text-emerald-400 font-semibold">
                    {d.completed ?? '—'}{d.totalCount !== undefined ? `/${d.totalCount}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {holystuffEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Antiguidade</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {holystuffEntries.map((e, i) => {
              const d = e.data as any;
              return (
                <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                  {d.name ?? fmtKey(e.key ?? '')}: <span className="text-amber-400 font-semibold">{d.grade ?? d.value ?? '—'}</span>
                </span>
              );
            })}
          </div>
        </section>
      )}

      {circleEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Chi (Inner Force) — por círculo</h3>
          <GenericEntryGrid entries={circleEntries.map((e) => ({ key: `Círculo ${e.key}`, data: e.data }))} />
        </section>
      )}

      {trainingEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">União Universal</h3>
          <GenericEntryGrid entries={trainingEntries.map((e) => ({ key: `Nó ${e.key}`, data: e.data }))} />
        </section>
      )}

      {dragonEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Artefato de Dragão ({dragonEntries.length} peças)</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {dragonEntries.map((e, i) => {
              const d = e.data as any;
              return (
                <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                  {d.slot ?? e.key ?? `#${i + 1}`}: grade {d.grade ?? '—'}{d.enhance ? ` +${d.enhance}` : ''}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {assetsEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Recursos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {assetsEntries.map(([k, v]) => (
              <div key={k} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
                <p className="text-slate-500 capitalize">{k}</p>
                <p className="text-slate-200 font-semibold">{Number(v).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {potential && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Potencial {potential.total !== undefined && potential.totalMax !== undefined && (
              <span className="text-cyan-400 font-bold">{potential.total}/{potential.totalMax}</span>
            )}
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['hunting', 'pvp', 'secondary'] as const).map((k) => (
              potential[k] !== undefined && (
                <div key={k} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
                  <p className="text-slate-500 capitalize">{k === 'hunting' ? 'Caça' : k === 'pvp' ? 'PVP' : 'Secundário'}</p>
                  <p className="text-slate-200 font-semibold">{potential[k]}{potential[`${k}Max`] !== undefined ? `/${potential[`${k}Max`]}` : ''}</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {scriptureEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Salão das Escrituras</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {scriptureEntries.map((e, i) => {
              const d = e.data as any;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
                  <p className="text-slate-300 truncate" title={d.codexName ?? e.key ?? ''}>{d.codexName ?? e.key}</p>
                  <p className="text-emerald-400 font-semibold">
                    {d.completed ?? '—'}{d.totalCount !== undefined ? `/${d.totalCount}` : ''}
                    {d.inprogress !== undefined && Number(d.inprogress) > 0 ? ` (+${d.inprogress} em progresso)` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {martialForces.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Chi — Manuais Marciais
            {martialArts?.consitutionLevel !== undefined && (
              <span className="text-slate-400 font-normal text-xs"> · Constituição nível {String(martialArts.consitutionLevel)}</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {martialForces.map((f, i) => (
              <span key={i} className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-slate-300">
                {f.forceName ?? `#${i + 1}`}: <span className="text-cyan-400 font-semibold">Lv {f.forceLevel ?? '—'}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {magicorbItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Orbe Mágica ({magicorbItems.length}){activeDeck !== null && <span className="text-slate-500 font-normal text-xs"> · deck {activeDeck}</span>}
          </h3>
          <EquipItemGrid items={magicorbItems} />
        </section>
      )}

      {magicstoneItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Pedra Mágica ({magicstoneItems.length}){activeDeck !== null && <span className="text-slate-500 font-normal text-xs"> · deck {activeDeck}</span>}
          </h3>
          <EquipItemGrid items={magicstoneItems} />
        </section>
      )}

      {mysticalpieceItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Peça Mística ({mysticalpieceItems.length}){activeDeck !== null && <span className="text-slate-500 font-normal text-xs"> · deck {activeDeck}</span>}
          </h3>
          <EquipItemGrid items={mysticalpieceItems} />
        </section>
      )}

      {(spiritEquip.length > 0 || spiritInven.length > 0) && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Espíritos equipados ({spiritEquip.length}){activeDeck !== null && <span className="text-slate-500 font-normal text-xs"> · deck {activeDeck}</span>}
          </h3>
          <EquipItemGrid items={spiritEquip} />
          {spiritInven.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                Ver inventário de espíritos ({spiritInven.length})
              </summary>
              <div className="mt-2">
                <EquipItemGrid items={spiritInven} />
              </div>
            </details>
          )}
        </section>
      )}

      {statsList.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Atributos de Combate</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {statsList.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5">
                {s.iconPath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.iconPath} alt="" className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />
                )}
                <div className="min-w-0">
                  <p className="text-slate-500 truncate" title={s.statName}>{s.statName}</p>
                  <p className="text-slate-200 font-semibold">{s.statValue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
