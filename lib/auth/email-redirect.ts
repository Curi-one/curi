/** Post-auth callback URL with optional in-app return path (FLOWS auth / email links). */
export function authEmailRedirectTo(returnTo?: string): string {
  const appEnv = process.env.APP_ENV;
  let base: string;
  if (appEnv === "production") {
    base = "https://www.curi.one/auth/callback";
  } else if (appEnv === "staging") {
    base = "https://stage.curi.one/auth/callback";
  } else {
    base = "http://localhost:3000/auth/callback";
  }
  const safe = returnTo?.trim();
  if (
    safe &&
    safe.startsWith("/") &&
    !safe.startsWith("//") &&
    safe !== "/today"
  ) {
    const url = new URL(base);
    url.searchParams.set("next", safe);
    return url.toString();
  }
  return base;
}
