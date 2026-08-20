import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY",
): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required for the Supabase admin (service role) client`,
    );
  }
  return value;
}

/** Service-role client for Route Handlers. Bypasses RLS — never import in client components. */
export function createAdminClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
