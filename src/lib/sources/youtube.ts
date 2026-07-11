import type { Category } from "../../types";
import type { LiveTrend, SourceResult } from "./types";

interface YtSearchItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
  };
}

interface YtSearchResponse {
  items?: YtSearchItem[];
  error?: { message: string };
}

function guessCategory(title: string): Category {
  const t = title.toLowerCase();
  if (/(hq|quadrinho|comic|manga|mangá)/.test(t)) return "HQs";
  if (/(anime|animação|animation|cartoon)/.test(t)) return "Animações";
  if (/(game|jogo|gameplay|ps5|xbox)/.test(t)) return "Games";
  if (/(série|serie|series|temporada|episódio)/.test(t)) return "Séries";
  if (/(herói|heroi|hero|marvel|dc)/.test(t)) return "Super-heróis";
  return "Filmes";
}

/**
 * Tendências reais via YouTube Data API v3 (search.list ordenado por
 * relevância recente). Requer chave. As chaves da YouTube API podem ser
 * usadas no navegador (com restrição por referenciador).
 */
export async function fetchYouTubeTrends(
  apiKey: string,
  query = "filmes séries HQs super heróis nerd",
  signal?: AbortSignal,
): Promise<SourceResult> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "viewCount");
  url.searchParams.set("relevanceLanguage", "pt");
  url.searchParams.set("regionCode", "BR");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("publishedAfter", daysAgoISO(30));

  const res = await fetch(url.toString(), { signal });
  const json = (await res.json()) as YtSearchResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `YouTube: HTTP ${res.status}`);
  }

  const items = json.items ?? [];
  const trends: LiveTrend[] = items
    .filter((it) => it.id.videoId)
    .map((it, i) => ({
      id: `yt-${it.id.videoId}`,
      title:
        it.snippet.title.length > 90
          ? it.snippet.title.slice(0, 87) + "…"
          : it.snippet.title,
      source: "youtube" as const,
      // ordenado por viewCount: os primeiros são mais quentes
      heat: Math.max(40, 96 - i * 4),
      category: guessCategory(it.snippet.title),
      context: it.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    }));

  if (trends.length === 0) throw new Error("YouTube não retornou resultados.");
  return { source: "youtube", live: true, trends };
}

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}
