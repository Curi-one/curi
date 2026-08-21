import { createHmac, timingSafeEqual } from "node:crypto";
import { appBaseUrl } from "@/lib/email/urls";
import { getEnv } from "@/lib/env";

export type EmailOpenPayload = {
  email: string;
  to: string;
  exp: number;
};

/**
 * A valid link mints a full session for the payload's email, so treat it as a
 * bearer credential: short-lived, and scoped to the day's email. 24h matches
 * the daily send cadence — a link is superseded before it expires.
 */
const DEFAULT_TTL_SECONDS = 24 * 60 * 60;

/**
 * Dedicated key, falling back to CRON_SECRET. Never the service-role key:
 * that is the highest-privilege secret in the system and must not double as
 * an HMAC key handed out (in signature form) to every email recipient.
 */
function linkSigningSecret(): string {
  const dedicated = getEnv().EMAIL_LINK_SECRET.trim();
  if (dedicated) return dedicated;
  return getEnv().CRON_SECRET.trim();
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64url")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  return Buffer.from(value + pad, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("hex");
}

export function lessonPagePath(courseId: string, lessonIndex: number): string {
  return `/courses/${courseId}/lessons/${lessonIndex}?from=today`;
}

export function buildSignedEmailOpenUrl(
  email: string,
  returnTo: string,
  now = new Date(),
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
  const secret = linkSigningSecret();
  if (!secret) {
    return `${appBaseUrl()}${returnTo}`;
  }

  const payload: EmailOpenPayload = {
    email,
    to: returnTo,
    exp: Math.floor(now.getTime() / 1000) + ttlSeconds,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = signPayload(encoded, secret);
  const url = new URL("/api/email/open", appBaseUrl());
  url.searchParams.set("p", encoded);
  url.searchParams.set("s", sig);
  return url.toString();
}

export function parseSignedEmailOpenUrl(
  encodedPayload: string | null,
  signature: string | null,
  now = new Date(),
): EmailOpenPayload | null {
  const secret = linkSigningSecret();
  if (!secret || !encodedPayload || !signature) {
    return null;
  }

  const expected = signPayload(encodedPayload, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as EmailOpenPayload;
    if (
      !payload ||
      typeof payload.email !== "string" ||
      typeof payload.to !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(now.getTime() / 1000)) {
      return null;
    }
    if (!payload.to.startsWith("/") || payload.to.startsWith("//")) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
