import type { Category, VideoType } from "../types";
import {
  ComicIcon,
  FilmIcon,
  GameIcon,
  HeroIcon,
  RadarIcon,
} from "./Icons";

type IconType = typeof FilmIcon;

/** Ícone (cinema / HQ / game / herói) por categoria. */
export const CATEGORY_ICON: Record<Category, IconType> = {
  Filmes: FilmIcon,
  Séries: FilmIcon,
  HQs: ComicIcon,
  Animações: FilmIcon,
  "Super-heróis": HeroIcon,
  Games: GameIcon,
  "Cultura Nerd": RadarIcon,
};

/** Cor do "chip" por tipo de vídeo. */
export const TYPE_STYLE: Record<VideoType, string> = {
  review: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25",
  teoria: "bg-grape-500/15 text-grape-400 ring-1 ring-grape-500/25",
  ranking: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
  explicação: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  notícia: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25",
  curiosidade: "bg-electric-500/15 text-electric-400 ring-1 ring-electric-500/25",
};

export const TYPE_LABEL: Record<VideoType, string> = {
  review: "Review",
  teoria: "Teoria",
  ranking: "Ranking",
  explicação: "Explicação",
  notícia: "Notícia",
  curiosidade: "Curiosidade",
};
