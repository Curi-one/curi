import { getEnv } from "@/lib/env";

/** Design system showcase is for local + staging QA only — never production. */
export function isDesignSystemEnabled(
  appEnv: ReturnType<typeof getEnv>["APP_ENV"] = getEnv().APP_ENV,
): boolean {
  return appEnv === "local" || appEnv === "staging";
}
