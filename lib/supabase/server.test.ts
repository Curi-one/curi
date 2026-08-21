import { describe, expect, it } from "vitest";
import { requestFromIncoming } from "@/lib/supabase/server";

describe("requestFromIncoming", () => {
  it("keeps cookies after the original request body was read", async () => {
    const request = new Request("http://localhost/api/auth", {
      method: "POST",
      headers: {
        cookie: "sb-verify=pkce",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "learner@example.com" }),
    });

    await request.json();

    const next = requestFromIncoming(request);
    expect(next.cookies.get("sb-verify")?.value).toBe("pkce");
  });
});
