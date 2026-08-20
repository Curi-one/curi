import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { createAdminClient } from "@/lib/supabase/admin";

export type UpdateProfileInput = {
  name?: string;
};

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; code: "unauthorized" | "invalid"; message: string };

export type UpdateProfileDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

export async function updateProfile(
  input: UpdateProfileInput,
  deps?: UpdateProfileDeps,
): Promise<UpdateProfileResult> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, code: "unauthorized", message: "Sign in required" };
  }

  const patch: Record<string, string> = {};
  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed) {
      return { ok: false, code: "invalid", message: "Name cannot be empty" };
    }
    patch.name = trimmed;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, code: "invalid", message: "Nothing to update" };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { error } = await admin.from("users").update(patch).eq("id", userId);
  if (error) {
    throw new Error(`users profile update failed: ${error.message}`);
  }

  return { ok: true };
}
