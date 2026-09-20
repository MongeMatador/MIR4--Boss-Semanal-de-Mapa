// Netlify Function: proxy para os dados de guerra (Cerco ao Castelo e Cerco
// de Sabuk) do mir4tracker.xyz.
//
// Endpoints upstream CONFIRMADOS AO VIVO nesta sessão (curl sem cookie, sem
// login) em 2026-09-18:
//   GET https://mir4tracker.xyz/api/war/castlesiege
//     → { fetched_at, results: [{ clan, isCastle, leader, level, member, newEntry, power, server }] }
//   GET https://mir4tracker.xyz/api/war/sabuksiege
//     → { fetched_at, results: [{ clan, gateway, isCastle, leader, level, member, newEntry, power, server }], rounds: [{id, name}] }
//   GET https://mir4tracker.xyz/api/hidden-valley
//     → { captureDate, fetched_at, servers: [{ server, worldId, bicheon, redMoon, snakePit }] }
//     onde cada zona (bicheon/redMoon/snakePit) é { clan, isNew, leader, level, members, power }
//     ou null quando a zona não tem detentor no momento.
//
// Todos retornam a foto do estado ATUAL de todos os servidores de uma vez —
// não é preciso (nem existe, confirmado) filtro por região/servidor. O
// parâmetro "round" em sabuksiege foi testado e não altera o resultado
// (retorna sempre o mais recente) — não expomos esse parâmetro por não
// termos confirmado que ele funciona.
//
// Uso: /.netlify/functions/mir4tracker-war?type=castle
//      /.netlify/functions/mir4tracker-war?type=sabuk
//      /.netlify/functions/mir4tracker-war?type=valley

const ENDPOINTS = {
  castle: 'https://mir4tracker.xyz/api/war/castlesiege',
  sabuk: 'https://mir4tracker.xyz/api/war/sabuksiege',
  valley: 'https://mir4tracker.xyz/api/hidden-valley',
};

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const type = params.get('type');

  if (!ENDPOINTS[type]) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "type" deve ser "castle", "sabuk" ou "valley".' }) };
  }

  try {
    const upstream = await fetch(ENDPOINTS[type], {
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
        // Cercos acontecem em ciclos de dias/semanas — cache de 30 min é seguro.
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar dados de guerra.', details: String(err) }) };
  }
}
