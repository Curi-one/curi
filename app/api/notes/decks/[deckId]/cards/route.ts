import { NextResponse } from "next/server";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { CreateCardRequestSchema } from "@/lib/notes/schemas";
import { getMockStore } from "@/lib/mock/store";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = resolveSession(request);
  const { deckId } = await context.params;

  if (!getEnv().USE_MOCK_API) {
    return NextResponse.json(
      { error: "not_available", code: "not_available" },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return invalidBodyResponse();
  }

  const parsed = CreateCardRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const result = store.addNoteCard(
    sessionId,
    deckId,
    parsed.data.front,
    parsed.data.back,
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: result.code === "not_found" ? 404 : 400 },
    );
  }

  return jsonWithSession({ card: result.data }, sessionId, { status: 201 });
}
