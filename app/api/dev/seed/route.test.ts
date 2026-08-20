import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/seed/route";

vi.mock("@/lib/seed/staging-member", () => ({
  seedStagingMember: vi.fn().mockResolvedValue({
    userId: "demo-user",
    email: "demo@curi.one",
    courseIds: ["c1", "c2", "c3"],
    today: "2026-08-20",
  }),
}));

describe("POST /api/dev/seed", () => {
  const previousEnv = {
    APP_ENV: process.env.APP_ENV,
    CRON_SECRET: process.env.CRON_SECRET,
  };

  beforeEach(() => {
    process.env.APP_ENV = "staging";
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (previousEnv.APP_ENV === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = previousEnv.APP_ENV;
    }
    if (previousEnv.CRON_SECRET === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = previousEnv.CRON_SECRET;
    }
  });

  it("returns 404 in production", async () => {
    process.env.APP_ENV = "production";
    const res = await POST(new Request("http://localhost/api/dev/seed", { method: "POST" }));
    expect(res.status).toBe(404);
  });

  it("seeds demo member on staging", async () => {
    const res = await POST(new Request("http://localhost/api/dev/seed", { method: "POST" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.email).toBe("demo@curi.one");
    expect(body.courseIds).toHaveLength(3);
  });

  it("requires CRON_SECRET when configured", async () => {
    process.env.CRON_SECRET = "test-secret";
    const res = await POST(new Request("http://localhost/api/dev/seed", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});
