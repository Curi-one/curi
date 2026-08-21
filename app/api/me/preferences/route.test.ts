import { beforeEach, describe, expect, it } from "vitest";
import { GET, PATCH } from "@/app/api/me/preferences/route";
import { resetMockStore } from "@/lib/mock/store";

describe("GET/PATCH /api/me/preferences (mock)", () => {
  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
    resetMockStore();
  });

  it("GET returns defaults for member session", async () => {
    const res = await GET(
      new Request("http://localhost/api/me/preferences", {
        headers: { cookie: "curi_session=member-default" },
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      preferences: { seq: string; length: string };
    };
    expect(body.preferences.seq).toBe("straight");
    expect(body.preferences.length).toBe("medium");
  });

  it("PATCH updates learning profile fields", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/me/preferences", {
        method: "PATCH",
        headers: {
          cookie: "curi_session=member-default",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seq: "broad", length: "long" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      preferences: { seq: string; length: string };
    };
    expect(body.preferences.seq).toBe("broad");
    expect(body.preferences.length).toBe("long");
  });

  it("rejects guest session", async () => {
    const res = await GET(
      new Request("http://localhost/api/me/preferences", {
        headers: { cookie: "curi_session=guest-123" },
      }),
    );
    expect(res.status).toBe(401);
  });
});
