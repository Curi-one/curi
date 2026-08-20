"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
import { PreviewSheet } from "@/components/PreviewSheet";
import { TabPills } from "@/components/TabPills";
import { depthLabel } from "@/lib/ui/constants";
import { getExplore, getLibrary, getMe } from "@/lib/api/client";

export default function ExplorePage() {
  const router = useRouter();
  const [paths, setPaths] = useState<CataloguePath[]>([]);
  const [books, setBooks] = useState<CatalogueBook[]>([]);
  const [tab, setTab] = useState<"paths" | "books">("paths");
  const [previewPath, setPreviewPath] = useState<CataloguePath | null>(null);
  const [previewBook, setPreviewBook] = useState<CatalogueBook | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [plan, setPlan] = useState<"free" | "academy">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExplore(), getLibrary(), getMe()])
      .then(([explore, lib, me]) => {
        setPaths(explore.paths);
        setBooks(explore.books);
        setActiveCount(lib.exploring.length);
        setPlan(me.session.plan);
      })
      .finally(() => setLoading(false));
  }, []);

  const atLimit = plan === "free" && activeCount >= 2;

  function handleStart() {
    if (atLimit) {
      router.push("/upgrade");
      return;
    }
    const topic = previewPath?.topic ?? previewBook?.title;
    if (topic) {
      router.push(`/clarify?topic=${encodeURIComponent(topic)}`);
    }
  }

  return (
    <PageShell title="Explore" kicker="Founder catalogue" withTabPad={false} className="pt-4">
      <p className="mt-2 text-sm text-ink-muted">
        Curated paths for first-time founders. Every start runs clarify — no
        skipping onboarding.
      </p>
      <div className="mt-6">
        <TabPills
          tabs={[
            { id: "paths", label: "Paths", count: paths.length },
            { id: "books", label: "Books", count: books.length },
          ]}
          active={tab}
          onChange={(id) => setTab(id as "paths" | "books")}
        />
      </div>
      <div className="mt-6">
        {loading && <p className="text-ink-muted">Loading catalogue…</p>}
        {!loading && tab === "paths" && paths.length === 0 && (
          <EmptyState
            message="Nothing in the catalogue yet."
            actionHref="/"
            actionLabel="Start a custom topic"
          />
        )}
        {!loading && tab === "paths" && paths.length > 0 && (
          <ul className="space-y-3">
            {paths.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPreviewPath(item)}
                  className="surface-card w-full px-4 py-4 text-left transition-colors hover:border-accent/30"
                >
                  <p className="font-display text-[22px] leading-snug text-ink">
                    {item.topic}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                  <p className="mt-2 font-meta">{depthLabel(item.depth)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loading && tab === "books" && books.length > 0 && (
          <ul className="space-y-3">
            {books.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPreviewBook(item)}
                  className="surface-card w-full px-4 py-4 text-left transition-colors hover:border-accent/30"
                >
                  <p className="font-display text-[22px] leading-snug text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {item.author} · {item.pathCount} paths
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-10 text-center">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm text-ink-muted underline hover:text-ink"
        >
          Or enter a custom topic on the landing page
        </button>
      </p>
      <PreviewSheet
        item={previewPath ?? previewBook}
        itemType={previewPath ? "path" : "book"}
        open={!!(previewPath ?? previewBook)}
        onClose={() => {
          setPreviewPath(null);
          setPreviewBook(null);
        }}
        onStart={handleStart}
        atLimit={atLimit}
      />
    </PageShell>
  );
}
