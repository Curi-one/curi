import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  USE_MOCK_API: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
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
});

export type AppEnv = z.infer<typeof envSchema>;

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
  };
}

/** Typed env with safe defaults when vars are missing (never throws in dev). */
export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(readRawEnv());
  if (parsed.success) {
    return parsed.data;
  }
  return envSchema.parse({});
}
