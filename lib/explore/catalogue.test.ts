import { describe, expect, it } from "vitest";
import { getExploreCatalogue } from "@/lib/explore/catalogue";

describe("getExploreCatalogue", () => {
  it("returns paths and books, each tagged with a category", () => {
    const catalogue = getExploreCatalogue();

    expect(catalogue.paths.length).toBeGreaterThan(0);
    expect(catalogue.books.length).toBeGreaterThan(0);
    for (const path of catalogue.paths) {
      expect(path.category).toBeTruthy();
    }
    for (const book of catalogue.books) {
      expect(book.category).toBeTruthy();
    }
  });

  it("derives a deduped category list spanning multiple categories", () => {
    const catalogue = getExploreCatalogue();

    expect(new Set(catalogue.pathCategories).size).toBe(
      catalogue.pathCategories.length,
    );
    expect(catalogue.pathCategories.length).toBeGreaterThanOrEqual(2);
    expect(new Set(catalogue.bookCategories).size).toBe(
      catalogue.bookCategories.length,
    );
    expect(catalogue.bookCategories.length).toBeGreaterThanOrEqual(2);
  });

  it("derives taxonomy trees with subcategories", () => {
    const catalogue = getExploreCatalogue();

    expect(catalogue.pathTaxonomy.length).toBeGreaterThanOrEqual(2);
    expect(catalogue.bookTaxonomy.length).toBeGreaterThanOrEqual(2);
    for (const group of catalogue.pathTaxonomy) {
      expect(group.subcategories.length).toBeGreaterThan(0);
    }
  });
});
