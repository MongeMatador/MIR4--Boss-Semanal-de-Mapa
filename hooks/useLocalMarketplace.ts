import { useState, useEffect, useCallback } from 'react';

// Mural de anúncios de compra/venda 100% PRÓPRIO do site (nada a ver com
// mir4tracker.xyz) — consome /.netlify/functions/local-marketplace, que guarda
// os anúncios no Netlify Blobs (armazenamento key-value da própria conta
// Netlify do usuário). Pedido do usuário: manter o visitante NO PRÓPRIO site
// (sem link pra outro lugar) e substituir "comentários"/mensagens por um
// contato direto (Discord/WhatsApp/etc.) informado no próprio anúncio.

export type ListingType = 'vender' | 'comprar';
export type ContactType = 'discord' | 'whatsapp' | 'telegram' | 'outro';

export interface LocalMarketplacePost {
  id: string;
  type: ListingType;
  itemName: string;
  price: number;
  currency: string;
  contactType: ContactType;
  contactValue: string;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export interface NewPostInput {
  type: ListingType;
  itemName: string;
  price: number;
  currency: string;
  contactType: ContactType;
  contactValue: string;
  description: string;
  imageUrl?: string;
}

// Guarda localmente (só neste navegador) quais anúncios são "meus" e o
// respectivo ownerToken — é o que permite remover o próprio anúncio depois,
// sem precisar de login/conta.
const MY_POSTS_KEY = 'mir4_local_marketplace_my_posts';

function loadMyTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(MY_POSTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMyToken(id: string, token: string) {
  try {
    const all = loadMyTokens();
    all[id] = token;
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(all));
  } catch { /* modo privado etc — ignora */ }
}

function removeMyToken(id: string) {
  try {
    const all = loadMyTokens();
    delete all[id];
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(all));
  } catch { /* ignora */ }
}

export function useLocalMarketplace() {
  const [posts, setPosts] = useState<LocalMarketplacePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetch('/.netlify/functions/local-marketplace')
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status} ao buscar anúncios`);
        return r.json();
      })
      .then((json) => setPosts(json.posts ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar anúncios'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
    setMyTokens(loadMyTokens());
  }, [load]);

  const createPost = useCallback(async (input: NewPostInput) => {
    const res = await fetch('/.netlify/functions/local-marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Erro ${res.status} ao publicar anúncio`);
    saveMyToken(json.post.id, json.ownerToken);
    setMyTokens(loadMyTokens());
    load();
    return json.post as LocalMarketplacePost;
  }, [load]);

  const deletePost = useCallback(async (id: string) => {
    const token = myTokens[id];
    if (!token) throw new Error('Você só pode remover anúncios publicados por você neste navegador.');
    const res = await fetch(
      `/.netlify/functions/local-marketplace?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`,
      { method: 'DELETE' },
    );
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `Erro ${res.status} ao remover anúncio`);
    }
    removeMyToken(id);
    setMyTokens(loadMyTokens());
    load();
  }, [myTokens, load]);

  return { posts, isLoading, error, myTokens, createPost, deletePost, reload: load };
}
