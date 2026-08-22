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
      className="group focus-ring relative flex aspect-square flex-col justify-between overflow-hidden rounded-none p-4 text-left text-paper transition-[filter] duration-[300ms] ease-out hover:brightness-110 sm:p-5"
      style={{ background: art.field }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={topicPatternStyle(art.pattern)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-end justify-end overflow-hidden font-display"
        style={{
          color: art.glyphColor,
          opacity: 0.9,
          fontSize: "clamp(4.5rem, 28vw, 7rem)",
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 0.78,
          letterSpacing: "-0.02em",
          paddingRight: "6%",
          paddingBottom: "8%",
        }}
        aria-hidden
      >
        {art.glyph}
      </div>

      <div className="relative z-[1] flex items-start justify-between gap-2">
        <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-accent">
          {mark.domainName}
        </span>
        {tab === "shelved" && (
          <span className="shrink-0 border border-white/20 bg-ink/40 px-1.5 py-0.5 font-meta text-[10px] uppercase tracking-[0.18em] text-paper/80">
            Shelved
          </span>
        )}
        {tab === "mastered" && (
          <span className="flex h-6 w-6 items-center justify-center bg-white/15 ring-1 ring-white/10">
            <Trophy className="h-3 w-3" strokeWidth={2.2} aria-hidden />
          </span>
        )}
      </div>

      <div className="relative z-[1] mt-auto">
        <p className="font-display text-xl italic leading-tight tracking-tight sm:text-2xl">
          {path.topic}
        </p>
        <p className="mt-1.5 font-meta text-[10px] tracking-[0.12em] text-silver">
          {mark.call}
        </p>
        <p className="mt-2 font-meta text-[10px] uppercase tracking-[0.14em] text-paper/55">
          {tab === "mastered"
            ? `${path.totalLessons} lessons · Mastered`
            : `${depthLabel(path.depth)} · ${progressDone} of ${path.totalLessons}`}
        </p>

        {tab === "shelved" && (
          <button
            type="button"
            onClick={(e) => void handleContinue(e)}
            disabled={continuing}
            className="mt-3 inline-flex items-center border border-paper/30 bg-paper/10 px-3 py-1.5 font-meta text-[10px] uppercase tracking-[0.2em] text-paper transition hover:bg-paper/20 disabled:opacity-50"
          >
            {continuing ? "Continuing…" : "Continue"}
          </button>
        )}
      </div>

      {/* Progress line — bottom edge */}
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-white/15"
        aria-hidden
      >
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
