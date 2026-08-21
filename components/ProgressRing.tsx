type Props = {
  percent: number;
  size?: number;
  stroke?: number;
};

export function ProgressRing({ percent, size = 68, stroke = 3.5 }: Props) {
  const pct = Math.min(100, Math.max(0, percent));
  const r = (size - stroke * 2) / 2 - 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const c = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          className="stroke-paper-tertiary"
          strokeWidth={stroke}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          className="stroke-ink/55"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold tabular-nums text-ink">
          {pct}%
        </span>
      </div>
    </div>
  );
}
