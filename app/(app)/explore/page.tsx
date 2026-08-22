"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ExploreBookRow } from "@/components/explore/ExploreBookRow";
import { ExploreCategoryNav } from "@/components/explore/ExploreCategoryNav";
import { ExploreFeaturedPath } from "@/components/explore/ExploreFeaturedPath";
import { ExplorePathRow } from "@/components/explore/ExplorePathRow";
import { ExploreSubcategoryNav } from "@/components/explore/ExploreSubcategoryNav";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { PreviewSheet } from "@/components/PreviewSheet";
import { getExplore, getLibrary, getMe } from "@/lib/api/client";
import {
  groupExploreCatalogue,
  subcategoriesForCategory,
  type ExploreTaxonomyGroup,
} from "@/lib/explore/taxonomy";
import {
  exploreStaggerDelay,
} from "@/lib/ui/use-stagger-reveal";

export default function ExplorePage() {
  const router = useRouter();
  const [paths, setPaths] = useState<CataloguePath[]>([]);
  const [books, setBooks] = useState<CatalogueBook[]>([]);
  const [pathTaxonomy, setPathTaxonomy] = useState<ExploreTaxonomyGroup[]>([]);
  const [bookTaxonomy, setBookTaxonomy] = useState<ExploreTaxonomyGroup[]>([]);
  const [tab, setTab] = useState<"paths" | "books">("paths");
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
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
        setPathTaxonomy(explore.pathTaxonomy ?? []);
        setBookTaxonomy(explore.bookTaxonomy ?? []);
        setActiveCount(lib.exploring.length);
        setPlan(me.session.plan);
      })
      .finally(() => setLoading(false));
  }, []);

  const atLimit = plan === "free" && activeCount >= 2;
  const q = query.trim().toLowerCase();
  const browsing = !q;
  const panelKey = `${tab}-${category ?? "all"}-${subcategory ?? "all"}-${q}`;

  const categories = useMemo(
    () =>
      (tab === "paths" ? pathTaxonomy : bookTaxonomy).map(
        (group) => group.category,
      ),
    [tab, pathTaxonomy, bookTaxonomy],
  );

  const subcategories = useMemo(() => {
    if (!category) return [];
    return tab === "paths"
      ? subcategoriesForCategory(paths, category)
      : subcategoriesForCategory(books, category);
  }, [tab, paths, books, category]);

  const filteredPaths = useMemo(() => {
    return paths.filter(
      (p) =>
        !q ||
        p.topic.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory?.toLowerCase().includes(q) ?? false),
    );
  }, [paths, q]);

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.subcategory?.toLowerCase().includes(q) ?? false),
    );
  }, [books, q]);

  const showFeatured =
    browsing && tab === "paths" && !category && !subcategory;
  const featured = showFeatured && paths.length > 0 ? paths[0]! : null;

  const pathSections = useMemo(() => {
    const items =
      featured && showFeatured
        ? filteredPaths.filter((p) => p.id !== featured.id)
        : filteredPaths;
    return groupExploreCatalogue(items, { category, subcategory });
  }, [filteredPaths, category, subcategory, featured, showFeatured]);

  const bookSections = useMemo(
    () => groupExploreCatalogue(filteredBooks, { category, subcategory }),
    [filteredBooks, category, subcategory],
  );

  function handleTabChange(next: "paths" | "books") {
    setTab(next);
    setCategory(null);
    setSubcategory(null);
  }

  function handleCategoryChange(next: string | null) {
    setCategory(next);
    setSubcategory(null);
  }

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

  let staggerIndex = 0;

  return (
    <PageShell withTabPad={false} className="pt-4">
      <div className="explore-shell">
        <header>
          <p className="explore-header-kicker">
            <span className="explore-header-kicker-dot" aria-hidden />
            Founder catalogue
          </p>
          <h1 className="explore-header-title">Explore</h1>
          <p className="explore-header-lede">
            Curated paths for first-time founders. Every start runs clarify — no
            skipping onboarding.
          </p>
        </header>

        <div className="explore-search">
          <Search className="explore-search-icon h-4 w-4" aria-hidden />
          <label className="sr-only" htmlFor="explore-search">
            Search catalogue
          </label>
          <input
            id="explore-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search paths, books, categories…"
            className="explore-search-input"
          />
        </div>

        <Link href="/new" className="explore-custom-link focus-ring">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Start a custom path
        </Link>

        {atLimit && (
          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            You have 2 active paths. Finish or shelve one in Library, or{" "}
            <Link
              href="/upgrade"
              className="text-ink underline underline-offset-2"
            >
              upgrade
            </Link>
            .
          </p>
        )}

        {browsing && (
          <>
            <div
              role="tablist"
              aria-label="Catalogue type"
              className="explore-type-tabs"
            >
              <button
                type="button"
                role="tab"
                id="explore-tab-paths"
                aria-selected={tab === "paths"}
                aria-controls="explore-panel"
                onClick={() => handleTabChange("paths")}
                className="explore-type-tab focus-ring"
              >
                Paths · {paths.length}
              </button>
              <button
                type="button"
                role="tab"
                id="explore-tab-books"
                aria-selected={tab === "books"}
                aria-controls="explore-panel"
                onClick={() => handleTabChange("books")}
                className="explore-type-tab focus-ring"
              >
                Books · {books.length}
              </button>
            </div>

            <ExploreCategoryNav
              categories={categories}
              active={category}
              onChange={handleCategoryChange}
            />

            {category && (
              <ExploreSubcategoryNav
                subcategories={subcategories}
                active={subcategory}
                onChange={setSubcategory}
              />
            )}
          </>
        )}

        <div
          id="explore-panel"
          role="tabpanel"
          aria-labelledby={tab === "paths" ? "explore-tab-paths" : "explore-tab-books"}
          key={panelKey}
          className="explore-panel"
        >
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
            <div className="py-10 text-center">
              <p className="text-sm leading-relaxed text-ink-muted">
                No catalogue match for “{query.trim()}”. Start a custom path on
                that topic.
              </p>
              <button
                type="button"
                onClick={startCustomFromQuery}
                className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Start a path on “{query.trim()}”
              </button>
            </div>
          )}

          {!loading && q && (filteredPaths.length > 0 || filteredBooks.length > 0) && (
            <ul className="explore-list">
              {filteredPaths.map((item) => {
                const delay = exploreStaggerDelay(staggerIndex++);
                return (
                  <li
                    key={item.id}
                    className="explore-stagger-item"
                    style={delay}
                  >
                    <ExplorePathRow
                      item={item}
                      onClick={() => setPreviewPath(item)}
                    />
                  </li>
                );
              })}
              {filteredBooks.map((item) => {
                const delay = exploreStaggerDelay(staggerIndex++);
                return (
                  <li
                    key={item.id}
                    className="explore-stagger-item"
                    style={delay}
                  >
                    <ExploreBookRow
                      item={item}
                      onClick={() => setPreviewBook(item)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && browsing && tab === "paths" && filteredPaths.length > 0 && (
            <>
              {featured && (
                <ExploreFeaturedPath
                  item={featured}
                  onClick={() => setPreviewPath(featured)}
                />
              )}

              {pathSections.map((section) => (
                <section
                  key={`${section.category}-${section.subcategory}`}
                  className="explore-section"
                  aria-labelledby={`path-section-${section.category}-${section.subcategory}`}
                >
                  <div className="explore-section-header">
                    <div>
                      <p className="explore-section-kicker">
                        {category ? section.category : section.subcategory}
                      </p>
                      <h2
                        id={`path-section-${section.category}-${section.subcategory}`}
                        className="explore-section-title"
                      >
                        {category ? section.subcategory : section.category}
                      </h2>
                    </div>
                    <span className="explore-section-count">
                      {section.items.length}
                    </span>
                  </div>
                  <ul className="explore-list">
                    {section.items.map((item) => {
                      const delay = exploreStaggerDelay(staggerIndex++);
                      return (
                        <li
                          key={item.id}
                          className="explore-stagger-item"
                          style={delay}
                        >
                          <ExplorePathRow
                            item={item}
                            onClick={() => setPreviewPath(item)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </>
          )}

          {!loading && browsing && tab === "books" && filteredBooks.length > 0 && (
            <>
              {bookSections.map((section) => (
                <section
                  key={`${section.category}-${section.subcategory}`}
                  className="explore-section"
                  aria-labelledby={`book-section-${section.category}-${section.subcategory}`}
                >
                  <div className="explore-section-header">
                    <div>
                      <p className="explore-section-kicker">
                        {category ? section.category : section.subcategory}
                      </p>
                      <h2
                        id={`book-section-${section.category}-${section.subcategory}`}
                        className="explore-section-title"
                      >
                        {category ? section.subcategory : section.category}
                      </h2>
                    </div>
                    <span className="explore-section-count">
                      {section.items.length}
                    </span>
                  </div>
                  <ul className="explore-list">
                    {section.items.map((item) => {
                      const delay = exploreStaggerDelay(staggerIndex++);
                      return (
                        <li
                          key={item.id}
                          className="explore-stagger-item"
                          style={delay}
                        >
                          <ExploreBookRow
                            item={item}
                            onClick={() => setPreviewBook(item)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>
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
    </PageShell>
  );
}
