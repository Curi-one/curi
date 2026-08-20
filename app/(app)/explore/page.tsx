"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PreviewSheet } from "@/components/PreviewSheet";
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

  useEffect(() => {
    getExplore().then((d) => {
      setPaths(d.paths);
      setBooks(d.books);
    });
    getLibrary().then((lib) => setActiveCount(lib.exploring.length));
    getMe().then((m) => setPlan(m.session.plan));
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

  const items = tab === "paths" ? paths : books;

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <h1 className="font-display text-3xl text-ink">Explore</h1>
      <div className="mt-6 flex gap-2">
        {(["paths", "books"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm capitalize ${
              tab === t ? "bg-ink text-paper" : "border border-border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-6 space-y-3">
        {tab === "paths"
          ? paths.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPreviewPath(item)}
                  className="w-full rounded-xl border border-border bg-paper-secondary px-4 py-4 text-left hover:border-ink/20"
                >
                  <p className="font-display text-lg text-ink">{item.topic}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                </button>
              </li>
            ))
          : books.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPreviewBook(item)}
                  className="w-full rounded-xl border border-border bg-paper-secondary px-4 py-4 text-left hover:border-ink/20"
                >
                  <p className="font-display text-lg text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                </button>
              </li>
            ))}
      </ul>
      {items.length === 0 && <p className="mt-6 text-ink-muted">Loading catalogue…</p>}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm text-ink-muted underline"
        >
          Or enter a custom topic
        </button>
      </div>
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
    </main>
  );
}
