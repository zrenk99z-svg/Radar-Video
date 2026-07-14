import { useMemo } from "react";
import type { VideoFormat, VideoIdea } from "../types";
import { buildTrendIdeas } from "../lib/trendIdeas";
import { suggestFormat } from "../lib/format";
import { SOURCE_LABEL, type SourceResult } from "../lib/sources";
import { IdeaCard } from "./IdeaCard";
import { FireIcon, LinkIcon } from "./Icons";

interface Props {
  results: SourceResult[];
  loading: boolean;
  enabled: boolean;
  savedFormats: Map<string, VideoFormat>;
  onSave: (idea: VideoIdea, format: VideoFormat) => void;
  onExplore: (subject: string) => void;
}

/**
 * "Ideias em alta": gera a melhor ideia de vídeo para cada tema realmente em
 * alta agora (Reddit/YouTube/Google Trends), em vez de partir só do que você
 * digita.
 */
export function TrendIdeas({
  results,
  loading,
  enabled,
  savedFormats,
  onSave,
  onExplore,
}: Props) {
  const items = useMemo(() => buildTrendIdeas(results, 6), [results]);

  if (!enabled) return null;

  return (
    <section id="em-alta" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric-500/30 to-grape-500/30 ring-1 ring-electric-500/40">
          <FireIcon className="h-5 w-5 animate-pulse-glow text-electric-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-100">
            Ideias em alta agora
          </h2>
          <p className="text-sm text-slate-400">
            Geradas do que está em alta na semana — clique para aprofundar.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card-glow grid place-items-center p-8 text-center text-slate-400">
          {loading
            ? "Buscando tendências…"
            : "Sem tendências agora. Tente atualizar o Radar de Tendências abaixo."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ idea, trend, subject }) => {
            const live = trend.source !== "simulado";
            return (
            <div key={trend.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 text-xs">
                <span
                  className={`chip shrink-0 ${
                    live
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  <FireIcon className="h-3 w-3" />
                  {SOURCE_LABEL[trend.source]} · {trend.heat}°
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-400">
                  {trend.title}
                </span>
                {trend.url && (
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir fonte"
                    className="shrink-0 text-slate-500 hover:text-electric-400"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <IdeaCard
                idea={idea}
                savedFormat={savedFormats.get(idea.id) ?? null}
                suggested={suggestFormat(idea)}
                onSave={onSave}
              />

              <button
                onClick={() => onExplore(subject)}
                className="self-start px-1 text-xs font-medium text-electric-400 hover:underline"
              >
                Ver 20 ideias de “{subject}” →
              </button>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
