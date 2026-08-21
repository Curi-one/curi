import Link from "next/link";
import { ArrowRight, Library, Sparkles } from "lucide-react";
import type { FeedResponse } from "@/lib/api/schemas";
import { LessonFeedCard } from "@/components/LessonFeedCard";

type Props = FeedResponse & {
  streak?: number;
  streakAtRisk?: boolean;
};

/**
 * Today, composed on the modular grid (BRAND §8.9, §10.1).
 *
 * Masthead is asymmetric: the title holds the left columns, the streak hangs
 * on the right rail, and a hairline rule closes the unit. Feed groups sit on
 * the reading measure so the right-hand columns stay empty — that silence is
 * what makes the due lessons read as the single subject of the page (§17:
 * empty space is the default).
 *
 * Rhythm is contrastive, not uniform: rows within a group are a `cluster`
 * apart, groups a `section` apart. Even spacing everywhere would flatten the
 * hierarchy that the grouping exists to express.
 */
export function TodayView({
  due,
  done,
  groups = [],
  streak = 0,
  streakAtRisk,
}: Props) {
  const total = due.length + done.length;
  const empty = total === 0;

  /** Course ids that still owe today's lesson — used to pick the tomorrow lock copy. */
  const courseIdsPendingToday = new Set(
    groups
      .flatMap((g) => g.items)
      .filter((i) => i.status === "available" || i.status === "overdue")
      .map((i) => i.courseId),
  );

  if (empty) {
    return (
      <div className="grid-canvas">
        <div className="col-measure">
          <h1 className="type-display-xl text-ink">Your daily founder fluency</h1>
          <p className="type-lede mt-block max-w-[46ch]">
            One lesson a day on the concepts that matter when you&apos;re
            building and raising. Three minutes, every morning.
          </p>
        </div>

        <div className="editorial-rule col-full my-section" aria-hidden />

        <ul className="col-wide flow-cluster">
          <li>
            <EmptyChoice
              href="/explore"
              icon={Library}
              title="Browse founder paths"
              body="Venture capital, term sheets, SAFEs, cap tables, unit economics — curated for first-time founders."
            />
          </li>
          <li>
            <EmptyChoice
              href="/new"
              icon={Sparkles}
              title="Create a custom path"
              body="Type a specific topic — best for founder-finance angles not in the library yet."
            />
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="grid-canvas">
      <header className="col-full">
        <div className="grid-canvas items-baseline gap-y-cluster">
          <h1 className="type-display-xl col-main text-ink">Today</h1>

          <div className="col-aside md:justify-self-end md:text-right">
            <Link
              href="/progress"
              className={`focus-ring inline-flex min-h-11 items-center gap-1.5 px-1 font-meta transition-colors hover:text-ink ${
                streakAtRisk ? "text-ink" : "text-ink-muted"
              }`}
            >
              {streak} day streak
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>

        {due.length > 0 && (
          <p className="type-kicker-mark mt-block normal-case tracking-wider text-ink-muted">
            {due.length} of {total} still to read
          </p>
        )}

        <div className="editorial-rule mt-block" aria-hidden />
      </header>

      <div className="col-measure mt-chapter flow-section">
        {groups.map((group) => (
          <section key={group.daysAgo}>
            <h2 className="type-kicker-mark mb-block">{group.label}</h2>
            <ul className="flow-cluster">
              {group.items.map((item) => (
                <li key={item.id}>
                  <LessonFeedCard
                    item={item}
                    lockedCopy={
                      item.status === "locked" &&
                      courseIdsPendingToday.has(item.courseId)
                        ? "Unlocks after today's lesson"
                        : "Unlocks tomorrow"
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Flush left, on the grid — never centred (§16 layout don'ts). */}
      <div className="col-full mt-section">
        <div className="editorial-rule mb-block" aria-hidden />
        <Link href="/new" className="link-subtle focus-ring inline-block">
          Create a new path
        </Link>
      </div>
    </div>
  );
}

type EmptyChoiceProps = {
  href: string;
  icon: typeof Library;
  title: string;
  body: string;
};

function EmptyChoice({ href, icon: Icon, title, body }: EmptyChoiceProps) {
  return (
    <Link
      href={href}
      className="group interactive-card focus-ring flex w-full items-start justify-between gap-6 border border-border bg-paper-secondary px-6 py-5 text-left hover:border-ink/30"
    >
      <div>
        <span className="flex items-center gap-2 font-medium text-ink">
          <Icon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
          {title}
        </span>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-muted">
          {body}
        </p>
      </div>
      <ArrowRight
        className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted/40 transition group-hover:text-ink"
        aria-hidden
      />
    </Link>
  );
}
