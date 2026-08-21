import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  // No default: an unset value must not silently enable the mock store.
  // Resolved by resolveUseMockApi below.
  USE_MOCK_API: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  PERPLEXITY_API_KEY: z.string().default(""),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  SENTRY_DSN: z.string().default(""),
  CRON_SECRET: z.string().default(""),
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().default(""),
  /** HMAC key for signed email deep links. Falls back to CRON_SECRET. */
  EMAIL_LINK_SECRET: z.string().default(""),
});

type RawEnv = z.infer<typeof envSchema>;

export type AppEnv = Omit<RawEnv, "USE_MOCK_API"> & {
  USE_MOCK_API: boolean;
};

/**
 * Mock mode replaces Supabase auth with a cookie-keyed in-memory store where
 * the sign-in code is a constant — i.e. no authentication at all. It must
 * never be reachable in production, and a missing env var must fail closed
 * rather than default it on.
 */
export function resolveUseMockApi(
  appEnv: RawEnv["APP_ENV"],
  raw: RawEnv["USE_MOCK_API"],
): boolean {
  if (appEnv === "production") {
    return false;
  }
  if (raw === undefined) {
    return appEnv === "local";
  }
  return raw === "true";
}

function readRawEnv(): Record<string, string | undefined> {
  return {
    APP_ENV: process.env.APP_ENV,
    USE_MOCK_API: process.env.USE_MOCK_API,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_LINK_SECRET: process.env.EMAIL_LINK_SECRET,
  };
}

function withResolvedFlags(raw: RawEnv): AppEnv {
  return {
    ...raw,
    USE_MOCK_API: resolveUseMockApi(raw.APP_ENV, raw.USE_MOCK_API),
  };
}

/** Typed env with safe defaults when vars are missing (never throws in dev). */
export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(readRawEnv());
  if (parsed.success) {
    return withResolvedFlags(parsed.data);
  }
  return withResolvedFlags(envSchema.parse({}));
}
