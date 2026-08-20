import type { ClarifyQuestion } from "@/lib/api/schemas";
import { StepProgress } from "@/components/StepProgress";

type Props = {
  question: ClarifyQuestion;
  step: number;
  totalSteps: number;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
  onBack?: () => void;
  topic?: string;
};

export function ClarifyStep({
  question,
  step,
  totalSteps,
  selectedAnswer,
  onSelect,
  onBack,
  topic,
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
      <StepProgress step={step} totalSteps={totalSteps} label="Clarify" />
      {topic && (
        <p className="mb-3 font-meta normal-case tracking-normal text-ink-muted">
          {topic}
        </p>
      )}
      <h1
        className="font-display text-[1.75rem] font-light leading-snug tracking-tight text-ink"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        {question.prompt}
      </h1>
      <ul className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              onClick={() => onSelect(opt)}
              className={`w-full rounded-xl border px-4 py-4 text-left text-[15px] leading-snug transition-colors min-h-[52px] ${
                selectedAnswer === opt
                  ? "border-ink bg-ink text-paper shadow-[inset_0_-2px_0_var(--color-accent)]"
                  : "border-border bg-paper-secondary hover:border-accent/30"
              }`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
