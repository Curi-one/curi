import katex from "katex";
import type { LessonVisualBlock } from "@/lib/api/schemas";
import { stripLatexDelimiters } from "@/lib/lessons/tex";
import "katex/dist/katex.min.css";

type Props = {
  /** Visual returned by the lesson API / Perplexity. */
  visual: LessonVisualBlock;
};

function renderEquationHtml(equation: string): string | null {
  const tex = stripLatexDelimiters(equation);
  if (!tex) return null;
  // Prefer KaTeX whenever it parses; conceptual slogans fall back to display type.
  try {
    return katex.renderToString(tex, {
      throwOnError: true,
      displayMode: true,
      output: "html",
      strict: "ignore",
    });
  } catch {
    return null;
  }
}

export function EquationBlock({ visual }: Props) {
  const { equation, formulaNote } = visual;
  if (!equation) return null;

  const html = renderEquationHtml(equation);

  return (
    <div className="my-10 border-y border-border py-6">
      <div className="text-xs uppercase tracking-widest text-ink-muted">
        Working equation
      </div>
      {html ? (
        <div
          className="mt-4 overflow-x-auto text-ink [&_.katex]:text-3xl sm:[&_.katex]:text-4xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="mt-4 font-display text-3xl font-light leading-tight tracking-tight text-ink sm:text-4xl">
          {stripLatexDelimiters(equation) || equation}
        </div>
      )}
      {formulaNote && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
          {formulaNote}
        </p>
      )}
    </div>
  );
}
