import { useState, useEffect } from 'react';

export interface MarketplacePost {
  comment_count: number;
  created_at: string;
  description: string;
  id: string;
  images: string[];
  last_activity_at: string;
  listing_type: 'selling' | 'buying';
  pinned: boolean;
  price: string;
  status: string;
  title: string;
  username: string;
}

export interface MarketplaceComment {
  id: string;
  username: string;
  body?: string;
  message?: string;
  created_at?: string;
  [key: string]: unknown;
}

// Marketplace P2P (anúncios de compra/venda entre jogadores, com
// comentários), via /.netlify/functions/mir4tracker-marketplace — proxy
// SOMENTE LEITURA de /api/marketplace/posts do mir4tracker.xyz. Publicar ou
// comentar exige login no mir4tracker.xyz (não temos acesso à conta do
// usuário nesse site, nem devemos ter).
export function useMarketplacePosts() {
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch('/.netlify/functions/mir4tracker-marketplace?type=list')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => { if (!cancelled) setPosts(Array.isArray(data?.posts) ? data.posts : []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar anúncios'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { posts, isLoading, error };
}

export function useMarketplacePostDetail(id: string | null) {
  const [post, setPost] = useState<MarketplacePost | null>(null);
  const [comments, setComments] = useState<MarketplaceComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setPost(null); setComments([]); return; }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/.netlify/functions/mir4tracker-marketplace?type=detail&id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setPost(data?.post ?? null);
        setComments(Array.isArray(data?.comments) ? data.comments : []);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao buscar anúncio'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { post, comments, isLoading, error };
}
