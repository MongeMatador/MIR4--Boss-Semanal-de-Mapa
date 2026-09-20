// Netlify Function: mural de anúncios de compra/venda 100% PRÓPRIO do site
// (NÃO usa nenhum dado do mir4tracker.xyz) — pedido explícito do usuário:
// ele quer manter o visitante no PRÓPRIO site em vez de mandar pra outro
// lugar, e trocar o sistema de comentários/mensagens por um contato direto
// (Discord/WhatsApp/etc.) informado no próprio anúncio.
//
// Usa o Netlify Blobs (@netlify/blobs) — armazenamento key-value nativo da
// PRÓPRIA conta Netlify do usuário, sem precisar de conta em nenhum serviço
// terceiro, sem chave de API extra pra configurar. Funciona automaticamente
// tanto em produção quanto em `netlify dev` (emulado localmente).
//
// Sem login/conta: qualquer visitante pode publicar. Pra permitir que o
// autor remova o próprio anúncio sem precisar de senha, a criação devolve
// um "ownerToken" aleatório que o navegador guarda em localStorage — sem
// esse token (que só quem criou o anúncio tem), não é possível remover.
// Isso não é segurança forte (não é o objetivo aqui), só evita que QUALQUER
// visitante remova o anúncio de outra pessoa por acidente ou de propósito.
//
// GET    /.netlify/functions/local-marketplace                -> { posts: [...] }  (mais recentes primeiro, sem ownerToken)
// POST   /.netlify/functions/local-marketplace                -> cria um anúncio, devolve { post, ownerToken }
// DELETE /.netlify/functions/local-marketplace?id=X&token=Y    -> remove um anúncio (exige o ownerToken da criação)

import { getStore } from '@netlify/blobs';

const MAX_FIELD = { itemName: 80, contactValue: 120, description: 400, currency: 20, imageUrl: 500 };
const VALID_TYPES = ['vender', 'comprar'];
const VALID_CONTACT_TYPES = ['discord', 'whatsapp', 'telegram', 'outro'];

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  const store = getStore('local-marketplace');

  if (event.httpMethod === 'GET') {
    const { blobs } = await store.list();
    const posts = [];
    for (const b of blobs) {
      const raw = await store.get(b.key, { type: 'json' });
      if (raw) {
        const { ownerToken, ...safe } = raw; // nunca devolver o token pra quem não é o dono
        posts.push(safe);
      }
    }
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return json(200, { posts });
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'JSON inválido' });
    }

    const type = body.type;
    const itemName = String(body.itemName || '').trim().slice(0, MAX_FIELD.itemName);
    const price = Number(body.price) || 0;
    const currency = String(body.currency || 'DRACO').trim().slice(0, MAX_FIELD.currency);
    const contactType = body.contactType;
    const contactValue = String(body.contactValue || '').trim().slice(0, MAX_FIELD.contactValue);
    const description = String(body.description || '').trim().slice(0, MAX_FIELD.description);
    // Imagem do item (rodada 6, pedido do usuário: "igual estava
    // anteriormente"). Em vez de upload de arquivo (que exigiria guardar
    // binário no Blob e um endpoint extra), aceitamos uma URL de imagem já
    // hospedada (ex.: um print colado no Discord/Imgur) — mais simples,
    // sem infra nova, e só aceitamos http(s) pra evitar outros esquemas.
    let imageUrl = String(body.imageUrl || '').trim().slice(0, MAX_FIELD.imageUrl);
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = '';

    if (!VALID_TYPES.includes(type)) {
      return json(400, { error: 'type deve ser "vender" ou "comprar"' });
    }
    if (!itemName) {
      return json(400, { error: 'itemName é obrigatório' });
    }
    if (!VALID_CONTACT_TYPES.includes(contactType)) {
      return json(400, { error: 'contactType inválido' });
    }
    if (!contactValue) {
      return json(400, { error: 'contactValue (o contato) é obrigatório' });
    }

    const id = randomId();
    const ownerToken = randomId() + randomId();
    const post = {
      id,
      type,
      itemName,
      price,
      currency,
      contactType,
      contactValue,
      description,
      imageUrl,
      createdAt: Date.now(),
      ownerToken,
    };
    await store.setJSON(id, post);

    const { ownerToken: _omit, ...safePost } = post;
    return json(201, { post: safePost, ownerToken });
  }

  if (event.httpMethod === 'DELETE') {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const id = params.get('id');
    const token = params.get('token');
    if (!id || !token) {
      return json(400, { error: 'id e token são obrigatórios' });
    }

    const existing = await store.get(id, { type: 'json' });
    if (!existing) {
      return json(404, { error: 'anúncio não encontrado' });
    }
    if (existing.ownerToken !== token) {
      return json(403, { error: 'token não corresponde a este anúncio' });
    }

    await store.delete(id);
    return json(200, { deleted: true });
  }

  return json(405, { error: 'Método não suportado' });
}

// Melhorias futuras naturais (não implementadas nesta primeira versão, pra
// não inventar escopo que o usuário não pediu): limite de anúncios por IP
// num período, expiração automática de anúncios antigos, edição de um
// anúncio já publicado (hoje só dá pra remover e criar de novo).
