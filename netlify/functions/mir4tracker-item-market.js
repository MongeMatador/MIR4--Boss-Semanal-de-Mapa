// Netlify Function: proxy para o Item Market (mercado de itens avulsos) do
// mir4tracker.xyz.
//
// Endpoint upstream CONFIRMADO AO VIVO (curl sem cookie, sem login) em
// 2026-09-19: GET https://mir4tracker.xyz/api/item-market?query=&sortBy=&asc=&page=&size=
//   → { content: [{chinessItemName, engilishItemName, grade, id, imgPath,
//       itemType, itemUID, lastUpdated, mainType, price, saleQuantity,
//       server, tabCategory, tier}], totalElements, totalPages, ... }
// (5.000+ listagens confirmadas — ver mapa-fontes-campos-publicos-mir4.md
// seção 6.2). CORS fechado (confirmado) — por isso o proxy.
//
// Filtro por continente/região (rodada 6): CONFIRMADO AO VIVO que o próprio
// endpoint aceita um parâmetro `server` (o valor já é o worldgroup, ex.:
// "NA1", "EU1", "ASIA1", "SA1", "INMENA1" — o mesmo agrupamento usado em
// constants/regions.ts) e filtra server-side, incluindo o `totalElements`
// já filtrado (testado: sem filtro = 4837 itens; com server=EU1 = 955,
// todos com server:"EU1"). Um parâmetro `worldgroup=` testado à parte NÃO
// funciona (é ignorado silenciosamente) — o nome real do parâmetro é
// `server`, mesmo já existindo um campo de resposta com esse nome.
//
// Filtros de Categoria/Nota/Nível (rodada 7): CONFIRMADO AO VIVO que o
// endpoint upstream também aceita `tabCategory`, `grade` e `tier` e filtra
// server-side de verdade (testado 1-a-1 pra cada valor de tabCategory de 1 a
// 24: totalElements muda e os itens retornados batem com o filtro). Já a
// "Aula" (classe) do print de referência do usuário NÃO existe como
// parâmetro deste endpoint (testado `class`, `job`, `jobType`,
// `characterClass`, `classType`, `itemClass`, `requireClass` — nenhum altera
// o total) — o próprio mir4tracker faz esse filtro no CLIENTE, detectando a
// classe pelo nome do arquivo de ícone (`_Pcw_`, `_Pcm_`, etc. — ver
// `IM_CLASS_CODE_MAP` no `app.js` deles, replicado em `useItemMarket.ts`).
//
// Uso: /.netlify/functions/mir4tracker-item-market?query=Sword&page=0&size=30&sortBy=price&asc=false&server=EU1&tabCategory=2&grade=5&tier=4

const ALLOWED_SORT = new Set(['price', 'lastUpdated', 'grade', 'tier']);
const ALLOWED_SERVERS = new Set(['NA1', 'EU1', 'ASIA1', 'ASIA2', 'ASIA3', 'SA1', 'INMENA1']);
const ALLOWED_CATEGORIES = new Set(['2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '17', '20', '21', '22']);
const ALLOWED_GRADES = new Set(['1', '2', '3', '4', '5']);
const ALLOWED_TIERS = new Set(['1', '2', '3', '4']);

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const query = params.get('query') || '';
  const page = params.get('page') || '0';
  // Cap normal de 60; quando o filtro de classe (client-side) está ativo,
  // o front pede um lote bem maior de uma vez (até 300) pra paginar
  // localmente depois de filtrar — mesma técnica usada pelo próprio
  // mir4tracker (eles usam 2000; usamos um teto menor pra não estourar o
  // tempo/tamanho de resposta da function).
  const size = Math.min(Number(params.get('size')) || 30, 300);
  const sortBy = ALLOWED_SORT.has(params.get('sortBy')) ? params.get('sortBy') : 'lastUpdated';
  const asc = params.get('asc') === 'true';
  const server = ALLOWED_SERVERS.has(params.get('server')) ? params.get('server') : '';
  const tabCategory = ALLOWED_CATEGORIES.has(params.get('tabCategory')) ? params.get('tabCategory') : '';
  const grade = ALLOWED_GRADES.has(params.get('grade')) ? params.get('grade') : '';
  const tier = ALLOWED_TIERS.has(params.get('tier')) ? params.get('tier') : '';

  const qs = new URLSearchParams({ query, page: String(page), size: String(size), sortBy, asc: String(asc) });
  if (server) qs.set('server', server);
  if (tabCategory) qs.set('tabCategory', tabCategory);
  if (grade) qs.set('grade', grade);
  if (tier) qs.set('tier', tier);

  try {
    const upstream = await fetch(`https://mir4tracker.xyz/api/item-market?${qs.toString()}`, {
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
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Falha ao buscar o mercado de itens.', details: String(err) }) };
  }
}
