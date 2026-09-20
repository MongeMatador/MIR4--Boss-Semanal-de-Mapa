// Netlify Function: proxy para as transferências diárias de servidor do
// mir4tracker.xyz (jogadores entrando/saindo de um servidor).
//
// Endpoint upstream CONFIRMADO AO VIVO nesta sessão (curl sem cookie, sem
// login) em 2026-09-18: GET https://mir4tracker.xyz/api/transfers/{worldgroupName}/{worldName}
// Exemplo real testado: /api/transfers/NA1/NA011 → array de
//   { _class, name, newClan, newServer, oldClan, oldServer, power }
// (power vem como string formatada, ex.: "444,913" — não como number puro)
//
// worldgroupName/worldName seguem o mesmo padrão retornado por
// /api/player/{nome} (characterInGameDetails[].worldgroupName / .worldName),
// ex.: worldgroupName "NA1", worldName "NA011".
//
// Uso: /.netlify/functions/mir4tracker-transfers?worldgroup=NA1&world=NA011

const BASE_URL = 'https://mir4tracker.xyz/api/transfers';

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const worldgroup = params.get('worldgroup');
  const world = params.get('world');

  if (!worldgroup || !world) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetros "worldgroup" e "world" são obrigatórios (ex.: NA1 / NA011).' }),
    };
  }

  try {
    const upstream = await fetch(`${BASE_URL}/${encodeURIComponent(worldgroup)}/${encodeURIComponent(world)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!upstream.ok) {
      return { statusCode: upstream.status, body: JSON.stringify({ error: `mir4tracker retornou ${upstream.status}` }) };
    }

    const data = await upstream.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Transferências são atualizadas diariamente pelo próprio tracker.
        'Cache-Control': 'public, max-age=900, s-maxage=900',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar transferências.', details: String(err) }) };
  }
}
