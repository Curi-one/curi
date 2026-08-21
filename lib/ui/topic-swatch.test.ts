import { describe, expect, it } from "vitest";
import {
  topicArt,
  topicSwatch,
  type TopicPattern,
} from "@/lib/ui/topic-swatch";

const WARM_FIELDS = new Set([
  "#0A0908",
  "#1C1A18",
  "#2E2C28",
  "#141210",
  "#242220",
  "#181614",
  "#10100E",
  "#22201C",
]);

const PATTERNS: TopicPattern[] = [
  "hatch",
  "grid",
  "halftone",
  "rules",
  "grain",
  "band",
  "corners",
];

describe("topicArt", () => {
  it("returns the same art for the same topic", () => {
    expect(topicArt("Constitutional Law")).toEqual(
      topicArt("Constitutional Law"),
    );
    expect(topicArt("Calculus")).toEqual(topicArt("Calculus"));
  });

  it("varies pattern, glyph, or field across distinct topics", () => {
    const topics = [
      "Constitutional Law",
      "Calculus",
      "Roman History",
      "Formal Logic",
      "Poetry & Language",
      "Quantum Physics",
      "Cooking Basics",
      "Urban Design",
    ];
    const arts = topics.map(topicArt);
    const signatures = new Set(
      arts.map((a) => `${a.field}|${a.glyph}|${a.pattern}|${a.align}`),
    );
    expect(signatures.size).toBeGreaterThanOrEqual(6);

    const patterns = new Set(arts.map((a) => a.pattern));
    const glyphs = new Set(arts.map((a) => a.glyph));
    const fields = new Set(arts.map((a) => a.field));
    expect(patterns.size).toBeGreaterThan(1);
    expect(glyphs.size).toBeGreaterThan(1);
    expect(fields.size).toBeGreaterThan(1);
  });

  it("maps topic keywords to brand §6.2 glyphs", () => {
    expect(topicArt("Constitutional Law").glyph).toBe("§");
    expect(topicArt("criminal law").glyph).toBe("§");

    expect(["∮", "∞", "ℵ", "⊕"]).toContain(topicArt("Calculus").glyph);
    expect(["∮", "∞", "ℵ", "⊕"]).toContain(topicArt("Linear Algebra").glyph);

    expect(["Æ", "¶", "†"]).toContain(topicArt("Roman History").glyph);
    expect(["Æ", "¶", "†"]).toContain(topicArt("English Language").glyph);

    expect(["∴", "∵"]).toContain(topicArt("Formal Logic").glyph);
    expect(["∴", "∵"]).toContain(topicArt("Deductive Reasoning").glyph);
  });

  it("falls back to the topic initial when no keyword matches", () => {
    expect(topicArt("Gardening").glyph).toBe("G");
    expect(topicArt("xylophone craft").glyph).toBe("X");
  });

  it("uses warm brand ink tones, never cold hsl(0 0% n%) greys", () => {
    for (const topic of [
      "Law",
      "Math",
      "History",
      "Logic",
      "Baking",
      "Astronomy",
      "Design",
      "Music",
    ]) {
      const art = topicArt(topic);
      expect(art.field).not.toMatch(/hsl\(\s*0\s+0%/i);
      expect(art.field).not.toMatch(/#000000|#FFFFFF|#000\b|#FFF\b/i);
      // Solid field or gradient that starts with a warm ink hex
      const hex = art.field.match(/#[0-9A-Fa-f]{6}/)?.[0]?.toUpperCase();
      expect(hex).toBeTruthy();
      expect(WARM_FIELDS.has(hex!)).toBe(true);
      expect(art.glyphColor.toUpperCase()).toBe("#FAF9F5");
    }
  });

  it("picks a deterministic pattern and alignment from the approved sets", () => {
    const art = topicArt("Quantum Mechanics");
    expect(PATTERNS).toContain(art.pattern);
    expect(["br", "bl", "center", "tr", "tl"]).toContain(art.align);
  });

  it("may include an optional two-stop dark gradient field", () => {
    const topics = Array.from({ length: 40 }, (_, i) => `Topic variant ${i}`);
    const withGradient = topics
      .map(topicArt)
      .filter((a) => a.field.includes("linear-gradient"));
    expect(withGradient.length).toBeGreaterThan(0);
    for (const art of withGradient) {
      expect(art.fieldStops).toBeDefined();
      expect(art.fieldStops).toHaveLength(2);
      expect(WARM_FIELDS.has(art.fieldStops![0]!.toUpperCase())).toBe(true);
      expect(WARM_FIELDS.has(art.fieldStops![1]!.toUpperCase())).toBe(true);
    }
  });
});

describe("topicSwatch", () => {
  it("still returns [field, glyphColor] for LibraryPathCard compat", () => {
    const [field, glyphColor] = topicSwatch("Constitutional Law");
    const art = topicArt("Constitutional Law");
    expect(field).toBe(art.field);
    expect(glyphColor).toBe(art.glyphColor);
    expect(glyphColor.toUpperCase()).toBe("#FAF9F5");
  });

  it("is deterministic", () => {
    expect(topicSwatch("Baking")).toEqual(topicSwatch("Baking"));
  });
});
