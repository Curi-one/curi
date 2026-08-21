import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/email/open/route";

vi.mock("@/lib/auth/establish-session", () => ({
  establishSessionForEmail: vi.fn(),
}));

import { establishSessionForEmail } from "@/lib/auth/establish-session";
import { buildSignedEmailOpenUrl, lessonPagePath } from "@/lib/email/signed-open-link";

describe("GET /api/email/open", () => {
  beforeEach(() => {
    process.env.APP_ENV = "staging";
    process.env.CRON_SECRET = "test-secret";
    vi.mocked(establishSessionForEmail).mockReset().mockResolvedValue(undefined);
  });

  it("redirects to the lesson after establishing a session", async () => {
    const path = lessonPagePath("course-1", 2);
    const openUrl = buildSignedEmailOpenUrl("learner@example.com", path);
    const req = new Request(openUrl);
    const res = await GET(new Request(openUrl));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`https://stage.curi.one${path}`);
    expect(establishSessionForEmail).toHaveBeenCalledWith(
      "learner@example.com",
      path,
    );
  });

  it("redirects to auth when the link is invalid", async () => {
    const res = await GET(
      new Request("https://stage.curi.one/api/email/open?p=bad&s=bad"),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth?error=link");
    expect(establishSessionForEmail).not.toHaveBeenCalled();
  });
});
