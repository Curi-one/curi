"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/api/schemas";

type Props = {
  questions: QuizQuestion[];
  onComplete: (answers: { questionId: string; selectedIndex: number }[]) => void;
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
    <div className="flex min-h-[70vh] flex-col pb-28">
      <p className="text-sm text-ink-muted">
        Question {index + 1} of {questions.length}
      </p>
      <h1 className="mt-4 font-display text-2xl text-ink">{q.prompt}</h1>
      <ul className="mt-8 space-y-3">
        {q.options.map((opt, optIndex) => {
          let style = "border-border bg-paper-secondary hover:border-ink/30";
          if (revealed && optIndex === q.correctIndex) {
            style = "border-ink bg-ink text-paper";
          } else if (revealed && optIndex === selectedIndex && !correct) {
            style = "border-border bg-paper-tertiary text-ink-muted";
          } else if (selectedIndex === optIndex) {
            style = "border-ink bg-ink text-paper";
          }
          return (
            <li key={opt}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(optIndex)}
                className={`w-full rounded-xl border px-4 py-4 text-left min-h-[52px] ${style}`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && (
        <div className="mt-8 rounded-xl border border-border bg-paper-secondary p-4">
          <p className="font-medium text-ink">{correct ? "Right" : "Not quite"}</p>
          <p className="mt-2 text-sm text-ink-muted">{why}</p>
        </div>
      )}
      {revealed && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-paper/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <button type="button" onClick={next} className="btn-primary w-full">
              {isLast ? "How did that land?" : "Next question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
