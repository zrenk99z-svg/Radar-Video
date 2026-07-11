import type { VideoIdea } from "../types";
import { scoreLabel } from "../lib/scoring";
import { ScoreRing } from "./ScoreRing";
import { MetricBar } from "./MetricBar";
import { BookmarkIcon, CheckIcon, FireIcon } from "./Icons";
import { CATEGORY_ICON, TYPE_LABEL, TYPE_STYLE } from "./categoryMeta";

interface Props {
  idea: VideoIdea;
  rank?: number;
  saved: boolean;
  viral?: boolean;
  onToggleSave: (idea: VideoIdea) => void;
}

/** Card de uma ideia de vídeo, com métricas e botão salvar. */
export function IdeaCard({ idea, rank, saved, viral, onToggleSave }: Props) {
  const Icon = CATEGORY_ICON[idea.category];

  return (
    <article
      className={`card-glow relative flex flex-col gap-4 p-5 animate-fade-up ${
        viral ? "shadow-glow-grape ring-1 ring-grape-500/40" : ""
      }`}
    >
      {viral && (
        <span className="absolute -top-2.5 left-4 chip bg-gradient-to-r from-rose-500 to-grape-500 text-white shadow-glow-grape">
          <FireIcon className="h-3.5 w-3.5" /> Viral
        </span>
      )}

      <header className="flex items-start gap-3">
        {typeof rank === "number" && (
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-slate-400">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-slate-100">
            {idea.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="chip bg-white/5 text-slate-300">
              <Icon className="h-3.5 w-3.5" />
              {idea.category}
            </span>
            <span className={`chip ${TYPE_STYLE[idea.type]}`}>
              {TYPE_LABEL[idea.type]}
            </span>
          </div>
        </div>
        <ScoreRing score={idea.score} />
      </header>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <MetricBar label="Interesse" value={idea.interest} />
        <MetricBar label="Cliques" value={idea.clickPotential} />
        <MetricBar label="Busca" value={idea.searchPotential} />
        <MetricBar label="Thumbnail" value={idea.thumbnailPotential} />
        <MetricBar label="Dificuldade" value={idea.difficulty} invertColor />
      </div>

      <footer className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400">
          Potencial:{" "}
          <span className="font-semibold text-slate-200">
            {scoreLabel(idea.score)}
          </span>
        </span>
        <button
          onClick={() => onToggleSave(idea)}
          className={
            saved
              ? "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/25"
              : "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium glass hover:border-electric-500/40 hover:text-white transition"
          }
        >
          {saved ? (
            <>
              <CheckIcon className="h-4 w-4" /> Salvo
            </>
          ) : (
            <>
              <BookmarkIcon className="h-4 w-4" /> Salvar
            </>
          )}
        </button>
      </footer>
    </article>
  );
}
