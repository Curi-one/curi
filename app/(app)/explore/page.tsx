"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
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
  const q = query.trim().toLowerCase();

  const filteredPaths = useMemo(() => {
    if (!q) return paths;
    return paths.filter(
      (p) =>
        p.topic.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [paths, q]);

  const filteredBooks = useMemo(() => {
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    );
  }, [books, q]);

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

  function startCustomFromQuery() {
    const topic = query.trim();
    if (!topic) {
      router.push("/new");
      return;
    }
    if (atLimit) {
      router.push("/upgrade");
      return;
    }
    router.push(`/clarify?topic=${encodeURIComponent(topic)}`);
  }

  const listEmpty =
    !loading &&
    ((tab === "paths" && filteredPaths.length === 0) ||
      (tab === "books" && filteredBooks.length === 0));

  return (
    <PageShell title="Explore" kicker="Founder catalogue" withTabPad={false} className="pt-4">
      <p className="mt-2 text-sm text-ink-muted">
        Curated paths for first-time founders. Every start runs clarify — no
        skipping onboarding.
      </p>

      <div className="mt-5">
        <Link
          href="/new"
          className="btn-secondary flex min-h-11 w-full items-center justify-center"
        >
          Start a custom path
        </Link>
      </div>

      <div className="mt-4">
        <label className="sr-only" htmlFor="explore-search">
          Search catalogue
        </label>
        <input
          id="explore-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search paths or books…"
          className="input-field w-full"
        />
      </div>

      {atLimit && (
        <p className="mt-4 rounded-xl border border-border bg-paper-secondary px-4 py-3 text-sm text-ink-muted">
          You have 2 active paths. Finish or shelve one in Library, or{" "}
          <Link href="/upgrade" className="text-accent underline">
            upgrade
          </Link>
          .
        </p>
      )}

      <div className="mt-6">
        <TabPills
          tabs={[
            { id: "paths", label: "Paths", count: filteredPaths.length },
            { id: "books", label: "Books", count: filteredBooks.length },
          ]}
          active={tab}
          onChange={(id) => setTab(id as "paths" | "books")}
        />
      </div>
      <div className="mt-6">
        {loading && <p className="text-ink-muted">Loading catalogue…</p>}
        {listEmpty && !q && (
          <EmptyState
            message="Nothing in the catalogue yet."
            actionHref="/new"
            actionLabel="Create a custom path"
          />
        )}
        {listEmpty && q && (
          <div className="surface-card p-8 text-center">
            <p className="text-[15px] font-light leading-relaxed text-ink-muted">
              No catalogue match for “{query.trim()}”. Start a custom path on
              that topic.
            </p>
            <button
              type="button"
              onClick={() => startCustomFromQuery()}
              className="btn-primary mt-6 inline-block"
            >
              Start a path on “{query.trim()}”
            </button>
          </div>
        )}
        {!loading && tab === "paths" && filteredPaths.length > 0 && (
          <ul className="space-y-3">
            {filteredPaths.map((item) => (
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
        {!loading && tab === "books" && filteredBooks.length > 0 && (
          <ul className="space-y-3">
            {filteredBooks.map((item) => (
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
      <p className="mt-10 text-center text-sm text-ink-muted">
        Prefer typing a topic? Use Start a custom path above.
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
