"use client";

import type { LessonFeel } from "@/lib/api/schemas";
import { LESSON_FEEL_OPTIONS } from "@/lib/ui/constants";
import { Button } from "@/components/Button";

type Props = {
  onSelect: (feel: LessonFeel) => void;
  selected?: LessonFeel;
};

export function LessonFeel({ onSelect, selected }: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col pb-28 animate-fade-in">
      <p className="type-kicker">Required</p>
      <h1
        className="mt-2 font-display text-display-xs font-light leading-snug text-ink"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        How did that land?
      </h1>
      <p className="mt-2 text-ui-md font-light text-ink-muted">
        Tomorrow&apos;s lesson adjusts to this — not a grade on you.
      </p>
      <ul className="mt-8 space-y-3">
        {LESSON_FEEL_OPTIONS.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              onClick={() => onSelect(opt.slug)}
              className={`option-card focus-ring text-ui-md ${
                selected === opt.slug ? "option-card-selected" : ""
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
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:left-[84px]">
      <div className="mx-auto max-w-lg md:max-w-xl lg:max-w-2xl">
        <Button onClick={onContinue} disabled={disabled} className="w-full">
          Complete lesson
        </Button>
      </div>
    </div>
  );
}
