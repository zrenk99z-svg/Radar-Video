import type { VideoFormat, VideoIdea } from "../types";
import { viralScore } from "../lib/scoring";
import { suggestFormat } from "../lib/format";
import { IdeaCard } from "./IdeaCard";
import { FireIcon } from "./Icons";

interface Props {
  ideas: VideoIdea[];
  formatFilter: "todos" | VideoFormat;
  savedFormats: Map<string, VideoFormat>;
  onSave: (idea: VideoIdea, format: VideoFormat) => void;
}

/** Modo Viral: destaca os temas com maior chance de viralizar no curto prazo. */
export function ViralMode({ ideas, formatFilter, savedFormats, onSave }: Props) {
  const pool =
    formatFilter === "todos"
      ? ideas
      : ideas.filter((i) => suggestFormat(i) === formatFilter);
  const top5 = [...pool]
    .sort((a, b) => viralScore(b) - viralScore(a))
    .slice(0, 5);

  const filterLabel =
    formatFilter === "longo" ? "vídeo longo" : formatFilter === "short" ? "short" : null;

  return (
    <section id="viral" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric-500/30 to-grape-500/30 ring-1 ring-electric-500/40">
          <FireIcon className="h-5 w-5 animate-pulse-glow text-electric-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-100">
            Modo Viral
          </h2>
          <p className="text-sm text-slate-400">
            {filterLabel
              ? `Os ${top5.length} temas mais virais que encaixam como ${filterLabel}.`
              : "Os 5 temas com maior chance de explodir em views no curto prazo."}
          </p>
        </div>
      </div>

      {top5.length === 0 ? (
        <div className="card-glow p-8 text-center text-slate-400">
          Nenhum tema viral encaixa como{" "}
          {formatFilter === "longo" ? "vídeo longo" : "short"} agora. Tente
          “Todos”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {top5.map((idea, i) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            rank={i + 1}
            viral
            savedFormat={savedFormats.get(idea.id) ?? null}
            suggested={suggestFormat(idea)}
            onSave={onSave}
          />
          ))}
        </div>
      )}
    </section>
  );
}
