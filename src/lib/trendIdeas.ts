import type { VideoIdea } from "../types";
import type { LiveTrend, SourceResult } from "./sources";
import { generateIdeas } from "./ideaGenerator";
import { rankIdeas } from "./scoring";

/**
 * Extrai um "assunto" curto e utilizável a partir do título de uma tendência
 * (posts do Reddit são frases longas; queries do Google/YouTube são curtas).
 * Corta no primeiro separador forte e limita o número de palavras.
 */
export function subjectFromTrend(title: string): string {
  const head = title.split(/[:\-–—|(]/)[0].trim();
  return head.split(/\s+/).slice(0, 6).join(" ").trim();
}

export interface TrendIdea {
  /** Melhor ideia gerada para o tema em alta. */
  idea: VideoIdea;
  /** A tendência real que originou a ideia. */
  trend: LiveTrend;
  /** Assunto limpo usado para gerar a ideia (para "ver 20 ideias"). */
  subject: string;
}

/**
 * Semeia ideias a partir das tendências reais: junta os temas de todas as
 * fontes, remove repetidos, ordena por "calor" e gera a melhor ideia de vídeo
 * para cada um. Prioriza fontes ao vivo.
 */
export function buildTrendIdeas(
  results: SourceResult[],
  limit = 6,
): TrendIdea[] {
  const seen = new Set<string>();
  const trends: LiveTrend[] = [];

  // Fontes ao vivo primeiro, para dar preferência a dados reais.
  const ordered = [...results].sort(
    (a, b) => Number(b.live) - Number(a.live),
  );

  for (const r of ordered) {
    for (const t of r.trends) {
      const subject = subjectFromTrend(t.title);
      const key = subject.toLowerCase();
      if (!key || key.length < 2 || seen.has(key)) continue;
      seen.add(key);
      trends.push(t);
    }
  }

  trends.sort((a, b) => b.heat - a.heat);

  return trends.slice(0, limit).map((trend) => {
    const subject = subjectFromTrend(trend.title);
    const idea = rankIdeas(generateIdeas(subject))[0];
    return { idea, trend, subject };
  });
}
