import { NextResponse } from "next/server";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { CreateDeckRequestSchema } from "@/lib/notes/schemas";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

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

  const parsed = CreateDeckRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const result = store.createNoteDeck(sessionId, parsed.data.name);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: 404 },
    );
  }

  return jsonWithSession({ deck: result.data }, sessionId, { status: 201 });
}
