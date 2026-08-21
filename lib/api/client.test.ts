import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearClientCache } from "@/lib/api/client-cache";

describe("apiFetch GET cache", () => {
  beforeEach(() => {
    clearClientCache();
    sessionStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    clearClientCache();
    sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("dedupes concurrent getMe calls to one network request", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        calls += 1;
        await new Promise((r) => setTimeout(r, 15));
        return {
          ok: true,
          json: async () => ({
            session: { kind: "member", plan: "free", email: "a@b.c" },
          }),
        };
      }),
    );

    const { getMe } = await import("@/lib/api/client");
    const [a, b] = await Promise.all([getMe(), getMe()]);
    expect(calls).toBe(1);
    expect(a.session.kind).toBe("member");
    expect(b.session.kind).toBe("member");

    await getMe();
    expect(calls).toBe(1);
  });

  it("clears cache after a mutation so the next GET refetches", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls += 1;
        const method = (init?.method ?? "GET").toUpperCase();
        if (method === "POST") {
          return {
            ok: true,
            json: async () => ({ ok: true }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            session: { kind: "member", plan: "free", email: "a@b.c" },
          }),
        };
      }),
    );

    const { getMe, postSignOut } = await import("@/lib/api/client");
    await getMe();
    expect(calls).toBe(1);
    await postSignOut();
    expect(calls).toBe(2);
    await getMe();
    expect(calls).toBe(3);
  });
});
