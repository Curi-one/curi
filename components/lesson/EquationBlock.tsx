import type { LessonVisualBlock } from "@/lib/api/schemas";
import { getLessonVisual } from "@/lib/lessons/visuals";

type Props = {
  topic?: string;
  visual?: LessonVisualBlock;
};

export function EquationBlock({ topic = "", visual }: Props) {
  const curated = topic ? getLessonVisual(topic) : null;
  const equation = visual?.equation ?? curated?.equation;
  if (!equation) return null;

  const note = visual?.formulaNote ?? curated?.formulaNote;

  return (
    <div className="my-10 border-y border-border py-6">
      <div className="text-xs uppercase tracking-[0.24em] text-ink-muted">
        Working equation
      </div>
      <div className="mt-4 font-display text-3xl font-light leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
        {equation}
      </div>
      {note && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
          {note}
        </p>
      )}
    </div>
  );
}
