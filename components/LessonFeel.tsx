"use client";

import type { LessonFeel } from "@/lib/api/schemas";
import { LESSON_FEEL_OPTIONS } from "@/lib/ui/constants";

type Props = {
  onSelect: (feel: LessonFeel) => void;
  selected?: LessonFeel;
};

export function LessonFeel({ onSelect, selected }: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col pb-28">
      <h1 className="font-display text-2xl text-ink">How did that land?</h1>
      <p className="mt-2 text-ink-muted">
        Tomorrow&apos;s lesson adjusts to this — not a grade on you.
      </p>
      <ul className="mt-8 space-y-3">
        {LESSON_FEEL_OPTIONS.map((opt) => (
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
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LessonFeelDock({
  onContinue,
  disabled,
}: {
  onContinue: () => void;
  disabled: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-paper/95 p-4 backdrop-blur">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className="btn-primary w-full disabled:opacity-40"
        >
          Complete lesson
        </button>
      </div>
    </div>
  );
}
