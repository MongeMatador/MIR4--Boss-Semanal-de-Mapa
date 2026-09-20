// Netlify Function: proxy para os rankings globais/por região do
// mir4tracker.xyz (aba "Global Rankings" do site deles).
//
// Endpoints upstream CONFIRMADOS AO VIVO nesta sessão (curl sem cookie, sem
// login) em 2026-09-19:
//   GET https://mir4tracker.xyz/api/global-rankings?ranktype=1&page=N
//     → Global Board (Overall, top 100 por página): { data: [{clan, classId,
//       name, power, rank, rankMove, server}] }
//   GET https://mir4tracker.xyz/api/global-rankings?ranktype=1000&classtype=N&page=N
//     → Global Board filtrado por classe (classtype 1=Warrior..7=Lionheart;
//       ranktype=1 IGNORA o filtro de classe, por isso o ranktype=1000).
//   GET https://mir4tracker.xyz/api/region-notables
//     → lista de regiões disponíveis: { regions: [{id, label}] }
//   GET https://mir4tracker.xyz/api/region-notables/{region}
//     → top jogadores da região: { captureDate, label, players: [{clan, job,
//       level, name, power, rank, server}] }
//
// Uso: /.netlify/functions/mir4tracker-rankings?type=overall&page=1
//      /.netlify/functions/mir4tracker-rankings?type=class&classId=2&page=1
//      /.netlify/functions/mir4tracker-rankings?type=regions
//      /.netlify/functions/mir4tracker-rankings?type=region-detail&region=NA1

const CLASS_IDS = { warrior: 1, sorcerer: 2, taoist: 3, arbalist: 4, lancer: 5, darkist: 6, lionheart: 7 };

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const type = params.get('type');
  const page = params.get('page') || '1';

  let url;
  if (type === 'overall') {
    url = `https://mir4tracker.xyz/api/global-rankings?ranktype=1&page=${encodeURIComponent(page)}`;
  } else if (type === 'class') {
    const classId = params.get('classId');
    if (!classId || !Object.values(CLASS_IDS).includes(Number(classId))) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "classId" inválido (1-7).' }) };
    }
    url = `https://mir4tracker.xyz/api/global-rankings?ranktype=1000&classtype=${encodeURIComponent(classId)}&page=${encodeURIComponent(page)}`;
  } else if (type === 'regions') {
    url = 'https://mir4tracker.xyz/api/region-notables';
  } else if (type === 'region-detail') {
    const region = params.get('region');
    if (!region) return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "region" é obrigatório.' }) };
    url = `https://mir4tracker.xyz/api/region-notables/${encodeURIComponent(region)}`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "type" deve ser overall, class, regions ou region-detail.' }) };
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
        // Rankings mudam com o jogo em tempo real, mas o próprio tracker
        // batiza isso como snapshot — cache curto é seguro.
        'Cache-Control': 'public, max-age=600, s-maxage=600',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar rankings.', details: String(err) }) };
  }
}
