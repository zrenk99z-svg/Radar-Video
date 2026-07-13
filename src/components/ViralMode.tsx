import type { VideoFormat, VideoIdea } from "../types";
import { viralScore } from "../lib/scoring";
import { suggestFormat } from "../lib/format";
import { IdeaCard } from "./IdeaCard";
import { FireIcon } from "./Icons";

interface Props {
  ideas: VideoIdea[];
  savedFormats: Map<string, VideoFormat>;
  onSave: (idea: VideoIdea, format: VideoFormat) => void;
}

/** Modo Viral: destaca os 5 temas com maior chance de viralizar no curto prazo. */
export function ViralMode({ ideas, savedFormats, onSave }: Props) {
  const top5 = [...ideas]
    .sort((a, b) => viralScore(b) - viralScore(a))
    .slice(0, 5);

  if (top5.length === 0) return null;

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
            Os 5 temas com maior chance de explodir em views no curto prazo.
          </p>
        </div>
      </div>

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
    </section>
  );
}
