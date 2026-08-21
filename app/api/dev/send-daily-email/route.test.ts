import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/send-daily-email/route";

vi.mock("@/lib/email/dispatch-daily", () => ({
  dispatchDailyLessonEmails: vi.fn(),
}));

import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

describe("POST /api/dev/send-daily-email", () => {
  beforeEach(() => {
    process.env.APP_ENV = "staging";
    process.env.RESEND_API_KEY = "re_test";
    vi.mocked(dispatchDailyLessonEmails).mockReset();
  });

  it("returns 404 on production", async () => {
    process.env.APP_ENV = "production";
    const res = await POST(
      new Request("http://localhost/api/dev/send-daily-email"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 503 when Resend is not configured", async () => {
    process.env.RESEND_API_KEY = "";
    const res = await POST(
      new Request("http://localhost/api/dev/send-daily-email"),
    );
    expect(res.status).toBe(503);
  });

  it("dispatches with force and email filter on staging", async () => {
    vi.mocked(dispatchDailyLessonEmails).mockResolvedValue({
      scanned: 1,
      eligible: 1,
      sent: 1,
      skipped: 0,
      errors: [],
    });

    const res = await POST(
      new Request(
        "http://localhost/api/dev/send-daily-email?email=you@example.com",
      ),
    );

    expect(res.status).toBe(200);
    expect(dispatchDailyLessonEmails).toHaveBeenCalledWith({
      force: true,
      sample: false,
      onlyEmail: "you@example.com",
    });
  });
});
