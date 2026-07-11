import { useMemo, type ReactNode } from "react";
import type { VideoIdea } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  buildCalendar,
  DEFAULT_CALENDAR,
  formatSlotDate,
  WEEKDAY_OPTIONS,
  type CalendarConfig,
  type Slot,
} from "../lib/calendar";
import { CalendarIcon, FilmIcon } from "./Icons";
import { TYPE_LABEL, TYPE_STYLE } from "./categoryMeta";

interface Props {
  saved: VideoIdea[];
}

/** Calendário editorial: 1 vídeo longo + 2 shorts por semana. */
export function EditorialCalendar({ saved }: Props) {
  const [config, setConfig] = useLocalStorage<CalendarConfig>(
    "refugio-nerd:calendar",
    DEFAULT_CALENDAR,
  );

  const weeks = useMemo(() => buildCalendar(saved, config), [saved, config]);

  function patch(p: Partial<CalendarConfig>) {
    setConfig((c) => ({ ...c, ...p }));
  }

  return (
    <section id="calendario" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl glass">
          <CalendarIcon className="h-5 w-5 text-electric-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-100">
            Calendário Editorial
          </h2>
          <p className="text-sm text-slate-400">
            1 vídeo longo + 2 shorts por semana, preenchido pelas ideias salvas.
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="card-glow mb-4 grid gap-3 p-4 sm:grid-cols-4">
        <ConfigField label="Início">
          <input
            type="date"
            value={config.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
            className="w-full rounded-lg glass px-2 py-1.5 text-sm text-slate-100 outline-none"
          />
        </ConfigField>
        <ConfigField label="Semanas">
          <input
            type="number"
            min={1}
            max={12}
            value={config.weeks}
            onChange={(e) =>
              patch({ weeks: Math.max(1, Math.min(12, +e.target.value || 1)) })
            }
            className="w-full rounded-lg glass px-2 py-1.5 text-sm text-slate-100 outline-none"
          />
        </ConfigField>
        <ConfigField label="Dia do longo">
          <WeekdaySelect
            value={config.longDay}
            onChange={(v) => patch({ longDay: v })}
          />
        </ConfigField>
        <ConfigField label="Dias dos shorts">
          <div className="flex gap-1.5">
            <WeekdaySelect
              value={config.shortDays[0]}
              onChange={(v) => patch({ shortDays: [v, config.shortDays[1]] })}
            />
            <WeekdaySelect
              value={config.shortDays[1]}
              onChange={(v) => patch({ shortDays: [config.shortDays[0], v] })}
            />
          </div>
        </ConfigField>
      </div>

      {saved.length === 0 ? (
        <div className="card-glow grid place-items-center p-8 text-center text-slate-400">
          Salve ideias em “Próximos Vídeos” para preencher o calendário.
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map((wk) => (
            <div key={wk.index} className="card-glow p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-electric-400">
                Semana {wk.index + 1}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <SlotCard slot={wk.long} highlight />
                <SlotCard slot={wk.shorts[0]} />
                <SlotCard slot={wk.shorts[1]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SlotCard({ slot, highlight }: { slot: Slot; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-grape-500/30 bg-grape-500/5"
          : "border-white/5 bg-white/5"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`chip ${
            highlight
              ? "bg-grape-500/20 text-grape-300"
              : "bg-electric-500/15 text-electric-400"
          }`}
        >
          <FilmIcon className="h-3 w-3" />
          {slot.kind === "longo" ? "Vídeo longo" : "Short"}
        </span>
        <span className="text-[11px] text-slate-400">{formatSlotDate(slot.date)}</span>
      </div>
      {slot.idea ? (
        <>
          <p className="line-clamp-2 text-sm font-medium text-slate-100">
            {slot.idea.title}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`chip ${TYPE_STYLE[slot.idea.type]}`}>
              {TYPE_LABEL[slot.idea.type]}
            </span>
            <span className="text-[11px] text-slate-500">
              Score {slot.idea.score}
            </span>
          </div>
        </>
      ) : (
        <p className="py-2 text-sm text-slate-600">Vaga livre — salve mais ideias.</p>
      )}
    </div>
  );
}

function ConfigField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function WeekdaySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="w-full rounded-lg glass px-2 py-1.5 text-sm text-slate-100 outline-none"
    >
      {WEEKDAY_OPTIONS.map((o) => (
        <option key={o.value} value={o.value} className="bg-void-800">
          {o.label}
        </option>
      ))}
    </select>
  );
}
