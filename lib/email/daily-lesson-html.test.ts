import { describe, expect, it } from "vitest";
import {
  dailyLessonSubject,
  renderDailyLessonEmail,
} from "@/lib/email/daily-lesson-html";

const payload = {
  to: "learner@example.com",
  userName: "Awais",
  streak: 8,
  dateLabel: "21 August 2026",
  emailFormat: "Full",
  featured: {
    topic: "Term Sheets",
    depthLabel: "Essentials",
    lessonTitle: "How a SAFE converts to equity",
    lessonIndex: 2,
    totalLessons: 12,
    bodyParagraphs: [
      "A startup raises $200k on a SAFE with a $5M cap.",
      "Two numbers usually govern the conversion.",
    ],
    pullQuote: "The cap sets a ceiling on the price used to convert.",
    takeaways: ["One", "Two", "Three"],
    tomorrowTitle: "Priced rounds and pro-rata",
  },
  alsoDue: [
    {
      topic: "Game theory",
      lessonTitle: "The Nash equilibrium",
      lessonUrl: "https://stage.curi.one/courses/x/lessons/1",
    },
  ],
  ctaUrl: "https://stage.curi.one/today",
  preferencesUrl: "https://stage.curi.one/profile?tab=email",
  unsubscribeUrl: "https://stage.curi.one/api/email/unsubscribe?token=abc",
  isAcademy: false,
};

describe("daily lesson email html", () => {
  it("builds a multi-path subject line", () => {
    expect(dailyLessonSubject(payload)).toBe(
      "2 lessons for today — How a SAFE converts to equity",
    );
  });

  it("renders prototype chrome and lesson content", () => {
    const html = renderDailyLessonEmail(payload);
    expect(html).toContain("How a SAFE converts to equity");
    expect(html).toContain("Also due today");
    expect(html).toContain("The Nash equilibrium");
    expect(html).toContain("Key takeaways");
    expect(html).toContain("Unsubscribe");
  });

  it("respects summary format by truncating body", () => {
    const html = renderDailyLessonEmail({
      ...payload,
      alsoDue: [],
      emailFormat: "Summary",
    });
    expect(html).toContain("A startup raises $200k");
    expect(html).not.toContain("Two numbers usually govern");
    expect(html).not.toContain("Key takeaways");
  });
});
