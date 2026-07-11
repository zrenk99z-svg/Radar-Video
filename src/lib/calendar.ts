import type { VideoIdea, VideoType } from "../types";

/** Cadência do canal: 1 vídeo longo + 2 shorts por semana. */
export interface CalendarConfig {
  /** Data de início (ISO yyyy-mm-dd). */
  startDate: string;
  weeks: number;
  /** Dia do vídeo longo (0=domingo … 6=sábado). */
  longDay: number;
  /** Dias dos 2 shorts. */
  shortDays: [number, number];
}

export const DEFAULT_CALENDAR: CalendarConfig = {
  startDate: new Date().toISOString().slice(0, 10),
  weeks: 4,
  longDay: 6, // sábado
  shortDays: [2, 4], // terça e quinta
};

export interface Slot {
  kind: "longo" | "short";
  date: string; // ISO yyyy-mm-dd
  idea: VideoIdea | null;
}

export interface WeekPlan {
  index: number;
  long: Slot;
  shorts: [Slot, Slot];
}

/** Tipos de vídeo que funcionam bem como short. */
const SHORT_FRIENDLY: VideoType[] = ["curiosidade", "notícia", "ranking"];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Data do próximo `weekday` (0-6) a partir de `from`, inclusive. */
function nextWeekday(from: Date, weekday: number): Date {
  const diff = (weekday - from.getDay() + 7) % 7;
  return addDays(from, diff);
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Monta o calendário editorial preenchendo os slots com as ideias salvas.
 * Vídeos longos recebem as ideias de maior pontuação; os shorts recebem
 * ideias "short-friendly" ordenadas por potencial de cliques.
 */
export function buildCalendar(
  saved: VideoIdea[],
  config: CalendarConfig,
): WeekPlan[] {
  const start = new Date(config.startDate + "T00:00:00");

  // Pool para longos: melhores por score.
  const longPool = [...saved].sort((a, b) => b.score - a.score);
  const usedLong = new Set<string>();
  const longs: VideoIdea[] = [];
  for (const idea of longPool) {
    if (longs.length >= config.weeks) break;
    longs.push(idea);
    usedLong.add(idea.id);
  }

  // Pool para shorts: short-friendly primeiro, por potencial de cliques.
  const shortPool = [...saved]
    .filter((i) => !usedLong.has(i.id))
    .sort((a, b) => {
      const af = SHORT_FRIENDLY.includes(a.type) ? 1 : 0;
      const bf = SHORT_FRIENDLY.includes(b.type) ? 1 : 0;
      if (af !== bf) return bf - af;
      return b.clickPotential - a.clickPotential;
    });

  let shortIdx = 0;
  const weeks: WeekPlan[] = [];

  for (let w = 0; w < config.weeks; w++) {
    const weekStart = addDays(start, w * 7);
    const longDate = nextWeekday(weekStart, config.longDay);
    const s0Date = nextWeekday(weekStart, config.shortDays[0]);
    const s1Date = nextWeekday(weekStart, config.shortDays[1]);

    weeks.push({
      index: w,
      long: { kind: "longo", date: iso(longDate), idea: longs[w] ?? null },
      shorts: [
        { kind: "short", date: iso(s0Date), idea: shortPool[shortIdx++] ?? null },
        { kind: "short", date: iso(s1Date), idea: shortPool[shortIdx++] ?? null },
      ],
    });
  }

  return weeks;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Formata uma data ISO como "Sáb, 12/07". */
export function formatSlotDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${WEEKDAYS[d.getDay()]}, ${dd}/${mm}`;
}

export const WEEKDAY_OPTIONS = WEEKDAYS.map((label, value) => ({ label, value }));
