import { TRENDING } from "../../data/trends";
import type { Settings } from "../settings";
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
 * Tenta a função serverless /api/trends (Vercel), que busca dados REAIS e
 * ATUAIS do mês no servidor (sem CORS): Reddit + Google Trends sem chave e
 * YouTube quando YOUTUBE_API_KEY está definida. Lança erro se indisponível
 * (ex.: `npm run dev` local ou host sem essa função) para cair no fallback.
 */
async function fetchServerTrends(
  settings: Settings,
  subject: string | undefined,
  signal?: AbortSignal,
): Promise<SourceResult[]> {
  const params = new URLSearchParams();
  if (subject) params.set("q", subject);
  const headers: Record<string, string> = { Accept: "application/json" };
  // Repassa a chave do YouTube das Configurações para o servidor (opcional).
  // `yt=1` diferencia o cache; a chave em si vai no header, fora da URL.
  if (settings.youtubeApiKey) {
    params.set("yt", "1");
    headers["x-yt-key"] = settings.youtubeApiKey;
  }
  const qs = params.toString();
  const url = qs ? `/api/trends?${qs}` : "/api/trends";
  const res = await fetch(url, { signal, headers });
  if (!res.ok) throw new Error(`/api/trends HTTP ${res.status}`);
  const data = (await res.json()) as { sources?: SourceResult[] };
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    throw new Error("/api/trends sem dados");
  }
  // Se alguma fonte veio vazia (falhou no servidor), mostra simulado para ela.
  return data.sources.map((s) =>
    s.live && s.trends.length ? s : simulatedFor(s.source, s.note),
  );
}

/** Busca no cliente (fallback): usa chaves/proxy das Configurações. */
async function fetchClientTrends(
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

  // Buscas (autocomplete) só funcionam no servidor (/api/trends). No cliente,
  // mostra simulado com aviso.
  const buscas = Promise.resolve(
    simulatedFor("buscas", "As buscas reais aparecem no deploy (servidor)."),
  );

  return Promise.all([buscas, reddit, youtube]);
}

/**
 * Busca tendências reais e atuais. Prioriza a função serverless /api/trends
 * (dados do mês corrente, sem CORS); se ela não existir/falhar, cai para a
 * busca no cliente e, por fim, para dados simulados.
 */
export async function fetchAllTrends(
  settings: Settings,
  subject?: string,
  signal?: AbortSignal,
): Promise<SourceResult[]> {
  try {
    return await fetchServerTrends(settings, subject, signal);
  } catch {
    return fetchClientTrends(settings, subject, signal);
  }
}

/** Nome de exibição por fonte. */
export const SOURCE_LABEL: Record<TrendSource, string> = {
  buscas: "Buscas",
  reddit: "Reddit",
  youtube: "YouTube",
  googletrends: "Google Trends",
  simulado: "Simulado",
};
