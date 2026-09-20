
export interface BossSpawnRaw {
  W: number;
  layer: string;
  time: string;
  location: string;
  bosses: string[];
  tier: number; // Adicionado para diferenciar Camada 1 e 3
}

export interface BossSpawn {
  id: string;
  map: number;
  layer: string;
  time: string;
  location: string;
  bosses: string[];
  bossesString: string;
  countdown: string;
  delta: number;
  originalTime: string;
  tier: number; // Adicionado para diferenciar Camada 1 e 3
}

// Fix: Add missing types for the crafting calculator.
export interface Material {
  name: string;
  quantity: number;
}

export interface CraftingRecipe {
  category: string;
  materials: Material[];
}

export interface CraftingData {
  [itemName:string]: CraftingRecipe;
}

// Fix: Add missing BossRewards type for the rewards modal.
export type BossRewards = Record<string, string[]>;
