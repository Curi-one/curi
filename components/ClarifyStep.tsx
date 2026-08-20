import type { ClarifyQuestion } from "@/lib/api/schemas";

type Props = {
  question: ClarifyQuestion;
  step: number;
  totalSteps: number;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
  onBack?: () => void;
};

export function ClarifyStep({
  question,
  step,
  totalSteps,
  selectedAnswer,
  onSelect,
  onBack,
}: Props) {
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
      <h1 className="font-display text-2xl leading-snug text-ink">{question.prompt}</h1>
      <ul className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              onClick={() => onSelect(opt)}
              className={`w-full rounded-xl border px-4 py-4 text-left text-base transition-colors min-h-[52px] ${
                selectedAnswer === opt
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper-secondary hover:border-ink/30"
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
