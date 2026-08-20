import type { DepthSlug } from "@/lib/api/schemas";
import { DEPTH_OPTIONS } from "@/lib/ui/constants";

type Props = {
  selected?: DepthSlug;
  onSelect: (depth: DepthSlug) => void;
  step: number;
  totalSteps: number;
  onBack?: () => void;
};

export function DepthPicker({ selected, onSelect, step, totalSteps, onBack }: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-8 flex items-center justify-between text-sm text-ink-muted">
        <span>
          {step} of {totalSteps}
        </span>
        {onBack ? (
          <button type="button" onClick={onBack} className="min-h-[44px] px-2">
            Back
          </button>
        ) : (
          <span />
        )}
      </div>
      <h1 className="font-display text-2xl text-ink">How far should this path go?</h1>
      <p className="mt-2 text-ink-muted">Pick the depth that matches your time.</p>
      <ul className="mt-8 space-y-3">
        {DEPTH_OPTIONS.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              onClick={() => onSelect(opt.slug)}
              className={`w-full rounded-xl border px-4 py-4 text-left min-h-[52px] ${
                selected === opt.slug
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper-secondary hover:border-ink/30"
              }`}
            >
              <span className="block font-medium">{opt.label}</span>
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
