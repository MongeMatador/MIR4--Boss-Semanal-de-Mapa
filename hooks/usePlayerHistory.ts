import { useState, useEffect } from 'react';
import {
  PlayerProfile,
  PowerHistoryEntry,
  LevelTrackEntry,
  NameTrackEntry,
  ClanServerHistoryEntry,
  NftHistoryEntry,
} from '../types/history';

// Busca o perfil histórico completo de um personagem por NOME (não precisa
// de seq/transportID de antemão) via /.netlify/functions/mir4tracker-player.
//
// Cobre: Power Score diário, Level Track, Past Names, histórico de
// clã/servidor, e o histórico de preço/relistagem de NFT (nftHistoryDtos).
//
// `name` pode ser null (ex.: enquanto o usuário ainda não digitou nada) —
// nesse caso o hook não dispara nenhuma busca.
export function usePlayerHistory(name: string | null) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!name || !name.trim()) {
      setProfile(null);
      setNotFound(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    fetch(`/.netlify/functions/mir4tracker-player?name=${encodeURIComponent(name.trim())}`)
      .then(async (r) => {
        if (r.status === 404) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((raw) => {
        if (cancelled || !raw) return;

        const cig = raw.characterInGame || {};
        const details = Array.isArray(cig.characterInGameDetails) ? cig.characterInGameDetails : [];
        const lastDetail = details[details.length - 1] || {};

        const powerHistory: PowerHistoryEntry[] = Array.isArray(cig.characterInGamePowers)
          ? cig.characterInGamePowers
          : [];
        const levelTrack: LevelTrackEntry[] = Array.isArray(raw.ingameLevelTrack) ? raw.ingameLevelTrack : [];
        const nameTrack: NameTrackEntry[] = Array.isArray(raw.ingameNameTracks) ? raw.ingameNameTracks : [];
        const clanServerHistory: ClanServerHistoryEntry[] = Array.isArray(cig.characterInGameHistory)
          ? cig.characterInGameHistory
          : [];
        const nftHistory: NftHistoryEntry[] = Array.isArray(raw.nftHistoryDtos) ? raw.nftHistoryDtos : [];

        // Peak/current calculados com cuidado: nem sempre a API devolve a
        // lista em ordem cronológica, e algum registro pode vir sem
        // powerScore numérico válido — sem esses dois cuidados, Math.max
        // vira NaN (era o bug do "Pico histórico: NaN") e o "atual" podia
        // pegar o item errado.
        let peakPower: number | null = null;
        let currentPower: number | null = null;
        const validPower = powerHistory
          .map((p) => ({ ...p, powerScore: Number(p.powerScore) }))
          .filter((p) => Number.isFinite(p.powerScore));
        if (validPower.length > 0) {
          peakPower = Math.max(...validPower.map((p) => p.powerScore));
          const sortedByDate = [...validPower].sort((a, b) => a.localDate.localeCompare(b.localDate));
          currentPower = sortedByDate[sortedByDate.length - 1].powerScore;
        }

        setProfile({
          name: cig.name || raw.name || name,
          status: raw.status || 'unknown',
          lv: raw.lv ?? 'unknown',
          clan: lastDetail.clan ?? null,
          worldName: lastDetail.worldName ?? null,
          worldgroupName: lastDetail.worldgroupName ?? null,
          classId: lastDetail._class ?? null,
          powerHistory,
          levelTrack,
          nameTrack,
          clanServerHistory,
          nftHistory,
          currentPower,
          peakPower,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar histórico');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [name]);

  return { profile, isLoading, error, notFound };
}
