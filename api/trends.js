/**
 * Função serverless (Vercel) que busca tendências REAIS e ATUAIS do mês:
 *   - Reddit: posts em alta (hot) de subreddits nerds — tempo real, sem chave.
 *   - Google Trends: buscas em alta hoje no Brasil (dailytrends) — sem chave.
 *   - YouTube: vídeos populares recentes (últimos 30 dias) — requer a variável
 *     de ambiente YOUTUBE_API_KEY (defina no painel da Vercel). Opcional.
 *
 * Rodar no servidor evita o bloqueio de CORS do navegador e mantém a chave
 * do YouTube em segredo (nunca vai para o cliente).
 *
 * Resposta: { generatedAt, month, sources: [{ source, live, trends[], note }] }
 * no mesmo formato que o front-end já consome.
 */

const REDDIT_SUBS = [
  { sub: "marvelstudios", category: "Filmes" },
  { sub: "DC_Cinematic", category: "Filmes" },
  { sub: "movies", category: "Filmes" },
  { sub: "television", category: "Séries" },
  { sub: "comicbooks", category: "HQs" },
  { sub: "anime", category: "Animações" },
  { sub: "gaming", category: "Games" },
];

const UA = "web:refugio-nerd-radar:1.0 (por Refúgio Nerd)";

function clampHeat(h) {
  return Math.max(10, Math.min(99, Math.round(h)));
}

function heatFromScore(score) {
  return clampHeat(Math.log10(Math.max(1, score)) * 22 + 8);
}

function trim(title, max = 90) {
  return title.length > max ? title.slice(0, max - 1) + "…" : title;
}

function guessCategory(title) {
  const t = (title || "").toLowerCase();
  if (/(hq|quadrinho|comic|manga|mangá)/.test(t)) return "HQs";
  if (/(anime|animação|animation|cartoon|desenho)/.test(t)) return "Animações";
  if (/(game|jogo|gameplay|ps5|xbox|nintendo)/.test(t)) return "Games";
  if (/(série|serie|series|temporada|episódio)/.test(t)) return "Séries";
  if (/(herói|heroi|hero|marvel|dc)/.test(t)) return "Super-heróis";
  return "Filmes";
}

async function fetchJson(url, { signal, headers } = {}) {
  const res = await fetch(url, { signal, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function withTimeout(ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

// ---------- Reddit ----------
async function redditTrends() {
  const trends = [];
  const results = await Promise.allSettled(
    REDDIT_SUBS.map(async ({ sub, category }) => {
      const t = withTimeout(8000);
      try {
        const json = await fetchJson(
          `https://www.reddit.com/r/${sub}/hot.json?limit=6&raw_json=1`,
          { signal: t.signal, headers: { "User-Agent": UA, Accept: "application/json" } },
        );
        return { category, sub, children: json?.data?.children || [] };
      } finally {
        t.clear();
      }
    }),
  );
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const child of r.value.children) {
      const d = child?.data;
      if (!d || d.stickied || d.over_18) continue;
      trends.push({
        id: `reddit-${d.id}`,
        title: trim(d.title),
        source: "reddit",
        heat: heatFromScore(d.score || 0),
        category: r.value.category,
        context: `r/${r.value.sub} · ${Number(d.score || 0).toLocaleString("pt-BR")} pts`,
        url: `https://www.reddit.com${d.permalink}`,
      });
    }
  }
  if (!trends.length) throw new Error("Reddit não retornou posts.");
  trends.sort((a, b) => b.heat - a.heat);
  return { source: "reddit", live: true, trends: trends.slice(0, 12) };
}

// ---------- Google Trends (dailytrends) ----------
async function googleTrends() {
  const t = withTimeout(8000);
  try {
    const res = await fetch(
      "https://trends.google.com/trends/api/dailytrends?hl=pt-BR&tz=180&geo=BR&ns=15",
      { signal: t.signal, headers: { "User-Agent": UA } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    // A API prefixa o JSON com ")]}',\n" — descarta até o primeiro "{".
    const json = JSON.parse(raw.slice(raw.indexOf("{")));
    const days = json?.default?.trendingSearchesDays || [];
    const searches = days[0]?.trendingSearches || [];
    const trends = searches.slice(0, 12).map((s, i) => {
      const query = s?.title?.query || "";
      const traffic = s?.formattedTraffic || "";
      return {
        id: `gt-${i}-${query.slice(0, 20)}`,
        title: query,
        source: "googletrends",
        heat: clampHeat(92 - i * 5),
        category: guessCategory(query + " " + (s?.articles?.[0]?.title || "")),
        context: `Google Trends · BR${traffic ? " · " + traffic : ""}`,
        url:
          s?.title?.exploreLink
            ? `https://trends.google.com${s.title.exploreLink}`
            : `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      };
    });
    if (!trends.length) throw new Error("Google Trends vazio.");
    return { source: "googletrends", live: true, trends };
  } finally {
    t.clear();
  }
}

// ---------- YouTube (opcional, requer chave) ----------
async function youtubeTrends(subject) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return {
      source: "youtube",
      live: false,
      trends: [],
      note: "Defina YOUTUBE_API_KEY nas variáveis da Vercel para ativar o YouTube.",
    };
  }
  const t = withTimeout(8000);
  try {
    const publishedAfter = new Date(Date.now() - 30 * 86400000).toISOString();
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", key);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", subject || "filmes séries HQs super heróis nerd");
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "viewCount");
    url.searchParams.set("relevanceLanguage", "pt");
    url.searchParams.set("regionCode", "BR");
    url.searchParams.set("maxResults", "12");
    url.searchParams.set("publishedAfter", publishedAfter);

    const json = await fetchJson(url.toString(), { signal: t.signal });
    if (json.error) throw new Error(json.error.message || "YouTube error");
    const items = (json.items || []).filter((it) => it.id?.videoId);
    const trends = items.map((it, i) => ({
      id: `yt-${it.id.videoId}`,
      title: trim(it.snippet.title),
      source: "youtube",
      heat: clampHeat(96 - i * 4),
      category: guessCategory(it.snippet.title),
      context: it.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    }));
    if (!trends.length) throw new Error("YouTube sem resultados.");
    return { source: "youtube", live: true, trends };
  } catch (e) {
    return { source: "youtube", live: false, trends: [], note: String(e.message || e) };
  } finally {
    t.clear();
  }
}

export default async function handler(req, res) {
  const subject =
    (req.query && (Array.isArray(req.query.q) ? req.query.q[0] : req.query.q)) || "";

  const [reddit, google, youtube] = await Promise.all([
    redditTrends().catch((e) => ({
      source: "reddit",
      live: false,
      trends: [],
      note: String(e.message || e),
    })),
    googleTrends().catch((e) => ({
      source: "googletrends",
      live: false,
      trends: [],
      note: String(e.message || e),
    })),
    youtubeTrends(subject),
  ]);

  const now = new Date();
  const month = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Cache na borda da Vercel por 30 min (revalida em background por 1h).
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("X-Robots-Tag", "noindex");
  res.status(200).json({
    generatedAt: now.toISOString(),
    month,
    sources: [reddit, youtube, google],
  });
}
