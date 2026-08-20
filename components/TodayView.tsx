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
          className={`font-meta ${streakAtRisk ? "text-accent" : ""}`}
        >
          {streak} day streak →
        </Link>
      </header>

      {empty ? (
        <div className="surface-card p-8 text-center">
          <p className="text-ink-muted">No paths yet.</p>
          <Link href="/explore" className="btn-primary mt-6 inline-block">
            Explore paths
          </Link>
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
        </>
      )}

    </div>
  );
}
