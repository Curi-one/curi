import { describe, expect, it } from "vitest";
import {
  normalizeMarkdownMathDelimiters,
  stripLatexDelimiters,
} from "@/lib/lessons/tex";

describe("stripLatexDelimiters", () => {
  it("strips \\[...\\] block delimiters (common Perplexity form)", () => {
    const raw =
      "\\[\\text{Real GDP} = \\frac{\\text{Nominal GDP}}{\\text{GDP deflator}}\\]";
    expect(stripLatexDelimiters(raw)).toBe(
      "\\text{Real GDP} = \\frac{\\text{Nominal GDP}}{\\text{GDP deflator}}",
    );
  });

  it("strips \\(...\\) inline delimiters", () => {
    expect(stripLatexDelimiters("\\(E = mc^2\\)")).toBe("E = mc^2");
  });

  it("strips $$ and $ wrappers", () => {
    expect(stripLatexDelimiters("$$a^2 + b^2 = c^2$$")).toBe("a^2 + b^2 = c^2");
    expect(stripLatexDelimiters("$x_i$")).toBe("x_i");
  });

  it("leaves bare TeX unchanged", () => {
    expect(stripLatexDelimiters("E = mc^2")).toBe("E = mc^2");
  });
});

describe("normalizeMarkdownMathDelimiters", () => {
  it("converts \\[...\\] and \\(...\\) to dollar math for remark-math", () => {
    const md =
      "See \\[\\frac{a}{b}\\] and inline \\(x^2\\) in the lesson.";
    expect(normalizeMarkdownMathDelimiters(md)).toBe(
      "See $$\\frac{a}{b}$$ and inline $x^2$ in the lesson.",
    );
  });
});
