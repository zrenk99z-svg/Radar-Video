import type { Category } from "../../types";
import type { LiveTrend, SourceResult } from "./types";

/** Subreddits nerds mapeados para categorias. */
const SUBREDDITS: { sub: string; category: Category }[] = [
  { sub: "marvelstudios", category: "Filmes" },
  { sub: "DC_Cinematic", category: "Filmes" },
  { sub: "movies", category: "Filmes" },
  { sub: "television", category: "Séries" },
  { sub: "comicbooks", category: "HQs" },
  { sub: "anime", category: "Animações" },
];

interface RedditChild {
  data: {
    id: string;
    title: string;
    score: number;
    permalink: string;
    stickied?: boolean;
    over_18?: boolean;
  };
}

/** Normaliza o score bruto do Reddit para um "calor" 0-100. */
function heatFromScore(score: number): number {
  // ~logarítmico: 100 pts ~ 20, 1k ~ 45, 10k ~ 70, 50k+ ~ 95
  const h = Math.round(Math.log10(Math.max(1, score)) * 22 + 8);
  return Math.max(10, Math.min(99, h));
}

/**
 * Busca posts em alta de subreddits nerds (JSON público, sem chave).
 * Pode falhar por CORS dependendo do ambiente — nesse caso, o agregador
 * usa o fallback simulado.
 */
export async function fetchRedditTrends(signal?: AbortSignal): Promise<SourceResult> {
  const trends: LiveTrend[] = [];

  const results = await Promise.allSettled(
    SUBREDDITS.map(async ({ sub, category }) => {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=6&raw_json=1`,
        { signal, headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`r/${sub}: HTTP ${res.status}`);
      const json = (await res.json()) as { data: { children: RedditChild[] } };
      return { category, sub, children: json.data.children };
    }),
  );

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const child of r.value.children) {
      const d = child.data;
      if (d.stickied || d.over_18) continue;
      trends.push({
        id: `reddit-${d.id}`,
        title: d.title.length > 90 ? d.title.slice(0, 87) + "…" : d.title,
        source: "reddit",
        heat: heatFromScore(d.score),
        category: r.value.category,
        context: `r/${r.value.sub} · ${d.score.toLocaleString("pt-BR")} pts`,
        url: `https://www.reddit.com${d.permalink}`,
      });
    }
  }

  if (trends.length === 0) {
    throw new Error("Reddit inacessível (provável bloqueio de CORS no navegador).");
  }

  trends.sort((a, b) => b.heat - a.heat);
  return { source: "reddit", live: true, trends: trends.slice(0, 12) };
}
