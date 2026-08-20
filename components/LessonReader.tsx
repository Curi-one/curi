import type { LessonResponse } from "@/lib/api/schemas";

type Props = {
  lesson: LessonResponse;
  lessonIndex: number;
  onStartQuiz: () => void;
};

function renderParagraph(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-ink/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function LessonReader({ lesson, lessonIndex, onStartQuiz }: Props) {
  return (
    <article className="pb-32 animate-fade-in">
      <p className="font-meta">Lesson {lessonIndex + 1}</p>
      <h1
        className="mt-3 font-display text-[2rem] font-light leading-[1.15] tracking-tight text-ink sm:text-[2.25rem]"
        style={{ fontVariationSettings: "'SOFT' 55, 'WONK' 1" }}
      >
        {lesson.title}
      </h1>
      <div className="mt-8 space-y-5 text-[17px] font-light leading-[1.7] text-ink/90">
        {lesson.body.map((para, i) => (
          <p key={i}>{renderParagraph(para)}</p>
        ))}
      </div>
      {lesson.sources.length > 0 && (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="type-kicker">Sources</h2>
          <ul className="mt-4 space-y-3">
            {lesson.sources.map((s, i) => (
              <li key={s.url} className="flex gap-3 text-sm">
                <span className="font-meta shrink-0 text-accent">{i + 1}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-snug text-ink underline decoration-border underline-offset-4 hover:decoration-accent"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:left-[84px]">
        <div className="mx-auto max-w-lg md:max-w-xl lg:max-w-2xl">
          <button type="button" onClick={onStartQuiz} className="btn-primary w-full">
            Take the quiz
          </button>
        </div>
      </div>
    </article>
  );
}
