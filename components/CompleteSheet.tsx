"use client";

import { Button } from "@/components/Button";
import { NextLessonPreviewCard } from "@/components/NextLessonPreviewCard";
import { StreakLabel } from "@/components/StreakIndicator";

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
  if (!open) return null;

  const title = pathMastered
    ? "Path mastered"
    : allPathsDoneToday
      ? "All caught up"
      : lessonNumber != null
        ? `Lesson ${lessonNumber} complete.`
        : "Lesson complete.";

  const body = pathMastered
    ? "This path is complete. It lives in Library → Mastered. No certificate, just the work done."
    : allPathsDoneToday
      ? "Next lessons unlock tomorrow."
      : "You still have paths to read today.";

  const showNextPreview = !pathMastered;

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
        className="relative flex max-h-[90dvh] w-full max-w-narrow flex-col animate-slide-up bg-paper sm:mx-4 sm:rounded-none"
        style={{ borderTop: "2px solid var(--color-accent)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-sheet-title"
      >
        <div className="shrink-0 px-7 pb-5 pt-7">
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
            className="font-display text-display-xs font-light leading-tight text-ink"
          >
            {title}
          </h2>
          {lessonTitle ? (
            <p className="mt-2 font-display text-lg italic leading-snug text-ink/55">
              {lessonTitle}
            </p>
          ) : (
            <p className="mt-2 text-ui-md leading-relaxed text-ink-muted">
              {body}
            </p>
          )}
          {streak != null && streak > 0 && (
            <div className="mt-3">
              <StreakLabel streak={streak} className="text-sm" />
            </div>
          )}
          {lessonTitle && (
            <p className="mt-3 text-ui-md leading-relaxed text-ink-muted">
              {body}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {showNextPreview && (
            <div className="px-7 pb-5">
              <NextLessonPreviewCard
                courseTopic={courseTopic}
                nextLessonTitle={nextLessonTitle}
                lessonNumber={lessonNumber}
                totalLessons={totalLessons}
              />
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t border-border px-7 py-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {pathMastered ? (
            <>
              <Button href="/library?tab=mastered" className="w-full">
                View in Library
              </Button>
              <Button
                href="/today"
                variant="secondary"
                onClick={onClose}
                className="w-full"
              >
                Back to Today
              </Button>
            </>
          ) : allPathsDoneToday ? (
            <Button href="/today" className="w-full">
              Done
            </Button>
          ) : (
            <Button href="/today" onClick={onClose} className="w-full">
              Back to Today
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
