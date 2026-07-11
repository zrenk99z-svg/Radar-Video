import type { VideoIdea } from "../types";
import { EMOTION_EMOJI, generateThumbnail } from "../lib/thumbnail";

interface Props {
  idea: VideoIdea;
}

/** Prévia visual (16:9) da thumbnail gerada automaticamente para uma ideia. */
export function ThumbnailPreview({ idea }: Props) {
  const thumb = generateThumbnail(idea);
  const [c1, c2] = thumb.colors;

  return (
    <div className="space-y-3">
      {/* Prévia 16:9 */}
      <div
        className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10"
        style={{
          background: `radial-gradient(120% 120% at 15% 10%, ${c1}66, transparent 55%), radial-gradient(120% 120% at 90% 95%, ${c2}88, #05050c 60%)`,
        }}
      >
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute right-3 top-3 text-3xl drop-shadow-lg">
          {EMOTION_EMOJI[thumb.emotion]}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div
            className="inline-block text-[11px] font-bold uppercase tracking-wider"
            style={{ color: c1 }}
          >
            {thumb.secondaryText}
          </div>
          <div
            className="font-display text-2xl font-extrabold leading-none text-white sm:text-3xl"
            style={{ textShadow: `0 2px 14px ${c2}, 0 0 2px #000` }}
          >
            {thumb.mainText}
          </div>
        </div>
      </div>

      {/* Especificação */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Texto principal" value={thumb.mainText} />
        <Field label="Texto secundário" value={thumb.secondaryText} />
        <Field
          label="Emoção"
          value={`${EMOTION_EMOJI[thumb.emotion]} ${thumb.emotion}`}
        />
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-slate-500">Cores</div>
          <div className="mt-1 flex items-center gap-2">
            <Swatch hex={c1} />
            <Swatch hex={c2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <div className="text-slate-500">{label}</div>
      <div className="mt-0.5 font-medium capitalize text-slate-200">{value}</div>
    </div>
  );
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-4 w-4 rounded ring-1 ring-white/20"
        style={{ background: hex }}
      />
      <span className="uppercase text-slate-300">{hex}</span>
    </span>
  );
}
