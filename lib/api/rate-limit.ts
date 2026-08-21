import { NextResponse } from "next/server";

/**
 * Best-effort fixed-window limiter.
 *
 * State is per-process, so on serverless each instance keeps its own counters
 * and the effective limit is (limit × instances). That is deliberate: it costs
 * nothing, needs no extra infrastructure, and turns "unbounded" into "bounded
 * by fan-out" for the endpoints that spend Perplexity credits or send mail.
 * Move to a shared store (Upstash/Redis) before relying on exact numbers.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Bound memory if a burst creates many distinct keys. */
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) {
      windows.delete(key);
    }
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  if (windows.size > MAX_TRACKED_KEYS) {
    sweep(now);
  }

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  );

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }
  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds,
  };
}

/** Caller IP, trusting the proxy headers Vercel sets. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Slow down and try again.", code: "rate_limited" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

/** Test hook. */
export function resetRateLimits(): void {
  windows.clear();
}
