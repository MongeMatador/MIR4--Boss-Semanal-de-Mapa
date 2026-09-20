// Netlify Function: proxy para os endpoints de detalhe de personagem
// (equipamento via "summary" e inventário/codex via "inven").
//
// Uso:
//   /.netlify/functions/xdraco-character?type=summary&seq=123
//   /.netlify/functions/xdraco-character?type=inven&transportID=456

const SUMMARY_URL = 'https://webapi.mir4global.com/nft/character/summary';
const INVEN_URL = 'https://webapi.mir4global.com/nft/character/inven';

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const type = params.get('type');

  let upstreamUrl;
  if (type === 'summary') {
    const seq = params.get('seq');
    if (!seq) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "seq" é obrigatório para type=summary' }) };
    }
    upstreamUrl = `${SUMMARY_URL}?seq=${encodeURIComponent(seq)}&languageCode=en`;
  } else if (type === 'inven') {
    const transportID = params.get('transportID');
    if (!transportID) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "transportID" é obrigatório para type=inven' }) };
    }
    upstreamUrl = `${INVEN_URL}?transportID=${encodeURIComponent(transportID)}&languageCode=en`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "type" deve ser "summary" ou "inven"' }) };
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://xdraco.com/nft/',
      },
    });

    if (!upstream.ok) {
      return { statusCode: upstream.status, body: JSON.stringify({ error: `API upstream retornou ${upstream.status}` }) };
    }

    const data = await upstream.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Detalhe de personagem muda pouco (equipamento/inventário só mudam
        // se o dono trocar algo) — cache mais longo, 30 minutos.
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar detalhe do personagem.', details: String(err) }) };
  }
}
