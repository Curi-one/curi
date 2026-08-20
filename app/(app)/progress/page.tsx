"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
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
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <Link href="/today" className="text-sm text-ink-muted">
        ← Today
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Progress</h1>
      <div className="mt-8">
        <Heatmap dates={dates} streak={streak} />
      </div>
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Your paths
        </h2>
        <ul className="mt-4 space-y-3">
          {paths.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-border px-4 py-3 text-sm"
            >
              <p className="font-medium text-ink">{p.topic}</p>
              <p className="text-ink-muted">
                {p.progress} / {p.totalLessons} · {depthLabel(p.depth)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
