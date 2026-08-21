"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Flame, Lock } from "lucide-react";

type Insight = { fact: string; reflection: string };

const DEFAULT_INSIGHTS: Insight[] = [
  {
    fact: "The expensive business mistakes usually come from misunderstood incentives, not missing definitions.",
    reflection:
      "A good concept shouldn't just explain a term. It should change the decision you make the next time that term shows up in a real situation.",
  },
  {
    fact: "Most people are far more predictable than they think — biases and incentives explain more than personality does.",
    reflection:
      "The advantage of knowing this material early isn't sounding smart. It's recognising the pattern before it costs you a decision.",
  },
  {
    fact: "Knowledge that stays abstract rarely changes behaviour. Knowledge tied to a real decision usually does.",
    reflection:
      "The test of whether a lesson landed isn't whether you can define it — it's whether you'd decide differently next time.",
  },
];

function pickInsight(): Insight {
  return DEFAULT_INSIGHTS[Math.floor(Math.random() * DEFAULT_INSIGHTS.length)]!;
}

export type CompleteSheetProps = {
  open: boolean;
  allPathsDoneToday: boolean;
  pathMastered?: boolean;
  onClose: () => void;
  streak?: number;
  lessonTitle?: string;
  courseTopic?: string;
  lessonNumber?: number;
  totalLessons?: number;
  nextLessonTitle?: string;
};

export function CompleteSheet({
  open,
  allPathsDoneToday,
  pathMastered,
  onClose,
  streak,
  lessonTitle,
  courseTopic,
  lessonNumber,
  totalLessons,
  nextLessonTitle,
}: CompleteSheetProps) {
  const [copied, setCopied] = useState(false);
  const insight = useMemo(() => (open ? pickInsight() : null), [open]);

  if (!open || !insight) return null;

  const title = pathMastered
    ? "Path mastered"
    : allPathsDoneToday
      ? "All caught up"
      : lessonNumber != null
        ? `Lesson ${lessonNumber} complete.`
        : "Lesson complete.";

  const body = pathMastered
    ? "This path is complete. It lives in Library → Mastered. No certificate — just the work done."
    : allPathsDoneToday
      ? "Next lessons unlock tomorrow."
      : "You still have paths to read today.";

  const shareTopic = courseTopic ?? "founder";
  const shareText = `Today I learned:\n\n"${insight.fact}"\n\n— from my ${shareTopic} path on Curi.\n\ncuri.app`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.app")}`;

  const showTomorrow =
    Boolean(nextLessonTitle) || (allPathsDoneToday && !pathMastered);

  function copyText() {
    void navigator.clipboard?.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(13,13,13,0.82)" }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[480px] animate-slide-up bg-paper sm:mx-4 sm:rounded-2xl"
        style={{ borderTop: "4px solid var(--color-accent)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-sheet-title"
      >
        <div className="px-7 pb-6 pt-7">
          {(courseTopic || lessonNumber != null) && (
            <div className="mb-2 font-meta text-ink-muted">
              {courseTopic}
              {courseTopic && lessonNumber != null ? " · " : null}
              {lessonNumber != null && totalLessons != null
                ? `Lesson ${lessonNumber} of ${totalLessons}`
                : lessonNumber != null
                  ? `Lesson ${lessonNumber}`
                  : null}
            </div>
          )}
          <h2
            id="complete-sheet-title"
            className="font-display text-[2rem] font-light leading-tight text-ink"
            style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
          >
            {title}
          </h2>
          {lessonTitle ? (
            <p
              className="mt-2 font-display text-lg italic leading-snug text-ink/55"
              style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}
            >
              {lessonTitle}
            </p>
          ) : (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              {body}
            </p>
          )}
          {streak != null && streak > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-accent">
              <Flame className="h-4 w-4" aria-hidden />
              {streak}-day streak
            </div>
          )}
          {lessonTitle && (
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              {body}
            </p>
          )}
        </div>

        <div className="mx-7 h-px bg-border" />

        <div className="px-7 py-5">
          <div className="mb-4 font-meta text-ink-muted">Today&apos;s insight</div>
          <blockquote
            className="font-display text-xl font-light leading-snug tracking-[-0.02em] text-ink"
            style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}
          >
            &ldquo;{insight.fact}&rdquo;
          </blockquote>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {insight.reflection}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border bg-ink px-4 py-2.5 text-xs font-medium text-paper transition hover:opacity-90"
            >
              Share on X
            </a>
            <a
              href={liUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-ink-muted transition hover:border-ink/30 hover:text-ink"
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyText}
              className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-ink-muted transition hover:border-ink/30 hover:text-ink"
            >
              {copied ? "Copied!" : "Copy text"}
            </button>
          </div>
        </div>

        {showTomorrow && (
          <>
            <div className="mx-7 h-px bg-border" />
            <div className="px-7 py-5">
              <div className="mb-3 font-meta text-ink-muted">
                Up next · Tomorrow
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-display text-base leading-snug text-ink/50">
                    {nextLessonTitle ?? "Your next lesson"}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-muted/70">
                    {lessonNumber != null && totalLessons != null
                      ? `Lesson ${lessonNumber + 1} of ${totalLessons} · ~5 min · unlocks tomorrow`
                      : "~5 min · unlocks tomorrow"}
                  </p>
                </div>
                <Lock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted/40"
                  aria-hidden
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-3 border-t border-border px-7 py-5">
          {pathMastered ? (
            <>
              <Link
                href="/library?tab=mastered"
                className="btn-primary block w-full text-center"
              >
                View in Library
              </Link>
              <Link
                href="/today"
                onClick={onClose}
                className="btn-secondary block w-full text-center"
              >
                Back to Today
              </Link>
            </>
          ) : allPathsDoneToday ? (
            <Link href="/today" className="btn-primary block w-full text-center">
              Done
            </Link>
          ) : (
            <Link
              href="/today"
              onClick={onClose}
              className="btn-primary block w-full text-center"
            >
              Back to Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
