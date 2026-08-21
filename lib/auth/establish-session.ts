import type { SupabaseClient } from "@supabase/supabase-js";
import { authEmailRedirectTo } from "@/lib/auth/email-redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type EstablishSessionDeps = {
  admin?: SupabaseClient;
  createServerClient?: () => Promise<SupabaseClient>;
};

/** Mint a one-time Supabase session for a known member email (email deep links). */
export async function establishSessionForEmail(
  email: string,
  returnTo?: string,
  deps?: EstablishSessionDeps,
): Promise<void> {
  const admin = deps?.admin ?? createAdminClient();
  const createServer = deps?.createServerClient ?? createClient;
  const supabase = await createServer();

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: authEmailRedirectTo(returnTo) },
  });

  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw new Error(linkError?.message ?? "Could not create sign-in link");
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error) {
    throw new Error(error.message);
  }
}
