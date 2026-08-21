import { sanitizeReturnTo } from "@/lib/auth/intent";

/**
 * Route access policy. Default is **member-only** — a path must be listed
 * here to be reachable by a guest (FLOWS F1: auth after first quiz).
 *
 * Guest-reachable surface:
 * - `/`            landing
 * - `/auth`        sign in / sign up (+ `/auth/callback`)
 * - `/clarify`     topic questions + depth
 * - `/generating`  outline stream
 * - `/explore`     catalogue (guests start paths from here — F3)
 * - `/courses/:id/lessons/:n` and its `/quiz` — lesson 1 needs no account
 *
 * Everything else (`/today`, `/library`, `/progress`, `/profile`, `/new`,
 * `/upgrade`, `/email-preview`) redirects to sign-in with a `returnTo`.
 */
const GUEST_EXACT_PATHS = new Set([
  "/",
  "/auth",
  "/clarify",
  "/generating",
  "/explore",
  "/design-system",
]);

const GUEST_PREFIXES = ["/auth/", "/courses/"];

/** Infrastructure paths middleware must never gate. */
const UNGATED_PREFIXES = ["/api/", "/_next/", "/favicon", "/robots", "/sitemap"];

export function isUngatedPath(pathname: string): boolean {
  return UNGATED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** True when a signed-out visitor may load this page. */
export function isGuestAllowedPath(pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (isUngatedPath(path)) {
    return true;
  }
  if (GUEST_EXACT_PATHS.has(path)) {
    return true;
  }
  return GUEST_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** True when this page requires a signed-in member. */
export function isMemberOnlyPath(pathname: string): boolean {
  return !isGuestAllowedPath(pathname);
}

/** Sign-in URL that returns the user to a member-only route after auth. */
export function memberSignInPath(returnTo = "/today"): string {
  const safe = sanitizeReturnTo(returnTo);
  return `/auth?intent=signin&returnTo=${encodeURIComponent(safe)}`;
}
