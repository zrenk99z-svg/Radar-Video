/**
 * Gerador de títulos com alto CTR. Motor heurístico (offline, determinístico)
 * baseado em palavras de impacto. Opcionalmente, um modo IA (Claude) refina.
 */

export interface TitleSuggestion {
  title: string;
  /** Pontuação de CTR estimada (0-100). */
  ctr: number;
  /** Palavras de impacto detectadas. */
  powerWords: string[];
  origin: "heurística" | "ia";
}

/** Palavras de impacto (gatilhos de clique) e o peso de cada uma. */
export const POWER_WORDS: { word: string; weight: number }[] = [
  { word: "FINALMENTE", weight: 12 },
  { word: "EXPLICADO", weight: 10 },
  { word: "SEGREDO", weight: 12 },
  { word: "O QUE NINGUÉM PERCEBEU", weight: 14 },
  { word: "URGENTE", weight: 11 },
  { word: "CHOCANTE", weight: 11 },
  { word: "REVELADO", weight: 10 },
  { word: "VOCÊ ERROU", weight: 9 },
  { word: "NUNCA MAIS", weight: 8 },
  { word: "A VERDADE SOBRE", weight: 10 },
  { word: "ANTES DE ASSISTIR", weight: 8 },
  { word: "MUDOU TUDO", weight: 9 },
];

function nice(subject: string): string {
  return subject
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TEMPLATES: ((s: string) => { title: string; words: string[] })[] = [
  (s) => ({ title: `${s.toUpperCase()}: O SEGREDO que Ninguém Te Contou`, words: ["SEGREDO"] }),
  (s) => ({ title: `FINALMENTE! ${s} EXPLICADO de Verdade`, words: ["FINALMENTE", "EXPLICADO"] }),
  (s) => ({ title: `${s}: O Que NINGUÉM PERCEBEU`, words: ["O QUE NINGUÉM PERCEBEU"] }),
  (s) => ({ title: `URGENTE: A VERDADE SOBRE ${s}`, words: ["URGENTE", "A VERDADE SOBRE"] }),
  (s) => ({ title: `Você ERROU Tudo Sobre ${s} (REVELADO)`, words: ["VOCÊ ERROU", "REVELADO"] }),
  (s) => ({ title: `${s} CHOCANTE: 7 Fatos que MUDARAM TUDO`, words: ["CHOCANTE", "MUDOU TUDO"] }),
  (s) => ({ title: `Assista ISSO ANTES DE ASSISTIR ${s}`, words: ["ANTES DE ASSISTIR"] }),
  (s) => ({ title: `O SEGREDO de ${s} que a Marvel Escondeu`, words: ["SEGREDO"] }),
  (s) => ({ title: `${s} EXPLICADO em 10 Minutos (SEM ENROLAÇÃO)`, words: ["EXPLICADO"] }),
  (s) => ({ title: `NINGUÉM Esperava Isso em ${s}`, words: [] }),
];

/**
 * Pontua um título por potencial de CTR usando sinais conhecidos:
 * palavras de impacto, números, maiúsculas, parênteses, tamanho ideal.
 */
export function scoreTitle(title: string): { ctr: number; powerWords: string[] } {
  let score = 42;
  const upper = title.toUpperCase();
  const found: string[] = [];

  for (const { word, weight } of POWER_WORDS) {
    if (upper.includes(word)) {
      score += weight;
      found.push(word);
    }
  }

  if (/\d/.test(title)) score += 8; // números disparam curiosidade
  if (/\(.+\)/.test(title)) score += 5; // parênteses ("REVELADO")
  if (/[!?]/.test(title)) score += 4;

  // Proporção de MAIÚSCULAS (ênfase), penaliza excesso
  const caps = (title.match(/[A-ZÀ-Ú]/g) || []).length;
  const ratio = caps / Math.max(1, title.replace(/\s/g, "").length);
  if (ratio > 0.25 && ratio < 0.7) score += 6;
  else if (ratio >= 0.7) score -= 6; // gritar demais reduz CTR

  // Tamanho: ~40-70 caracteres é o ideal para não cortar na thumbnail/feed
  const len = title.length;
  if (len >= 40 && len <= 70) score += 8;
  else if (len > 85) score -= 8;

  return {
    ctr: Math.max(0, Math.min(100, Math.round(score))),
    powerWords: found,
  };
}

/** Gera títulos com alto CTR para um assunto (heurística offline). */
export function generateTitles(subject: string): TitleSuggestion[] {
  const s = nice(subject);
  return TEMPLATES.map((tpl) => {
    const { title, words } = tpl(s);
    const { ctr, powerWords } = scoreTitle(title);
    return {
      title,
      ctr,
      powerWords: Array.from(new Set([...words, ...powerWords])),
      origin: "heurística" as const,
    };
  }).sort((a, b) => b.ctr - a.ctr);
}
