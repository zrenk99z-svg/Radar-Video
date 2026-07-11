# Refúgio Nerd — Radar de Vídeos

Aplicativo web para descobrir **temas de vídeos com alto potencial de
visualização** para o canal Refúgio Nerd (filmes, séries, HQs, animações,
super-heróis e cultura nerd).

> Repositório dedicado: o app fica na **raiz** (pronto para deploy direto em
> Vercel/Cloudflare Pages, sem configurar subpasta).

## Funcionalidades

1. **Descoberta de temas** — digite um assunto (Superman, One Piece, Marvel…)
   e gere **20 ideias** de vídeo. Cada ideia traz título sugerido, categoria,
   nível de interesse (0–100), potencial de cliques, dificuldade de produção e
   tipo de vídeo (review, teoria, ranking, explicação, notícia, curiosidade).
2. **Radar de tendências (fontes reais)** — busca assuntos realmente comentados
   em **Reddit**, **YouTube** e **Google Trends**, com fallback simulado
   sinalizado (`ao vivo` / `simulado`) por fonte. Clique para gerar ideias.
3. **Análise de concorrência** — mostra quantos canais já cobriram o tema, nº
   estimado de vídeos, nível de saturação e uma recomendação. Real via YouTube
   Data API quando há chave; estimativa determinística caso contrário.
4. **Pontuação automática** — cada ideia recebe uma nota (0–100) combinando
   interesse do público, facilidade de produção, potencial de busca e potencial
   de thumbnail; o feed é ordenado do melhor para o pior tema.
5. **Calendário editorial** — cadência de **1 vídeo longo + 2 shorts por
   semana**, preenchido automaticamente pelas ideias salvas (melhores no longo,
   short-friendly nos shorts). Dias e nº de semanas configuráveis.
6. **Salvar ideias** — guarde favoritas na lista **Próximos Vídeos**,
   persistida no `localStorage` do navegador.
7. **Gerador de thumbnail** — para cada tema salvo, gera texto principal, texto
   secundário, emoção sugerida (choque, mistério, hype, nostalgia) e cores
   recomendadas, com prévia visual 16:9.
8. **IA de títulos com alto CTR** — gera títulos usando palavras de impacto
   (FINALMENTE, EXPLICADO, SEGREDO, "O QUE NINGUÉM PERCEBEU"…) e pontua cada um
   por CTR estimado. Motor heurístico offline por padrão; modo **IA (Claude
   Opus 4.8)** opcional quando uma chave da Anthropic é configurada.
9. **Modo Viral** (bônus) — destaca os 5 temas com maior chance de gerar views
   no curto prazo.

### Dados reais e atuais (mês corrente)

Quando publicado na **Vercel**, o app busca tendências **reais e do mês atual**
por meio da função serverless [`api/trends.js`](api/trends.js), que roda no
servidor (sem bloqueio de CORS):

| Fonte | Como | Chave? |
|---|---|---|
| **Reddit** | Posts em alta (`hot`) de subreddits nerds — tempo real | Não |
| **Google Trends** | Buscas em alta hoje no Brasil (`dailytrends`) | Não |
| **YouTube** | Vídeos populares dos últimos 30 dias (Data API v3) | Sim — variável `YOUTUBE_API_KEY` na Vercel |

Para ativar o YouTube: no projeto da Vercel → **Settings → Environment
Variables** → adicione `YOUTUBE_API_KEY` com sua chave da YouTube Data API v3 e
faça **Redeploy**. Reddit e Google Trends já funcionam sem nenhuma configuração.

O front-end chama `/api/trends` primeiro; se ela não existir (ex.: `npm run dev`
local ou outro host), ele tenta buscar pelo navegador usando as chaves opcionais
de **Configurações** e, por fim, cai para dados **simulados** — sempre
sinalizado na interface (`ao vivo` / `simulado`).

As chaves opcionais de **Configurações** (usadas só no modo cliente/fallback):

| Campo | Habilita |
|---|---|
| **YouTube Data API v3 — chave** | YouTube no navegador (fallback, sem servidor) |
| **Google Trends — URL do proxy** | Proxy próprio (fallback) que aceite `?q=&geo=BR` |
| **Anthropic (Claude) — chave** | Modo IA no gerador de títulos |

