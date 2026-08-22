import {
  CATALOGUE_BOOKS,
  CATALOGUE_PATHS,
  type CatalogueBook,
  type CataloguePath,
} from "@/lib/mock/fixtures";
import {
  buildExploreTaxonomy,
  type ExploreTaxonomyGroup,
} from "@/lib/explore/taxonomy";

export type ExploreCatalogue = {
  paths: CataloguePath[];
  books: CatalogueBook[];
  /** Deduped, order-of-first-appearance category labels for browse filter chips. */
  pathCategories: string[];
  bookCategories: string[];
  pathTaxonomy: ExploreTaxonomyGroup[];
  bookTaxonomy: ExploreTaxonomyGroup[];
};

function dedupedCategories(items: { category: string }[]): string[] {
  return [...new Set(items.map((item) => item.category))];
}

/** Static founder catalogue for v1 (F3). DB-backed catalogue deferred. */
export function getExploreCatalogue(): ExploreCatalogue {
  return {
    paths: CATALOGUE_PATHS,
    books: CATALOGUE_BOOKS,
    pathCategories: dedupedCategories(CATALOGUE_PATHS),
    bookCategories: dedupedCategories(CATALOGUE_BOOKS),
    pathTaxonomy: buildExploreTaxonomy(CATALOGUE_PATHS),
    bookTaxonomy: buildExploreTaxonomy(CATALOGUE_BOOKS),
  };
}
