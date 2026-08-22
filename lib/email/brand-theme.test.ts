import { describe, expect, it } from "vitest";
import {
  EMAIL_COLORS,
  emailPage,
  emailShell,
  emailWordmark,
  escapeHtml,
} from "@/lib/email/brand-theme";

describe("email brand theme", () => {
  it("escapes html", () => {
    expect(escapeHtml(`<script>"&"</script>`)).toBe(
      "&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;",
    );
  });

  it("includes wordmark and vermilion rule", () => {
    const mark = emailWordmark();
    expect(mark).toContain("Cu<em");
    expect(mark).toContain(EMAIL_COLORS.accent);
  });

  it("wraps content in branded shell", () => {
    const html = emailShell({
      title: "Test",
      header: { dateLabel: "22 Aug", metaLine: "Day 1 · Topic" },
      rows: "<tr><td>body</td></tr>",
      footer: { userName: "Ada" },
    });
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain(EMAIL_COLORS.canvas);
    expect(html).toContain("Day 1 · Topic");
    expect(html).toContain("Hi Ada");
  });

  it("renders transactional page with CTA styling", () => {
    const html = emailPage({
      title: "Unsubscribed",
      heading: "Unsubscribed",
      bodyHtml: "<p>Done.</p>",
      actionHtml: `<button type="submit">Go</button>`,
    });
    expect(html).toContain("Unsubscribed");
    expect(html).toContain("daily micro-learning");
  });
});
