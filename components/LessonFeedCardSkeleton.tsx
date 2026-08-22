/** Placeholder row matching `LessonFeedCard` layout while the feed loads. */
export function LessonFeedCardSkeleton() {
  return (
    <div
      className="feed-card flex w-full gap-3.5 rounded-none border border-border bg-paper-secondary p-4 sm:gap-4 sm:p-5"
      aria-hidden
    >
      <div className="skeleton-pulse h-12 w-12 shrink-0" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="skeleton-pulse h-5 w-[72%]" />
        <div className="skeleton-pulse h-3 w-[34%]" />
        <div className="space-y-2 pt-1">
          <div className="skeleton-pulse h-3 w-full" />
          <div className="skeleton-pulse h-3 w-[88%]" />
        </div>
        <div className="h-px bg-border/40" />
        <div className="flex justify-between gap-3">
          <div className="skeleton-pulse h-3 w-24" />
          <div className="skeleton-pulse h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
