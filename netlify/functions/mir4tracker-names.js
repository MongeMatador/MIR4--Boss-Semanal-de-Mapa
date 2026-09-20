// Netlify Function: proxy para o autocomplete de nomes do mir4tracker.xyz.
//
// Endpoint upstream confirmado ao vivo (sem login):
//   GET https://mir4tracker.xyz/api/names/{query}
// Retorna: [{ "label": "NomeDoPersonagem" }, ...]
//
// Uso: /.netlify/functions/mir4tracker-names?q=Sou

const BASE_URL = 'https://mir4tracker.xyz/api/names';

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const q = params.get('q');

  if (!q || q.trim().length < 2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetro "q" precisa ter ao menos 2 caracteres.' }),
    };
  }

  try {
    const upstream = await fetch(`${BASE_URL}/${encodeURIComponent(q.trim())}`, {
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
        // Autocomplete pode cachear bem curto — nomes novos aparecem rápido.
        'Cache-Control': 'public, max-age=120, s-maxage=120',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar sugestões de nome.', details: String(err) }) };
  }
}
