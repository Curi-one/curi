import { describe, expect, it } from "vitest";
import { BRAND_PALETTE } from "@/lib/brand/palette";
import {
  curiositySnapshot,
  dailyLessonSubject,
  renderDailyLessonEmail,
} from "@/lib/email/daily-lesson-html";

const payload = {
  to: "learner@example.com",
  userName: "Awais",
  streak: 8,
  dateLabel: "21 August 2026",
  emailFormat: "Curiosity",
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

  it("renders curiosity peek with title, snapshot, and strong CTA — not full lesson", () => {
    const html = renderDailyLessonEmail(payload);
    expect(html).toContain("How a SAFE converts to equity");
    expect(html).toContain("Also due today");
    expect(html).toContain("The Nash equilibrium");
    expect(html).toContain("One");
    expect(html).toContain("Open today's lessons →");
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain(BRAND_PALETTE.accent);
    expect(html).toContain("Unsubscribe");
    // Curiosity: first takeaway only — not the full takeaways list or body
    expect(html).not.toContain("Key takeaways");
    expect(html).not.toContain("Two");
    expect(html).not.toContain("Three");
    expect(html).not.toContain(
      "A startup raises $200k on a SAFE with a $5M cap.",
    );
    expect(html).not.toContain("Two numbers usually govern the conversion.");
  });

  it("prefers first takeaway for snapshot", () => {
    expect(curiositySnapshot(payload.featured)).toBe("One");
  });

  it("falls back to pullQuote then truncated body then calm line", () => {
    expect(
      curiositySnapshot({
        ...payload.featured,
        takeaways: [],
      }),
    ).toBe("The cap sets a ceiling on the price used to convert.");

    expect(
      curiositySnapshot({
        ...payload.featured,
        takeaways: [],
        pullQuote: undefined,
      }),
    ).toBe("A startup raises $200k on a SAFE with a $5M cap.");

    const long =
      "Word ".repeat(60).trim() +
      " end.";
    const snap = curiositySnapshot({
      ...payload.featured,
      takeaways: [],
      pullQuote: undefined,
      bodyParagraphs: [long],
    });
    expect(snap.length).toBeLessThanOrEqual(201);
    expect(snap.endsWith("…")).toBe(true);

    expect(
      curiositySnapshot({
        ...payload.featured,
        takeaways: [],
        pullQuote: undefined,
        bodyParagraphs: [],
      }),
    ).toBe("Today's lesson is ready");
  });
});
