// Netlify Function: proxy para o mir4tracker.xyz — perfil completo do
// jogador, incluindo TODOS os históricos (Power Score diário, Level,
// Nome, Clã/Servidor) e o histórico de preço/relistagem de NFT.
//
// Endpoint upstream confirmado (sem login, ver mapa-fontes-campos-publicos-mir4.md
// seção 18/19): GET https://mir4tracker.xyz/api/player/{nome}
//
// O CORS do mir4tracker está FECHADO para qualquer origem de terceiro
// (confirmado via curl com header Origin customizado — nenhum header
// Access-Control-Allow-* voltou na resposta). Por isso é obrigatório um
// proxy server-side; chamar direto do navegador do usuário não funciona.
//
// Uso: /.netlify/functions/mir4tracker-player?name=SouUmMonge

const BASE_URL = 'https://mir4tracker.xyz/api/player';

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const name = params.get('name');

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetro "name" é obrigatório (nome do personagem).' }),
    };
  }

  try {
    const upstream = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`, {
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
        // Histórico muda no máximo algumas vezes por dia (novo evento de
        // power/level/NFT) — 10 minutos de cache é um bom equilíbrio.
        'Cache-Control': 'public, max-age=600, s-maxage=600',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Falha ao buscar dados do mir4tracker.', details: String(err) }),
    };
  }
}
