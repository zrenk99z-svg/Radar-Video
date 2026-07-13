import type { VideoFormat, VideoIdea, VideoType } from "../types";

/** Tipos que costumam render mais como short (rápido, com gancho). */
const SHORT_FRIENDLY: VideoType[] = ["curiosidade", "notícia", "ranking"];

/**
 * Sugere o formato ideal do vídeo (longo vs short) a partir do tipo e das
 * métricas: shorts favorecem cliques + produção rápida; longos favorecem
 * profundidade (interesse + busca). Determinístico.
 */
export function suggestFormat(idea: VideoIdea): VideoFormat {
  const shortFriendly = SHORT_FRIENDLY.includes(idea.type);
  const ease = 100 - idea.difficulty;
  const shortScore =
    idea.clickPotential * 0.5 + ease * 0.3 + (shortFriendly ? 22 : 0);
  const longScore =
    idea.interest * 0.4 + idea.searchPotential * 0.4 + (shortFriendly ? 0 : 22);
  return shortScore >= longScore ? "short" : "longo";
}

/** Formato efetivo de uma ideia salva: o escolhido, ou o sugerido. */
export function resolveFormat(idea: VideoIdea): VideoFormat {
  return idea.format ?? suggestFormat(idea);
}

export const FORMAT_LABEL: Record<VideoFormat, string> = {
  longo: "Longo",
  short: "Short",
};
