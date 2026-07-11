import type { LiveTrend, SourceResult } from "./types";

interface ProxyResponse {
  // Formato flexível: aceita { related: string[] } ou { topics: [{title, value}] }
  related?: string[];
  topics?: { title: string; value?: number }[];
}

/**
 * Google Trends não expõe uma API pública com CORS. Esta função consulta um
 * proxy opcional definido nas configurações. O proxy deve aceitar
 * `?q=<termo>&geo=BR` e devolver JSON com termos relacionados em alta.
 * Sem proxy configurado, o agregador cai no modo simulado.
 */
export async function fetchGoogleTrends(
  proxyUrl: string,
  query = "cultura nerd",
  signal?: AbortSignal,
): Promise<SourceResult> {
  const url = new URL(proxyUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("geo", "BR");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Google Trends proxy: HTTP ${res.status}`);
  const json = (await res.json()) as ProxyResponse;

  const raw =
    json.topics?.map((t) => ({ title: t.title, value: t.value })) ??
    (json.related ?? []).map((title) => ({ title, value: undefined }));

  const trends: LiveTrend[] = raw.slice(0, 12).map((t, i) => ({
    id: `gt-${i}-${t.title.slice(0, 20)}`,
    title: t.title,
    source: "googletrends" as const,
    heat: t.value != null ? Math.max(20, Math.min(99, t.value)) : 90 - i * 5,
    category: "Cultura Nerd",
    context: "Google Trends · BR",
    url: `https://www.google.com/search?q=${encodeURIComponent(t.title)}`,
  }));

  if (trends.length === 0) throw new Error("Proxy do Google Trends vazio.");
  return { source: "googletrends", live: true, trends };
}
