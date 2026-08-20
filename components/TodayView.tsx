import Link from "next/link";
import { ArrowRight, Library, Sparkles } from "lucide-react";
import type { FeedResponse } from "@/lib/api/schemas";
import { PathRow } from "@/components/PathRow";

type Props = FeedResponse & {
  streak?: number;
  streakAtRisk?: boolean;
};

export function TodayView({ due, done, streak = 0, streakAtRisk }: Props) {
  const total = due.length + done.length;
  const empty = total === 0;

  if (empty) {
    return (
      <div className="mx-auto w-full max-w-[580px] pb-4 pt-2">
        <div className="mb-8 border-b border-border pb-8">
          <h1
            className="font-display text-3xl font-light leading-snug tracking-tight text-ink"
            style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
          >
            Your daily founder fluency
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            One lesson a day on the concepts that matter when you&apos;re
            building and raising. Three minutes, every morning.
          </p>
        </div>

        <div className="space-y-2">
          <Link
            href="/explore"
            className="group interactive-card focus-ring flex w-full items-center justify-between border border-border bg-paper-secondary px-6 py-5 text-left hover:border-accent/20"
          >
            <div>
              <div className="flex items-center gap-2 font-medium text-ink">
                <Library className="h-4 w-4 shrink-0" aria-hidden />
                Browse founder paths
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Venture capital, term sheets, SAFEs, cap tables, unit economics
                — curated for first-time founders.
              </p>
            </div>
            <ArrowRight
              className="ml-4 h-4 w-4 shrink-0 text-ink-muted/40 transition group-hover:text-ink"
              aria-hidden
            />
          </Link>

          <Link
            href="/new"
            className="group interactive-card focus-ring flex w-full items-center justify-between border border-border bg-paper-secondary px-6 py-5 text-left hover:border-accent/20"
          >
            <div>
              <div className="flex items-center gap-2 font-medium text-ink">
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                Create a custom path
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Type a specific topic — best for founder-finance angles not in
                the library yet.
              </p>
            </div>
            <ArrowRight
              className="ml-4 h-4 w-4 shrink-0 text-ink-muted/40 transition group-hover:text-ink"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1
            className="font-display text-[2rem] font-light tracking-tight text-ink"
            style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
          >
            Today
          </h1>
          {due.length > 0 && (
            <p className="mt-1 text-[15px] font-light text-ink-muted">
              {due.length} of {total} still to read
            </p>
          )}
        </div>
        <Link
          href="/progress"
          className={`focus-ring inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-2 font-meta transition-colors hover:bg-ink/[0.04] ${
            streakAtRisk ? "text-accent hover:text-accent-dark" : "hover:text-ink"
          }`}
        >
          {streak} day streak
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </header>

      {due.length === 0 && done.length > 0 ? (
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
            <Link href="/new" className="link-subtle focus-ring inline-block rounded-sm">
              Create a new path
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
