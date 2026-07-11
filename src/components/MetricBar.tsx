interface Props {
  label: string;
  value: number;
  /** true = valor alto é ruim (ex.: dificuldade). */
  invertColor?: boolean;
}

/** Barra horizontal compacta para uma métrica de 0-100. */
export function MetricBar({ label, value, invertColor }: Props) {
  const good = invertColor ? value < 50 : value >= 60;
  const mid = value >= 40 && value < 60;
  const bar = good
    ? "from-electric-500 to-grape-500"
    : mid
      ? "from-amber-400 to-amber-500"
      : "from-rose-500 to-rose-600";

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar}`}
          style={{ width: `${value}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  );
}
