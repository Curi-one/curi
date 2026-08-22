"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Heatmap } from "@/components/Heatmap";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { ProgressPathRow } from "@/components/ProgressPathRow";
import { getLibrary, getProgress } from "@/lib/api/client";
import type { PathSummary } from "@/lib/api/schemas";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative overflow-hidden border border-border bg-paper-secondary px-4 py-4">
      <p className="font-meta text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl tabular-nums leading-none tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

/*
 * StatCard previously carried a track-mark pattern and glyph. Both were wrong:
 *
 * - The pattern families draw near-white lines and are specified for dark Ink
 *   fields only. On this light card they were invisible in light mode and
 *   appeared only once dark mode inverted the surface beneath them.
 * - The glyph came from `topicArt("Active paths")`, i.e. the classifier run
 *   over a UI label. It matched no domain, fell through to GEN, and rendered a
 *   dagger. BRAND §6 requires a glyph to connect to the content's subject and
 *   never to be decorative; a stat tile has no subject to connect to.
 *
 * A stat tile is a number and its label. That is the whole composition.
 */

export default function ProgressPage() {
  const [streak, setStreak] = useState(0);
  const [activityByDay, setActivityByDay] = useState<Record<string, number>>(
    {},
  );
  const [exploring, setExploring] = useState<PathSummary[]>([]);
  const [mastered, setMastered] = useState<PathSummary[]>([]);
  const [stats, setStats] = useState({ active: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgress(), getLibrary()])
      .then(([p, lib]) => {
        setStreak(p.streak);
        setActivityByDay(
          p.activityByDay ??
            Object.fromEntries(p.heatmap.map((date) => [date, 1])),
        );
        setExploring(lib.exploring);
        setMastered(lib.mastered);
        setStats({
          active: p.activePaths ?? lib.exploring.length,
          mastered: p.masteredPaths ?? lib.mastered.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell title="Progress" withTabPad={false} className="pt-4">
        <LoadingState label="Loading progress…" />
      </PageShell>
    );
  }

  const hasPaths = exploring.length > 0 || mastered.length > 0;

  return (
    <PageShell
      back={{ href: "/today", label: "Today" }}
      title="Progress"
      kicker={streak > 0 ? `${streak}-day streak` : "Build your streak"}
      withTabPad={false}
      className="pt-4"
    >
      <div className="animate-fade-in mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Active paths" value={stats.active} />
        <StatCard label="Mastered" value={stats.mastered} />
      </div>

      {/* No pattern layer: the families are white-on-Ink and this is a light
          surface — see the StatCard note above. */}
      <section className="animate-fade-in mt-8 border border-border bg-paper-secondary p-5 sm:p-6">
        <Heatmap activityByDay={activityByDay} streak={streak} />
      </section>

      <section className="animate-fade-in mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="type-kicker-mark">Your paths</h2>
          {hasPaths && (
            <Link
              href="/library"
              className="focus-ring inline-flex items-center gap-1 font-meta text-[10px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
            >
              Library
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>

        {!hasPaths ? (
          <p className="mt-4 text-ink-muted">
            No paths yet.{" "}
            <Link
              href="/explore"
              className="link-subtle focus-ring inline-block rounded-none"
            >
              Explore founder paths
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {exploring.map((path) => (
              <li key={path.id}>
                <ProgressPathRow path={path} />
              </li>
            ))}
            {mastered.map((path) => (
              <li key={path.id}>
                <ProgressPathRow path={path} mastered />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
