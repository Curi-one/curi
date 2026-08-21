import { describe, expect, it } from "vitest";
import { lessonBlurb } from "@/lib/ui/lesson-blurb";

describe("lessonBlurb", () => {
  it("returns the first foothold for the opening lesson", () => {
    expect(lessonBlurb("Any title", 0, 7, "Stoicism")).toBe(
      "The first foothold: the definition, pressure, and real decision this path is built around.",
    );
  });

  it("returns synthesis for a late-path lesson", () => {
    expect(lessonBlurb("Wrapping up", 6, 7, "Stoicism")).toBe(
      "The synthesis: what you can now explain before a negotiation, a pitch, or a hard call.",
    );
  });

  it("matches why titles early in the path", () => {
    expect(lessonBlurb("Why this matters", 1, 8, "Topic")).toBe(
      "The opening question: why this matters before reality makes it expensive.",
    );
  });

  it("matches framework and mental-model keywords", () => {
    expect(lessonBlurb("A useful framework", 3, 8, "Topic")).toBe(
      "A frame you can carry into real conversations and internal decisions.",
    );
  });

  it("matches origin and history keywords", () => {
    expect(lessonBlurb("The origin of the idea", 2, 8, "Topic")).toBe(
      "The roots: the pattern, incentive, or pressure that made this idea necessary.",
    );
  });

  it("uses mid-path defaults when no keyword matches", () => {
    expect(lessonBlurb("Ordinary chapter", 2, 8, "Topic")).toBe(
      "The mechanism: what makes the idea, metric, or model move.",
    );
    expect(lessonBlurb("Ordinary chapter", 4, 8, "Topic")).toBe(
      "The deeper layer: where incentives and timing start to matter.",
    );
    expect(lessonBlurb("Ordinary chapter", 6, 8, "Topic")).toBe(
      "The synthesis: the threads drawn together into a real decision.",
    );
  });

  it("uses early-path foundations when no keyword matches", () => {
    expect(lessonBlurb("Ordinary chapter", 1, 8, "Topic")).toBe(
      "The foundations: the concepts that carry the rest of the path.",
    );
  });

  it("never uses exclamation marks or em-dashes", () => {
    const samples = [
      lessonBlurb("Why start here", 0, 5, "A"),
      lessonBlurb("Debate and tension", 2, 5, "A"),
      lessonBlurb("Practical tools", 2, 5, "A"),
      lessonBlurb("Quiet hidden truth", 2, 5, "A"),
      lessonBlurb("Final piece", 4, 5, "A"),
    ];
    for (const text of samples) {
      expect(text).not.toMatch(/!/);
      expect(text).not.toMatch(/—/);
    }
  });
});
