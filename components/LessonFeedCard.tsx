import Link from "next/link";
import { Lock } from "lucide-react";
import type { FeedLessonItem } from "@/lib/api/schemas";
import { TopicThumbnail } from "@/components/TopicThumbnail";

type Props = {
  item: FeedLessonItem;
  /** Copy for a locked (tomorrow) card — depends on whether today's lesson is still due. */
  lockedCopy?: string;
};

function blurbFor(item: FeedLessonItem, lockedCopy: string): string {
  const position = `Lesson ${item.lessonNumber} of ${item.totalLessons}`;
  switch (item.status) {
    case "available":
      return `${position} · continue your path on ${item.topic}.`;
    case "completed":
      return `${position} · completed. Tap to re-read.`;
    case "overdue":
      return `${position} · missed yesterday. Catch up on ${item.topic}.`;
    case "locked":
      return `${position} · ${lockedCopy}`;
  }
}

function actionLabel(status: FeedLessonItem["status"]): string {
  switch (status) {
    case "available":
      return "Read now";
    case "overdue":
      return "Catch up";
    case "completed":
      return "Completed";
    case "locked":
      return "Locked";
  }
}

export function LessonFeedCard({ item, lockedCopy = "Unlocks tomorrow" }: Props) {
  const dimmed = item.status === "completed";
  const blurb = blurbFor(item, lockedCopy);

  if (item.status === "locked") {
    return (
      <div className="flex w-full gap-3.5 rounded-lg border border-border/50 bg-paper-secondary p-4 opacity-55 sm:gap-4 sm:p-5">
        <div className="opacity-40">
          <TopicThumbnail topic={item.topic} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-ink/50 sm:text-[15px]">
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted/70 sm:text-[13px]">
            {blurb}
          </p>
          <div className="mt-3 h-px bg-border/40" aria-hidden />
          <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted/50">
            <Lock className="h-3 w-3" aria-hidden />
            {lockedCopy}
          </div>
        </div>
      </div>
    );
  }

  const href = `/courses/${item.courseId}/lessons/${item.lessonIndex}?from=today`;

  return (
    <Link
      href={href}
      className={`group flex w-full gap-3.5 rounded-lg border border-border/50 bg-paper-secondary p-4 transition-[border-color,opacity,box-shadow] duration-200 hover:border-border sm:gap-4 sm:p-5 ${
        dimmed ? "opacity-55" : ""
      }`}
    >
      <TopicThumbnail topic={item.topic} />

      <div className="min-w-0 flex-1">
        <h3
          className={`text-[14px] font-semibold leading-snug tracking-tight sm:text-[15px] ${
            dimmed ? "text-ink/55" : "text-ink"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-1 font-meta">{item.topic}</p>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted sm:text-[13px]">
          {blurb}
        </p>

        <div className="mt-3 h-px bg-border/55" aria-hidden />

        <div className="mt-2 flex items-center justify-end">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              dimmed ? "text-ink-muted/45" : "text-accent"
            }`}
          >
            {actionLabel(item.status)}
          </span>
        </div>
      </div>
    </Link>
  );
}
