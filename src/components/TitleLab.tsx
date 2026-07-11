import { useEffect, useState } from "react";
import type { Settings } from "../lib/settings";
import { generateTitles, type TitleSuggestion } from "../lib/titleAI";
import { generateTitlesWithClaude } from "../lib/claudeTitles";
import { scoreColor } from "../lib/scoring";
import { CheckIcon, WandIcon } from "./Icons";

interface Props {
  subject: string;
  settings: Settings;
}

/** Gerador de títulos com alto CTR (heurística + modo IA/Claude opcional). */
export function TitleLab({ subject, settings }: Props) {
  const [titles, setTitles] = useState<TitleSuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setTitles(generateTitles(subject));
    setError(null);
  }, [subject]);

  async function runAI() {
    if (!settings.anthropicApiKey) return;
    setLoadingAI(true);
    setError(null);
    try {
      const ai = await generateTitlesWithClaude(subject, settings.anthropicApiKey);
      setTitles(ai);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingAI(false);
    }
  }

  function copy(title: string) {
    navigator.clipboard?.writeText(title).then(() => {
      setCopied(title);
      window.setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <section id="titulos" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric-500/25 to-grape-500/25 ring-1 ring-electric-500/30">
            <WandIcon className="h-5 w-5 text-electric-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              Títulos com alto CTR
            </h2>
            <p className="text-sm text-slate-400">
              Gerados com palavras de impacto para “{subject}”.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTitles(generateTitles(subject))}
            className="btn-ghost text-sm"
          >
            Regenerar
          </button>
          <button
            onClick={runAI}
            disabled={!settings.anthropicApiKey || loadingAI}
            title={
              settings.anthropicApiKey
                ? "Gerar com Claude"
                : "Adicione a chave da Anthropic em Configurações"
            }
            className="btn-primary text-sm"
          >
            <WandIcon className="h-4 w-4" />
            {loadingAI ? "IA gerando…" : "Gerar com IA (Claude)"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300 ring-1 ring-rose-500/20">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {titles.map((t, i) => (
          <div key={`${t.title}-${i}`} className="card-glow flex items-center gap-3 p-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5">
              <span className={`font-display text-lg font-bold ${scoreColor(t.ctr)}`}>
                {t.ctr}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-100">{t.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`chip text-[10px] ${
                    t.origin === "ia"
                      ? "bg-grape-500/15 text-grape-400 ring-1 ring-grape-500/25"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {t.origin === "ia" ? "IA · Claude" : "heurística"}
                </span>
                {t.powerWords.slice(0, 3).map((w) => (
                  <span
                    key={w}
                    className="chip bg-electric-500/10 text-[10px] text-electric-400"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => copy(t.title)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl glass text-slate-400 transition hover:text-electric-400"
              aria-label="Copiar título"
            >
              {copied === t.title ? (
                <CheckIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <span className="text-xs">copiar</span>
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        CTR estimado por heurística (palavras de impacto, números, tamanho ideal
        40–70 caracteres). O modo IA usa Claude Opus 4.8.
      </p>
    </section>
  );
}
