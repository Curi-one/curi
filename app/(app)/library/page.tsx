"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LibraryResponse } from "@/lib/api/schemas";
import { getLibrary } from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";

type Tab = keyof LibraryResponse;

const TABS: { id: Tab; label: string }[] = [
  { id: "exploring", label: "Exploring" },
  { id: "mastered", label: "Mastered" },
  { id: "shelved", label: "Shelved" },
];

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("exploring");
  const [lib, setLib] = useState<LibraryResponse | null>(null);

  useEffect(() => {
    getLibrary().then(setLib).catch(() =>
      setLib({ exploring: [], mastered: [], shelved: [] }),
    );
  }, []);

  const paths = lib?.[tab] ?? [];

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <h1 className="font-display text-3xl text-ink">Library</h1>
      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === t.id ? "bg-ink text-paper" : "border border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {!lib && <p className="text-ink-muted">Loading…</p>}
        {lib && paths.length === 0 && (
          <p className="text-ink-muted">
            {tab === "exploring"
              ? "No active paths. Start one from Explore."
              : tab === "mastered"
                ? "Nothing mastered yet."
                : "No shelved paths."}
          </p>
        )}
        {paths.length > 0 && (
          <ul className="space-y-3">
            {paths.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/library/${p.id}`}
                  className="block rounded-xl border border-border bg-paper-secondary px-4 py-4 hover:border-ink/20"
                >
                  <p className="font-display text-lg text-ink">{p.topic}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {depthLabel(p.depth)} · {p.progress} of {p.totalLessons}{" "}
                    lessons
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
