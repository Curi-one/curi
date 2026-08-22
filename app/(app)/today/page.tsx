"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { TodayFeedSkeleton } from "@/components/TodayFeedSkeleton";
import { TodayView } from "@/components/TodayView";
import {
  getFeed,
  getMe,
  getNotes,
  getPreferences,
  getProgress,
  invalidateClientCache,
} from "@/lib/api/client";
import { memberSignInPath } from "@/lib/auth/member-gate";
import type { FeedResponse } from "@/lib/api/schemas";

function TodayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [streak, setStreak] = useState(0);
  const [notesDueCount, setNotesDueCount] = useState(0);
  const [notesShowDueOnToday, setNotesShowDueOnToday] = useState(true);
  const [ready, setReady] = useState(false);
  const [upgradeConfirmed, setUpgradeConfirmed] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") !== "1") return;
    setUpgradeConfirmed(true);
    invalidateClientCache(["/api/me"]);
    router.replace("/today", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (me.session.kind !== "member") {
          router.replace(memberSignInPath("/today"));
          return;
        }

        const [f, p, notes, prefRes] = await Promise.all([
          getFeed(),
          getProgress(),
          getNotes(),
          getPreferences(),
        ]);
        if (cancelled) return;
        setFeed(f);
        setStreak(p.streak);
        setNotesDueCount(notes.stats.dueCount);
        setNotesShowDueOnToday(prefRes.preferences.notesShowDueOnToday);
        setReady(true);
      } catch {
        if (cancelled) return;
        router.replace(memberSignInPath("/today"));
      }
    }

    void load();

    /** Re-reading a lesson elsewhere shouldn't leave Today stale (CUR-46). */
    function onFocus() {
      void load();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  return (
    <>
      {!ready && <TodayFeedSkeleton />}
      {feed && ready && (
        <TodayView
          {...feed}
          streak={streak}
          streakAtRisk={streak > 0 && feed.due.length > 0}
          upgradeConfirmed={upgradeConfirmed}
          notesDueCount={notesDueCount}
          notesShowDueOnToday={notesShowDueOnToday}
        />
      )}
    </>
  );
}

export default function TodayPage() {
  return (
    <PageShell withTabPad={false} className="pt-4">
      <Suspense fallback={<TodayFeedSkeleton />}>
        <TodayContent />
      </Suspense>
    </PageShell>
  );
}
