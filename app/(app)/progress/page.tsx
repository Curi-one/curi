"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { PathProgressBar } from "@/components/PathProgressBar";
import { getLibrary, getProgress } from "@/lib/api/client";
import type { PathSummary } from "@/lib/api/schemas";
import { depthLabel } from "@/lib/ui/constants";

export default function ProgressPage() {
  const [streak, setStreak] = useState(0);
  const [dates, setDates] = useState<string[]>([]);
  const [paths, setPaths] = useState<PathSummary[]>([]);
  const [stats, setStats] = useState({ active: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgress(), getLibrary()])
      .then(([p, lib]) => {
        setStreak(p.streak);
        setDates(p.heatmap);
        setPaths([...lib.exploring, ...lib.mastered]);
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

  return (
    <PageShell
      back={{ href: "/today", label: "Today" }}
      title="Progress"
      kicker={streak > 0 ? `${streak}-day streak` : "Build your streak"}
      content="full"
      withTabPad={false}
      className="pt-4"
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="surface-card px-4 py-3">
          <p className="font-meta">Active</p>
          <p className="mt-1 font-display text-2xl text-ink">{stats.active}</p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="font-meta">Mastered</p>
          <p className="mt-1 font-display text-2xl text-ink">
            {stats.mastered}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Heatmap dates={dates} streak={streak} />
      </div>
      <section className="mt-10">
        <h2 className="type-kicker">Your paths</h2>
        {paths.length === 0 ? (
          <p className="mt-4 text-ink-muted">
            No paths yet.{""}
            <Link
              href="/explore"
              className="link-subtle focus-ring inline-block rounded-none"
            >
              Explore founder paths
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {paths.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/library/${p.id}`}
                  className="surface-card surface-card-interactive interactive-card focus-ring group block px-4 py-3"
                >
                  <p className="font-medium text-ink transition-colors group-hover:text-ink">
                    {p.topic}
                  </p>
                  <p className="mt-1 font-meta">
                    {p.progress} / {p.totalLessons} · {depthLabel(p.depth)}
                  </p>
                  <PathProgressBar
                    progress={p.progress}
                    total={p.totalLessons}
                    className="mt-2"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
