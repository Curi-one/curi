"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/api/schemas";
import { StepProgress } from "@/components/StepProgress";
import { Button } from "@/components/Button";

type Props = {
  questions: QuizQuestion[];
  onComplete: (
    answers: { questionId: string; selectedIndex: number }[],
  ) => void;
};

export function QuizFlow({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedIndex: number }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function choose(optionIndex: number) {
    if (revealed) return;
    setSelectedIndex(optionIndex);
    setRevealed(true);
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== q.id),
      { questionId: q.id, selectedIndex: optionIndex },
    ]);
  }

  function next() {
    const finalAnswers = [
      ...answers.filter((a) => a.questionId !== q.id),
      { questionId: q.id, selectedIndex: selectedIndex ?? 0 },
    ];
    if (isLast) {
      onComplete(finalAnswers);
      return;
    }
    setIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  const correct = selectedIndex === q.correctIndex;
  const why =
    q.explanation && q.explanation.trim().length > 0
      ? q.explanation
      : "Check the lesson sources for more detail.";

  return (
    <div className="flex min-h-[70vh] flex-col pb-28 animate-fade-in">
      <StepProgress
        step={index + 1}
        totalSteps={questions.length}
        label="Quiz"
      />
      <h1 className="mt-2 font-display text-display-xs font-light leading-snug text-ink">
        {q.prompt}
      </h1>
      <ul className="mt-8 space-y-3">
        {q.options.map((opt, optIndex) => {
          let style = "border-border bg-paper-secondary hover:border-ink";
          if (revealed && optIndex === q.correctIndex) {
            style = "border-ink bg-ink text-paper";
          } else if (revealed && optIndex === selectedIndex && !correct) {
            style =
              "border-border bg-paper-tertiary text-ink-muted line-through";
          } else if (!revealed && selectedIndex === optIndex) {
            style = "border-ink bg-ink text-paper";
          }
          return (
            <li key={opt}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(optIndex)}
                className={`w-full rounded-none border px-4 py-4 text-left text-ui-md min-h-[52px] transition-colors ${style}`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && (
        <div
          className={`mt-8 rounded-none border p-4 ${
            correct
              ? "border-ink/20 bg-paper-secondary"
              : "border-border bg-paper-secondary"
          }`}
        >
          <p className="font-medium text-ink">
            {correct ? "Right" : "Not quite"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{why}</p>
          {q.source && (
            <p className="mt-3 text-sm text-ink-muted">
              <span className="font-meta text-ink-muted">Sources</span>
              {" ·"}
              <a
                href={q.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-border underline-offset-4 hover:decoration-ink"
              >
                {q.source.title}
              </a>
            </p>
          )}
        </div>
      )}
      {revealed && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:left-[84px]">
          <div className="mx-auto max-w-lg md:max-w-xl lg:max-w-2xl">
            <Button onClick={next} className="w-full">
              {isLast ? "How did that land?" : "Next question"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
