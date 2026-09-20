// Netlify Function: proxy SOMENTE DE LEITURA para o Marketplace P2P
// (compra/venda entre jogadores, com comentários) do mir4tracker.xyz.
//
// Endpoints upstream CONFIRMADOS AO VIVO (curl sem cookie, sem login) em
// 2026-09-19:
//   GET https://mir4tracker.xyz/api/marketplace/posts
//     → { posts: [{comment_count, created_at, description, id, images[],
//         last_activity_at, listing_type ("selling"|"buying"), pinned,
//         price, status, title, username}] }
//   GET https://mir4tracker.xyz/api/marketplace/posts/{id}
//     → { post: {...}, comments: [...] }
//
// IMPORTANTE: criar post/comentário exige LOGIN no mir4tracker.xyz (a
// própria página deles usa apiFetch(..., {method:'POST'}) autenticado) —
// não temos nem devemos ter as credenciais do usuário. Este proxy só
// EXPÕE LEITURA dos posts públicos; para publicar ou comentar, o usuário
// precisa fazer isso direto em mir4tracker.xyz (link exibido na UI).
//
// Uso: /.netlify/functions/mir4tracker-marketplace?type=list
//      /.netlify/functions/mir4tracker-marketplace?type=detail&id=<uuid>

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const type = params.get('type') || 'list';

  let url;
  if (type === 'list') {
    url = 'https://mir4tracker.xyz/api/marketplace/posts';
  } else if (type === 'detail') {
    const id = params.get('id');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "id" é obrigatório.' }) };
    url = `https://mir4tracker.xyz/api/marketplace/posts/${encodeURIComponent(id)}`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro "type" deve ser list ou detail.' }) };
  }

  try {
    const upstream = await fetch(url, {
      method: 'GET', // nunca proxy de POST/DELETE — só leitura pública
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
        // Posts novos podem aparecer a qualquer momento — cache curto.
        'Cache-Control': 'public, max-age=120, s-maxage=120',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar o marketplace.', details: String(err) }) };
  }
}
