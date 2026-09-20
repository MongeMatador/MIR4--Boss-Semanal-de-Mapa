# Changelog — Expansão MIR4 Boss Timer

Este pacote contém o repositório inteiro com as mudanças já aplicadas.
Nada foi enviado pro GitHub — você decide quando e como mesclar.

**Build verificado:** `npm install && npm run build` roda limpo, sem erros
de TypeScript nem de bundling (Vite).

---

## 🐛 Correções de bugs

### 1. `importmap` órfão no `index.html`
O `index.html` tinha um bloco `<script type="importmap">` apontando `react`
e `react-dom` para a versão **19.2.3** via CDN (esm.sh), enquanto o projeto
inteiro usa **React 18.2.0** (via `package.json`, instalado normalmente).
Isso é sobra do modo de preview "sem build" do Google AI Studio — no seu
projeto real (com Vite), esse importmap não deveria existir, e a
inconsistência de versão é uma fonte clássica de bugs difíceis de rastrear
(dois React diferentes competindo). Removido.

### 2. QR Code do PIX incompleto
O `FloatingDonationButton.tsx` gerava o QR Code a partir da **chave PIX
crua** (`25a5e572-...`). Isso força quem escaneia a abrir o app do banco,
buscar a chave manualmente e digitar o valor — fricção alta, e provavelmente
a explicação principal pra baixa conversão de doações que você mencionou.

Agora o QR Code carrega um **payload EMV "Copia e Cola" completo** (o
mesmo formato que qualquer PIX de loja/comércio usa), incluindo valor,
nome do beneficiário e cidade. Implementado do zero em
`utils/pixPayload.ts`, com cálculo de CRC16 próprio (sem dependências
externas) e testado estruturalmente contra o padrão do Banco Central.

Também adicionei **botões de valor sugerido** (R$5/10/20/50 + "outro
valor") — clicar é mais rápido que digitar.

⚠️ **Ação necessária:** o payload só fica 100% válido com seu nome e
cidade reais cadastrados no banco. Veja `SETUP_TODO.md`.

### 3. Arquivos mortos
Removidos 8 arquivos vazios (0 bytes) que sobraram do scaffold original e
não eram usados em nenhum lugar: `CoffeeIcon.tsx`, `DonationButton.tsx`,
`PixIcon.tsx`, `PixModal.tsx`, `QrCodePlaceholder.tsx`,
`PixQrCodeImage.tsx`, `download.html`, `public/crafting-data.ts`.

---

## ⚡ Performance / infraestrutura

### 4. Tailwind CSS: CDN → build real
Trocado `<script src="https://cdn.tailwindcss.com">` (compila CSS no
navegador do usuário, toda visita) por Tailwind via PostCSS, compilado uma
vez no build. Mesmo visual, carregamento mais rápido, e resolve o aviso que
o próprio Tailwind exibe sobre não usar a versão CDN em produção.

Adicionei `@tailwindcss/typography` como plugin (necessário pras classes
`prose`/`prose-invert` que `SEOContent.tsx` e `GuidesSection.tsx` já usavam
— no CDN isso vinha embutido automaticamente, no build precisa ser
explícito).

### 5. Rotas (`react-router-dom`)
O site virou multi-página sem quebrar nada do timer:
- `App.tsx` foi reescrito só para orquestrar as rotas.
- Todo o conteúdo antigo do timer foi movido, sem alteração de lógica, para
  `components/BossTimerPage.tsx`.
- Novo `components/Layout.tsx` com navegação (Boss Timer / Marketplace) e o
  botão de doação, que agora aparece em **todas** as páginas, não só na
  home.
- `public/_redirects` adicionado — necessário pro Netlify não dar 404 ao
  acessar `/marketplace` direto ou dar F5 na página.

---

## ✨ Nova seção: Marketplace de NFTs

Nova rota `/marketplace`, construída em cima dos dados que já
mapeamos da API pública do xdraco.com:

- **`netlify/functions/xdraco-lists.js`** — proxy pra listagens (evita
  CORS, cacheia 5 min)
- **`netlify/functions/xdraco-character.js`** — proxy pro detalhe de
  personagem (equipamento + inventário, cacheia 30 min)
- **`hooks/useMarketplaceListings.ts`** — busca paginada com filtros
  (classe, level, preço, ordenação)
- **`hooks/useCharacterDetail.ts`** — busca equipamento/inventário sob
  demanda (só quando o usuário abre o detalhe)
- **`components/Marketplace/`** — `CharacterCard`, `FilterBar`,
  `CharacterDetailModal` (com **as imagens de cada item**, agrupando
  itens repetidos do inventário com contador — evita uma lista gigante
  ilegível) e `MarketplacePage`

As Netlify Functions só funcionam quando o site está de fato hospedado na
Netlify (é o mesmo serviço que já hospeda seu site hoje, então deve
funcionar automaticamente no próximo deploy — Netlify detecta a pasta
`netlify/functions` sozinha).

---

## 🔍 SEO

Adicionado, já que os dados do Analytics mostraram tráfego orgânico
praticamente zero:

- `public/robots.txt`
- `public/sitemap.xml` (com as duas rotas: `/` e `/marketplace`)
- Open Graph + Twitter Card tags no `index.html` (prévia bonita ao
  compartilhar o link no Discord/WhatsApp/Twitter)
- `<link rel="canonical">`
- `public/og-image.png` — imagem gerada pra essas prévias

**Isso não veio no escopo desta rodada** (fica pra próxima, se quiser):
pré-renderização (SSG) pra garantir que crawlers vejam o conteúdo sem
depender de execução de JS. Hoje o conteúdo (`SEOContent.tsx`,
`GuidesSection.tsx`) já existia e é bom — só não sabemos com certeza se o
Google está indexando ele corretamente por ser client-side rendered. Vale
monitorar no Google Search Console depois do deploy.

---

## ✅ O que eu NÃO toquei

- Lógica do timer de boss (`constants.ts`, cálculo de countdown, etc.) —
  só movida de lugar, zero mudança de comportamento
- Código do AdSense (`AdComponent.tsx`, tags no `index.html`)
- Google Analytics (tag no `index.html`)
- Conteúdo de `SEOContent.tsx` e `GuidesSection.tsx` (já eram bons)
