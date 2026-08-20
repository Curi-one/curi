"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  allPathsDoneToday: boolean;
  onClose: () => void;
};

export function CompleteSheet({ open, allPathsDoneToday, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/30">
      <div
        className="w-full rounded-t-2xl border border-border bg-paper p-6 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="font-display text-2xl text-ink">
          {allPathsDoneToday ? "All caught up" : "Nice work"}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {allPathsDoneToday
            ? "Next lessons unlock tomorrow."
            : "You still have paths to read today."}
        </p>
        <div className="mt-6">
          {allPathsDoneToday ? (
            <Link href="/today" className="btn-primary block w-full text-center">
              Done
            </Link>
          ) : (
            <Link href="/today" onClick={onClose} className="btn-primary block w-full text-center">
              Back to Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
