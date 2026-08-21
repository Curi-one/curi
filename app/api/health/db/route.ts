import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EXPECTED_TABLES = [
  "content_cache",
  "users",
  "courses",
  "course_lessons",
  "lesson_content",
  "quiz_questions",
  "lesson_activity",
  "pending_courses",
] as const;

/**
 * GET /api/health/db — verifies Postgres connectivity and expected tables.
 * Uses service role when configured; never returns secrets or connection strings.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const tables: string[] = [];

    for (const table of EXPECTED_TABLES) {
      const { error } = await supabase
        .from(table)
        .select("*", { head: true, count: "exact" })
        .limit(0);

      if (!error) {
        tables.push(table);
      } else if (!isMissingRelation(error.message)) {
        return NextResponse.json(
          { ok: false, error: "database_unreachable" },
          { status: 503 },
        );
      }
    }

    return NextResponse.json({
      ok: tables.includes("content_cache"),
      tables,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_URL/i.test(message)) {
      return NextResponse.json(
        { ok: false, error: "supabase_not_configured" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "database_unreachable" },
      { status: 503 },
    );
  }
}

function isMissingRelation(message: string): boolean {
  return /relation .* does not exist|could not find the table|schema cache/i.test(
    message,
  );
}
