import type { ClarifyQuestion } from "@/lib/api/schemas";
import { ArrowLeft } from "lucide-react";
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-none px-1 text-sm text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink focus-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
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
      <h1 className="font-display text-display-xs font-light leading-snug tracking-tight text-ink">
        {question.prompt}
      </h1>
      <ul className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              onClick={() => onSelect(opt)}
              className={`option-card focus-ring text-ui-md leading-snug ${
                selectedAnswer === opt ? "option-card-selected" : ""
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
