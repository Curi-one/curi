"use client";

import Link from "next/link";
import { ArrowRight, Library, Sparkles } from "lucide-react";
import type { FeedResponse } from "@/lib/api/schemas";
import { LessonFeedCard } from "@/components/LessonFeedCard";
import { TodayEmptyActionCard } from "@/components/TodayEmptyActionCard";

type Props = FeedResponse & {
  streak?: number;
  streakAtRisk?: boolean;
  /** Shown after Stripe Checkout success (`/today?upgraded=1`). */
  upgradeConfirmed?: boolean;
};

export function TodayView({
  due,
  done,
  groups = [],
  streak = 0,
  streakAtRisk,
  upgradeConfirmed = false,
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

  const upgradeBanner = upgradeConfirmed ? (
    <p
      className="mb-6 border-b border-border pb-4 text-sm leading-relaxed text-ink-muted"
      role="status"
    >
      Academy is active — unlimited paths are unlocked.
    </p>
  ) : null;

  if (empty) {
    return (
      <div className="mx-auto w-full max-w-[580px] pb-4 pt-2">
        {upgradeBanner}
        <div className="mb-10 border-b border-border pb-10">
          <h1 className="type-display-xl text-ink">
            Your daily founder fluency
          </h1>
          <p className="type-lede mt-4 max-w-md">
            One lesson a day on the concepts that matter when you&apos;re
            building and raising. Three minutes, every morning.
          </p>
        </div>

        <div className="space-y-4">
          <TodayEmptyActionCard
            href="/explore"
            wallLabel="Curated library"
            title="Browse founder paths"
            description="Venture capital, term sheets, SAFEs, cap tables, unit economics — curated for first-time founders."
            icon={Library}
            primary
          />
          <TodayEmptyActionCard
            href="/new"
            wallLabel="Your topic"
            title="Create a custom path"
            description="Type a specific topic — best for founder-finance angles not in the library yet."
            icon={Sparkles}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {upgradeBanner}
      <header className="mb-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="type-display-xl text-ink">Your lessons</h1>
            {due.length > 0 && (
              <p className="type-kicker-mark mt-4 normal-case tracking-wider text-ink-muted">
                {due.length} of {total} still to read
              </p>
            )}
          </div>
          <Link
            href="/progress"
            className={`focus-ring inline-flex min-h-11 shrink-0 items-center gap-1 rounded-none px-2 font-meta transition-colors hover:bg-ink/[0.04] ${
              streakAtRisk
                ? "text-ink hover:text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {streak} day streak
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
        <div className="editorial-rule mt-8" aria-hidden />
      </header>

      {groups.map((group) => (
        <section key={group.daysAgo} className="mb-10 last:mb-6">
          <h2 className="type-kicker-mark mb-4">{group.label}</h2>
          <ul className="space-y-3">
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

      <div className="mt-12 text-center">
        <Link
          href="/new"
          className="link-subtle focus-ring inline-block rounded-none"
        >
          Create a new path
        </Link>
      </div>
    </div>
  );
}
