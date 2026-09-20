import { useState, useEffect } from 'react';

// Autocomplete de nomes via /.netlify/functions/mir4tracker-names (proxy de
// /api/names/{query} do mir4tracker.xyz, confirmado público/sem login).
// Debounce simples de 250ms pra não disparar uma requisição por tecla.
export function useNameAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/.netlify/functions/mir4tracker-names?q=${encodeURIComponent(trimmed)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (cancelled) return;
          const labels = Array.isArray(data) ? data.map((d: any) => d?.label).filter(Boolean) : [];
          setSuggestions(labels);
        })
        .catch(() => { if (!cancelled) setSuggestions([]); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    }, 250);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  return { suggestions, isLoading };
}
