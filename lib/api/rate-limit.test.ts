import { beforeEach, describe, expect, it } from "vitest";
import {
  clientIp,
  rateLimit,
  resetRateLimits,
} from "@/lib/api/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows up to the limit then refuses", () => {
    const now = 1_000_000;
    expect(rateLimit("k", 3, 60_000, now).ok).toBe(true);
    expect(rateLimit("k", 3, 60_000, now).ok).toBe(true);
    expect(rateLimit("k", 3, 60_000, now).ok).toBe(true);

    const blocked = rateLimit("k", 3, 60_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("keys are independent", () => {
    const now = 1_000_000;
    rateLimit("a", 1, 60_000, now);
    expect(rateLimit("a", 1, 60_000, now).ok).toBe(false);
    expect(rateLimit("b", 1, 60_000, now).ok).toBe(true);
  });

  it("opens a fresh window after expiry", () => {
    const now = 1_000_000;
    rateLimit("k", 1, 60_000, now);
    expect(rateLimit("k", 1, 60_000, now).ok).toBe(false);
    expect(rateLimit("k", 1, 60_000, now + 60_001).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(
      clientIp(
        new Request("http://localhost/", {
          headers: { "x-real-ip": "9.9.9.9" },
        }),
      ),
    ).toBe("9.9.9.9");
    expect(clientIp(new Request("http://localhost/"))).toBe("unknown");
  });
});