> ⚠️ **Sobre a chave da Anthropic:** o modo IA chama a API da Anthropic direto
> do navegador (adequado apenas para uso pessoal/protótipo). Em produção, use um
> back-end (proxy) que guarde a chave no servidor — nunca exponha a chave em um
> app público. O Reddit é consultado via JSON público (sem chave), mas pode ser
> bloqueado por CORS dependendo do navegador; nesse caso, o fallback simulado
> assume.

## Progressive Web App (PWA)

O app é instalável e funciona offline:

- **Instalável na tela inicial** — no iPhone (Safari): toque em **Compartilhar →
  “Adicionar à Tela de Início”**. No Android/desktop (Chrome/Edge) aparece um
  botão **Instalar**. Um banner com essas instruções aparece automaticamente
  (dispensável).
- **Tela cheia (standalone)** — abre sem a barra do navegador, com a barra de
  status integrada (`black-translucent`) e respeitando o *notch* via
  `env(safe-area-inset-*)`.
- **Offline** — um *service worker* (Workbox, via `vite-plugin-pwa`) faz
  *precache* do app shell e dos assets; as fontes do Google são cacheadas em
  runtime. Depois da primeira visita, o app abre sem rede (os dados ao vivo,
  naturalmente, exigem conexão).
- **Manifesto e ícones** — `manifest.webmanifest` gerado no build, com ícones
  192/512 e um ícone *maskable*, além de `apple-touch-icon` (180) para iOS.
- **Mobile-first** — layout totalmente responsivo, sem rolagem horizontal,
  alvos de toque confortáveis e sem realce de toque azul.

> O service worker só roda no build de produção (`npm run build` + `npm run
> preview`), não em `npm run dev`. Instalação e *precache* exigem HTTPS (ou
> `localhost`).

## Tecnologias

React 18 · TypeScript · Vite · Tailwind CSS · `vite-plugin-pwa` (Workbox) ·
`localStorage` (sem back-end).

## Como executar localmente

Requer Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```bash
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build de produção
npm run lint       # type-check (tsc --noEmit)
```

## Estrutura

```
(raiz do repositório)
  index.html
  tailwind.config.js        identidade Refúgio Nerd (Preto/Brasa/Creme), glow
  src/
    App.tsx                 layout principal (busca, concorrência, ranking,
                            títulos, radar, calendário, salvos)
    types.ts                tipos de domínio
    lib/
      ideaGenerator.ts      gera 20 ideias determinísticas por assunto
      scoring.ts            pontuação final + score viral + ranking
      thumbnail.ts          conceito de thumbnail por ideia
      settings.ts           chaves de API / proxy (localStorage)
      competition.ts        análise de concorrência (YouTube API ou estimativa)
      calendar.ts           calendário editorial (1 longo + 2 shorts/semana)
      titleAI.ts            gerador heurístico de títulos + score de CTR
      claudeTitles.ts       modo IA opcional (Claude Opus 4.8)
      sources/              fontes de tendências
        reddit.ts  youtube.ts  googleTrends.ts  index.ts (agregador+fallback)
    data/trends.ts          temas em alta simulados (fallback)
    hooks/useLocalStorage.ts
    components/
      SearchBar.tsx  IdeaCard.tsx  ScoreRing.tsx  MetricBar.tsx
      LiveTrends.tsx  CompetitionPanel.tsx  TitleLab.tsx
      EditorialCalendar.tsx  SettingsPanel.tsx
      ViralMode.tsx  SavedList.tsx  ThumbnailPreview.tsx
      Icons.tsx  categoryMeta.tsx  (TrendRadar.tsx — versão curada original)
```

## Como a pontuação é calculada

`score = 0.32·interesse + 0.18·facilidade + 0.28·busca + 0.22·thumbnail`
(facilidade = `100 − dificuldade`). Ver `src/lib/scoring.ts`.

O **Modo Viral** usa outra fórmula, priorizando cliques e busca de curto prazo:
`0.40·cliques + 0.25·busca + 0.25·thumbnail + 0.10·facilidade`.

O **CTR de um título** (`src/lib/titleAI.ts`) parte de uma base e soma sinais:
palavras de impacto, presença de números, parênteses, proporção de maiúsculas e
tamanho ideal (40–70 caracteres).

O gerador de ideias é **determinístico** — o mesmo assunto sempre produz as
mesmas 20 ideias, ideal para demonstração. Tendências e concorrência usam dados
reais quando configurados (ver acima) e caem para simulação caso contrário.
