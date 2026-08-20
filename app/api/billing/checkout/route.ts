import { createCheckoutSession } from "@/lib/billing/checkout";
import { getEnv } from "@/lib/env";
import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { captureEvent } from "@/lib/observability/analytics";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    return jsonWithSession(
      {
        url: null,
        message: "Stripe not wired in mock mode — set USE_MOCK_API=false",
      },
      sessionId,
      { status: 501 },
    );
  }

  const result = await createCheckoutSession();
  if (!result.ok) {
    return jsonWithSession(
      { url: null, message: result.message, code: result.code },
      sessionId,
      { status: result.status },
    );
  }

  captureEvent("upgrade_started");
  return jsonWithSession({ url: result.url, message: "Redirecting to Stripe" }, sessionId);
}
