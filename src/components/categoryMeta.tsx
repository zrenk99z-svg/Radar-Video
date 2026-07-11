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

/** Cor do "chip" por tipo de vídeo — paleta quente (Brasa/Creme/âmbar). */
export const TYPE_STYLE: Record<VideoType, string> = {
  review: "bg-white/5 text-creme-300 ring-1 ring-white/10",
  teoria: "bg-electric-500/15 text-electric-400 ring-1 ring-electric-500/25",
  ranking: "bg-grape-500/15 text-grape-400 ring-1 ring-grape-500/25",
  explicação: "bg-white/5 text-slate-300 ring-1 ring-white/10",
  notícia: "bg-electric-600/20 text-electric-400 ring-1 ring-electric-600/30",
  curiosidade: "bg-grape-400/15 text-grape-400 ring-1 ring-grape-400/25",
};

export const TYPE_LABEL: Record<VideoType, string> = {
  review: "Review",
  teoria: "Teoria",
  ranking: "Ranking",
  explicação: "Explicação",
  notícia: "Notícia",
  curiosidade: "Curiosidade",
};
