import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/me/route";
import { POST as signOut } from "@/app/api/auth/signout/route";
import { POST as auth } from "@/app/api/auth/route";
import { MOCK_AUTH_CODE } from "@/lib/mock/store";

describe("GET /api/me + signout (mock)", () => {
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

  it("returns guest then member after auth, guest after signout", async () => {
    const cookie = "curi_session=me-flow-session";

    const meGuest = await GET(
      new Request("http://localhost/api/me", {
        headers: { cookie },
      }),
    );
    expect((await meGuest.json()).session.kind).toBe("guest");

    await auth(
      new Request("http://localhost/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: JSON.stringify({
          email: "me@example.com",
          code: MOCK_AUTH_CODE,
          name: "Sam",
        }),
      }),
    );

    const meMember = await GET(
      new Request("http://localhost/api/me", {
        headers: { cookie },
      }),
    );
    expect((await meMember.json()).session).toMatchObject({
      kind: "member",
      email: "me@example.com",
      name: "Sam",
    });

    const out = await signOut(
      new Request("http://localhost/api/auth/signout", {
        method: "POST",
        headers: { cookie },
      }),
    );
    expect((await out.json()).session.kind).toBe("guest");
  });
});
