"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
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
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(
    initialTab === "mastered" || initialTab === "shelved"
      ? initialTab
      : "exploring",
  );
  const [lib, setLib] = useState<LibraryResponse | null>(null);

  useEffect(() => {
    getLibrary().then(setLib).catch(() =>
      setLib({ exploring: [], mastered: [], shelved: [] }),
    );
  }, []);

  const paths = lib?.[tab] ?? [];

  return (
    <PageShell title="Library" kicker="Your paths" withTabPad={false} className="pt-4">
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
          <EmptyState
            message={
              tab === "exploring"
                ? "No active paths yet. Start one from Explore or the landing page."
                : tab === "mastered"
                  ? "Nothing mastered yet. Finish a path to see it here."
                  : "No shelved paths."
            }
            actionHref={tab === "exploring" ? "/explore" : undefined}
            actionLabel={tab === "exploring" ? "Explore paths" : undefined}
          />
        )}
        {paths.length > 0 && (
          <ul className="space-y-3">
            {paths.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/library/${p.id}`}
                  className="surface-card block px-4 py-4 hover:border-ink/30"
                >
                  <p className="font-display text-[22px] leading-snug text-ink">
                    {p.topic}
                  </p>
                  <p className="mt-2 font-meta">
                    {depthLabel(p.depth)} · {p.progress} of {p.totalLessons}{" "}
                    lessons
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
