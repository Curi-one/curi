import type { DepthSlug } from "@/lib/api/schemas";
import { ArrowLeft } from "lucide-react";
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-none px-1 text-sm text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink focus-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}
      </div>
      <StepProgress step={step} totalSteps={totalSteps} label="Depth" />
      <h1
        className="font-display text-display-xs font-light leading-snug tracking-tight text-ink"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        How far should this path go?
      </h1>
      <p className="mt-2 text-ui-md font-light text-ink-muted">
        We&apos;ll pick the exact lesson count within the band.
      </p>
      <ul className="mt-8 space-y-3">
        {DEPTH_OPTIONS.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              onClick={() => onSelect(opt.slug)}
              className={`option-card focus-ring text-ui-lg ${
                selected === opt.slug ? "option-card-selected" : ""
              }`}
            >
              <span className="block font-medium text-ui-lg">{opt.label}</span>
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
