import { createPortalSession } from "@/lib/billing/checkout";
import { getEnv } from "@/lib/env";
import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    return jsonWithSession(
      { url: null, message: "Stripe portal not available in mock mode" },
      sessionId,
      { status: 501 },
    );
  }

  const result = await createPortalSession();
  if (!result.ok) {
    return jsonWithSession(
      { url: null, message: result.message, code: result.code },
      sessionId,
      { status: result.status },
    );
  }

  return jsonWithSession({ url: result.url }, sessionId);
}
