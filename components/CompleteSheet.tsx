"use client";

import Link from "next/link";
import { useState } from "react";
import { Flame, Lock } from "lucide-react";
import type { ShareableFactPayload } from "@/lib/api/schemas";
import {
  buildShareText,
  copyAndOpenLinkedIn,
  linkedinShareUrl,
  twitterIntentUrl,
} from "@/lib/share/lesson-share";

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
  /** Prefer lesson API / Perplexity shareable fact when present. */
  shareableFact?: ShareableFactPayload;
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
  shareableFact,
}: CompleteSheetProps) {
  const [copied, setCopied] = useState(false);
  const insight = shareableFact ?? null;

  if (!open) return null;

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

  const shareText = insight
    ? buildShareText({ fact: insight.fact, topic: courseTopic ?? "founder" })
    : null;
  const tweetUrl = shareText ? twitterIntentUrl(shareText) : null;
  const liUrl = linkedinShareUrl();

  const showTomorrow =
    Boolean(nextLessonTitle) || (allPathsDoneToday && !pathMastered);

  function copyText() {
    if (!shareText) return;
    void navigator.clipboard?.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function shareToLinkedIn() {
    if (!shareText) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    void copyAndOpenLinkedIn(shareText);
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
        className="relative flex max-h-[90dvh] w-full max-w-[480px] flex-col animate-slide-up bg-paper sm:mx-4 sm:rounded-none"
        style={{ borderTop: "2px solid var(--color-accent)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-sheet-title"
      >
        <div className="shrink-0 px-7 pb-6 pt-7">
          {(courseTopic || lessonNumber != null) && (
            <div className="mb-2 font-meta text-ink-muted">
              {courseTopic}
              {courseTopic && lessonNumber != null ? " ·" : null}
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
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
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

        <div className="mx-7 h-px shrink-0 bg-border" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {insight && (
            <div className="px-7 py-5">
              <div className="mb-4 font-meta text-ink-muted">
                Today&apos;s insight
              </div>
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
                  href={tweetUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-none border border-border bg-ink px-4 py-2.5 text-xs font-medium text-paper transition hover:opacity-90"
                >
                  Share on X
                </a>
                <a
                  href={liUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-none border border-border px-4 py-2.5 text-xs font-medium text-ink-muted transition hover:border-ink/30 hover:text-ink"
                  onClick={(e) => {
                    e.preventDefault();
                    shareToLinkedIn();
                  }}
                >
                  Share on LinkedIn
                </a>
                <button
                  type="button"
                  onClick={copyText}
                  className="inline-flex min-h-11 items-center rounded-none border border-border px-4 py-2.5 text-xs font-medium text-ink-muted transition hover:border-ink/30 hover:text-ink"
                >
                  {copied ? "Copied" : "Copy text"}
                </button>
              </div>
            </div>
          )}

          {showTomorrow && (
            <>
              <div className="mx-7 h-px bg-border" />
              <div className="px-7 py-5">
                <div className="mb-3 font-meta text-ink-muted">
                  Up next · Tomorrow
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-ui text-base font-light leading-snug text-ink-faint">
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
        </div>

        <div className="shrink-0 space-y-3 border-t border-border px-7 py-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
            <Link
              href="/today"
              className="btn-primary block w-full text-center"
            >
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
