// Netlify Function: proxy para a API pública do marketplace de NFT do MIR4
// (webapi.mir4global.com), que o próprio site xdraco.com usa.
//
// Por que um proxy em vez de chamar direto do navegador do usuário:
//  1. Evita problemas de CORS (a API não expõe headers de CORS pra outros domínios).
//  2. Adiciona cache de borda (Cache-Control), reduzindo chamadas repetidas.
//  3. Se a API externa mudar de endereço ou exigir headers extras no futuro,
//     só precisamos atualizar aqui — o frontend não muda.
//
// Uso: /.netlify/functions/xdraco-lists?listType=sale&class=0&page=1

const BASE_URL = 'https://webapi.mir4global.com/nft/lists';

const ALLOWED_LIST_TYPES = ['sale', 'recent', 'topTraded', 'recommended'];

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});

  const listType = params.get('listType') || 'sale';
  if (!ALLOWED_LIST_TYPES.includes(listType)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `listType inválido. Use um de: ${ALLOWED_LIST_TYPES.join(', ')}` }),
    };
  }

  // Garante languageCode padrão se não vier
  if (!params.has('languageCode')) {
    params.set('languageCode', 'en');
  }

  try {
    const upstream = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://xdraco.com/nft/',
      },
    });

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        body: JSON.stringify({ error: `API upstream retornou ${upstream.status}` }),
      };
    }

    const data = await upstream.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache de 5 minutos na CDN da Netlify — poupa chamadas repetidas
        // sem deixar o preço/listagem muito desatualizado.
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Falha ao buscar dados do marketplace.', details: String(err) }),
    };
  }
}
