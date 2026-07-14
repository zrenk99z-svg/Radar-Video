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

// `broad: true` = subreddit amplo (pode ter tema não-nerd) → aplica filtro nerd.
// Sem broad = subreddit já nerd → mantém tudo.
const REDDIT_SUBS = [
  { sub: "marvelstudios", category: "Filmes" },
  { sub: "DC_Cinematic", category: "Filmes" },
  { sub: "comicbooks", category: "HQs" },
  { sub: "anime", category: "Animações" },
  { sub: "StarWars", category: "Filmes" },
  { sub: "movies", category: "Filmes", broad: true },
  { sub: "television", category: "Séries", broad: true },
  { sub: "gaming", category: "Games", broad: true },
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

/**
 * Relevância nerd: filmes/séries/HQs/animações/super-heróis/games/cultura pop.
 * Usado para manter o Google Trends (que é genérico) só com temas do canal.
 */
const NERD =
  /(marvel|\bdc\b|homem[\s-]?aranha|spider[\s-]?man|batman|superman|super[\s-]?her[oó]|x[\s-]?men|vingador|avenger|liga da justi[çc]a|justice league|quarteto fant[aá]stico|fantastic four|thor|loki|hulk|wolverine|deadpool|coringa|joker|gotham|star\s?wars|guerra nas estrelas|jedi|sith|mandalorian|senhor dos an[eé]is|lord of the rings|hobbit|rings of power|harry potter|anime|mang[aá]|otaku|one piece|naruto|dragon ball|demon slayer|jujutsu|chainsaw|hq|quadrinh|gibi|comics?|godzilla|kaiju|duna|dune|avatar|matrix|transformers|jurassic|alien|predador|predator|invenc[ií]vel|the boys|stranger things|wandavision|witcher|fallout|arcane|the last of us|house of the dragon|game of thrones|demolidor|daredevil|venom|sonic|pok[eé]mon|zelda|mario|playstation|\bps5\b|xbox|nintendo|elden ring|final fantasy|resident evil|gta|minecraft|fortnite|valorant|league of legends|cavaleiro das trevas|filme|s[eé]rie|trailer|temporada|cinema|hero[íi]s?|super-?heróis?|nerd|geek|cosplay|comic\s?con|ccxp)/i;

function isNerd(text) {
  return NERD.test(text || "");
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
      REDDIT_SUBS.map(async ({ sub, category, broad }) => {
        // Top da SEMANA (não "hot"/do dia). O caminho .json é só no público.
        const path = token
          ? `${base}/r/${sub}/top?t=week&limit=8&raw_json=1`
          : `${base}/r/${sub}/top.json?t=week&limit=8&raw_json=1`;
        const res = await fetch(path, { signal: t.signal, headers });
        if (!res.ok) throw new Error(`r/${sub} HTTP ${res.status}`);
        const json = await res.json();
        return { category, sub, broad, children: json?.data?.children || [] };
      }),
    );
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const child of r.value.children) {
        const d = child?.data;
        if (!d || d.stickied || d.over_18) continue;
        // Subs amplos: mantém só posts com cara de nerd.
        if (r.value.broad && !isNerd(d.title)) continue;
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
    // hours=168 pede a janela de 7 dias (semana). Se o feed ignorar, ainda
    // retorna os temas em alta — que passam pelo filtro nerd abaixo.
    const res = await fetch(
      "https://trends.google.com/trending/rss?geo=BR&hours=168",
      {
        signal: t.signal,
        headers: {
          "User-Agent": UA,
          Accept: "application/rss+xml, application/xml",
        },
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const parsed = items.map((m) => {
      const block = m[1];
      return {
        title: xmlTag(block, "title"),
        traffic: xmlTag(block, "ht:approx_traffic"),
        link: xmlTag(block, "link"),
        news: xmlTag(block, "ht:news_item_title"),
      };
    });
    // Google Trends é genérico: mantém só o que é nerd (temas do canal).
    const trends = parsed
      .filter((p) => isNerd(p.title + " " + p.news))
      .slice(0, 12)
      .map((p, i) => ({
        id: `gt-${i}-${p.title.slice(0, 20)}`,
        title: p.title,
        source: "googletrends",
        heat: clampHeat(92 - i * 5),
        category: guessCategory(p.title + " " + p.news),
        context: `Google Trends · BR${p.traffic ? " · " + p.traffic : ""}`,
        url:
          p.link || `https://www.google.com/search?q=${encodeURIComponent(p.title)}`,
      }));
    if (!trends.length) {
      throw new Error("Nenhum tema nerd em alta hoje no Google Trends.");
    }
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
    // Vídeos publicados nos últimos 7 dias (semana).
    const publishedAfter = new Date(Date.now() - 7 * 86400000).toISOString();
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
