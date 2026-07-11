import type { Category } from "../../types";

export type TrendSource = "reddit" | "youtube" | "googletrends" | "simulado";

/** Um tema normalizado, vindo de qualquer fonte (real ou simulada). */
export interface LiveTrend {
  id: string;
  title: string;
  source: TrendSource;
  /** Métrica de "calor" 0-100 derivada da fonte. */
  heat: number;
  /** Categoria estimada. */
  category: Category;
  /** Contexto (subreddit, canal, região…). */
  context: string;
  /** URL de origem, quando houver. */
  url?: string;
}

/** Resultado de um provedor de tendências. */
export interface SourceResult {
  source: TrendSource;
  /** true = veio de rede real; false = fallback simulado. */
  live: boolean;
  trends: LiveTrend[];
  /** Mensagem de erro/status, se o modo real falhou. */
  note?: string;
}
