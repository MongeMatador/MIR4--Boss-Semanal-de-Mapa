import { useState, useEffect } from 'react';

export interface ValleyHolder {
  clan: string;
  isNew: boolean;
  leader: string;
  level: number;
  members: number;
  power: number;
}

export interface ValleyServerEntry {
  server: string;
  worldId: string;
  bicheon: ValleyHolder | null;
  redMoon: ValleyHolder | null;
  snakePit: ValleyHolder | null;
}

// Vale Oculto (Hidden Valley), via
// /.netlify/functions/mir4tracker-war?type=valley (proxy confirmado ao vivo
// de /api/hidden-valley do mir4tracker.xyz). Formato diferente do
// castle/sabuk siege — por servidor, cada uma das 3 zonas (Bicheon, Lua
// Vermelha, Covil da Serpente) tem seu próprio detentor (ou null, quando
// ninguém segura a zona no momento).
export function useHiddenValley() {
  const [servers, setServers] = useState<ValleyServerEntry[]>([]);
  const [captureDate, setCaptureDate] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch('/.netlify/functions/mir4tracker-war?type=valley')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setServers(Array.isArray(data?.servers) ? data.servers : []);
        setCaptureDate(typeof data?.captureDate === 'string' ? data.captureDate : null);
        setFetchedAt(typeof data?.fetched_at === 'number' ? data.fetched_at : null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar dados do Vale Oculto'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { servers, captureDate, fetchedAt, isLoading, error };
}
