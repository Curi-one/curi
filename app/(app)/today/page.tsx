"use client";

import { useEffect, useState } from "react";
import { TodayView } from "@/components/TodayView";
import { getFeed, getProgress } from "@/lib/api/client";
import type { FeedResponse } from "@/lib/api/schemas";

export default function TodayPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getFeed(), getProgress()])
      .then(([f, p]) => {
        setFeed(f);
        setStreak(p.streak);
      })
      .catch(() => setError("Could not load Today."));
  }, []);

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      {error && <p className="text-ink-muted">{error}</p>}
      {!feed && !error && <p className="text-ink-muted">Loading…</p>}
      {feed && (
        <TodayView
          {...feed}
          streak={streak}
          streakAtRisk={streak > 0 && feed.due.length > 0}
        />
      )}
    </main>
  );
}
