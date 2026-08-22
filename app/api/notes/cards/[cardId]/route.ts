import { NextResponse } from "next/server";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { UpdateCardRequestSchema } from "@/lib/notes/schemas";
import { getMockStore } from "@/lib/mock/store";

type RouteContext = { params: Promise<{ cardId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId } = resolveSession(request);
  const { cardId } = await context.params;

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

  const parsed = UpdateCardRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const result = store.updateNoteCard(sessionId, cardId, parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: 404 },
    );
  }

  return jsonWithSession({ card: result.data }, sessionId);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId } = resolveSession(_request);
  const { cardId } = await context.params;

  if (!getEnv().USE_MOCK_API) {
    return NextResponse.json(
      { error: "not_available", code: "not_available" },
      { status: 503 },
    );
  }

  const store = getMockStore();
  const result = store.deleteNoteCard(sessionId, cardId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: 404 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
