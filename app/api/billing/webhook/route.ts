import { NextResponse } from "next/server";
import { createStripeClient } from "@/lib/billing/checkout";
import { handleStripeEvent } from "@/lib/billing/webhooks";
import { getEnv } from "@/lib/env";

export async function POST(request: Request) {
  const env = getEnv();
  const secret = env.STRIPE_WEBHOOK_SECRET.trim();
  if (!env.STRIPE_SECRET_KEY.trim() || !secret) {
    return NextResponse.json(
      { error: "Stripe webhooks not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  try {
    const stripe = createStripeClient();
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
