import { describe, expect, it } from "vitest";
import {
  EXPLORE_GENERAL_SUBCATEGORY,
  buildExploreTaxonomy,
  groupExploreCatalogue,
  subcategoriesForCategory,
} from "@/lib/explore/taxonomy";
import type { CataloguePath } from "@/lib/mock/fixtures";

const samplePaths: CataloguePath[] = [
  {
    id: "a",
    topic: "A",
    description: "",
    depth: "essentials",
    category: "Cat 1",
    subcategory: "Sub A",
  },
  {
    id: "b",
    topic: "B",
    description: "",
    depth: "essentials",
    category: "Cat 1",
    subcategory: "Sub B",
  },
  {
    id: "c",
    topic: "C",
    description: "",
    depth: "essentials",
    category: "Cat 2",
  },
];

describe("buildExploreTaxonomy", () => {
  it("returns categories with deduped subcategories in order", () => {
    expect(buildExploreTaxonomy(samplePaths)).toEqual([
      { category: "Cat 1", subcategories: ["Sub A", "Sub B"] },
      { category: "Cat 2", subcategories: [EXPLORE_GENERAL_SUBCATEGORY] },
    ]);
  });
});

describe("groupExploreCatalogue", () => {
  it("groups by category and subcategory sections", () => {
    const sections = groupExploreCatalogue(samplePaths, {});
    expect(sections).toHaveLength(3);
    expect(sections[0]?.subcategory).toBe("Sub A");
  });

  it("filters by category and subcategory", () => {
    const sections = groupExploreCatalogue(samplePaths, {
      category: "Cat 1",
      subcategory: "Sub B",
    });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.items).toHaveLength(1);
    expect(sections[0]?.items[0]?.id).toBe("b");
  });
});

describe("subcategoriesForCategory", () => {
  it("lists subcategories for one category", () => {
    expect(subcategoriesForCategory(samplePaths, "Cat 1")).toEqual([
      "Sub A",
      "Sub B",
    ]);
  });
});
