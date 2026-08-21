import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/daily-email/route";

vi.mock("@/lib/email/dispatch-daily", () => ({
  dispatchDailyLessonEmails: vi.fn(),
}));

import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

describe("GET /api/cron/daily-email", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
    vi.mocked(dispatchDailyLessonEmails).mockReset();
  });

  it("requires cron auth", async () => {
    const res = await GET(new Request("http://localhost/api/cron/daily-email"));
    expect(res.status).toBe(401);
  });

  it("returns dispatch summary for authorized cron", async () => {
    vi.mocked(dispatchDailyLessonEmails).mockResolvedValue({
      scanned: 2,
      eligible: 1,
      sent: 1,
      skipped: 1,
      errors: [],
    });

    const res = await GET(
      new Request("http://localhost/api/cron/daily-email", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; sent: number };
    expect(body.ok).toBe(true);
    expect(body.sent).toBe(1);
  });
});
