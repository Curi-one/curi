import {
  CATALOGUE_BOOKS,
  CATALOGUE_PATHS,
  type CatalogueBook,
  type CataloguePath,
} from "@/lib/mock/fixtures";

export type ExploreCatalogue = {
  paths: CataloguePath[];
  books: CatalogueBook[];
};

/** Static founder catalogue for v1 (F3). DB-backed catalogue deferred. */
export function getExploreCatalogue(): ExploreCatalogue {
  return {
    paths: CATALOGUE_PATHS,
    books: CATALOGUE_BOOKS,
  };
}
