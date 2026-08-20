"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LessonResponse } from "@/lib/api/schemas";

type Props = {
  lesson: LessonResponse;
  lessonIndex: number;
  onStartQuiz: () => void;
};

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

/** First 2–3 body paragraphs (or leading sentences) as takeaway bullets. */
function extractTakeaways(body: string[]): string[] {
  const out: string[] = [];
  for (const para of body) {
    const clean = stripInlineMarkdown(para);
    if (!clean) continue;
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length === 0) continue;
    // Prefer a short paragraph; otherwise take the first sentence.
    if (clean.length <= 180 || sentences.length === 1) {
      out.push(clean);
    } else {
      out.push(sentences[0]);
    }
    if (out.length >= 3) break;
  }
  return out.slice(0, 3);
}

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

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function LessonReader({ lesson, lessonIndex, onStartQuiz }: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const [readProgress, setReadProgress] = useState(0);
  const takeaways = extractTakeaways(lesson.body);
  const [takeawaysOpen, setTakeawaysOpen] = useState(true);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const container = findScrollParent(article);

    function update() {
      const el = articleRef.current;
      if (!el) return;
      if (container) {
        const cRect = container.getBoundingClientRect();
        const aRect = el.getBoundingClientRect();
        const scrolledPast =
          cRect.top - aRect.top + container.clientHeight;
        setReadProgress(
          Math.min(1, Math.max(0, scrolledPast / Math.max(aRect.height, 1))),
        );
        return;
      }
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrolledPast = viewport - rect.top;
      setReadProgress(
        Math.min(1, Math.max(0, scrolledPast / Math.max(rect.height, 1))),
      );
    }

    const target: HTMLElement | Window = container ?? window;
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [lesson.title, lesson.body.length]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-0.5 md:left-[84px]"
      >
        <div
          className="h-full bg-ink/30 transition-[width] duration-200 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      <article ref={articleRef} className="pb-32 animate-fade-in">
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

        {takeaways.length > 0 && (
          <div className="mt-10 border-t border-border">
            <button
              type="button"
              onClick={() => setTakeawaysOpen((o) => !o)}
              className="flex w-full items-center justify-between py-3.5 text-left"
              aria-expanded={takeawaysOpen}
            >
              <span className="type-kicker">Key takeaways</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                  takeawaysOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {takeawaysOpen && (
              <ul className="space-y-4 pb-5">
                {takeaways.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-sm leading-[1.7] text-ink/80"
                  >
                    <span className="mt-[-2px] shrink-0 font-display text-xl leading-none text-accent">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {lesson.sources.length > 0 && (
          <section className="mt-8 border-t border-border pt-6">
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
            <button
              type="button"
              onClick={onStartQuiz}
              className="btn-primary w-full"
            >
              Take the quiz
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
