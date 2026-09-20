// Tipos para os dados históricos e de progressão vindos do mir4tracker.xyz
// (via as Netlify Functions mir4tracker-player e mir4tracker-progression).
//
// Alguns campos abaixo vêm de um endpoint cuja semântica ainda não está
// 100% confirmada (ver mapa-fontes-campos-publicos-mir4.md, seção 9/19) —
// nesses casos o comentário avisa e o tipo é deixado mais permissivo em vez
// de arriscar uma interpretação errada.

export interface PowerHistoryEntry {
  id: number;
  localDate: string;
  powerScore: number;
  rank: number | null;
}

export interface LevelTrackEntry {
  localDate: string;
  oldLevel: number;
  newLevel: number;
  nftId: number | null;
}

export interface NameTrackEntry {
  localDate: string;
  oldName: string;
  newName: string;
  nftId: number | null;
}

export interface ClanServerHistoryEntry {
  clanFrom: string | null;
  clanTo: string | null;
  serverFrom: string | null;
  serverTo: string | null;
  date: string;
}

// eventType observado: 1/2/3, semântica não confirmada com certeza.
// Hipótese registrada no mapa de fontes: 1 = primeira listagem,
// 2 = relistagem/atualização de preço, 3 = delistagem.
// NUNCA tratar "price" aqui como "preço de venda confirmada" — é o preço
// anunciado naquele evento (listing), não necessariamente uma venda.
export interface NftHistoryEntry {
  date: string;
  eventType: number;
  lvl: number | string;
  name: string;
  power: number;
  price: number;
  seq: number;
  totalCodex: number | null;
}

export type PlayerStatus = 'Active Player' | 'Deactive Player' | 'XDRACO' | string;

export interface PlayerProfile {
  name: string;
  status: PlayerStatus;
  lv: number | string;
  clan: string | null;
  worldName: string | null;
  worldgroupName: string | null;
  classId: number | null;
  powerHistory: PowerHistoryEntry[];
  levelTrack: LevelTrackEntry[];
  nameTrack: NameTrackEntry[];
  clanServerHistory: ClanServerHistoryEntry[];
  nftHistory: NftHistoryEntry[];
  currentPower: number | null;
  peakPower: number | null;
}

// --- Progressão (wemix-nft-*) ---
// Estrutura observada ao vivo (seção 18.7 do mapa de fontes), mas os nomes
// exatos de todos os campos internos não foram 100% documentados — os tipos
// abaixo cobrem o que foi confirmado e deixam o restante como `unknown`
// dentro de `raw`, para nunca inventar um campo que não foi visto de fato.

export interface CodexCategoryEntry {
  codexName: string;
  completed: number;
  inprogress: number;
  totalCount: number;
}

export interface HolystuffEntry {
  name: string;
  grade: number | string;
}

export interface HeavenProgression {
  circle?: unknown; // Chi / Inner Force, por tier
  training?: unknown; // Constituição, níveis por nó
}

export interface DragonArtifactEntry {
  slot?: string;
  grade?: number | string;
  enhance?: number;
  holeCount?: number;
}

export interface AssetsResources {
  acientcoins?: number;
  copper?: number;
  darksteel?: number;
  dragonjade?: number;
  dragonsteel?: number;
  energy?: number;
  speedups?: number;
  [key: string]: number | undefined;
}

// Cada campo abaixo é deixado como `unknown` de propósito: os endpoints
// wemix-nft-* às vezes devolvem array, às vezes objeto (mapa chave→valor),
// dependendo da categoria e possivelmente da versão do personagem. Forçar
// um shape fixo aqui (ex.: sempre array) já causou tela em branco quando o
// dado real veio diferente — quem interpreta o formato é a UI
// (PlayerProgressionPanel), de forma defensiva, nunca este tipo.
//
// potential/scripture/magicorb/magicstone/mysticalpiece/spirit/training/stats
// confirmados ao vivo em 2026-09-19 (rodada 4) — ver
// mapa-fontes-campos-publicos-mir4.md seção 21.1/22. Shapes observados:
//   potential: { hunting, huntingMax, pvp, pvpMax, secondary, secondaryMax, total, totalMax }
//   scripture: mesmo formato do codex (mapa id -> {codexName, completed, inprogress, totalCount})
//   magicorb/magicstone/mysticalpiece: { activeDeck?, equipItem: { [slotType]: { [tier]: { [slot]: {...item} } } } }
//     (magicorb tem um nível extra de aninhamento — slotType->tier->slot;
//     magicstone/mysticalpiece só têm slotType->slot)
//   spirit: { equip: { [slot]: {...pet} }, inven: [...pet] }
//   training: mapa índice -> {forceIdx, forceLevel, forceName} + collectLevel/collectName/consitutionLevel/consitutionName
//   stats: { lists: [{statName, statValue, iconPath}], mainstats: [...] }
export interface CharacterProgression {
  codex: unknown;
  holystuff: unknown;
  heaven: unknown;
  dragon: unknown;
  assets: AssetsResources | unknown;
  potential: unknown;
  scripture: unknown;
  magicorb: unknown;
  magicstone: unknown;
  mysticalpiece: unknown;
  spirit: unknown;
  training: unknown;
  stats: unknown;
  // "Deck"/set de composição ativo no momento (magicorb/magicstone/
  // mysticalpiece/spirit guardam VÁRIOS decks — o jogo deixa montar mais de
  // uma composição e trocar entre elas). magicorb/magicstone/mysticalpiece
  // expõem esse número no próprio JSON (`activeDeck`); spirit não expõe,
  // então reaproveitamos o mesmo valor dos outros três (rodada 5 — ver
  // mapa-fontes-campos-publicos-mir4.md seção 23).
  activeDeck: number | null;
}
