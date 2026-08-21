import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEARNING_PROFILE,
  learningProfilePromptLines,
  learningProfileStance,
  normalizeLearningProfile,
} from "@/lib/profile/learning-profile";

describe("learning profile", () => {
  it("uses prototype defaults", () => {
    expect(DEFAULT_LEARNING_PROFILE).toEqual({
      seq: "straight",
      anchor: "example",
      length: "medium",
      rigor: "clean",
      jargon: "always",
    });
  });

  it("builds Perplexity prompt lines from profile", () => {
    const lines = learningProfilePromptLines({
      seq: "broad",
      anchor: "data",
      length: "long",
      rigor: "edges",
      jargon: "skip",
    });
    expect(lines.join("\n")).toContain("broad picture");
    expect(lines.join("\n")).toContain("numbers");
    expect(lines.join("\n")).toContain("~10 minute");
    expect(lines.join("\n")).toContain("edge cases");
    expect(lines.join("\n")).toContain("look them up");
  });

  it("migrates legacy localStorage lessonDepth labels", () => {
    expect(normalizeLearningProfile({ lessonDepth: "Short" }).length).toBe(
      "short",
    );
    expect(normalizeLearningProfile({ lessonDepth: "Quick" }).length).toBe(
      "short",
    );
    expect(normalizeLearningProfile({ lessonDepth: "Deep" }).length).toBe(
      "long",
    );
  });

  it("renders a stance summary string", () => {
    const stance = learningProfileStance(DEFAULT_LEARNING_PROFILE);
    expect(stance).toContain("straight into the example");
    expect(stance).toContain("real-world examples");
    expect(stance).toContain("Medium");
  });
});
