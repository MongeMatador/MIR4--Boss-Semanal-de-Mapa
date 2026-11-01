// Pós-build: gera dist/<rota>/index.html com título, descrição, canonical e
// conteúdo textual real (com links internos) já no HTML inicial, para que
// crawlers que não executam JS enxerguem cada página. O React substitui o
// conteúdo de #root ao montar, então não há mudança para o usuário.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://mir4bossrespawntimer.netlify.app';
const routes = JSON.parse(readFileSync(join(root, 'config/seoRoutes.json'), 'utf8'));
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  ['/', 'Boss Timer'], ['/marketplace', 'Marketplace NFT'], ['/consulta', 'Consulta de jogador'],
  ['/rankings', 'Ranking global'], ['/clan-rankings', 'Ranking de clãs'], ['/transferencias', 'Transferências'],
  ['/guerra', 'Guerra de clãs'], ['/expedicao', 'Expedição de clã'], ['/item-market', 'Mercado de itens'],
  ['/sobre', 'Sobre'], ['/privacidade', 'Privacidade'],
];

const INTRO = {
  '/': 'O MIR4 Boss Timer acompanha em tempo real o respawn dos bosses de campo do MIR4 (Draco, Hydra, Darksteel e outros) nos mundos W1 a W6, com localização no mapa, favoritos e alertas para jogadores e clãs.',
};

function bodyFor(path, meta) {
  const h1 = path === '/' ? 'MIR4 Boss Respawn Timer' : meta.title.split(' | ')[0];
  const intro = INTRO[path] ?? meta.description;
  const links = NAV.map(([p, l]) => `<li><a href="${p}">${esc(l)}</a></li>`).join('');
  return `<main style="font-family:sans-serif;color:#e2e8f0;background:#0f172a;min-height:100vh;padding:2rem"><h1>${esc(h1)}</h1><p>${esc(intro)}</p><nav aria-label="Seções do site"><ul>${links}</ul></nav><p>Carregando dados...</p></main>`;
}

for (const [path, meta] of Object.entries(routes)) {
  const url = path === '/' ? `${SITE}/` : `${SITE}${path}`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(meta.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>/, `<div id="root">${bodyFor(path, meta)}</div>`);
  if (!html.includes('<main')) throw new Error(`Falha ao injetar conteúdo em ${path}`);
  const out = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('prerender', path);
}
