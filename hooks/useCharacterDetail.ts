import { useState, useEffect } from 'react';
import { CharacterDetail, EquipmentItem, InventoryItem } from '../types/marketplace';

interface RawEquipEntry {
  itemName: string;
  enhance: string;
  refineStep: string;
  holeCount: string;
  grade: string;
  tier: string;
  itemType: string;
  itemPath: string;
}

interface RawInvenEntry {
  itemName: string;
  grade: string;
  tier: string;
  enhance: number;
  mainType: number;
  subType: number;
  tabCategory: number;
  itemPath: string;
}

export function useCharacterDetail(seq: number | null, transportID: number | null) {
  const [detail, setDetail] = useState<CharacterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seq === null || transportID === null) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/.netlify/functions/xdraco-character?type=summary&seq=${seq}`).then(r => r.json()),
      fetch(`/.netlify/functions/xdraco-character?type=inven&transportID=${transportID}`).then(r => r.json()),
    ])
      .then(([summaryJson, invenJson]) => {
        if (cancelled) return;

        const equipment: EquipmentItem[] = [];
        if (summaryJson.code === 200) {
          const equipItems = summaryJson.data.equipItem || {};
          // A API retorna um objeto (chave = slot) quando há itens, mas às
          // vezes um array vazio quando não há nenhum equipado.
          if (!Array.isArray(equipItems)) {
            for (const [slot, eq] of Object.entries(equipItems as Record<string, RawEquipEntry>)) {
              equipment.push({
                slot,
                itemName: eq.itemName,
                enhance: Number(eq.enhance) || 0,
                refineStep: Number(eq.refineStep) || 0,
                holeCount: Number(eq.holeCount) || 0,
                grade: Number(eq.grade) || 0,
                tier: Number(eq.tier) || 0,
                itemType: eq.itemType,
                itemPath: eq.itemPath,
              });
            }
          }
        }

        const inventory: InventoryItem[] = [];
        if (invenJson.code === 200 && Array.isArray(invenJson.data)) {
          for (const it of invenJson.data as RawInvenEntry[]) {
            inventory.push({
              itemName: it.itemName,
              grade: Number(it.grade) || 0,
              tier: Number(it.tier) || 0,
              enhance: it.enhance || 0,
              mainType: it.mainType,
              subType: it.subType,
              tabCategory: it.tabCategory,
              itemPath: it.itemPath,
            });
          }
        }

        setDetail({ equipment, inventory });
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar detalhes');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [seq, transportID]);

  return { detail, isLoading, error };
}
