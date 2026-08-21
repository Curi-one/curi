import type { SupabaseClient } from "@supabase/supabase-js";
import type { LibraryResponse } from "@/lib/api/schemas";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { courseRowToSummary } from "@/lib/courses/summary";
import { createAdminClient } from "@/lib/supabase/admin";

const EMPTY_LIBRARY: LibraryResponse = {
  exploring: [],
  mastered: [],
  shelved: [],
};

export type GetLibraryDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

function mapDbStatus(status: string): keyof LibraryResponse | null {
  if (status === "active") return "exploring";
  if (status === "completed") return "mastered";
  if (status === "shelved") return "shelved";
  return null;
}

export async function getLibrary(
  deps?: GetLibraryDeps,
): Promise<LibraryResponse> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return EMPTY_LIBRARY;
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data, error } = await admin
    .from("courses")
    .select("id, topic, depth, progress, total, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`courses library load failed: ${error.message}`);
  }

  const library: LibraryResponse = {
    exploring: [],
    mastered: [],
    shelved: [],
  };

  for (const row of data ?? []) {
    const tab = mapDbStatus(String(row.status));
    if (!tab) continue;
    library[tab].push(
      courseRowToSummary({
        id: String(row.id),
        topic: String(row.topic),
        depth: row.depth,
        progress: row.progress as number,
        total: row.total as number,
      }),
    );
  }

  return library;
}
