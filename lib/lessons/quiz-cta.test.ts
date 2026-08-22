import { describe, expect, it } from "vitest";
import { quizCtaCopy } from "@/lib/lessons/quiz-cta";

describe("quizCtaCopy", () => {
  it("returns deterministic copy for the same lesson", () => {
    expect(quizCtaCopy("Unit economics", "Founder finance", 2)).toEqual(
      quizCtaCopy("Unit economics", "Founder finance", 2),
    );
  });

  it("returns a label and hint", () => {
    const cta = quizCtaCopy("Why margins matter", "Unit economics", 0);
    expect(cta.label.length).toBeGreaterThan(10);
    expect(cta.hint.length).toBeGreaterThan(10);
    expect(cta.label).not.toMatch(/take the quiz/i);
  });

  it("varies copy across different lessons", () => {
    const labels = new Set(
      [0, 1, 2, 3, 4, 5].map((i) =>
        quizCtaCopy(`Lesson ${i}`, "Topic", i).label,
      ),
    );
    expect(labels.size).toBeGreaterThan(1);
  });
});
