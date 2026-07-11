import type { Category, VideoIdea, VideoType } from "../types";
import { computeScore } from "./scoring";

/** PRNG determinístico (mulberry32) para resultados estáveis por assunto. */
function seededRandom(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const CATEGORIES: Category[] = [
  "Filmes",
  "Séries",
  "HQs",
  "Animações",
  "Super-heróis",
  "Games",
  "Cultura Nerd",
];

interface Template {
  type: VideoType;
  title: (s: string) => string;
  /** modificadores base de cada métrica (0-1) para dar personalidade ao tipo */
  bias: {
    interest: number;
    click: number;
    difficulty: number;
    search: number;
    thumb: number;
  };
}

/** Título capitalizado do assunto. */
function nice(subject: string): string {
  return subject
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TEMPLATES: Template[] = [
  {
    type: "ranking",
    title: (s) => `TOP 10 Momentos ÉPICOS de ${s}`,
    bias: { interest: 0.85, click: 0.9, difficulty: 0.4, search: 0.8, thumb: 0.9 },
  },
  {
    type: "teoria",
    title: (s) => `A Teoria que MUDA TUDO em ${s}`,
    bias: { interest: 0.8, click: 0.92, difficulty: 0.35, search: 0.7, thumb: 0.85 },
  },
  {
    type: "review",
    title: (s) => `${s}: Vale a Pena? Análise SEM SPOILER`,
    bias: { interest: 0.7, click: 0.75, difficulty: 0.45, search: 0.9, thumb: 0.7 },
  },
  {
    type: "explicação",
    title: (s) => `Entenda ${s} em 10 Minutos`,
    bias: { interest: 0.72, click: 0.7, difficulty: 0.5, search: 0.92, thumb: 0.6 },
  },
  {
    type: "curiosidade",
    title: (s) => `7 Curiosidades de ${s} que Você NÃO Sabia`,
    bias: { interest: 0.78, click: 0.85, difficulty: 0.3, search: 0.75, thumb: 0.82 },
  },
  {
    type: "notícia",
    title: (s) => `URGENTE: A Novidade de ${s} que Ninguém Esperava`,
    bias: { interest: 0.82, click: 0.9, difficulty: 0.25, search: 0.68, thumb: 0.8 },
  },
  {
    type: "ranking",
    title: (s) => `Do PIOR ao MELHOR: Ranking de ${s}`,
    bias: { interest: 0.8, click: 0.82, difficulty: 0.5, search: 0.78, thumb: 0.85 },
  },
  {
    type: "teoria",
    title: (s) => `O Segredo Escondido em ${s}`,
    bias: { interest: 0.83, click: 0.9, difficulty: 0.38, search: 0.66, thumb: 0.88 },
  },
  {
    type: "explicação",
    title: (s) => `A Ordem Correta para Consumir ${s}`,
    bias: { interest: 0.68, click: 0.65, difficulty: 0.4, search: 0.95, thumb: 0.55 },
  },
  {
    type: "review",
    title: (s) => `Por que TODO MUNDO Está Falando de ${s}?`,
    bias: { interest: 0.86, click: 0.88, difficulty: 0.35, search: 0.72, thumb: 0.8 },
  },
  {
    type: "curiosidade",
    title: (s) => `Os ERROS que Passaram Despercebidos em ${s}`,
    bias: { interest: 0.74, click: 0.8, difficulty: 0.42, search: 0.7, thumb: 0.78 },
  },
  {
    type: "ranking",
    title: (s) => `${s}: Todos os Personagens RANQUEADOS`,
    bias: { interest: 0.77, click: 0.8, difficulty: 0.55, search: 0.8, thumb: 0.82 },
  },
  {
    type: "teoria",
    title: (s) => `E se ${s} Fosse o VILÃO? Teoria Sombria`,
    bias: { interest: 0.81, click: 0.9, difficulty: 0.36, search: 0.6, thumb: 0.9 },
  },
  {
    type: "explicação",
    title: (s) => `A Linha do Tempo COMPLETA de ${s}`,
    bias: { interest: 0.7, click: 0.68, difficulty: 0.6, search: 0.9, thumb: 0.58 },
  },
  {
    type: "notícia",
    title: (s) => `${s} Confirmado? Tudo o que Sabemos`,
    bias: { interest: 0.8, click: 0.86, difficulty: 0.28, search: 0.82, thumb: 0.76 },
  },
  {
    type: "curiosidade",
    title: (s) => `Referências Ocultas em ${s}`,
    bias: { interest: 0.73, click: 0.78, difficulty: 0.44, search: 0.66, thumb: 0.75 },
  },
  {
    type: "review",
    title: (s) => `Revisitando ${s}: Envelheceu BEM?`,
    bias: { interest: 0.69, click: 0.72, difficulty: 0.4, search: 0.74, thumb: 0.68 },
  },
  {
    type: "ranking",
    title: (s) => `As MELHORES Fases de ${s}`,
    bias: { interest: 0.76, click: 0.79, difficulty: 0.48, search: 0.76, thumb: 0.8 },
  },
  {
    type: "teoria",
    title: (s) => `A Conexão Secreta entre ${s} e o Multiverso`,
    bias: { interest: 0.84, click: 0.91, difficulty: 0.4, search: 0.64, thumb: 0.89 },
  },
  {
    type: "curiosidade",
    title: (s) => `O que Cortaram de ${s} e Ninguém Viu`,
    bias: { interest: 0.75, click: 0.83, difficulty: 0.33, search: 0.68, thumb: 0.81 },
  },
];

/** Deriva a categoria provável a partir do template e de um pouco de aleatoriedade. */
function pickCategory(rand: () => number, type: VideoType): Category {
  const hero = ["Super-heróis", "HQs", "Filmes"] as Category[];
  const explain: Category[] = ["Séries", "Animações", "Cultura Nerd"];
  const pool = type === "explicação" || type === "review" ? explain : hero;
  const merged = rand() > 0.5 ? pool : CATEGORIES;
  return merged[Math.floor(rand() * merged.length)];
}

/** Ajusta um valor base (0-1) com um pequeno ruído e o converte para 0-100. */
function metric(base: number, rand: () => number): number {
  const noise = (rand() - 0.5) * 0.25; // ±12.5%
  return Math.round(Math.max(5, Math.min(100, (base + noise) * 100)));
}

/**
 * Gera 20 ideias de vídeo para um assunto. Determinístico: o mesmo assunto
 * sempre produz as mesmas ideias, mas assuntos diferentes variam bastante.
 */
export function generateIdeas(subject: string): VideoIdea[] {
  const clean = nice(subject);
  const rand = seededRandom(hashString(clean.toLowerCase()));

  return TEMPLATES.map((tpl, i) => {
    const interest = metric(tpl.bias.interest, rand);
    const clickPotential = metric(tpl.bias.click, rand);
    const difficulty = metric(tpl.bias.difficulty, rand);
    const searchPotential = metric(tpl.bias.search, rand);
    const thumbnailPotential = metric(tpl.bias.thumb, rand);
    const score = computeScore({
      interest,
      difficulty,
      searchPotential,
      thumbnailPotential,
    });

    return {
      id: `${clean.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      subject: clean,
      title: tpl.title(clean),
      category: pickCategory(rand, tpl.type),
      type: tpl.type,
      interest,
      clickPotential,
      difficulty,
      searchPotential,
      thumbnailPotential,
      score,
    };
  });
}
