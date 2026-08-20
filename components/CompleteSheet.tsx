"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  allPathsDoneToday: boolean;
  pathMastered?: boolean;
  onClose: () => void;
};

export function CompleteSheet({
  open,
  allPathsDoneToday,
  pathMastered,
  onClose,
}: Props) {
  if (!open) return null;

  const title = pathMastered
    ? "Path mastered"
    : allPathsDoneToday
      ? "All caught up"
      : "Nice work";

  const body = pathMastered
    ? "This path is complete. It lives in Library → Mastered. No certificate — just the work done."
    : allPathsDoneToday
      ? "Next lessons unlock tomorrow."
      : "You still have paths to read today.";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        className="relative w-full rounded-t-2xl border border-border bg-paper p-6 pb-8 animate-slide-up shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-sheet-title"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
        <h2
          id="complete-sheet-title"
          className="font-display text-2xl font-light text-ink"
          style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{body}</p>
        <div className="mt-6 space-y-3">
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
