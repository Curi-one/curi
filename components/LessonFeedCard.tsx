import Link from "next/link";
import { Lock } from "lucide-react";
import type { FeedLessonItem } from "@/lib/api/schemas";
import { TopicThumbnail } from "@/components/TopicThumbnail";
import { lessonBlurb } from "@/lib/ui/lesson-blurb";

type Props = {
  item: FeedLessonItem;
  /** Copy for a locked (tomorrow) card — depends on whether today's lesson is still due. */
  lockedCopy?: string;
};

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

function positionLabel(item: FeedLessonItem): string {
  return `Lesson ${item.lessonNumber} of ${item.totalLessons}`;
}

export function LessonFeedCard({
  item,
  lockedCopy = "Unlocks tomorrow",
}: Props) {
  const dimmed = item.status === "completed";
  const preview = lessonBlurb(
    item.title,
    item.lessonIndex,
    item.totalLessons,
    item.topic,
  );

  if (item.status === "locked") {
    return (
      <div className="flex w-full gap-3.5 rounded-none border border-border/50 bg-paper-secondary p-4 opacity-55 sm:gap-4 sm:p-5">
        <div className="opacity-40">
          <TopicThumbnail topic={item.topic} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-ui-xl font-light leading-tight tracking-tight text-ink/50 sm:text-display-2xs">
            {item.title}
          </h3>
          <p className="mt-1 font-meta text-ink-muted/60">{item.topic}</p>
          <p className="mt-1.5 line-clamp-2 text-ui-2xs leading-relaxed text-ink-muted/70 sm:text-ui-xs">
            {preview}
          </p>
          <div className="mt-3 h-px bg-border/40" aria-hidden />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-ui-4xs font-medium tracking-wide text-ink-muted/45">
              {positionLabel(item)}
            </span>
            <div className="flex items-center gap-1.5 text-ui-4xs font-semibold uppercase tracking-wider text-ink-muted/50">
              <Lock className="h-3 w-3" aria-hidden />
              {lockedCopy}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const href = `/courses/${item.courseId}/lessons/${item.lessonIndex}?from=today`;

  return (
    <Link
      href={href}
      className={`group interactive-card focus-ring relative flex w-full gap-3.5 overflow-hidden rounded-none border border-border/50 bg-paper-secondary p-4 sm:gap-4 sm:p-5 ${
        dimmed ? "opacity-55 hover:opacity-70" : "hover:border-ink/30"
      }`}
    >
      {!dimmed && (
        <span
          className="absolute bottom-4 left-0 top-4 w-0.5 rounded-none bg-ink/30"
          aria-hidden
        />
      )}
      <TopicThumbnail topic={item.topic} />

      <div className="min-w-0 flex-1">
        <h3
          className={`font-display text-ui-xl font-light leading-tight tracking-tight transition-colors sm:text-display-2xs ${
            dimmed
              ? "text-ink/55 group-hover:text-ink/70"
              : "text-ink group-hover:text-ink"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-1 font-meta">{item.topic}</p>
        <p className="mt-1.5 line-clamp-2 text-ui-2xs leading-relaxed text-ink-muted sm:text-ui-xs">
          {preview}
        </p>

        <div className="mt-3 h-px bg-border/55" aria-hidden />

        <div className="mt-2 flex items-center justify-between gap-2">
          <span
            className={`text-ui-4xs font-medium tracking-wide ${
              dimmed ? "text-ink-muted/40" : "text-ink-muted/70"
            }`}
          >
            {positionLabel(item)}
          </span>
          <span
            className={`text-ui-4xs font-semibold uppercase tracking-wider transition-colors ${
              dimmed
                ? "text-ink-muted/45 group-hover:text-ink-muted/70"
                : "text-ink group-hover:text-ink"
            }`}
          >
            {actionLabel(item.status)}
          </span>
        </div>
      </div>
    </Link>
  );
}
