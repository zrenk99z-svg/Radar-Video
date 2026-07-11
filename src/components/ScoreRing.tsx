import { scoreColor, scoreLabel } from "../lib/scoring";

interface Props {
  score: number;
  size?: number;
}

/** Anel circular animado exibindo a pontuação final. */
export function ScoreRing({ score, size = 64 }: Props) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = scoreColor(score);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`Pontuação: ${score} (${scoreLabel(score)})`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-white/10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
          className={color}
          style={{ transition: "stroke-dashoffset 0.7s ease", stroke: "currentColor" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className={`font-display font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
}
