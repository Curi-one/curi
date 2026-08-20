import type { LessonResponse } from "@/lib/api/schemas";

type Props = {
  lesson: LessonResponse;
  onStartQuiz: () => void;
};

function renderParagraph(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function LessonReader({ lesson, onStartQuiz }: Props) {
  return (
    <article className="pb-28">
      <h1 className="font-display text-3xl leading-tight text-ink">{lesson.title}</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/90">
        {lesson.body.map((para, i) => (
          <p key={i}>{renderParagraph(para)}</p>
        ))}
      </div>
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Sources
        </h2>
        <ul className="mt-3 space-y-2">
          {lesson.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink underline decoration-border underline-offset-2"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-paper/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button type="button" onClick={onStartQuiz} className="btn-primary w-full">
            Take the quiz
          </button>
        </div>
      </div>
    </article>
  );
}
