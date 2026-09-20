export interface CombatStats {
  hp: number;
  mp: number;
  physAtk: number;
  spellAtk: number;
  physDef: number;
  spellDef: number;
}

// Status do NFT (rodada 7): investigado ao vivo se existiria algo como
// "licitação em andamento / sem lances / vendido / por vir" (pedido do
// usuário). CONFIRMADO que a API oficial (webapi.mir4global.com) só tem
// listagem de PREÇO FIXO — não achamos nenhum campo de leilão/lance em
// nenhum endpoint (nft/lists, nft/character/summary). O que existe de fato,
// confirmado ao vivo comparando listType=sale (tradeType=1) com
// listType=recent/topTraded (tradeType=3): 'sale' = à venda agora, 'sold' =
// já vendido (tem tradeDT, a data da venda). "Licitação"/"sem lances"/"por
// vir" não têm evidência de existir pra Character NFT do MIR4 — pode ser
// que o usuário tenha visto isso em outro marketplace NFT (ex.: WEMIX PLAY
// geral, que vende outros tipos de ativo) e não no XDRACO especificamente.
export type NftStatus = 'sale' | 'sold';

export interface MarketplaceCharacter {
  nftID: string;
  seq: number;
  transportID: number;
  characterName: string;
  classId: number;
  className: string;
  level: number;
  powerScore: number;
  priceWemix: number;
  sealedDT: number;
  stats: CombatStats | null;
  status: NftStatus;
  // Só presente quando status === 'sold' (vem de listType=recent/topTraded).
  tradeDT: number | null;
}

export interface EquipmentItem {
  slot: string;
  itemName: string;
  enhance: number;
  refineStep: number;
  holeCount: number;
  grade: number;
  tier: number;
  itemType: string;
  itemPath: string;
}

export interface InventoryItem {
  itemName: string;
  grade: number;
  tier: number;
  enhance: number;
  mainType: number;
  subType: number;
  tabCategory: number;
  itemPath: string;
}

export interface CharacterDetail {
  equipment: EquipmentItem[];
  inventory: InventoryItem[];
}

export const CLASS_NAMES: Record<number, string> = {
  0: 'Todas',
  1: 'Warrior',
  2: 'Sorcerer',
  3: 'Taoist',
  4: 'Arbalist',
  5: 'Lancer',
  6: 'Darkist',
  7: 'Lionheart',
  8: 'Spirit Summoner',
};

// Grade 1 (comum) a 5 (lendário) — cores usadas nos cards de item, seguindo
// a convenção visual do próprio MIR4/XDRACO. Grade 5 (lendário) usa um
// amarelo mais puro/saturado (yellow-400) em vez do âmbar mais apagado, pra
// ficar realmente "chamativo" como nos sites de referência (mir4tracker
// etc.), que destacam lendários com um amarelo bem vivo.
export const GRADE_COLORS: Record<number, string> = {
  1: 'border-slate-500 text-slate-300',
  2: 'border-green-500 text-green-300',
  3: 'border-blue-500 text-blue-300',
  4: 'border-purple-500 text-purple-300',
  5: 'border-yellow-400 text-yellow-300',
};
