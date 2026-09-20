// Netlify Function: proxy para o Clan Rankings do mir4tracker.xyz.
//
// Endpoints upstream CONFIRMADOS AO VIVO nesta sessão (curl sem cookie, sem
// login) em 2026-09-19:
//   GET https://mir4tracker.xyz/api/clan-rankings?scope=global|world:{worldgroup}|server:{server}
//     → { captureDate, rankings: [{clan, leader, power, rank, server}] }
//     (~1000 clãs em scope=global; escopo "world:NA1" filtra pelo grupo de
//     servidores; escopo "server:NA011" filtra por um servidor só)
//   GET https://mir4tracker.xyz/api/clan-rankings/power-growth
//     → { currentDate, growth: [{clan, currentPower, currentRank, gained,
//         leader, previousPower}] } (maiores ganhos de poder desde o
//         snapshot anterior)
//   GET https://mir4tracker.xyz/api/clan-rankings/rank-changes
//     → { climbers: [{clan, currentRank, delta, leader, previousRank}] }
//         (maiores subidas de ranking desde o snapshot anterior)
//
// Uso: /.netlify/functions/mir4tracker-clan-rankings?tab=list&scope=global
//      /.netlify/functions/mir4tracker-clan-rankings?tab=list&scope=world:NA1
//      /.netlify/functions/mir4tracker-clan-rankings?tab=list&scope=server:NA011
//      /.netlify/functions/mir4tracker-clan-rankings?tab=growth
//      /.netlify/functions/mir4tracker-clan-rankings?tab=changes

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const tab = params.get('tab') || 'list';

  let url;
  if (tab === 'list') {
    const scope = params.get('scope') || 'global';
    url = `https://mir4tracker.xyz/api/clan-rankings?scope=${encodeURIComponent(scope)}`;
  } else if (tab === 'growth') {
    url = 'https://mir4tracker.xyz/api/clan-rankings/power-growth';
  } else if (tab === 'changes') {
    url = 'https://mir4tracker.xyz/api/clan-rankings/rank-changes';
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "tab" deve ser list, growth ou changes.' }) };
  }

  try {
    const upstream = await fetch(url, {
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
        // O próprio tracker atualiza isso por snapshot diário.
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar clan rankings.', details: String(err) }) };
  }
}
