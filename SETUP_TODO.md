# O que fazer antes de publicar

Checklist rápido — nenhum desses itens impede o `npm run build` de
funcionar, mas alguns afetam funcionalidade real em produção.

## 🔴 Obrigatório

- [ ] **`config/pixConfig.ts`** — preencha `merchantName` e `merchantCity`
      com o nome e cidade **exatamente como cadastrados no seu banco** pro
      PIX. Sem isso, alguns apps de banco podem rejeitar o QR Code por
      inconsistência de dados. (Máx. 25 caracteres o nome, 15 a cidade —
      sem acento, o código já normaliza sozinho.)

## 🟡 Recomendado

- [ ] **Netlify Functions**: depois do próximo deploy, teste se
      `/marketplace` está carregando as listagens de verdade — abra o
      DevTools (F12) → aba Network → veja se
      `/.netlify/functions/xdraco-lists` retorna 200. Se der erro, o log
      da function aparece no painel da Netlify (Functions → xdraco-lists →
      Logs).
- [ ] **`config/pixConfig.ts`** → `ALTERNATIVE_SUPPORT_URL`: se você criar
      uma conta em Ko-fi, Buy Me a Coffee, Livepix ou Apoia.se, cole o link
      aqui — isso habilita automaticamente um botão extra no modal de
      doação pra visitantes de fora do Brasil (lembrando: 81% do seu
      tráfego é Brasil, mas o resto fica sem opção de apoiar hoje).
- [ ] **Google Search Console**: depois do deploy, cadastre o site (se
      ainda não tiver) e envie o `sitemap.xml` manualmente — acelera a
      indexação em vez de esperar o Google achar sozinho.

## 🟢 Opcional / próxima rodada

- [ ] Trocar `public/og-image.png` (gerei uma versão simples) por uma arte
      mais elaborada, se quiser algo mais "de marca".
- [ ] Considerar pré-renderização (SSG) pra reforçar SEO — não é urgente,
      mas ajuda crawlers que não executam JS perfeitamente.
- [ ] Adicionar mais guias de conteúdo (build de classes, tier list) — cada
      um é mais uma chance de aparecer em buscas específicas.

---

## Como testar localmente antes de ir pra produção

```bash
npm install
npm run build   # confirma que builda sem erro
npm run dev     # abre em localhost, mas as Netlify Functions do
                 # marketplace só funcionam quando publicado na Netlify
                 # (ou rodando `netlify dev` com a Netlify CLI instalada)
```

Pra testar as Netlify Functions localmente também, instale a CLI:
```bash
npm install -g netlify-cli
netlify dev
```
