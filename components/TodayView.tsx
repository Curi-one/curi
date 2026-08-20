import Link from "next/link";
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
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Today</h1>
          {!empty && due.length > 0 && (
            <p className="mt-1 text-ink-muted">
              {due.length} of {total} still to read
            </p>
          )}
        </div>
        <Link
          href="/progress"
          className={`text-sm font-medium ${streakAtRisk ? "text-streak" : "text-ink-muted"}`}
        >
          {streak} day streak →
        </Link>
      </header>

      {empty ? (
        <div className="rounded-xl border border-border bg-paper-secondary p-8 text-center">
          <p className="text-ink-muted">No paths yet.</p>
          <Link href="/explore" className="btn-primary mt-6 inline-block">
            Explore paths
          </Link>
        </div>
      ) : (
        <>
          {due.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-muted">
                Still to read
              </h2>
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
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-muted">
                Already today
              </h2>
              <ul className="space-y-3">
                {done.map((path) => (
                  <li key={path.id}>
                    <PathRow path={path} dimmed />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-8 flex justify-end">
        <Link href="/profile" className="text-sm text-ink-muted">
          Profile
        </Link>
      </div>
    </div>
  );
}
