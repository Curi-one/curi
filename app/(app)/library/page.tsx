"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LibraryPathCard } from "@/components/LibraryPathCard";
import { PageShell } from "@/components/PageShell";
import { TabPills } from "@/components/TabPills";
import type { LibraryResponse } from "@/lib/api/schemas";
import { getLibrary } from "@/lib/api/client";

type Tab = keyof LibraryResponse;

const TABS: { id: Tab; label: string }[] = [
  { id: "exploring", label: "Exploring" },
  { id: "mastered", label: "Mastered" },
  { id: "shelved", label: "Shelved" },
];

function LibraryContent() {
  const [tab, setTab] = useState<Tab>("exploring");
  const [lib, setLib] = useState<LibraryResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("tab");
    if (q === "mastered" || q === "shelved" || q === "exploring") {
      setTab(q);
    }
  }, []);

  useEffect(() => {
    getLibrary().then(setLib).catch(() =>
      setLib({ exploring: [], mastered: [], shelved: [] }),
    );
  }, []);

  const paths = lib?.[tab] ?? [];
  const masteredCount = lib?.mastered.length ?? 0;
  const exploringCount = lib?.exploring.length ?? 0;
  const totalPaths =
    (lib?.exploring.length ?? 0) +
    (lib?.mastered.length ?? 0) +
    (lib?.shelved.length ?? 0);

  return (
    <>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Your paths</p>
        <Link href="/new" className="btn-secondary h-9 px-3 text-sm">
          New path
        </Link>
      </div>

      {lib && totalPaths > 0 && (
        <div className="mt-7 grid grid-cols-2 divide-x divide-border border-y border-border py-5">
          <div className="px-4 sm:px-6">
            <p className="font-display text-4xl leading-none tracking-[-0.04em] text-ink">
              {masteredCount}
            </p>
            <p className="mt-2 font-meta">mastered</p>
          </div>
          <div className="px-4 sm:px-6">
            <p className="font-display text-4xl leading-none tracking-[-0.04em] text-ink">
              {exploringCount}
            </p>
            <p className="mt-2 font-meta">exploring</p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <TabPills
          tabs={TABS.map((t) => ({
            id: t.id,
            label: t.label,
            count: lib?.[t.id].length,
          }))}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>
      <div className="mt-6">
        {!lib && <p className="text-ink-muted">Loading…</p>}
        {lib && paths.length === 0 && (
          <EmptyState
            message={
              tab === "exploring"
                ? "No active paths yet. Start a curated founder path, or create a custom one."
                : tab === "mastered"
                  ? "Nothing mastered yet. Finish a path to see it here."
                  : "No shelved paths."
            }
            actionHref={tab === "exploring" ? "/explore" : undefined}
            actionLabel={tab === "exploring" ? "Browse Explore" : undefined}
            secondaryHref={tab === "exploring" ? "/new" : undefined}
            secondaryLabel={tab === "exploring" ? "New path" : undefined}
          />
        )}
        {paths.length > 0 && tab === "mastered" && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {paths.map((p) => (
              <li key={p.id}>
                <LibraryPathCard path={p} tab={tab} />
              </li>
            ))}
          </ul>
        )}
        {paths.length > 0 && tab !== "mastered" && (
          <ul className="space-y-3">
            {paths.map((p) => (
              <li key={p.id}>
                <LibraryPathCard path={p} tab={tab} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function LibraryPage() {
  return (
    <PageShell title="Library" withTabPad={false} className="pt-4">
      <Suspense fallback={<p className="mt-6 text-ink-muted">Loading…</p>}>
        <LibraryContent />
      </Suspense>
    </PageShell>
  );
}
