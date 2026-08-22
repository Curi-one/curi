import { describe, expect, it } from "vitest";
import { buildLessonNoteCards } from "@/lib/notes/lesson-cards";

describe("buildLessonNoteCards", () => {
  it("builds cards from quiz questions and takeaways", () => {
    const cards = buildLessonNoteCards({
      topic: "Term Sheets",
      lessonTitle: "Liquidation preferences",
      quiz: [
        {
          prompt: "Who gets paid first?",
          options: ["Common", "Preferred", "Employees", "Founders"],
          correctIndex: 1,
          explanation: "Preferred stockholders have liquidation preference.",
        },
      ],
      takeaways: ["Liquidation preference determines payout order."],
    });
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0]?.front).toContain("Who gets paid first");
    expect(cards[0]?.back).toContain("Preferred");
    expect(cards.some((c) => c.front.startsWith("Takeaway"))).toBe(true);
  });

  it("caps output at six cards", () => {
    const cards = buildLessonNoteCards({
      topic: "Topic",
      lessonTitle: "Lesson",
      quiz: Array.from({ length: 5 }, (_, i) => ({
        prompt: `Question ${i}`,
        options: ["A", "B", "C", "D"],
        correctIndex: 0,
        explanation: `Explanation ${i}`,
      })),
      takeaways: ["t1", "t2", "t3"],
    });
    expect(cards.length).toBeLessThanOrEqual(6);
  });
});
