import { useState } from "react";
import type { VideoIdea } from "../types";
import { rankIdeas } from "../lib/scoring";
import { ThumbnailPreview } from "./ThumbnailPreview";
import { BookmarkIcon, TrashIcon } from "./Icons";
import { CATEGORY_ICON, TYPE_LABEL, TYPE_STYLE } from "./categoryMeta";

interface Props {
  saved: VideoIdea[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Lista "Próximos Vídeos" com gerador de thumbnail por item. */
export function SavedList({ saved, onRemove, onClear }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ordered = rankIdeas(saved);

  return (
    <section id="proximos" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl glass">
            <BookmarkIcon className="h-5 w-5 text-grape-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              Próximos Vídeos
            </h2>
            <p className="text-sm text-slate-400">
              {saved.length
                ? `${saved.length} ideia${saved.length > 1 ? "s" : ""} salva${
                    saved.length > 1 ? "s" : ""
                  } — abra para gerar a thumbnail.`
                : "Salve ideias para montar sua fila de produção."}
            </p>
          </div>
        </div>
        {saved.length > 0 && (
          <button
            onClick={onClear}
            className="btn-ghost text-sm text-slate-400 hover:text-rose-300"
          >
            <TrashIcon className="h-4 w-4" /> Limpar
          </button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="card-glow grid place-items-center p-10 text-center">
          <BookmarkIcon className="mb-3 h-8 w-8 text-slate-600" />
          <p className="text-slate-400">
            Nenhuma ideia salva ainda. Gere temas e toque em{" "}
            <span className="text-slate-200">Salvar</span>.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ordered.map((idea) => {
            const Icon = CATEGORY_ICON[idea.category];
            const open = openId === idea.id;
            return (
              <li key={idea.id} className="card-glow overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-electric-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-100">
                      {idea.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`chip ${TYPE_STYLE[idea.type]}`}>
                        {TYPE_LABEL[idea.type]}
                      </span>
                      <span className="text-xs text-slate-500">
                        Score {idea.score}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenId(open ? null : idea.id)}
                    className="btn-ghost px-3 py-2 text-sm"
                  >
                    {open ? "Fechar" : "Thumbnail"}
                  </button>
                  <button
                    onClick={() => onRemove(idea.id)}
                    aria-label="Remover"
                    className="grid h-9 w-9 place-items-center rounded-xl glass text-slate-400 transition hover:text-rose-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {open && (
                  <div className="border-t border-white/5 bg-black/20 p-4">
                    <ThumbnailPreview idea={idea} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
