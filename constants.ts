
import { BossSpawnRaw } from './types';
import { BOSS_DATA } from './data';

export const ALL_MAPS = 'Todos os Mapas';
export const ALL_BOSSES = 'Todos os Bosses';
export const ALL_PERIODS = 'Todos os Horários';
export const ALL_TIERS = 'Todas as Camadas';

// Mapeamento de servidores para seus respectivos fusos horários
// Ajustado conforme solicitação do usuário:
// SA = UTC-3
// NA = UTC-4
// EU = UTC+2
// ASIA = UTC+8
// INMENA = UTC+6
export const SERVER_TIMEZONES: { [key: string]: { label: string, offset: number, iana: string } } = {
    'SA': { label: 'SA (UTC-3)', offset: -3, iana: 'Etc/GMT+3' },
    'NA': { label: 'NA (UTC-4)', offset: -4, iana: 'Etc/GMT+4' },
    'EU': { label: 'EU (UTC+2)', offset: 2, iana: 'Etc/GMT-2' },
    'ASIA': { label: 'ASIA (UTC+8)', offset: 8, iana: 'Etc/GMT-8' },
    'INMENA': { label: 'INMENA (UTC+6)', offset: 6, iana: 'Etc/GMT-6' },
};


export const PERIODOS: Record<string, [number, number] | null> = {
    [ALL_PERIODS]: null,
    'Manhã (06:00 - 11:59)': [6, 12],
    'Tarde (12:00 - 17:59)': [12, 18],
    'Noite (18:00 - 05:59)': [18, 6] // Caso especial
};

// Aqui a mágica acontece: lemos do novo arquivo data.ts em vez de fixar no window.
export const BOSS_DATA_RAW: BossSpawnRaw[] = BOSS_DATA;
