"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { PageShell } from "@/components/PageShell";
import { getLibrary, getProgress } from "@/lib/api/client";
import type { PathSummary } from "@/lib/api/schemas";
import { depthLabel } from "@/lib/ui/constants";

export default function ProgressPage() {
  const [streak, setStreak] = useState(0);
  const [dates, setDates] = useState<string[]>([]);
  const [paths, setPaths] = useState<PathSummary[]>([]);

  useEffect(() => {
    Promise.all([getProgress(), getLibrary()]).then(([p, lib]) => {
      setStreak(p.streak);
      setDates(p.heatmap);
      setPaths([...lib.exploring, ...lib.mastered]);
    });
  }, []);

  return (
    <PageShell
      back={{ href: "/today", label: "Today" }}
      title="Progress"
      kicker="Streak & paths"
      withTabPad={false}
    >
      <div className="mt-8">
        <Heatmap dates={dates} streak={streak} />
      </div>
      <section className="mt-10">
        <h2 className="type-kicker">Your paths</h2>
        {paths.length === 0 ? (
          <p className="mt-4 text-ink-muted">
            No paths yet.{" "}
            <Link href="/explore" className="underline hover:text-ink">
              Explore
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {paths.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/library/${p.id}`}
                  className="surface-card block px-4 py-3 hover:border-ink/30"
                >
                  <p className="font-medium text-ink">{p.topic}</p>
                  <p className="mt-1 font-meta">
                    {p.progress} / {p.totalLessons} · {depthLabel(p.depth)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
