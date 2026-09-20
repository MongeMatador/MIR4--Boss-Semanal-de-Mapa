import { useState, useEffect } from 'react';
import { CharacterProgression } from '../types/history';

// Busca Códex, Antiguidade, Constituição/Chi, Artefato de Dragão, Recursos,
// Potencial, Salão das Escrituras, Orbe Mágica, Pedra Mágica, Peça Mística,
// Espíritos, Artes Marciais e Atributos de Combate de um personagem via
// transportID, usando /.netlify/functions/mir4tracker-progression (proxy
// dos endpoints wemix-nft-* do mir4tracker.xyz — todos confirmados ao vivo).
//
// Cada categoria é buscada em paralelo e falha de forma independente —
// se um endpoint específico não responder, os outros continuam
// disponíveis em vez de derrubar a tela inteira.
//
// O formato exato de cada resposta não é 100% documentado — algumas vêm
// como array puro, outras como objeto (mapa de chave→valor), e pode haver
// um wrapper "{ data: ... }" como no restante da API do mir4tracker. Em vez
// de forçar um formato e perder dado real quando ele não bate, guardamos o
// valor "desembrulhado" como veio, e quem decide como desenhar (array,
// objeto, ou nenhum dos dois) é o componente de UI — nunca aqui.
function unwrap(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>).data;
  }
  return raw;
}

export function useCharacterProgression(transportID: number | null) {
  const [progression, setProgression] = useState<CharacterProgression | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transportID === null) {
      setProgression(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const fetchType = (type: string) =>
      fetch(`/.netlify/functions/mir4tracker-progression?type=${type}&transportID=${transportID}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    Promise.all([
      fetchType('codex'),
      fetchType('holystuff'),
      fetchType('heaven'),
      fetchType('dragon'),
      fetchType('assets'),
      fetchType('potential'),
      fetchType('scripture'),
      fetchType('magicorb'),
      fetchType('magicstone'),
      fetchType('mysticalpiece'),
      fetchType('spirit'),
      fetchType('training'),
      fetchType('stats'),
    ])
      .then(([codex, holystuff, heaven, dragon, assets, potential, scripture, magicorb, magicstone, mysticalpiece, spirit, training, stats]) => {
        if (cancelled) return;
        const magicorbData = unwrap(magicorb) as Record<string, unknown> | null;
        const magicstoneData = unwrap(magicstone) as Record<string, unknown> | null;
        const mysticalpieceData = unwrap(mysticalpiece) as Record<string, unknown> | null;
        // activeDeck só vem no JSON de magicorb/magicstone/mysticalpiece —
        // spirit não declara, então reaproveitamos o mesmo valor (é o
        // mesmo personagem/deck ativo) em vez de inventar um número.
        const activeDeck =
          (magicorbData?.activeDeck as number | undefined) ??
          (magicstoneData?.activeDeck as number | undefined) ??
          (mysticalpieceData?.activeDeck as number | undefined) ??
          null;
        setProgression({
          codex: (unwrap(codex) ?? null) as CharacterProgression['codex'],
          holystuff: (unwrap(holystuff) ?? null) as CharacterProgression['holystuff'],
          heaven: (unwrap(heaven) ?? null) as CharacterProgression['heaven'],
          dragon: (unwrap(dragon) ?? null) as CharacterProgression['dragon'],
          assets: (unwrap(assets) ?? null) as CharacterProgression['assets'],
          potential: (unwrap(potential) ?? null) as CharacterProgression['potential'],
          scripture: (unwrap(scripture) ?? null) as CharacterProgression['scripture'],
          magicorb: magicorbData as CharacterProgression['magicorb'],
          magicstone: magicstoneData as CharacterProgression['magicstone'],
          mysticalpiece: mysticalpieceData as CharacterProgression['mysticalpiece'],
          spirit: (unwrap(spirit) ?? null) as CharacterProgression['spirit'],
          training: (unwrap(training) ?? null) as CharacterProgression['training'],
          stats: (unwrap(stats) ?? null) as CharacterProgression['stats'],
          activeDeck,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar progressão');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [transportID]);

  return { progression, isLoading, error };
}
