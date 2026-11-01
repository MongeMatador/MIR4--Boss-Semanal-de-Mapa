import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://mir4bossrespawntimer.netlify.app';

import seoRoutes from '../config/seoRoutes.json';

interface Meta {
  title: string;
  description: string;
}

const META_BY_PATH = seoRoutes as Record<string, Meta>;
const DEFAULT_META: Meta = META_BY_PATH['/'];

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
