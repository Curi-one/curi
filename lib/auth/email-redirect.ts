/** Post-auth callback URL with optional in-app return path (FLOWS auth / email links). */
export function authEmailRedirectTo(returnTo?: string): string {
  const appEnv = process.env.APP_ENV;
  const onLocalDev =
    process.env.NODE_ENV === "development" && process.env.VERCEL !== "1";
  let base: string;
  if (onLocalDev) {
    base = "http://localhost:3000/auth/callback";
  } else if (appEnv === "production") {
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
