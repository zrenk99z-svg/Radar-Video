import type { VideoFormat, VideoIdea } from "../types";
import { scoreLabel } from "../lib/scoring";
import { FORMAT_LABEL } from "../lib/format";
import { ScoreRing } from "./ScoreRing";
import { MetricBar } from "./MetricBar";
import { FireIcon, LongIcon, ShortIcon } from "./Icons";
import { CATEGORY_ICON, TYPE_LABEL, TYPE_STYLE } from "./categoryMeta";

interface Props {
  idea: VideoIdea;
  rank?: number;
  /** Formato com que foi salvo, ou null se não estiver salvo. */
  savedFormat: VideoFormat | null;
  /** Formato sugerido (mostrado como selo e como recomendação). */
  suggested: VideoFormat;
  viral?: boolean;
  onSave: (idea: VideoIdea, format: VideoFormat) => void;
}

const FORMAT_ICON = { longo: LongIcon, short: ShortIcon } as const;

/** Card de uma ideia de vídeo, com métricas, formato sugerido e salvar Longo/Short. */
export function IdeaCard({
  idea,
  rank,
  savedFormat,
  suggested,
  viral,
  onSave,
}: Props) {
  const Icon = CATEGORY_ICON[idea.category];
  const SuggestedIcon = FORMAT_ICON[suggested];

  return (
    <article
      className={`card-glow relative flex flex-col gap-4 p-5 animate-fade-up ${
        viral ? "shadow-glow-grape ring-1 ring-grape-500/40" : ""
      }`}
    >
      {viral && (
        <span className="absolute -top-2.5 left-4 chip bg-gradient-to-r from-electric-600 to-grape-500 text-void-900 shadow-glow-grape">
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
          <h3 className="text-[15px] font-semibold leading-snug text-slate-100">
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
            <span
              title="Formato sugerido para este tema"
              className="chip bg-electric-500/10 text-electric-400 ring-1 ring-electric-500/25"
            >
              <SuggestedIcon className="h-3.5 w-3.5" />
              {FORMAT_LABEL[suggested]}
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

      <footer className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-xs text-slate-400">
          {savedFormat ? (
            <span className="text-emerald-300">✓ Salvo</span>
          ) : (
            <>
              Potencial:{" "}
              <span className="font-semibold text-slate-200">
                {scoreLabel(idea.score)}
              </span>
            </>
          )}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="hidden text-[11px] text-slate-500 sm:inline">
            Salvar:
          </span>
          <div className="inline-flex items-center gap-0.5 rounded-xl glass p-0.5">
            <FormatButton
              format="longo"
              active={savedFormat === "longo"}
              suggested={suggested === "longo" && !savedFormat}
              onClick={() => onSave(idea, "longo")}
            />
            <FormatButton
              format="short"
              active={savedFormat === "short"}
              suggested={suggested === "short" && !savedFormat}
              onClick={() => onSave(idea, "short")}
            />
          </div>
        </div>
      </footer>
    </article>
  );
}

function FormatButton({
  format,
  active,
  suggested,
  onClick,
}: {
  format: VideoFormat;
  active: boolean;
  suggested: boolean;
  onClick: () => void;
}) {
  const FmtIcon = FORMAT_ICON[format];
  return (
    <button
      onClick={onClick}
      title={
        active
          ? `Salvo como ${FORMAT_LABEL[format]} — clique para remover`
          : `Salvar como ${FORMAT_LABEL[format]}`
      }
      className={
        active
          ? "inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-electric-500 to-grape-400 px-2.5 py-1.5 text-xs font-semibold text-void-900"
          : `inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white ${
              suggested ? "ring-1 ring-electric-500/40" : ""
            }`
      }
    >
      <FmtIcon className="h-3.5 w-3.5" />
      {FORMAT_LABEL[format]}
    </button>
  );
}
