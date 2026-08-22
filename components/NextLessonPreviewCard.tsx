"use client";

import { Lock } from "lucide-react";
import {
  buildTrackMark,
  endowedPct,
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  courseTopic?: string;
  nextLessonTitle?: string;
  lessonNumber?: number;
  totalLessons?: number;
};

/** Branded tomorrow-lesson teaser for the completion sheet. */
export function NextLessonPreviewCard({
  courseTopic,
  nextLessonTitle,
  lessonNumber,
  totalLessons,
}: Props) {
  const title = nextLessonTitle ?? "Your next lesson";
  const art = topicArt(nextLessonTitle ?? courseTopic ?? title);
  const mark = buildTrackMark(courseTopic ?? title);
  const pct =
    lessonNumber != null && totalLessons != null
      ? endowedPct(lessonNumber, totalLessons)
      : 0;

  const meta =
    lessonNumber != null && totalLessons != null
      ? `Lesson ${lessonNumber + 1} of ${totalLessons} · unlocks tomorrow`
      : "Unlocks tomorrow";

  return (
    <div className="complete-next-lesson relative overflow-hidden border border-border bg-paper-secondary">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={topicPatternStyle("columns")}
        aria-hidden
      />
      <div className="relative flex min-h-[8.5rem]">
        <div
          className="relative flex w-[7.25rem] shrink-0 flex-col justify-between overflow-hidden p-3 text-mark-fg sm:w-32"
          style={{ background: art.field }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={topicPatternStyle(art.pattern)}
            aria-hidden
          />
          <span className="relative z-[1] font-meta text-[8px] uppercase tracking-[0.22em] text-mark-meta">
            {mark.domainName}
          </span>
          <span
            className="relative z-[1] select-none self-end font-display text-4xl font-light italic leading-none"
            style={{ color: art.glyphColor }}
            aria-hidden
          >
            {art.glyph}
          </span>
          <div
            className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-mark-fg/15"
            aria-hidden
          >
            <div
              className="h-full bg-mark-fg/75 transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <p className="type-kicker-mark">Up next · Tomorrow</p>
          <h3 className="mt-3 font-display text-display-2xs font-light italic leading-tight tracking-tight text-ink">
            {title}
          </h3>
          <p className="mt-2 font-meta text-[10px] tracking-[0.12em] text-ink-muted">
            {courseTopic ? `${courseTopic} · ${mark.call}` : mark.call}
          </p>
          <p className="mt-3 flex items-center gap-2 font-meta text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            <Lock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
            {meta}
          </p>
        </div>
      </div>

      <div className="relative h-[2px] bg-paper-tertiary" aria-hidden>
        <div
          className="h-full bg-ink transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
