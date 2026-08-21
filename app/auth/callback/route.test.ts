import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/auth/callback/route";

describe("GET /auth/callback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects to the login form with an error when the link has no token", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const res = await GET(
      new NextRequest("http://localhost:3000/auth/callback"),
    );

    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/auth?error=link");
  });
});
