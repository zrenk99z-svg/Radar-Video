/**
 * Função serverless (Vercel) que busca tendências REAIS e ATUAIS do mês:
 *   - Reddit: posts em alta (hot) de subreddits nerds.
 *       • Reddit bloqueia servidores sem login. Para funcionar na Vercel, crie
 *         um app grátis em https://www.reddit.com/prefs/apps (tipo "script") e
 *         defina REDDIT_CLIENT_ID e REDDIT_CLIENT_SECRET nas variáveis da Vercel.
 *       • Sem essas variáveis, tenta o JSON público (costuma ser bloqueado).
 *   - Google Trends: buscas em alta hoje no Brasil, via feed RSS novo. Sem chave.
 *   - YouTube: vídeos populares recentes (últimos 30 dias). Requer YOUTUBE_API_KEY.
 *
 * Rodar no servidor evita o bloqueio de CORS do navegador e mantém as chaves
 * em segredo (nunca vão para o cliente).
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
  if (/(game|jogo|gameplay|ps5|xbox|nintendo|steam)/.test(t)) return "Games";
  if (/(série|serie|series|temporada|episódio)/.test(t)) return "Séries";
  if (/(herói|heroi|hero|marvel|dc)/.test(t)) return "Super-heróis";
  return "Filmes";
}
function withTimeout(ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}
function decodeXml(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}
function xmlTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeXml(m[1]).trim() : "";
}

// ---------- Reddit ----------
async function redditToken(signal) {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    signal,
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`auth HTTP ${res.status}`);
  const j = await res.json();
  return j.access_token || null;
}

async function redditTrends() {
  const t = withTimeout(9000);
  try {
    let token = null;
    try {
      token = await redditToken(t.signal);
    } catch {
      token = null;
    }
    const base = token ? "https://oauth.reddit.com" : "https://www.reddit.com";
    const headers = { "User-Agent": UA, Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const trends = [];
    const results = await Promise.allSettled(
      REDDIT_SUBS.map(async ({ sub, category }) => {
        const res = await fetch(`${base}/r/${sub}/hot?limit=6&raw_json=1`, {
          signal: t.signal,
          headers,
        });
        if (!res.ok) throw new Error(`r/${sub} HTTP ${res.status}`);
        const json = await res.json();
        return { category, sub, children: json?.data?.children || [] };
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
    if (!trends.length) {
      throw new Error(
        token
          ? "Reddit não retornou posts."
          : "Reddit bloqueia servidores sem login — defina REDDIT_CLIENT_ID e REDDIT_CLIENT_SECRET (app grátis em reddit.com/prefs/apps).",
      );
    }
    trends.sort((a, b) => b.heat - a.heat);
    return { source: "reddit", live: true, trends: trends.slice(0, 12) };
  } finally {
    t.clear();
  }
}

// ---------- Google Trends (feed RSS novo) ----------
async function googleTrends() {
  const t = withTimeout(9000);
  try {
    const res = await fetch("https://trends.google.com/trending/rss?geo=BR", {
      signal: t.signal,
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const trends = items.slice(0, 12).map((m, i) => {
      const block = m[1];
      const title = xmlTag(block, "title");
      const traffic = xmlTag(block, "ht:approx_traffic");
      const link = xmlTag(block, "link");
      const news = xmlTag(block, "ht:news_item_title");
      return {
        id: `gt-${i}-${title.slice(0, 20)}`,
        title,
        source: "googletrends",
        heat: clampHeat(92 - i * 5),
        category: guessCategory(title + " " + news),
        context: `Google Trends · BR${traffic ? " · " + traffic : ""}`,
        url: link || `https://www.google.com/search?q=${encodeURIComponent(title)}`,
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
  const t = withTimeout(9000);
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

    const res = await fetch(url.toString(), { signal: t.signal });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
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

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("X-Robots-Tag", "noindex");
  res.status(200).json({
    generatedAt: now.toISOString(),
    month,
    sources: [reddit, youtube, google],
  });
}
