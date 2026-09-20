import { useState, useEffect } from 'react';

export interface ServerTransferEntry {
  _class: string;
  name: string;
  newClan: string;
  newServer: string;
  oldClan: string;
  oldServer: string;
  power: string; // vem formatado como string do mir4tracker, ex.: "444,913"
}

// Transferências diárias de entrada/saída de um servidor, via
// /.netlify/functions/mir4tracker-transfers (proxy de
// /api/transfers/{worldgroup}/{world} do mir4tracker.xyz — confirmado ao
// vivo com curl sem login nesta sessão).
export function useServerTransfers(worldgroup: string | null, world: string | null) {
  const [transfers, setTransfers] = useState<ServerTransferEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!worldgroup || !world) {
      setTransfers([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/.netlify/functions/mir4tracker-transfers?worldgroup=${encodeURIComponent(worldgroup)}&world=${encodeURIComponent(world)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setTransfers(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar transferências'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [worldgroup, world]);

  return { transfers, isLoading, error };
}
