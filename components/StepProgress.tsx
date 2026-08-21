type Props = {
  step: number;
  totalSteps: number;
  label?: string;
};

/** Pip strip for multi-step clarify / depth / quiz flows (prototype onboarding). */
export function StepProgress({ step, totalSteps, label }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5"
          role="list"
          aria-label={label ? `${label} progress` : "Progress"}
        >
          {Array.from({ length: Math.max(totalSteps, 0) }, (_, i) => {
            const n = i + 1;
            const current = n === step;
            const filled = n < step;
            return (
              <span
                key={i}
                role="listitem"
                aria-current={current ? "step" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current
                    ? "w-8 bg-ink"
                    : filled
                      ? "w-3 bg-ink/30"
                      : "w-3 bg-border"
                }`}
              />
            );
          })}
        </div>
        <span className="font-meta shrink-0 tabular-nums">
          {label
            ? `${label} · ${step}/${totalSteps}`
            : `${step}/${totalSteps}`}
        </span>
      </div>
    </div>
  );
}
