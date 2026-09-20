import { useState, useEffect } from 'react';

export interface SiegeEntry {
  clan: string;
  isCastle: boolean;
  leader: string;
  level: number;
  member: number;
  newEntry: boolean;
  power: number;
  server: string;
  gateway?: number; // só existe em sabuksiege
}

export interface SiegeRound {
  id: string;
  name: string;
}

// Cerco ao Castelo / Cerco de Sabuk, via
// /.netlify/functions/mir4tracker-war (proxy confirmado ao vivo de
// /api/war/castlesiege e /api/war/sabuksiege do mir4tracker.xyz).
export function useWarData(type: 'castle' | 'sabuk') {
  const [results, setResults] = useState<SiegeEntry[]>([]);
  const [rounds, setRounds] = useState<SiegeRound[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/.netlify/functions/mir4tracker-war?type=${type}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setResults(Array.isArray(data?.results) ? data.results : []);
        setRounds(Array.isArray(data?.rounds) ? data.rounds : []);
        setFetchedAt(typeof data?.fetched_at === 'number' ? data.fetched_at : null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar dados de guerra'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [type]);

  return { results, rounds, fetchedAt, isLoading, error };
}
