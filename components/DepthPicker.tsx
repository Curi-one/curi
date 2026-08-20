import type { DepthSlug } from "@/lib/api/schemas";
import { StepProgress } from "@/components/StepProgress";
import { DEPTH_OPTIONS } from "@/lib/ui/constants";

type Props = {
  selected?: DepthSlug;
  onSelect: (depth: DepthSlug) => void;
  step: number;
  totalSteps: number;
  onBack?: () => void;
};

export function DepthPicker({
  selected,
  onSelect,
  step,
  totalSteps,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 text-sm text-ink-muted hover:text-ink"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
      </div>
      <StepProgress step={step} totalSteps={totalSteps} label="Depth" />
      <h1
        className="font-display text-[1.75rem] font-light leading-snug tracking-tight text-ink"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        How far should this path go?
      </h1>
      <p className="mt-2 text-[15px] font-light text-ink-muted">
        We&apos;ll pick the exact lesson count within the band.
      </p>
      <ul className="mt-8 space-y-3">
        {DEPTH_OPTIONS.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              onClick={() => onSelect(opt.slug)}
              className={`w-full rounded-xl border px-4 py-4 text-left min-h-[52px] transition-colors ${
                selected === opt.slug
                  ? "border-ink bg-ink text-paper shadow-[inset_0_-2px_0_var(--color-accent)]"
                  : "border-border bg-paper-secondary hover:border-accent/30"
              }`}
            >
              <span className="block font-medium text-[16px]">{opt.label}</span>
              <span
                className={`mt-1 block text-sm ${
                  selected === opt.slug ? "text-paper/80" : "text-ink-muted"
                }`}
              >
                {opt.subcopy}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
