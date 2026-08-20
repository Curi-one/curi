"use client";

import { Flame } from "lucide-react";

type Props = {
  streak: number;
};

export function StreakMoment({ streak }: Props) {
  if (streak <= 0) return null;

  return (
    <div className="streak-toast fixed bottom-6 left-1/2 z-[55] -translate-x-1/2 rounded-none border border-border bg-paper px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center text-ink">
          <Flame size={16} aria-hidden />
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">
            Lesson complete — {streak}-day streak.
          </div>
          <div className="mt-0.5 text-xs text-ink-muted">
            The point is not speed, but return.
          </div>
        </div>
      </div>
    </div>
  );
}
