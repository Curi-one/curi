import type { DepthOption, DepthSlug } from "@/lib/api/schemas";
import { ArrowLeft } from "lucide-react";
import { StepProgress } from "@/components/StepProgress";
import { DETAILS_MAX_CHARS } from "@/lib/clarify/details";
import { DEPTH_OPTIONS } from "@/lib/ui/constants";

type Props = {
  selected?: DepthSlug;
  onSelect: (depth: DepthSlug) => void;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  /** Topic-dynamic labels; falls back to default DEPTH_OPTIONS. */
  options?: DepthOption[];
  details?: string;
  onDetailsChange?: (details: string) => void;
  detailsMax?: number;
};

export function DepthPicker({
  selected,
  onSelect,
  step,
  totalSteps,
  onBack,
  options,
  details = "",
  onDetailsChange,
  detailsMax = DETAILS_MAX_CHARS,
}: Props) {
  const depthOptions = options?.length === 3 ? options : DEPTH_OPTIONS;
  const detailsLen = details.length;

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
      <h1 className="font-display text-display-xs font-light leading-snug tracking-tight text-ink">
        How far should this path go?
      </h1>
      <p className="mt-2 text-ui-md font-light text-ink-muted">
        We&apos;ll pick the exact lesson count within the band.
      </p>

      {onDetailsChange ? (
        <div className="mt-6">
          <label
            htmlFor="clarify-details"
            className="block text-sm font-medium text-ink"
          >
            Anything else we should know?
          </label>
          <p className="mt-1 text-sm font-light text-ink-muted">
            Optional — goals, constraints, or prior experience.
          </p>
          <textarea
            id="clarify-details"
            value={details}
            maxLength={detailsMax}
            rows={3}
            placeholder="e.g. Travel next month; I know some basics already…"
            onChange={(e) => onDetailsChange(e.target.value.slice(0, detailsMax))}
            className="mt-3 w-full resize-y rounded-none border border-border bg-paper px-3 py-2.5 text-ui-md font-light text-ink placeholder:text-ink-faint focus-ring"
          />
          <p className="mt-1.5 text-right font-meta text-mono-sm tabular-nums text-ink-muted">
            {detailsLen} / {detailsMax}
          </p>
        </div>
      ) : null}

      <ul className="mt-8 space-y-3">
        {depthOptions.map((opt) => (
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
