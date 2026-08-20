import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveSession } from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

const bodySchema = z.object({
  persona: z.enum(["guest", "member"]),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { sessionId } = resolveSession(request);
  getMockStore().setPersona(sessionId, parsed.data.persona);
  return NextResponse.json({ ok: true });
}
