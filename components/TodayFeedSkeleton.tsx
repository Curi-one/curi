import { LessonFeedCardSkeleton } from "@/components/LessonFeedCardSkeleton";

/** Today feed layout skeleton — shown while `/api/feed` resolves. */
export function TodayFeedSkeleton() {
  return (
    <div className="pb-4" aria-busy="true" aria-label="Loading your feed">
      <header className="mb-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="skeleton-pulse h-9 w-[58%] max-w-xs" />
            <div className="skeleton-pulse h-3 w-32" />
          </div>
          <div className="skeleton-pulse h-11 w-20 shrink-0" />
        </div>
        <div className="editorial-rule mt-8" aria-hidden />
      </header>

      <section className="mb-10">
        <div className="skeleton-pulse mb-4 h-3 w-16" />
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <LessonFeedCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
