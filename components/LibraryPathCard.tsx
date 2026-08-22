"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { Trophy } from "lucide-react";
import type { PathSummary } from "@/lib/api/schemas";
import { ApiError, patchRestoreCourse } from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";
import {
  buildTrackMark,
  endowedPct,
  MARK_GLYPH_FONT_SIZE,
  markGlyphOpacity,
  markPatternOpacity,
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  path: PathSummary;
  tab: "exploring" | "mastered" | "shelved";
};

export function LibraryPathCard({ path, tab }: Props) {
  const router = useRouter();
  const [continuing, setContinuing] = useState(false);
  const art = topicArt(path.topic);
  const mark = buildTrackMark(path.topic);
  const pct =
    tab === "mastered"
      ? 100
      : endowedPct(path.progress, path.totalLessons);
  const progressDone = tab === "mastered" ? path.totalLessons : path.progress;

  async function handleContinue(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (continuing) return;
    setContinuing(true);
    try {
      await patchRestoreCourse(path.id);
      router.push(
        `/courses/${path.id}/lessons/${path.progress}?from=library`,
      );
    } catch (err) {
      if (err instanceof ApiError && err.code === "path_limit") {
        router.push("/upgrade");
        return;
      }
      setContinuing(false);
    }
  }

  return (
    <Link
      href={`/library/${path.id}`}
      className="group focus-ring relative flex aspect-square flex-col justify-between overflow-hidden rounded-none p-4 text-left text-mark-fg transition-[filter] duration-[300ms] ease-out hover:brightness-110 sm:p-5"
      style={{ background: art.field, containerType: "size" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          ...topicPatternStyle(art.pattern),
          opacity: markPatternOpacity("withText"),
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-end justify-end overflow-hidden font-display"
        style={{
          color: art.glyphColor,
          opacity: markGlyphOpacity("withText"),
          // Container-relative, so the glyph tracks the card's own size as the
          // grid reflows. `vw` ignored the card entirely.
          fontSize: MARK_GLYPH_FONT_SIZE,
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 0.78,
          letterSpacing: "-0.02em",
          paddingRight: "6%",
          paddingBottom: "2%",
        }}
        aria-hidden
      >
        {art.glyph}
      </div>

      <div className="relative z-[1] flex items-start justify-between gap-2">
        {/* Silver at rest, Vermilion on hover. A card grid renders this N
            times and the accent budget is once per screen (§1.2), so the
            resting state cannot carry it. Hover resolves to exactly one card
            at a time, which is the "selected mark" case TRACK-MARKS reserves
            the accent for. */}
        <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-mark-meta transition-colors duration-small group-hover:text-accent">
          {mark.domainName}
        </span>
        {tab === "shelved" && (
          <span className="shrink-0 border border-mark-fg/20 bg-mark-field/40 px-1.5 py-0.5 font-meta text-[10px] uppercase tracking-[0.18em] text-mark-fg/80">
            Shelved
          </span>
        )}
        {tab === "mastered" && (
          <span className="flex h-6 w-6 items-center justify-center bg-mark-fg/15 ring-1 ring-mark-fg/10">
            <Trophy className="h-3 w-3" strokeWidth={2.2} aria-hidden />
          </span>
        )}
      </div>

      <div className="relative z-[1] mt-auto">
        <p className="font-display text-xl italic leading-tight tracking-tight sm:text-2xl">
          {path.topic}
        </p>
        <p className="mt-1.5 font-meta text-[10px] tracking-[0.12em] text-mark-meta">
          {mark.call}
        </p>
        <p className="mt-2 font-meta text-[10px] uppercase tracking-[0.14em] text-mark-fg/55">
          {tab === "mastered"
            ? `${path.totalLessons} lessons · Mastered · Certificate ready`
            : `${depthLabel(path.depth)} · ${progressDone} of ${path.totalLessons}`}
        </p>

        {tab === "shelved" && (
          <button
            type="button"
            onClick={(e) => void handleContinue(e)}
            disabled={continuing}
            className="mt-3 inline-flex items-center border border-mark-fg/30 bg-mark-fg/10 px-3 py-1.5 font-meta text-[10px] uppercase tracking-[0.2em] text-mark-fg transition hover:bg-mark-fg/20 disabled:opacity-50"
          >
            {continuing ? "Continuing…" : "Continue"}
          </button>
        )}
      </div>

      {/* Progress line — bottom edge */}
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-mark-fg/15"
        aria-hidden
      >
        <div
          className="h-full bg-mark-fg/75 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
