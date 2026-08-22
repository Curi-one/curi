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
import { topicArt, topicPatternStyle } from "@/lib/ui/topic-swatch";

function StatCard({
  label,
  value,
  pattern = "vitrine",
}: {
  label: string;
  value: number;
  pattern?: "vitrine" | "ledger" | "radiate";
}) {
  const art = topicArt(label);
  return (
    <div className="relative overflow-hidden border border-border bg-paper-secondary px-4 py-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={topicPatternStyle(pattern)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-2 -top-2 font-display text-5xl font-light italic leading-none text-ink/[0.04]"
        aria-hidden
      >
        {art.glyph}
      </div>
      <p className="relative z-[1] font-meta text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </p>
      <p className="relative z-[1] mt-2 font-display text-4xl tabular-nums leading-none tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

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
        <StatCard label="Active paths" value={stats.active} pattern="ledger" />
        <StatCard label="Mastered" value={stats.mastered} pattern="radiate" />
      </div>

      <section className="animate-fade-in relative mt-8 overflow-hidden border border-border bg-paper-secondary p-5 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={topicPatternStyle("columns")}
          aria-hidden
        />
        <div className="relative z-[1]">
          <Heatmap activityByDay={activityByDay} streak={streak} />
        </div>
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
