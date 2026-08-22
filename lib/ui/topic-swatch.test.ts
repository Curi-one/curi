import { describe, expect, it } from "vitest";
import {
  buildTrackMark,
  classifyTopicDomain,
  hashTopicString,
  MARK_GLYPH_OPACITY,
  MARK_GLYPH_OPACITY_WITH_TEXT,
  MARK_PATTERN_OPACITY,
  MARK_PATTERN_OPACITY_WITH_TEXT,
  MARK_SURFACE_PATTERN_OPACITY,
  markGlyphOpacity,
  markPatternOpacity,
  topicArt,
  topicPatternStyle,
  topicSwatch,
  trackMarkTier,
  type TopicPattern,
} from "@/lib/ui/topic-swatch";

const PATTERNS: TopicPattern[] = [
  "vitrine",
  "blueprint",
  "cross",
  "ledger",
  "columns",
  "radiate",
];

describe("hashTopicString", () => {
  it("uses djb2-style hashing starting at 5381 (HTML parity)", () => {
    // Verified against docs/references/track-marks.html hashStr
    expect(hashTopicString("Calculus")).toBe(2129504033);
    expect(hashTopicString("Constitutional Law")).toBe(2056184855);
  });
});

describe("classifyTopicDomain", () => {
  it("maps keywords to domains; first match wins", () => {
    expect(classifyTopicDomain("Constitutional Law")).toBe("LAW");
    expect(classifyTopicDomain("Calculus")).toBe("MATH");
    expect(classifyTopicDomain("Roman History")).toBe("HIST");
    expect(classifyTopicDomain("Formal Logic")).toBe("PHIL");
    expect(classifyTopicDomain("English Language")).toBe("LANG");
    expect(classifyTopicDomain("Behavioural Economics")).toBe("ECON");
    // physics appears in MATH before SCI
    expect(classifyTopicDomain("Quantum Physics")).toBe("MATH");
  });

  it("falls back to GEN when no keyword matches", () => {
    expect(classifyTopicDomain("Gardening")).toBe("GEN");
    expect(classifyTopicDomain("xylophone craft")).toBe("GEN");
  });
});

describe("buildTrackMark", () => {
  it("is deterministic for the same topic", () => {
    expect(buildTrackMark("Constitutional Law")).toEqual(
      buildTrackMark("Constitutional Law"),
    );
  });

  it("returns domain, glyph, pattern, and call number", () => {
    expect(buildTrackMark("Constitutional Law")).toEqual({
      domainKey: "LAW",
      domainName: "Law & Policy",
      glyph: "†",
      pattern: "ledger",
      call: "LAW · 855.9",
    });
    expect(buildTrackMark("Calculus")).toEqual({
      domainKey: "MATH",
      domainName: "Mathematics",
      glyph: "∮",
      pattern: "blueprint",
      call: "MATH · 633.3",
    });
    expect(buildTrackMark("Roman History")).toEqual({
      domainKey: "HIST",
      domainName: "History",
      glyph: "Æ",
      pattern: "vitrine",
      call: "HIST · 936.9",
    });
    expect(buildTrackMark("Formal Logic")).toEqual({
      domainKey: "PHIL",
      domainName: "Philosophy",
      glyph: "∞",
      pattern: "vitrine",
      call: "PHIL · 492.6",
    });
    expect(buildTrackMark("Gardening")).toEqual({
      domainKey: "GEN",
      domainName: "General Knowledge",
      glyph: "†",
      pattern: "radiate",
      call: "GEN · 620.8",
    });
  });

  it("formats call numbers as DOMAIN · NNN.D", () => {
    for (const topic of [
      "Constitutional Law",
      "Calculus",
      "Gardening",
      "Behavioural Economics",
    ]) {
      expect(buildTrackMark(topic).call).toMatch(
        /^(PHIL|MATH|HIST|SCI|LANG|ECON|LAW|GEN) · \d{3}\.\d$/,
      );
    }
  });

  it("varies identity across distinct topics", () => {
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
    const marks = topics.map(buildTrackMark);
    const signatures = new Set(
      marks.map((m) => `${m.domainKey}|${m.glyph}|${m.pattern}|${m.call}`),
    );
    expect(signatures.size).toBeGreaterThanOrEqual(6);
  });
});

