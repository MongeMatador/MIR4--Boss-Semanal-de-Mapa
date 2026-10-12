import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://mir4bossrespawntimer.netlify.app';

interface Meta {
  title: string;
  description: string;
}

const DEFAULT_META: Meta = {
  title: 'MIR4 Boss Respawn Timer - Cronômetro e Localização',
  description:
    'Timer de Boss MIR4 em tempo real. Acompanhe o respawn, localização, e acesse guias e estratégias. A ferramenta definitiva para jogadores e clãs de MIR4.',
};

const META_BY_PATH: Record<string, Meta> = {
  '/': DEFAULT_META,
  '/marketplace': {
    title: 'Marketplace de NFTs MIR4 — Preços e Personagens à Venda | MIR4 Boss Timer',
    description:
      'Veja personagens NFT à venda no marketplace do MIR4 com filtros por classe, poder e preço, atualizados diariamente.',
  },
  '/consulta': {
    title: 'Consulta de Jogador MIR4 — Poder, Equipamentos e Histórico | MIR4 Boss Timer',
    description:
      'Pesquise qualquer jogador de MIR4 pelo nome e veja poder, evolução, histórico e transferências de servidor.',
  },
  '/transferencias': {
    title: 'Transferências de Servidor MIR4 — Histórico | MIR4 Boss Timer',
    description: 'Acompanhe as transferências de servidor de jogadores e clãs no MIR4.',
  },
  '/guerra': {
    title: 'Guerra de Clãs MIR4 — Resultados e Dados | MIR4 Boss Timer',
    description: 'Consulte dados e resultados das guerras de clãs do MIR4.',
  },
  '/expedicao': {
    title: 'Expedição de Clã MIR4 — Bosses e Horários | MIR4 Boss Timer',
    description: 'Bosses, horários e informações da Expedição de Clã do MIR4.',
  },
  '/rankings': {
    title: 'Ranking Global MIR4 — Melhores Jogadores | MIR4 Boss Timer',
    description: 'Ranking global de jogadores do MIR4 por poder, servidor e classe.',
  },
  '/clan-rankings': {
    title: 'Ranking de Clãs MIR4 — Melhores Clãs | MIR4 Boss Timer',
    description: 'Ranking dos melhores clãs do MIR4 por servidor e poder.',
  },
  '/item-market': {
    title: 'Mercado de Itens MIR4 — Preços e Ofertas | MIR4 Boss Timer',
    description: 'Preços e ofertas de itens no mercado do MIR4.',
  },
  '/privacidade': {
    title: 'Política de Privacidade | MIR4 Boss Timer',
    description: 'Como o MIR4 Boss Timer usa cookies, armazenamento local e anúncios do Google AdSense.',
  },
  '/sobre': {
    title: 'Sobre o MIR4 Boss Timer',
    description: 'Conheça o MIR4 Boss Timer, ferramenta gratuita de respawn de bosses, marketplace e rankings para jogadores de MIR4.',
  },
};

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Atualiza título, descrição e canonical conforme a rota atual. */
export const RouteMeta: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const meta = META_BY_PATH[path] ?? DEFAULT_META;
    const url = `${SITE}${path === '/' ? '/' : path}`;

    document.title = meta.title;
    setTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    }, 'content', meta.description);
    setTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }, 'href', url);
    setTag('meta[property="og:title"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:title');
      return m;
    }, 'content', meta.title);
    setTag('meta[property="og:url"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    }, 'content', url);
  }, [pathname]);

  return null;
};
