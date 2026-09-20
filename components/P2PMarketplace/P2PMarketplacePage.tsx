import React, { useState } from 'react';
import { useLocalMarketplace, ListingType, ContactType, LocalMarketplacePost } from '../../hooks/useLocalMarketplace';

// Mural de anúncios P2P 100% PRÓPRIO do site — substituiu a versão anterior
// que só lia (em modo leitura) os posts do mir4tracker.xyz e mandava quem
// quisesse publicar pra lá. Pedido do usuário: manter o visitante no
// PRÓPRIO site (ele quer tráfego/visualizações aqui, não em outro domínio)
// e, em vez de um sistema de comentários/mensagens, cada anúncio já traz o
// contato direto do autor (Discord/WhatsApp/Telegram) pra combinar fora do
// site. Ver netlify/functions/local-marketplace.js pra como isso é guardado.

const CONTACT_LABELS: Record<ContactType, string> = {
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  outro: 'Outro contato',
};

const CONTACT_ICON: Record<ContactType, string> = {
  discord: '🎮',
  whatsapp: '📱',
  telegram: '✈️',
  outro: '✉️',
};

function timeAgo(ts: number) {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

const NewPostForm: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({ onCreated, onCancel }) => {
  const { createPost } = useLocalMarketplace();
  const [type, setType] = useState<ListingType>('vender');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('DRACO');
  const [contactType, setContactType] = useState<ContactType>('discord');
  const [contactValue, setContactValue] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !contactValue.trim()) {
      setFormError('Preencha ao menos o item e o contato.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createPost({
        type,
        itemName: itemName.trim(),
        price: Number(price) || 0,
        currency: currency.trim() || 'DRACO',
        contactType,
        contactValue: contactValue.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
      });
      onCreated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível publicar agora.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Novo anúncio</h2>
        <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-sm">Cancelar</button>
      </div>

      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {(['vender', 'comprar'] as ListingType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${type === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t === 'vender' ? 'Quero vender' : 'Quero comprar'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item ou personagem (ex.: Celestial +8)"
          className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço (opcional)"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="Moeda (DRACO, WEMIX...)"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={contactType}
          onChange={(e) => setContactType(e.target.value as ContactType)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
        >
          {(Object.keys(CONTACT_LABELS) as ContactType[]).map((c) => (
            <option key={c} value={c}>{CONTACT_LABELS[c]}</option>
          ))}
        </select>
        <input
          type="text"
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder="Seu contato (ex.: usuario#1234, +55...)"
          className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes (opcional)"
          rows={2}
          className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Link da imagem do item (opcional — cole o link de um print, ex.: Imgur/Discord)"
          className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        {imageUrl.trim() && (
          <img
            src={imageUrl.trim()}
            alt="Pré-visualização"
            className="sm:col-span-3 max-h-40 rounded-lg border border-slate-700 object-contain bg-slate-950/40"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
      <p className="text-slate-500 text-[11px] -mt-1">
        Não é upload de arquivo — cole o link de uma imagem já hospedada (Imgur, Discord, etc.).
      </p>

      {formError && <p className="text-red-400 text-xs">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
      >
        {submitting ? 'Publicando...' : 'Publicar anúncio'}
      </button>
    </form>
  );
};

const PostCard: React.FC<{ post: LocalMarketplacePost; isMine: boolean; onDelete: () => void }> = ({ post, isMine, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const copyContact = async () => {
    try {
      await navigator.clipboard.writeText(post.contactValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard indisponível — só não mostra o "copiado" */ }
  };

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${post.type === 'vender' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
          {post.type === 'vender' ? 'VENDENDO' : 'PROCURANDO'}
        </span>
        <span className="text-slate-500 text-[11px] ml-auto">{timeAgo(post.createdAt)}</span>
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.itemName}
          loading="lazy"
          className="w-full h-32 object-contain rounded-lg border border-slate-700 bg-slate-950/40"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <p className="text-slate-100 font-semibold text-sm truncate" title={post.itemName}>{post.itemName}</p>
      {post.price > 0 && <p className="text-amber-400 font-bold text-sm">{post.price.toLocaleString('pt-BR')} {post.currency}</p>}
      {post.description && <p className="text-slate-400 text-xs line-clamp-3">{post.description}</p>}

      <button
        type="button"
        onClick={copyContact}
        className="mt-1 flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-xs hover:border-cyan-500 transition-colors"
        title="Clique para copiar"
      >
        <span className="text-slate-300 truncate">
          {CONTACT_ICON[post.contactType]} {CONTACT_LABELS[post.contactType]}: <span className="text-slate-100 font-medium">{post.contactValue}</span>
        </span>
        <span className="text-cyan-400 flex-shrink-0">{copied ? 'Copiado!' : 'Copiar'}</span>
      </button>

      {isMine && (
        <button type="button" onClick={onDelete} className="text-red-400/80 hover:text-red-400 text-[11px] self-end">
          Remover meu anúncio
        </button>
      )}
    </div>
  );
};

export const P2PMarketplacePage: React.FC = () => {
  const { posts, isLoading, error, myTokens, deletePost, reload } = useLocalMarketplace();
  const [filter, setFilter] = useState<'all' | ListingType>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.type === filter);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este anúncio?')) return;
    try {
      await deletePost(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível remover agora.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-slate-100">Marketplace P2P</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Publicar anúncio
          </button>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Anuncie o que você quer vender ou comprar e deixe seu contato (Discord, WhatsApp, Telegram) direto no
        anúncio — combine tudo fora daqui, sem precisar de outro site.
      </p>

      {showForm && (
        <NewPostForm onCreated={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      )}

      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit mb-4">
        {(['all', 'vender', 'comprar'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filter === f ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {f === 'all' ? 'Todos' : f === 'vender' ? 'Vendendo' : 'Procurando'}
          </button>
        ))}
        <button type="button" onClick={reload} className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200" title="Atualizar">
          ↻
        </button>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12 text-slate-400">Carregando anúncios...</div>}
      {error && <div className="text-red-400 text-sm text-center py-8">Não foi possível carregar os anúncios agora.</div>}

      {!isLoading && !error && (
        filtered.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <p className="text-slate-400">Nenhum anúncio por aqui ainda. Seja o primeiro a publicar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isMine={Boolean(myTokens[post.id])}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default P2PMarketplacePage;