describe("trackMarkTier", () => {
  it("maps size to the four tiers", () => {
    expect(trackMarkTier(96)).toBe("large");
    expect(trackMarkTier(80)).toBe("large");
    expect(trackMarkTier(56)).toBe("medium");
    expect(trackMarkTier(48)).toBe("medium");
    expect(trackMarkTier(32)).toBe("small");
    expect(trackMarkTier(28)).toBe("small");
    expect(trackMarkTier(18)).toBe("micro");
    expect(trackMarkTier(16)).toBe("micro");
    expect(trackMarkTier(20)).toBe("micro");
    expect(trackMarkTier(27)).toBe("micro");
  });
});

describe("topicArt", () => {
  it("wraps buildTrackMark with ink field and paper glyph colour", () => {
    const mark = buildTrackMark("Calculus");
    const art = topicArt("Calculus");
    expect(art.glyph).toBe(mark.glyph);
    expect(art.pattern).toBe(mark.pattern);
    expect(art.align).toBe("br");
    // Theme-independent mark tokens, with the literal tone as fallback. A
    // track mark is a dark Ink field in BOTH themes, so it must not resolve
    // through a token that html.dark remaps.
    expect(art.field).toBe("var(--mark-field, #0A0908)");
    expect(art.glyphColor).toBe("var(--mark-fg, #FAF9F5)");
  });

  it("never resolves the field through a theme-flipping token", () => {
    const art = topicArt("Calculus");
    for (const value of [art.field, art.glyphColor]) {
      expect(value).not.toMatch(/--color-(paper|bg-primary|text-primary)/);
    }
  });

  it("is deterministic", () => {
    expect(topicArt("Calculus")).toEqual(topicArt("Calculus"));
  });
});

describe("topicSwatch", () => {
  it("still returns [field, glyphColor] for LibraryPathCard compat", () => {
    const [field, glyphColor] = topicSwatch("Constitutional Law");
    const art = topicArt("Constitutional Law");
    expect(field).toBe(art.field);
    expect(glyphColor).toBe(art.glyphColor);
    expect(glyphColor).toBe("var(--mark-fg, #FAF9F5)");
  });

  it("is deterministic", () => {
    expect(topicSwatch("Baking")).toEqual(topicSwatch("Baking"));
  });
});

describe("mark imagery opacity", () => {
  it("uses full field opacity when no readable copy shares the Ink field", () => {
    expect(markPatternOpacity("field")).toBe(MARK_PATTERN_OPACITY);
    expect(markGlyphOpacity("field")).toBe(MARK_GLYPH_OPACITY);
    expect(MARK_PATTERN_OPACITY).toBe(0.16);
    expect(MARK_GLYPH_OPACITY).toBe(0.5);
  });

  it("recedes pattern and glyph when readable copy shares the Ink field", () => {
    expect(markPatternOpacity("withText")).toBe(MARK_PATTERN_OPACITY_WITH_TEXT);
    expect(markGlyphOpacity("withText")).toBe(MARK_GLYPH_OPACITY_WITH_TEXT);
    expect(MARK_PATTERN_OPACITY_WITH_TEXT).toBeLessThan(MARK_PATTERN_OPACITY);
    expect(MARK_GLYPH_OPACITY_WITH_TEXT).toBeLessThan(MARK_GLYPH_OPACITY);
  });

  it("keeps surface patterns lighter than ink-field patterns", () => {
    expect(MARK_SURFACE_PATTERN_OPACITY).toBeLessThan(
      MARK_PATTERN_OPACITY_WITH_TEXT,
    );
  });
});

describe("topicPatternStyle", () => {
  it("returns CSS for every track-mark pattern family", () => {
    for (const pattern of PATTERNS) {
      const style = topicPatternStyle(pattern);
      expect(Object.keys(style).length).toBeGreaterThan(0);
      expect(
        style.backgroundImage || style.background || "",
      ).toBeTruthy();
    }
  });
});
