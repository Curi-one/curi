"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { TodayView } from "@/components/TodayView";
import {
  getFeed,
  getMe,
  getProgress,
  invalidateClientCache,
} from "@/lib/api/client";
import { memberSignInPath } from "@/lib/auth/member-gate";
import type { FeedResponse } from "@/lib/api/schemas";

export default function TodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [streak, setStreak] = useState(0);
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

        const [f, p] = await Promise.all([getFeed(), getProgress()]);
        if (cancelled) return;
        setFeed(f);
        setStreak(p.streak);
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
    <PageShell withTabPad={false} className="pt-4">
      {!ready && <LoadingState label="Loading your feed…" />}
      {feed && ready && (
        <TodayView
          {...feed}
          streak={streak}
          streakAtRisk={streak > 0 && feed.due.length > 0}
          upgradeConfirmed={upgradeConfirmed}
        />
      )}
    </PageShell>
  );
}
