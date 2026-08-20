import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FeedResponse } from "@/lib/api/schemas";
import { PathRow } from "@/components/PathRow";

type Props = FeedResponse & {
  streak?: number;
  streakAtRisk?: boolean;
};

export function TodayView({ due, done, streak = 0, streakAtRisk }: Props) {
  const total = due.length + done.length;
  const empty = total === 0;

  return (
    <div className="pb-24">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1
            className="font-display text-[2rem] font-light tracking-tight text-ink"
            style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
          >
            Today
          </h1>
          {!empty && due.length > 0 && (
            <p className="mt-1 text-[15px] font-light text-ink-muted">
              {due.length} of {total} still to read
            </p>
          )}
        </div>
        <Link
          href="/progress"
          className={`inline-flex shrink-0 items-center gap-1 font-meta ${streakAtRisk ? "text-accent" : ""}`}
        >
          {streak} day streak
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </header>

      {empty ? (
        <div className="surface-card p-8 text-center">
          <p className="font-display text-xl text-ink">Nothing due today</p>
          <p className="mt-2 text-sm text-ink-muted">
            Browse curated founder paths, or create a custom path on any topic.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/explore" className="btn-primary inline-block">
              Browse founder paths
            </Link>
            <Link
              href="/new"
              className="text-sm text-ink-muted underline hover:text-ink sm:self-center"
            >
              Create a custom path
            </Link>
          </div>
        </div>
      ) : due.length === 0 && done.length > 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="font-display text-xl text-ink">All caught up</p>
          <p className="mt-2 text-sm text-ink-muted">
            Next lessons unlock tomorrow. Or start another path.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/progress" className="btn-secondary inline-block">
              View progress
            </Link>
            <Link href="/new" className="btn-ghost inline-block text-sm">
              New path
            </Link>
          </div>
        </div>
      ) : (
        <>
          {due.length > 0 && (
            <section className="mb-8">
              <h2 className="type-kicker mb-3">Still to read</h2>
              <ul className="space-y-3">
                {due.map((path) => (
                  <li key={path.id}>
                    <PathRow path={path} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="type-kicker mb-3">Already today</h2>
              <ul className="space-y-3">
                {done.map((path) => (
                  <li key={path.id}>
                    <PathRow path={path} dimmed />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="mt-10 text-center">
            <Link
              href="/new"
              className="text-sm text-ink-muted underline hover:text-ink"
            >
              Create a new path
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
