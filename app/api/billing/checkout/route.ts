import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  return jsonWithSession(
    { url: null, message: "Stripe not wired" },
    sessionId,
    { status: 501 },
  );
}
