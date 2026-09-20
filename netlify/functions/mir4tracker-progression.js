// Netlify Function: proxy para os endpoints "wemix-nft-*" do mir4tracker.xyz
// — Códex, Antiguidade (holystuff), Constituição/Chi (heaven), Artefato de
// Dragão (dragon), Recursos (assets), Potencial, Salão das Escrituras
// (scripture), Orbe Mágica, Pedra Mágica, Peça Mística, Espíritos, Artes
// Marciais (training) e Atributos de Combate (stats) de QUALQUER
// personagem, sem precisar de login no WEMIX PLAY nem do dono estar logado.
//
// Endpoints upstream confirmados (ver mapa-fontes-campos-publicos-mir4.md
// seção 18.7 e seção 21.1 — rodada 4, testados ao vivo em 2026-09-19 com
// transportID=369524, todos retornaram HTTP 200 com dados reais):
//   GET https://mir4tracker.xyz/api/wemix-nft-codex?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-holystuff?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-heaven?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-dragon?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-assets?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-potential?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-scripture?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-magicorb?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-magicstone?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-mysticalpiece?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-spirit?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-training?transportID=X
//   GET https://mir4tracker.xyz/api/wemix-nft-stats?transportID=X
//
// Isso fecha o gap antes documentado (Potencial e Salão das Escrituras
// tinham fonte pública confirmada nesta rodada; E.T. completo e Mapa de
// Manifestação Divina continuam SEM endpoint público conhecido — não
// inventar dado para esses dois).
//
// CORS do mir4tracker fechado para terceiros — proxy obrigatório.
//
// Uso: /.netlify/functions/mir4tracker-progression?type=codex&transportID=369524

const BASE_URL = 'https://mir4tracker.xyz/api/wemix-nft';

const ALLOWED_TYPES = [
  'codex', 'holystuff', 'heaven', 'dragon', 'assets',
  'potential', 'scripture', 'magicorb', 'magicstone', 'mysticalpiece', 'spirit', 'training', 'stats',
];

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const type = params.get('type');
  const transportID = params.get('transportID');

  if (!ALLOWED_TYPES.includes(type)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Parâmetro "type" deve ser um de: ${ALLOWED_TYPES.join(', ')}` }),
    };
  }
  if (!transportID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetro "transportID" é obrigatório.' }),
    };
  }

  try {
    const upstream = await fetch(`${BASE_URL}-${type}?transportID=${encodeURIComponent(transportID)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        body: JSON.stringify({ error: `mir4tracker retornou ${upstream.status}` }),
      };
    }

    const data = await upstream.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Progressão (Códex/Constituição/Antiguidade/etc.) muda devagar —
        // cache mais longo, 30 minutos, igual ao detalhe de equipamento.
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Falha ao buscar dados de progressão do mir4tracker.', details: String(err) }),
    };
  }
}
