import { TRENDING } from "../data/trends";
import type { TrendingTopic } from "../types";
import { ArrowDownIcon, ArrowUpIcon, RadarIcon } from "./Icons";
import { CATEGORY_ICON } from "./categoryMeta";

const KIND_ORDER: TrendingTopic["kind"][] = [
  "Lançamento",
  "Série do momento",
  "HQ comentada",
  "Jogo em alta",
];

interface Props {
  onExplore: (subject: string) => void;
}

/** Radar de Tendências: temas em alta simulados, agrupados por tipo. */
export function TrendRadar({ onExplore }: Props) {
  return (
    <section id="tendencias" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl glass">
          <RadarIcon className="h-5 w-5 text-electric-400" />
          <span className="absolute inset-0 origin-center animate-sweep">
            <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-full bg-gradient-to-t from-electric-400 to-transparent" />
          </span>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-100">
            Radar de Tendências
          </h2>
          <p className="text-sm text-slate-400">
            Temas nerds em alta agora — clique para gerar ideias.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KIND_ORDER.map((kind) => {
          const items = TRENDING.filter((t) => t.kind === kind);
          return (
            <div key={kind} className="card-glow p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-electric-400">
                {kind}
              </h3>
              <ul className="space-y-2">
                {items.map((t) => {
                  const Icon = CATEGORY_ICON[t.category];
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => onExplore(t.title)}
                        className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/5"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-300 group-hover:text-electric-400">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-200 group-hover:text-white">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-500">{t.tag}</span>
                        </span>
                        <span className="flex flex-col items-end">
                          <span className="text-sm font-bold tabular-nums text-slate-100">
                            {t.heat}°
                          </span>
                          <span
                            className={`flex items-center gap-0.5 text-[11px] tabular-nums ${
                              t.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {t.delta >= 0 ? (
                              <ArrowUpIcon className="h-3 w-3" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3" />
                            )}
                            {Math.abs(t.delta)}%
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
