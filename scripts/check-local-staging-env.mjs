#!/usr/bin/env node
/**
 * Validates .env.local for Option 2 (local → staging Supabase).
 * Usage: node scripts/check-local-staging-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy .env.example and configure.");
  process.exit(1);
}

const text = readFileSync(envPath, "utf8");
const get = (key) => {
  const quoted = text.match(new RegExp(`^${key}="([^"]*)"`, "m"));
  if (quoted) return quoted[1];
  const bare = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return bare?.[1]?.trim() ?? "";
};

const checks = [
  ["APP_ENV", get("APP_ENV"), (v) => v === "staging"],
  ["USE_MOCK_API", get("USE_MOCK_API"), (v) => v === "false"],
  [
    "NEXT_PUBLIC_SUPABASE_URL",
    get("NEXT_PUBLIC_SUPABASE_URL"),
    (v) => v.startsWith("https://") && !v.includes("[SENSITIVE]"),
  ],
  [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    get("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    (v) => v.startsWith("eyJ") && v.length > 100,
  ],
  [
    "SUPABASE_SERVICE_ROLE_KEY",
    get("SUPABASE_SERVICE_ROLE_KEY"),
    (v) => v.startsWith("eyJ") && v.length > 100,
  ],
];

let ok = true;
for (const [name, value, valid] of checks) {
  if (!valid(value)) {
    ok = false;
    console.error(`✗ ${name}${value ? " (invalid)" : " (missing)"}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

if (!ok) {
  console.error(
    "\nPaste SUPABASE_SERVICE_ROLE_KEY from:\nhttps://supabase.com/dashboard/project/xoyqmwmudqoncwxvtkps/settings/api\nThen restart: pnpm dev",
  );
  process.exit(1);
}

console.log("\nReady for staging Supabase on localhost.");
