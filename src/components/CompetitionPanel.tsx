import { useEffect, useState, type ReactNode } from "react";
import type { Settings } from "../lib/settings";
import {
  estimateCompetition,
  fetchCompetition,
  type Competition,
} from "../lib/competition";
import { UsersIcon } from "./Icons";

interface Props {
  subject: string;
  settings: Settings;
}

const LEVEL_STYLE: Record<Competition["level"], string> = {
  Baixa: "text-emerald-300",
  Média: "text-amber-300",
  Alta: "text-orange-300",
  Saturada: "text-rose-300",
};

/** Análise de concorrência: quantos canais já cobriram o tema. */
export function CompetitionPanel({ subject, settings }: Props) {
  const [comp, setComp] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subject) return;
    const ctrl = new AbortController();
    if (settings.youtubeApiKey) {
      setLoading(true);
      fetchCompetition(subject, settings.youtubeApiKey, ctrl.signal)
        .then(setComp)
        .finally(() => setLoading(false));
    } else {
      setComp(estimateCompetition(subject));
    }
    return () => ctrl.abort();
  }, [subject, settings.youtubeApiKey]);

  if (!comp) return null;

  return (
    <div className="card-glow p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl glass">
          <UsersIcon className="h-5 w-5 text-grape-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-100">
            Concorrência {loading && <span className="text-slate-500">· …</span>}
          </h3>
          <p className="text-xs text-slate-400">
            {comp.live ? "Dados do YouTube" : "Estimativa simulada"} para “
            {comp.subject}”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Canais no tema" value={comp.channels.toLocaleString("pt-BR")} />
        <Stat
          label="Vídeos (aprox.)"
          value={comp.totalVideos.toLocaleString("pt-BR")}
        />
        <Stat
          label="Saturação"
          value={
            <span className={LEVEL_STYLE[comp.level]}>
              {comp.level} · {comp.saturation}
            </span>
          }
        />
      </div>

      {/* Barra de saturação */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
            style={{ width: `${comp.saturation}%`, transition: "width 0.6s ease" }}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300">{comp.advice}</p>
      {!comp.live && (
        <p className="mt-1 text-[11px] text-slate-500">
          Adicione uma chave da YouTube API em Configurações para dados reais.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <div className="font-display text-xl font-bold text-slate-100">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{label}</div>
    </div>
  );
}
