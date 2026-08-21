"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import { lessonCountForDepth } from "@/lib/mock/fixtures";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { BrowseFilterChips } from "@/components/BrowseFilterChips";
import { CourseCover } from "@/components/CourseCover";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { PreviewSheet } from "@/components/PreviewSheet";
import { TabPills } from "@/components/TabPills";
import { depthLabel } from "@/lib/ui/constants";
import { getExplore, getLibrary, getMe } from "@/lib/api/client";
import { Button } from "@/components/Button";

function groupByFirstLetter<T>(
  items: T[],
  getLabel: (item: T) => string,
): { letter: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const letter = (getLabel(item)[0] ?? "#").toUpperCase();
    const bucket = map.get(letter) ?? [];
    bucket.push(item);
    map.set(letter, bucket);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, group]) => ({ letter, items: group }));
}

export default function ExplorePage() {
  const router = useRouter();
  const [paths, setPaths] = useState<CataloguePath[]>([]);
  const [books, setBooks] = useState<CatalogueBook[]>([]);
  const [pathCategories, setPathCategories] = useState<string[]>([]);
  const [bookCategories, setBookCategories] = useState<string[]>([]);
  const [tab, setTab] = useState<"paths" | "books">("paths");
  const [category, setCategory] = useState<string | null>(null);
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
        setPathCategories(explore.pathCategories ?? []);
        setBookCategories(explore.bookCategories ?? []);
        setActiveCount(lib.exploring.length);
        setPlan(me.session.plan);
      })
      .finally(() => setLoading(false));
  }, []);

  const atLimit = plan === "free" && activeCount >= 2;
  const q = query.trim().toLowerCase();

  function handleTabChange(id: "paths" | "books") {
    setTab(id);
    setCategory(null);
  }

  const filteredPaths = useMemo(() => {
    return paths
      .filter((p) => !category || p.category === category)
      .filter(
        (p) =>
          !q ||
          p.topic.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
  }, [paths, q, category]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => !category || b.category === category)
      .filter(
        (b) =>
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q),
      );
  }, [books, q, category]);

  const featured = !q && filteredPaths.length > 0 ? filteredPaths[0]! : null;
  const restPaths =
    featured && !q
      ? filteredPaths.filter((p) => p.id !== featured.id)
      : filteredPaths;
  const pathGroups = useMemo(
    () => groupByFirstLetter(restPaths, (p) => p.topic),
    [restPaths],
  );

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
    (q
      ? filteredPaths.length === 0 && filteredBooks.length === 0
      : tab === "paths"
        ? filteredPaths.length === 0
        : filteredBooks.length === 0);

  return (
    <PageShell
      title="Explore"
      kicker="Founder catalogue"
      content="full"
      withTabPad={false}
      className="pt-4"
    >
      <p className="mt-2 text-sm text-ink-muted">
        Curated paths for first-time founders. Every start runs clarify — no
        skipping onboarding.
      </p>

      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-muted/50"
          aria-hidden
        />
        <label className="sr-only" htmlFor="explore-search">
          Search catalogue
        </label>
        <input
          id="explore-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search founder paths — term sheets, SAFEs…"
          className="input-field w-full pl-10"
        />
      </div>

      <div className="mt-4">
        <Button
          href="/new"
          variant="secondary"
          icon={<Sparkles aria-hidden />}
          className="w-full"
        >
          Start a custom path
        </Button>
      </div>

      {atLimit && (
        <p className="mt-4 rounded-none border border-border bg-paper-secondary px-4 py-3 text-sm text-ink-muted">
          You have 2 active paths. Finish or shelve one in Library, or{""}
          <Link
            href="/upgrade"
            className="text-ink underline underline-offset-2"
          >
            upgrade
          </Link>
          .
        </p>
      )}

      {!q && (
        <div className="mt-6">
          <TabPills
            variant="underline"
            tabs={[
              { id: "paths", label: "Founder paths", count: paths.length },
              { id: "books", label: "Books", count: books.length },
            ]}
            active={tab}
            onChange={(id) => handleTabChange(id as "paths" | "books")}
          />
          <div className="mt-4">
            <BrowseFilterChips
              categories={tab === "paths" ? pathCategories : bookCategories}
              active={category}
              onChange={setCategory}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading && (
          <LoadingState label="Loading catalogue…" minHeight="min-h-[24vh]" />
        )}
        {listEmpty && !q && (
          <EmptyState
            message="Nothing in the catalogue yet."
            actionHref="/new"
            actionLabel="Create a custom path"
          />
        )}
        {listEmpty && q && (
          <div className="surface-card p-8 text-center">
            <p className="text-ui-md font-light leading-relaxed text-ink-muted">
              No catalogue match for “{query.trim()}”. Start a custom path on
              that topic.
            </p>
            <Button
              onClick={() => startCustomFromQuery()}
              icon={<Sparkles aria-hidden />}
              className="mt-6"
            >
              Start a path on “{query.trim()}”
            </Button>
          </div>
        )}

        {!loading &&
          q &&
          (filteredPaths.length > 0 || filteredBooks.length > 0) && (
            <ul className="space-y-2">
              {filteredPaths.map((item) => (
                <li key={item.id}>
                  <PathSearchRow
                    item={item}
                    onClick={() => setPreviewPath(item)}
                  />
                </li>
              ))}
              {filteredBooks.map((item) => (
                <li key={item.id}>
                  <BookSearchRow
                    item={item}
                    onClick={() => setPreviewBook(item)}
                  />
                </li>
              ))}
            </ul>
          )}

        {!loading && !q && tab === "paths" && filteredPaths.length > 0 && (
          <div className="space-y-8">
            {featured && (
              <section aria-labelledby="explore-start-here">
                <h2
                  id="explore-start-here"
                  className="text-ui-md font-semibold tracking-tight text-ink"
                >
                  Start here
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  A solid first path for founders preparing to raise.
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewPath(featured)}
                  className="group interactive-card focus-ring mt-3 w-full overflow-hidden rounded-none border border-border bg-paper text-left hover:border-ink/30"
                >
                  <CourseCover topic={featured.topic} height={160} />
                  <div className="px-5 pb-5 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-meta">Featured · Founder path</p>
                        <h3 className="mt-1 font-display text-display-2xs leading-snug text-ink sm:text-2xl">
                          {featured.topic}
                        </h3>
                      </div>
                      <span className="w-fit shrink-0 rounded-none border border-border bg-paper-secondary px-3 py-1.5 font-meta normal-case">
                        {lessonCountForDepth(featured.topic, featured.depth)}
                        {""}
                        lessons
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                      {featured.description}
                    </p>
                    <p className="mt-2 font-meta">
                      {depthLabel(featured.depth)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink transition-all group-hover:gap-3">
                      See path
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </div>
                  </div>
                </button>
              </section>
            )}

            {pathGroups.map((group) => (
              <section
                key={group.letter}
                aria-labelledby={`path-letter-${group.letter}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <h2
                    id={`path-letter-${group.letter}`}
                    className="text-ui-md font-semibold tracking-tight text-ink"
                  >
                    {group.letter}
                  </h2>
                  <div className="h-px flex-1 bg-border" aria-hidden />
                </div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <PathMarketCard
                        item={item}
                        onClick={() => setPreviewPath(item)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {!loading && !q && tab === "books" && filteredBooks.length > 0 && (
          <ul className="space-y-3">
            {filteredBooks.map((item) => (
              <li key={item.id}>
                <BookSearchRow
                  item={item}
                  onClick={() => setPreviewBook(item)}
                />
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

function PathMarketCard({
  item,
  onClick,
}: {
  item: CataloguePath;
  onClick: () => void;
}) {
  const lessons = lessonCountForDepth(item.topic, item.depth);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group interactive-card focus-ring flex h-full w-full flex-col overflow-hidden rounded-none border border-border bg-paper text-left hover:border-ink/30"
    >
      <CourseCover topic={item.topic} height={100} />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="font-meta">Founder path</p>
        <p className="font-display text-display-2xs leading-snug text-ink">
          {item.topic}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
          {item.description}
        </p>
        <p className="mt-auto pt-2 font-meta">
          {lessons} lessons · {depthLabel(item.depth)}
        </p>
      </div>
    </button>
  );
}

function PathSearchRow({
  item,
  onClick,
}: {
  item: CataloguePath;
  onClick: () => void;
}) {
  const lessons = lessonCountForDepth(item.topic, item.depth);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group interactive-card focus-ring flex w-full items-center gap-3.5 rounded-none border border-border bg-paper p-3.5 text-left hover:border-ink/30"
    >
      <CourseCover topic={item.topic} height={54} width={54} />
      <div className="min-w-0 flex-1">
        <p className="font-meta">Founder path</p>
        <p className="text-sm font-semibold leading-snug text-ink">
          {item.topic}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
          {item.description}
        </p>
        <span className="mt-1 block font-meta normal-case sm:hidden">
          {lessons} · {depthLabel(item.depth)}
        </span>
      </div>
      <span className="hidden shrink-0 font-meta normal-case sm:inline">
        {lessons} · {depthLabel(item.depth)}
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-ink-muted/40 transition-colors group-hover:text-ink"
        aria-hidden
      />
    </button>
  );
}

function BookSearchRow({
  item,
  onClick,
}: {
  item: CatalogueBook;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group interactive-card focus-ring flex w-full items-center gap-3.5 rounded-none border border-border bg-paper p-3.5 text-left hover:border-ink/30"
    >
      <CourseCover topic={item.title} height={54} width={54} />
      <div className="min-w-0 flex-1">
        <p className="font-meta">Book</p>
        <p className="text-sm font-semibold leading-snug text-ink">
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
          {item.author} · {item.description}
        </p>
        <span className="mt-1 block font-meta normal-case sm:hidden">
          {item.pathCount} paths
        </span>
      </div>
      <span className="hidden shrink-0 font-meta normal-case sm:inline">
        {item.pathCount} paths
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-ink-muted/40 transition-colors group-hover:text-ink"
        aria-hidden
      />
    </button>
  );
}
