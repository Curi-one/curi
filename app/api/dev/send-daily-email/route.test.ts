import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/send-daily-email/route";

vi.mock("@/lib/email/dispatch-daily", () => ({
  dispatchDailyLessonEmails: vi.fn(),
}));

import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

describe("POST /api/dev/send-daily-email", () => {
  const SECRET = "cron-test-secret";

  function authed(url: string): Request {
    return new Request(url, {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET}` },
    });
  }

  beforeEach(() => {
    process.env.APP_ENV = "staging";
    process.env.RESEND_API_KEY = "re_test";
    process.env.CRON_SECRET = SECRET;
    vi.mocked(dispatchDailyLessonEmails).mockReset();
  });

  it("returns 404 on production", async () => {
    process.env.APP_ENV = "production";
    const res = await POST(
      new Request("http://localhost/api/dev/send-daily-email"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 401 without the cron bearer token", async () => {
    const res = await POST(
      new Request("http://localhost/api/dev/send-daily-email", {
        method: "POST",
      }),
    );
    expect(res.status).toBe(401);
    expect(dispatchDailyLessonEmails).not.toHaveBeenCalled();
  });

  it("returns 401 for a wrong bearer token", async () => {
    const res = await POST(
      new Request("http://localhost/api/dev/send-daily-email", {
        method: "POST",
        headers: { authorization: "Bearer nope" },
      }),
    );
    expect(res.status).toBe(401);
    expect(dispatchDailyLessonEmails).not.toHaveBeenCalled();
  });

  it("returns 503 when Resend is not configured", async () => {
    process.env.RESEND_API_KEY = "";
    const res = await POST(
      authed("http://localhost/api/dev/send-daily-email"),
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
      authed("http://localhost/api/dev/send-daily-email?email=you@example.com"),
    );

    expect(res.status).toBe(200);
    expect(dispatchDailyLessonEmails).toHaveBeenCalledWith({
      force: true,
      sample: false,
      onlyEmail: "you@example.com",
    });
  });
});
