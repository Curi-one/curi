import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";

export const EXPLORE_GENERAL_SUBCATEGORY = "Overview";

export type ExploreTaxonomyGroup = {
  category: string;
  subcategories: string[];
};

export type ExploreCatalogueSection<T> = {
  category: string;
  subcategory: string;
  items: T[];
};

function subcategoryOf(item: { subcategory?: string }): string {
  return item.subcategory?.trim() || EXPLORE_GENERAL_SUBCATEGORY;
}

/** Deduped category → subcategory tree in first-appearance order. */
export function buildExploreTaxonomy<
  T extends { category: string; subcategory?: string },
>(items: T[]): ExploreTaxonomyGroup[] {
  const order: string[] = [];
  const map = new Map<string, string[]>();

  for (const item of items) {
    if (!map.has(item.category)) {
      order.push(item.category);
      map.set(item.category, []);
    }
    const subs = map.get(item.category)!;
    const sub = subcategoryOf(item);
    if (!subs.includes(sub)) subs.push(sub);
  }

  return order.map((category) => ({
    category,
    subcategories: map.get(category) ?? [],
  }));
}

export function subcategoriesForCategory<
  T extends { category: string; subcategory?: string },
>(items: T[], category: string): string[] {
  const subs: string[] = [];
  for (const item of items) {
    if (item.category !== category) continue;
    const sub = subcategoryOf(item);
    if (!subs.includes(sub)) subs.push(sub);
  }
  return subs;
}

/** Filter + group catalogue items for the browse grid (category → subcategory sections). */
export function groupExploreCatalogue<
  T extends { category: string; subcategory?: string },
>(
  items: T[],
  {
    category = null,
    subcategory = null,
  }: { category?: string | null; subcategory?: string | null },
): ExploreCatalogueSection<T>[] {
  let filtered = items;
  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }
  if (subcategory) {
    filtered = filtered.filter(
      (item) => subcategoryOf(item) === subcategory,
    );
  }

  const sections: ExploreCatalogueSection<T>[] = [];
  const index = new Map<string, ExploreCatalogueSection<T>>();

  for (const item of filtered) {
    const key = `${item.category}\0${subcategoryOf(item)}`;
    let section = index.get(key);
    if (!section) {
      section = {
        category: item.category,
        subcategory: subcategoryOf(item),
        items: [],
      };
      index.set(key, section);
      sections.push(section);
    }
    section.items.push(item);
  }

  return sections;
}

export type ExplorePathSection = ExploreCatalogueSection<CataloguePath>;
export type ExploreBookSection = ExploreCatalogueSection<CatalogueBook>;
