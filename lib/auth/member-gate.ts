import { sanitizeReturnTo } from "@/lib/auth/intent";

/** Sign-in URL that returns the user to a member-only route after auth. */
export function memberSignInPath(returnTo = "/today"): string {
  const safe = sanitizeReturnTo(returnTo);
  return `/auth?intent=signin&returnTo=${encodeURIComponent(safe)}`;
}
