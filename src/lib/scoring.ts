import type { VideoIdea } from "../types";

/**
 * Pesos da pontuação final. A soma é 1.
 * A dificuldade entra de forma invertida (facilidade de produção).
 */
export const SCORE_WEIGHTS = {
  interest: 0.32, // interesse do público
  ease: 0.18, // facilidade de produção (100 - dificuldade)
  search: 0.28, // potencial de busca
  thumbnail: 0.22, // potencial de thumbnail
} as const;

/**
 * Calcula a pontuação final (0-100) de uma ideia com base em:
 * interesse do público, facilidade de produção, potencial de busca e de thumbnail.
 */
export function computeScore(
  idea: Pick<
    VideoIdea,
    "interest" | "difficulty" | "searchPotential" | "thumbnailPotential"
  >,
): number {
  const ease = 100 - idea.difficulty;
  const raw =
    idea.interest * SCORE_WEIGHTS.interest +
    ease * SCORE_WEIGHTS.ease +
    idea.searchPotential * SCORE_WEIGHTS.search +
    idea.thumbnailPotential * SCORE_WEIGHTS.thumbnail;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * "Potencial viral de curto prazo": prioriza cliques + busca + thumbnail,
 * dá menos peso à produção. Usado no Modo Viral.
 */
export function viralScore(idea: VideoIdea): number {
  const ease = 100 - idea.difficulty;
  const raw =
    idea.clickPotential * 0.4 +
    idea.searchPotential * 0.25 +
    idea.thumbnailPotential * 0.25 +
    ease * 0.1;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/** Retorna as ideias ordenadas do melhor para o pior score. */
export function rankIdeas(ideas: VideoIdea[]): VideoIdea[] {
  return [...ideas].sort((a, b) => b.score - a.score);
}

/** Rótulo textual para uma pontuação. */
export function scoreLabel(score: number): string {
  if (score >= 85) return "Explosivo";
  if (score >= 70) return "Ótimo";
  if (score >= 55) return "Bom";
  if (score >= 40) return "Mediano";
  return "Fraco";
}

/** Classe de cor (tailwind) para uma pontuação. */
export function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "text-electric-400";
  if (score >= 55) return "text-sky-300";
  if (score >= 40) return "text-amber-300";
  return "text-rose-300";
}
