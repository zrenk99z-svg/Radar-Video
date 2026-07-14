import { SOURCE_LABEL, type SourceResult } from "../lib/sources";
import { CATEGORY_ICON } from "./categoryMeta";
import { LinkIcon, RadarIcon } from "./Icons";

interface Props {
  results: SourceResult[];
  loading: boolean;
  enabled: boolean;
  onReload: () => void;
  onExplore: (subject: string) => void;
}

/** Radar de Tendências com fontes reais (Reddit, YouTube, Google Trends). */
export function LiveTrends({
  results,
  loading,
  enabled,
  onReload,
  onExplore,
}: Props) {
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <section id="tendencias" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
              Temas nerd em alta agora ({currentMonth}) — clique para gerar
              ideias.
            </p>
          </div>
        </div>
        <button onClick={onReload} disabled={loading} className="btn-ghost text-sm">
          {loading ? "Buscando…" : "Atualizar"}
        </button>
      </div>

      {results.length === 0 ? (
        <div className="card-glow grid place-items-center p-8 text-center text-slate-400">
          {enabled
            ? "Carregando fontes…"
            : "Fontes ao vivo desativadas. Ative em Configurações."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {results.map((r) => (
            <div key={r.source} className="card-glow min-w-0 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">
                  {SOURCE_LABEL[r.source]}
                </h3>
                <span
                  title={r.note}
                  className={`chip ${
                    r.live
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      r.live ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                  {r.live ? "ao vivo" : "simulado"}
                </span>
              </div>

              <ul className="space-y-1.5">
                {r.trends.slice(0, 6).map((t) => {
                  const Icon = CATEGORY_ICON[t.category];
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => onExplore(t.title)}
                        className="group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-white/5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/5 text-slate-300 group-hover:text-electric-400">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-slate-200 group-hover:text-white">
                            {t.title}
                          </span>
                          <span className="truncate text-[11px] text-slate-500">
                            {t.context}
                          </span>
                        </span>
                        <span className="text-xs font-bold tabular-nums text-slate-300">
                          {t.heat}°
                        </span>
                        {t.url && (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-500 hover:text-electric-400"
                            aria-label="Abrir fonte"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {r.note && !r.live && (
                <p className="mt-2 text-[11px] text-slate-600">{r.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
