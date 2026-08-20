"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { TodayView } from "@/components/TodayView";
import { getFeed, getProgress } from "@/lib/api/client";
import type { FeedResponse } from "@/lib/api/schemas";

export default function TodayPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      Promise.all([getFeed(), getProgress()])
        .then(([f, p]) => {
          setFeed(f);
          setStreak(p.streak);
        })
        .catch(() => setError("Could not load Today."));
    }

    load();

    /** Re-reading a lesson elsewhere shouldn't leave Today stale (CUR-46). */
    function onFocus() {
      load();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <PageShell withTabPad={false} className="pt-4">
      {error && <p className="text-ink-muted">{error}</p>}
      {!feed && !error && <LoadingState label="Loading your feed…" />}
      {feed && (
        <TodayView
          {...feed}
          streak={streak}
          streakAtRisk={streak > 0 && feed.due.length > 0}
        />
      )}
    </PageShell>
  );
}
