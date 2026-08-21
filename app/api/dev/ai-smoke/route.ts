import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * Dev/staging config check for Perplexity — does **not** call the live API.
 *
 * Live smoke (tiny sonar call) is manual only: set PERPLEXITY_API_KEY locally
 * and invoke `chatCompletion` from a script or REPL. Never run paid calls in CI.
 */
export async function GET() {
  const env = getEnv();

  if (env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const configured = env.PERPLEXITY_API_KEY.trim().length > 0;

  return NextResponse.json({
    configured,
    /** True when mock mode is on — prefer fixtures over live AI. */
    useMock: env.USE_MOCK_API,
  });
}
