import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cacheKey,
  clearClientCache,
  getCached,
  invalidateClientCache,
  readThroughCache,
  setCached,
} from "@/lib/api/client-cache";

describe("client-cache", () => {
  beforeEach(() => {
    clearClientCache();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearClientCache();
    sessionStorage.clear();
  });

  it("returns null when empty", () => {
    expect(getCached("GET:/api/me")).toBeNull();
  });

  it("stores and returns values within TTL", () => {
    setCached("GET:/api/me", { session: { kind: "member" } }, 60_000);
    expect(getCached("GET:/api/me")).toEqual({
      session: { kind: "member" },
    });
  });

  it("expires after TTL", () => {
    setCached("GET:/api/feed", { due: [] }, 1_000);
    vi.advanceTimersByTime(1_001);
    expect(getCached("GET:/api/feed")).toBeNull();
  });

  it("persists to sessionStorage and rehydrates after memory clear", () => {
    setCached("GET:/api/progress", { streak: 3 }, 60_000);
    // Simulate remount: memory wiped, storage kept
    clearClientCache({ memoryOnly: true });
    expect(getCached("GET:/api/progress")).toEqual({ streak: 3 });
  });

  it("invalidateClientCache clears everything", () => {
    setCached("GET:/api/me", { ok: true }, 60_000);
    setCached("GET:/api/feed", { due: [] }, 60_000);
    invalidateClientCache();
    expect(getCached("GET:/api/me")).toBeNull();
    expect(getCached("GET:/api/feed")).toBeNull();
  });

  it("invalidateClientCache can clear by path prefix", () => {
    setCached("GET:/api/me", { ok: true }, 60_000);
    setCached("GET:/api/feed", { due: [] }, 60_000);
    setCached("GET:/api/library", { paths: [] }, 60_000);
    invalidateClientCache(["/api/feed", "/api/library"]);
    expect(getCached("GET:/api/me")).toEqual({ ok: true });
    expect(getCached("GET:/api/feed")).toBeNull();
    expect(getCached("GET:/api/library")).toBeNull();
  });

  it("cacheKey normalizes method and path", () => {
    expect(cacheKey("get", "/api/me")).toBe("GET:/api/me");
    expect(cacheKey("GET", "/api/feed")).toBe("GET:/api/feed");
  });

  it("readThroughCache hits network once for concurrent callers", async () => {
    vi.useRealTimers();
    clearClientCache();
    sessionStorage.clear();

    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 20));
      return { streak: 7 };
    };

    const [a, b, c] = await Promise.all([
      readThroughCache("GET:/api/progress", fetcher),
      readThroughCache("GET:/api/progress", fetcher),
      readThroughCache("GET:/api/progress", fetcher),
    ]);

    expect(calls).toBe(1);
    expect(a).toEqual({ streak: 7 });
    expect(b).toEqual({ streak: 7 });
    expect(c).toEqual({ streak: 7 });

    // Second wave uses cache — no extra network
    const d = await readThroughCache("GET:/api/progress", fetcher);
    expect(calls).toBe(1);
    expect(d).toEqual({ streak: 7 });
  });

  it("readThroughCache skipCache bypasses and refreshes", async () => {
    vi.useRealTimers();
    clearClientCache();
    sessionStorage.clear();

    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return { n: calls };
    };

    await readThroughCache("GET:/api/me", fetcher);
    const fresh = await readThroughCache("GET:/api/me", fetcher, {
      skipCache: true,
    });
    expect(calls).toBe(2);
    expect(fresh).toEqual({ n: 2 });
    expect(getCached("GET:/api/me")).toEqual({ n: 2 });
  });
});
