type Props = {
  step: number;
  totalSteps: number;
  label?: string;
};

/** Thin progress bar for multi-step clarify / quiz flows. */
export function StepProgress({ step, totalSteps, label }: Props) {
  const pct =
    totalSteps > 0 ? Math.min(100, Math.round((step / totalSteps) * 100)) : 0;
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-meta">
          {label ?? `${step} of ${totalSteps}`}
        </span>
        <span className="text-xs text-ink-muted">
          {step}/{totalSteps}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-paper-tertiary">
        <div
          className="h-full rounded-full bg-accent transition-all duration-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
