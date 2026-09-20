import { useState, useEffect } from 'react';

export interface GlobalRankingEntry {
  clan: string;
  classId: number;
  name: string;
  power: string; // vem formatado ("992,613"), não number puro
  rank: string;
  rankMove: string; // "", "up", "new" etc.
  server: string;
}

export interface RegionInfo {
  id: string;
  label: string;
}

export interface RegionPlayerEntry {
  clan: string;
  job: string;
  level: number;
  name: string;
  power: number;
  rank: number;
  server: string;
}

const CLASS_IDS: Record<string, number> = {
  Warrior: 1, Sorcerer: 2, Taoist: 3, Arbalist: 4, Lancer: 5, Darkist: 6, Lionheart: 7,
};
export { CLASS_IDS };

// Global Board (Overall ou por classe), via
// /.netlify/functions/mir4tracker-rankings — proxy confirmado ao vivo de
// /api/global-rankings do mir4tracker.xyz.
export function useGlobalBoard(classId: number | null, page: number) {
  const [entries, setEntries] = useState<GlobalRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const qs = classId
      ? `type=class&classId=${classId}&page=${page}`
      : `type=overall&page=${page}`;

    fetch(`/.netlify/functions/mir4tracker-rankings?${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setEntries(Array.isArray(data?.data) ? data.data : []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar rankings'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [classId, page]);

  return { entries, isLoading, error };
}

// Lista de regiões disponíveis para "Region Notables".
export function useRegionList() {
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch('/.netlify/functions/mir4tracker-rankings?type=regions')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setRegions(Array.isArray(data?.regions) ? data.regions : []); })
      .catch(() => { if (!cancelled) setRegions([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { regions, isLoading };
}

// Top jogadores de uma região específica ("Region Notables").
export function useRegionNotables(region: string | null) {
  const [players, setPlayers] = useState<RegionPlayerEntry[]>([]);
  const [captureDate, setCaptureDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!region) { setPlayers([]); return; }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/.netlify/functions/mir4tracker-rankings?type=region-detail&region=${encodeURIComponent(region)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setPlayers(Array.isArray(data?.players) ? data.players : []);
        setCaptureDate(typeof data?.captureDate === 'string' ? data.captureDate : null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar região'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [region]);

  return { players, captureDate, isLoading, error };
}
