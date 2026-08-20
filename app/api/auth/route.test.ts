import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/route";
import { MOCK_AUTH_CODE } from "@/lib/mock/store";

describe("POST /api/auth", () => {
  const previousUseMockApi = process.env.USE_MOCK_API;

  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
  });

  afterEach(() => {
    if (previousUseMockApi === undefined) {
      delete process.env.USE_MOCK_API;
    } else {
      process.env.USE_MOCK_API = previousUseMockApi;
    }
  });

  it("email-only returns link step with mock devHint (not for UI)", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "dev@example.com" }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      step: string;
      devHint?: string;
    };
    expect(body).toMatchObject({
      ok: true,
      step: "link",
      devHint: MOCK_AUTH_CODE,
    });
  });

  it("email+code with valid mock code returns member session", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "curi_session=auth-test-session",
        },
        body: JSON.stringify({
          email: "dev@example.com",
          code: MOCK_AUTH_CODE,
          name: "Alex",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      session: { kind: string; email?: string; name?: string };
    };
    expect(body.session).toMatchObject({
      kind: "member",
      email: "dev@example.com",
      name: "Alex",
    });
  });

  it("rejects invalid mock code", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "dev@example.com",
          code: "000000",
        }),
      }),
    );

    expect(res.status).toBe(401);
  });
});
