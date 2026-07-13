export type VideoType =
  | "review"
  | "teoria"
  | "ranking"
  | "explicação"
  | "notícia"
  | "curiosidade";

export type Category =
  | "Filmes"
  | "Séries"
  | "HQs"
  | "Animações"
  | "Super-heróis"
  | "Games"
  | "Cultura Nerd";

export type Emotion = "choque" | "mistério" | "hype" | "nostalgia";

/** Formato do vídeo: longo (10min+) ou short (vertical, curto). */
export type VideoFormat = "longo" | "short";

/** A single generated video idea. */
export interface VideoIdea {
  id: string;
  /** The subject the user searched for (ex.: "Batman"). */
  subject: string;
  title: string;
  category: Category;
  type: VideoType;
  /** Nível de interesse do público (0-100). */
  interest: number;
  /** Potencial de cliques (0-100). */
  clickPotential: number;
  /** Dificuldade de produção (0-100, maior = mais difícil). */
  difficulty: number;
  /** Potencial de busca no YouTube (0-100). */
  searchPotential: number;
  /** Potencial de thumbnail chamativa (0-100). */
  thumbnailPotential: number;
  /** Pontuação final calculada (0-100). */
  score: number;
  /** Formato escolhido ao salvar (Longo/Short). Ausente = usar o sugerido. */
  format?: VideoFormat;
}

/** Auto-generated thumbnail concept for a saved idea. */
export interface ThumbnailConcept {
  mainText: string;
  secondaryText: string;
  emotion: Emotion;
  /** Recommended color stops (hex). */
  colors: [string, string];
}

/** A simulated trending topic shown on the radar. */
export interface TrendingTopic {
  id: string;
  title: string;
  category: Category;
  kind: "Lançamento" | "Série do momento" | "HQ comentada" | "Jogo em alta";
  heat: number; // 0-100
  delta: number; // variação recente, pode ser negativa
  tag: string;
}
