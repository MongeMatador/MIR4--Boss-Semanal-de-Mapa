// Mapa oficial região → lista de servidores.
//
// Fonte original: extraído do bundle JS público do mir4tracker.xyz
// (constante `REGIONS`, usada pelo próprio site deles para os dropdowns de
// região/servidor). Essa constante hardcoded no frontend deles estava
// desatualizada (faltavam servidores novos) — confirmado ao vivo em
// 2026-09-19 testando `GET /api/rankings2/{region}/{server}` para cada
// servidor "seguinte" de cada grupo: ASIA042, ASIA092, ASIA342, INMENA032,
// EU032, SA042 e NA042 retornaram dados reais (totalElements > 0) mas não
// estavam na lista deles. Adicionados aqui com base nessa confirmação ao
// vivo, não copiados às cegas — é a origem do bug relatado pelo usuário de
// "SA042 não aparece nas transferências".
export const REGIONS: Record<string, string[]> = {
  ASIA1: ['ASIA011', 'ASIA012', 'ASIA013', 'ASIA014', 'ASIA021', 'ASIA022', 'ASIA023', 'ASIA024', 'ASIA031', 'ASIA032', 'ASIA033', 'ASIA034', 'ASIA041', 'ASIA042'],
  ASIA2: ['ASIA051', 'ASIA052', 'ASIA053', 'ASIA061', 'ASIA062', 'ASIA063', 'ASIA071', 'ASIA072', 'ASIA073', 'ASIA081', 'ASIA082', 'ASIA083', 'ASIA091', 'ASIA092'],
  ASIA3: ['ASIA311', 'ASIA312', 'ASIA313', 'ASIA314', 'ASIA321', 'ASIA322', 'ASIA323', 'ASIA324', 'ASIA331', 'ASIA332', 'ASIA333', 'ASIA334', 'ASIA341', 'ASIA342'],
  INMENA1: ['INMENA011', 'INMENA012', 'INMENA013', 'INMENA014', 'INMENA021', 'INMENA022', 'INMENA023', 'INMENA024', 'INMENA031', 'INMENA032'],
  EU1: ['EU011', 'EU012', 'EU013', 'EU014', 'EU021', 'EU022', 'EU023', 'EU024', 'EU031', 'EU032'],
  SA1: ['SA011', 'SA012', 'SA013', 'SA014', 'SA021', 'SA022', 'SA023', 'SA031', 'SA032', 'SA033', 'SA041', 'SA042'],
  NA1: ['NA011', 'NA012', 'NA013', 'NA014', 'NA021', 'NA022', 'NA023', 'NA031', 'NA032', 'NA033', 'NA041', 'NA042'],
};

export const REGION_NAMES = Object.keys(REGIONS);

// Grupo "macro" de cada região (ex.: ASIA1/ASIA2/ASIA3 → "ASIA"), usado nos
// filtros de Clan Rankings/Global Rankings — mesma lógica que o próprio
// mir4tracker usa (prefixo do nome do worldgroup, sem o número final).
export function macroGroup(worldgroup: string): string {
  return worldgroup.replace(/\d+$/, '');
}

export const MACRO_GROUPS = Array.from(new Set(REGION_NAMES.map(macroGroup)));
