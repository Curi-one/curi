import Link from "next/link";
import type { PathSummary } from "@/lib/api/schemas";
import { TopicThumbnail } from "@/components/TopicThumbnail";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  path: PathSummary;
  dimmed?: boolean;
};

function pathBlurb(path: PathSummary, lessonNum: number, dimmed: boolean): string {
  const depth = depthLabel(path.depth);
  if (dimmed) {
    return `${depth} path · completed today. Tap to re-read.`;
  }
  if (path.progress === 0) {
    return `${depth} path · start with lesson 1 of ${path.totalLessons}.`;
  }
  if (path.progress >= path.totalLessons) {
    return `${depth} path · all ${path.totalLessons} lessons complete.`;
  }
  return `${depth} path · continue with lesson ${lessonNum} of ${path.totalLessons}.`;
}

export function PathRow({ path, dimmed }: Props) {
  const lessonNum = Math.min(path.progress + 1, path.totalLessons);
  /** Done-today paths link back to the last completed (re-readable) lesson (DECISIONS: re-read allowed). */
  const lessonIndex = dimmed
    ? Math.max(0, path.progress - 1)
    : path.progress;
  const href = `/courses/${path.id}/lessons/${lessonIndex}?from=today`;
  const blurb = pathBlurb(path, lessonNum, !!dimmed);

  return (
    <Link
      href={href}
      className={`group interactive-card focus-ring flex w-full gap-3.5 rounded-lg border border-border/50 bg-paper-secondary p-4 sm:gap-4 sm:p-5 ${
        dimmed ? "opacity-55 hover:opacity-70" : "hover:border-accent/25"
      }`}
    >
      <TopicThumbnail topic={path.topic} />

      <div className="min-w-0 flex-1">
        <h3
          className={`text-[14px] font-semibold leading-snug tracking-tight transition-colors sm:text-[15px] ${
            dimmed
              ? "text-ink/55 group-hover:text-ink/70"
              : "text-ink group-hover:text-ink"
          }`}
        >
          {path.topic}
        </h3>
        <p className="mt-1 font-meta">
          {depthLabel(path.depth)} · Lesson {lessonNum} of {path.totalLessons}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted sm:text-[13px]">
          {blurb}
        </p>

        <div className="mt-3 h-px bg-border/55" aria-hidden />

        <div className="mt-2 flex items-center justify-end">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              dimmed
                ? "text-ink-muted/45 group-hover:text-ink-muted/70"
                : "text-accent group-hover:text-accent-dark"
            }`}
          >
            {dimmed ? "Completed" : "Read now"}
          </span>
        </div>
      </div>
    </Link>
  );
}
