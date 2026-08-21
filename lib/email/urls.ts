import { getEnv } from "@/lib/env";

export function appBaseUrl(): string {
  const env = getEnv().APP_ENV;
  if (env === "production") return "https://www.curi.one";
  if (env === "staging") return "https://stage.curi.one";
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function emailFromAddress(): string {
  const from = getEnv().EMAIL_FROM.trim();
  return from || "Curi <hello@curi.one>";
}
