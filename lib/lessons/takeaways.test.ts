import { describe, expect, it } from "vitest";
import { getLessonTakeaways } from "@/lib/lessons/takeaways";

describe("getLessonTakeaways", () => {
  it("returns three takeaways that mention the topic", () => {
    const takeaways = getLessonTakeaways("Unit Economics");
    expect(takeaways).toHaveLength(3);
    expect(takeaways[1]).toContain("Unit Economics");
    expect(takeaways.every((t) => t.length > 20)).toBe(true);
  });

  it("works for any topic string", () => {
    const takeaways = getLessonTakeaways("Term Sheets");
    expect(takeaways).toHaveLength(3);
    expect(takeaways[0]).toMatch(/surface|incentive|trade-off/i);
  });
});
