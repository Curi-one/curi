import { NextResponse } from "next/server";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { UpdateDeckRequestSchema } from "@/lib/notes/schemas";
import { getMockStore } from "@/lib/mock/store";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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

  const parsed = UpdateDeckRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const result = store.updateNoteDeck(sessionId, deckId, parsed.data.name);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: 404 },
    );
  }

  return jsonWithSession({ deck: result.data }, sessionId);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId } = resolveSession(_request);
  const { deckId } = await context.params;

  if (!getEnv().USE_MOCK_API) {
    return NextResponse.json(
      { error: "not_available", code: "not_available" },
      { status: 503 },
    );
  }

  const store = getMockStore();
  const result = store.deleteNoteDeck(sessionId, deckId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: 404 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
