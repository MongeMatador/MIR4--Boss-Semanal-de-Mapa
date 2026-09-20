import { useState, useEffect } from 'react';

export interface ClanRankingEntry {
  clan: string;
  leader: string;
  power: number;
  rank: number;
  server: string;
}

export interface ClanGrowthEntry {
  clan: string;
  currentPower: number;
  currentRank: number;
  gained: number;
  leader: string;
  previousPower: number;
}

export interface ClanRankChangeEntry {
  clan: string;
  currentRank: number;
  delta: number;
  leader: string;
  previousRank: number;
}

// Clan Rankings ("All ~1000 clans"), via
// /.netlify/functions/mir4tracker-clan-rankings — proxy confirmado ao vivo
// de /api/clan-rankings do mir4tracker.xyz. scope: 'global' | 'world:NA1' |
// 'server:NA011'.
export function useClanRankingList(scope: string) {
  const [rankings, setRankings] = useState<ClanRankingEntry[]>([]);
  const [captureDate, setCaptureDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/.netlify/functions/mir4tracker-clan-rankings?tab=list&scope=${encodeURIComponent(scope)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setRankings(Array.isArray(data?.rankings) ? data.rankings : []);
        setCaptureDate(typeof data?.captureDate === 'string' ? data.captureDate : null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar clan rankings'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [scope]);

  return { rankings, captureDate, isLoading, error };
}

export function useClanPowerGrowth() {
  const [growth, setGrowth] = useState<ClanGrowthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch('/.netlify/functions/mir4tracker-clan-rankings?tab=growth')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setGrowth(Array.isArray(data?.growth) ? data.growth : []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { growth, isLoading, error };
}

export function useClanRankChanges() {
  const [climbers, setClimbers] = useState<ClanRankChangeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch('/.netlify/functions/mir4tracker-clan-rankings?tab=changes')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setClimbers(Array.isArray(data?.climbers) ? data.climbers : []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { climbers, isLoading, error };
}
