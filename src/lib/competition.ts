/** Análise de concorrência: quantos canais já fizeram vídeos sobre o tema. */

export interface Competition {
  subject: string;
  /** Nº estimado de vídeos sobre o tema. */
  totalVideos: number;
  /** Nº de canais distintos que já cobriram o tema. */
  channels: number;
  /** 0-100: quão saturado está o tema. */
  saturation: number;
  level: "Baixa" | "Média" | "Alta" | "Saturada";
  /** true = veio da YouTube Data API; false = estimativa simulada. */
  live: boolean;
  /** Recomendação curta para o criador. */
  advice: string;
  note?: string;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function classify(saturation: number): Competition["level"] {
  if (saturation >= 80) return "Saturada";
  if (saturation >= 60) return "Alta";
  if (saturation >= 35) return "Média";
  return "Baixa";
}

function adviceFor(level: Competition["level"]): string {
  switch (level) {
    case "Baixa":
      return "Pouca concorrência — ótima janela para dominar o tema.";
    case "Média":
      return "Concorrência moderada — invista em um ângulo original e boa thumbnail.";
    case "Alta":
      return "Muitos canais no tema — só entre com uma abordagem bem diferenciada.";
    case "Saturada":
      return "Tema saturado — busque um nicho específico ou uma teoria inédita.";
  }
}

/** Estimativa determinística (sem chave), baseada no assunto. */
export function estimateCompetition(subject: string): Competition {
  const clean = subject.trim();
  const rand = hash(clean.toLowerCase());
  // temas populares (curtos, conhecidos) tendem a ser mais saturados
  const popularity = Math.min(1, 0.3 + (12 - Math.min(12, clean.length)) / 18);
  const base = (rand % 60) / 100; // 0-0.6
  const saturation = Math.round(Math.min(95, (popularity * 0.7 + base * 0.6) * 100));
  const channels = Math.round(30 + (rand % 900) * (0.4 + popularity));
  const totalVideos = Math.round(channels * (2.5 + (rand % 40) / 10));
  const level = classify(saturation);
  return {
    subject: clean,
    totalVideos,
    channels,
    saturation,
    level,
    live: false,
    advice: adviceFor(level),
  };
}

interface YtSearchResponse {
  pageInfo?: { totalResults?: number };
  items?: { snippet: { channelId: string } }[];
  error?: { message: string };
}

/**
 * Concorrência real via YouTube Data API: total de vídeos + nº de canais
 * distintos em uma amostra recente. Cai para `estimateCompetition` em erro.
 */
export async function fetchCompetition(
  subject: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<Competition> {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", subject);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("regionCode", "BR");

    const res = await fetch(url.toString(), { signal });
    const json = (await res.json()) as YtSearchResponse;
    if (!res.ok || json.error) {
      throw new Error(json.error?.message ?? `HTTP ${res.status}`);
    }

    const items = json.items ?? [];
    const channels = new Set(items.map((i) => i.snippet.channelId)).size;
    const totalVideos = json.pageInfo?.totalResults ?? items.length;
    // saturação: muitos resultados totais + amostra dominada por poucos canais
    const density = items.length ? channels / items.length : 1;
    const volumeScore = Math.min(1, Math.log10(Math.max(1, totalVideos)) / 6);
    const saturation = Math.round(
      Math.min(95, (volumeScore * 0.7 + (1 - density) * 0.3) * 100),
    );
    const level = classify(saturation);
    return {
      subject: subject.trim(),
      totalVideos,
      channels,
      saturation,
      level,
      live: true,
      advice: adviceFor(level),
    };
  } catch (e) {
    const fallback = estimateCompetition(subject);
    fallback.note = (e as Error).message;
    return fallback;
  }
}
