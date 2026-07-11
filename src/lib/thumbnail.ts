import type { Emotion, ThumbnailConcept, VideoIdea } from "../types";

const EMOTION_BY_TYPE: Record<VideoIdea["type"], Emotion> = {
  teoria: "mistério",
  notícia: "choque",
  ranking: "hype",
  review: "nostalgia",
  explicação: "mistério",
  curiosidade: "choque",
};

const COLORS_BY_EMOTION: Record<Emotion, [string, string]> = {
  choque: ["#ef4444", "#f59e0b"], // vermelho/laranja — alerta
  mistério: ["#7c22ce", "#22a6f2"], // roxo/azul — enigma
  hype: ["#22a6f2", "#a855f7"], // azul elétrico/roxo — energia
  nostalgia: ["#f59e0b", "#9333ea"], // âmbar/roxo — memória
};

const SECONDARY_BY_EMOTION: Record<Emotion, string> = {
  choque: "VOCÊ NÃO VAI ACREDITAR",
  mistério: "O QUE NINGUÉM PERCEBEU",
  hype: "PREPARE-SE",
  nostalgia: "LEMBRA DISSO?",
};

/** Extrai um "punch" curto para o texto principal da thumbnail. */
function punchText(idea: VideoIdea): string {
  const t = idea.title.toUpperCase();
  // Palavras de impacto já embutidas nos títulos.
  const hits = t.match(/ÉPICOS|MUDA TUDO|URGENTE|SEGREDO|VILÃO|ERROS|TOP 10|SPOILER/);
  if (hits) {
    // Combina o gancho com o assunto.
    return `${idea.subject.toUpperCase()}: ${hits[0]}`;
  }
  return idea.subject.toUpperCase();
}

/**
 * Gera automaticamente um conceito de thumbnail para uma ideia salva:
 * texto principal, texto secundário, emoção sugerida e cores recomendadas.
 */
export function generateThumbnail(idea: VideoIdea): ThumbnailConcept {
  const emotion = EMOTION_BY_TYPE[idea.type];
  return {
    mainText: punchText(idea),
    secondaryText: SECONDARY_BY_EMOTION[emotion],
    emotion,
    colors: COLORS_BY_EMOTION[emotion],
  };
}

export const EMOTION_EMOJI: Record<Emotion, string> = {
  choque: "😱",
  mistério: "🕵️",
  hype: "🔥",
  nostalgia: "🕹️",
};
