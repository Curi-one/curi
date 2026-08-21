import { getEnv } from "@/lib/env";

export function verifyCronAuth(request: Request): boolean {
  const secret = getEnv().CRON_SECRET.trim();
  if (!secret) {
    return getEnv().APP_ENV === "local";
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
