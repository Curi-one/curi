import type { LessonVisualBlock } from "@/lib/api/schemas";

type Props = {
  /** Visual returned by the lesson API / Perplexity. */
  visual: LessonVisualBlock;
};

export function EquationBlock({ visual }: Props) {
  const { equation, formulaNote } = visual;
  if (!equation) return null;

  return (
    <div className="my-10 border-y border-border py-6">
      <div className="text-xs uppercase tracking-[0.24em] text-ink-muted">
        Working equation
      </div>
      <div className="mt-4 font-display text-3xl font-light leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
        {equation}
      </div>
      {formulaNote && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
          {formulaNote}
        </p>
      )}
    </div>
  );
}
