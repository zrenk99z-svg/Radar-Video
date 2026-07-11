import { TRENDING } from "../../data/trends";
import type { Settings } from "../settings";
import { fetchGoogleTrends } from "./googleTrends";
import { fetchRedditTrends } from "./reddit";
import type { LiveTrend, SourceResult, TrendSource } from "./types";
import { fetchYouTubeTrends } from "./youtube";

export type { LiveTrend, SourceResult, TrendSource } from "./types";

/** Converte os temas simulados internos em LiveTrend, por fonte. */
function simulatedFor(source: TrendSource, note?: string): SourceResult {
  const trends: LiveTrend[] = TRENDING.map((t) => ({
    id: `sim-${source}-${t.id}`,
    title: t.title,
    source: "simulado",
    heat: t.heat,
    category: t.category,
    context: `${t.tag} · simulado`,
  }));
  return { source, live: false, trends, note };
}

/**
 * Busca tendências reais de Reddit, YouTube e Google Trends conforme as
 * configurações. Cada fonte que falhar (CORS, sem chave, sem proxy) cai
 * automaticamente para dados simulados, sinalizados como `live: false`.
 */
export async function fetchAllTrends(
  settings: Settings,
  subject?: string,
  signal?: AbortSignal,
): Promise<SourceResult[]> {
  const q = subject?.trim();

  const reddit = fetchRedditTrends(signal).catch((e: Error) =>
    simulatedFor("reddit", e.message),
  );

  const youtube = settings.youtubeApiKey
    ? fetchYouTubeTrends(
        settings.youtubeApiKey,
        q || "filmes séries HQs super heróis nerd",
        signal,
      ).catch((e: Error) => simulatedFor("youtube", e.message))
    : Promise.resolve(
        simulatedFor("youtube", "Sem chave da YouTube Data API (Configurações)."),
      );

  const google = settings.googleTrendsProxyUrl
    ? fetchGoogleTrends(
        settings.googleTrendsProxyUrl,
        q || "cultura nerd",
        signal,
      ).catch((e: Error) => simulatedFor("googletrends", e.message))
    : Promise.resolve(
        simulatedFor("googletrends", "Sem proxy do Google Trends (Configurações)."),
      );

  return Promise.all([reddit, youtube, google]);
}

/** Nome de exibição por fonte. */
export const SOURCE_LABEL: Record<TrendSource, string> = {
  reddit: "Reddit",
  youtube: "YouTube",
  googletrends: "Google Trends",
  simulado: "Simulado",
};
