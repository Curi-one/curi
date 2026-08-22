"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import type { PathSummary } from "@/lib/api/schemas";
import { depthLabel } from "@/lib/ui/constants";
import {
  buildTrackMark,
  endowedPct,
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  path: PathSummary;
  mastered?: boolean;
};

/** Compact track-mark path row for the progress page. */
export function ProgressPathRow({ path, mastered = false }: Props) {
  const art = topicArt(path.topic);
  const mark = buildTrackMark(path.topic);
  const pct = mastered ? 100 : endowedPct(path.progress, path.totalLessons);
  const progressDone = mastered ? path.totalLessons : path.progress;

  return (
    <Link
      href={`/library/${path.id}`}
      className="group focus-ring interactive-card relative flex overflow-hidden border border-border bg-paper-secondary transition-[border-color,filter] duration-[300ms] ease-out hover:border-ink/25 hover:brightness-[1.02]"
    >
      <div
        className="relative flex w-[4.5rem] shrink-0 flex-col justify-between overflow-hidden p-2.5 text-paper sm:w-20"
        style={{ background: art.field }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={topicPatternStyle(art.pattern)}
          aria-hidden
        />
        <span className="relative z-[1] font-meta text-[8px] uppercase tracking-[0.2em] text-accent">
          {mark.domainName}
        </span>
        <span
          className="relative z-[1] select-none font-display text-2xl font-light italic leading-none"
          style={{ color: art.glyphColor }}
          aria-hidden
        >
          {art.glyph}
        </span>
        <div
          className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-white/15"
          aria-hidden
        >
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-lg italic leading-tight tracking-tight text-ink transition-colors group-hover:text-ink">
            {path.topic}
          </p>
          {mastered && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-ink/[0.06] ring-1 ring-border">
              <Trophy className="h-3 w-3 text-ink-muted" strokeWidth={2.2} aria-hidden />
            </span>
          )}
        </div>
        <p className="mt-1 font-meta text-[10px] tracking-[0.12em] text-ink-muted">
          {mark.call}
        </p>
        <p className="mt-2 font-meta text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {mastered
            ? `${path.totalLessons} lessons · Mastered`
            : `${depthLabel(path.depth)} · ${progressDone} of ${path.totalLessons}`}
        </p>
        <div className="mt-2.5 h-[2px] overflow-hidden bg-paper-tertiary">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
