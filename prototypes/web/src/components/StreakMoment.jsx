import React from "react";
import { Flame } from "lucide-react";

export function StreakMoment({ streak }) {
  return (
    <div
      className="streak-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-card px-5 py-4 shadow-float"
      style={{
        animation: "streak-pop 0.45s cubic-bezier(0.16,1,0.3,1) both"
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Flame size={16} aria-hidden />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Lesson complete — {streak}-day streak.</div>
          <div className="mt-0.5 text-xs text-muted-foreground">The point is not speed, but return.</div>
        </div>
      </div>
    </div>
  );
}

export default StreakMoment;
