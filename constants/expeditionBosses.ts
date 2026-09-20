// Tabela de custo de recursos por chefe da Expedição do Clã (Clan
// Expedition).
//
// Fonte: extraído diretamente do bundle JS público do mir4tracker.xyz
// (constante `EXP_BOSSES`, usada pela própria calculadora de Expedição do
// Clã deles — que também é 100% client-side, sem API por trás, guardando
// tudo em localStorage do navegador). Baixado e conferido ao vivo em
// 2026-09-18. Reproduzimos a mesma tabela em vez de inventar valores.
export interface ExpeditionBoss {
  name: string;
  copper: number;
  darksteel: number;
  energy: number;
  gold: number;
  statue: number;
}

export const EXPEDITION_BOSSES: ExpeditionBoss[] = [
  { name: 'Fox Spirit Beast', copper: 2500, darksteel: 125000, energy: 125000, gold: 1000, statue: 2 },
  { name: 'Demon Bull God', copper: 5000, darksteel: 250000, energy: 250000, gold: 1200, statue: 4 },
  { name: 'Hell Rock Fiend', copper: 7500, darksteel: 375000, energy: 375000, gold: 1400, statue: 6 },
  { name: 'Redmoon Devil', copper: 10000, darksteel: 500000, energy: 500000, gold: 1600, statue: 8 },
  { name: 'Infernal Abomination', copper: 12500, darksteel: 625000, energy: 625000, gold: 1800, statue: 10 },
  { name: 'Blue Thunder Dragon', copper: 15000, darksteel: 750000, energy: 750000, gold: 2000, statue: 12 },
  { name: 'Azure Flame Emperor', copper: 17500, darksteel: 875000, energy: 875000, gold: 2200, statue: 14 },
  { name: 'Sanguinary Serpent Scorpion', copper: 20000, darksteel: 1000000, energy: 1000000, gold: 2400, statue: 16 },
  { name: 'Soul Absorbing Demon Beast', copper: 22500, darksteel: 1125000, energy: 1125000, gold: 2600, statue: 18 },
  { name: 'Chakravati Darkmaur', copper: 25000, darksteel: 1250000, energy: 1250000, gold: 2800, statue: 20 },
  { name: 'Ice Demon Deity MAJ', copper: 27500, darksteel: 1375000, energy: 1375000, gold: 3000, statue: 22 },
];
