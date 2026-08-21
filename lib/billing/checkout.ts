import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type StripeDeps = {
  stripe?: Stripe;
  admin?: SupabaseClient;
  getUser?: () => Promise<{ id: string; email?: string } | null>;
  priceId?: string;
  appUrl?: string;
};

function requireStripeSecret(): string {
  const key = getEnv().STRIPE_SECRET_KEY.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return key;
}

export function createStripeClient(secret = requireStripeSecret()): Stripe {
  return new Stripe(secret);
}

/** True when Checkout can run (secret + Academy price). Webhook also needs STRIPE_WEBHOOK_SECRET. */
export function isStripeBillingConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.STRIPE_SECRET_KEY.trim() && env.STRIPE_PRICE_ID.trim());
}

async function defaultGetUser(): Promise<{
  id: string;
  email?: string;
} | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email ?? undefined };
  } catch {
    return null;
  }
}

function appBaseUrl(): string {
  const env = getEnv().APP_ENV;
  if (env === "production") return "https://www.curi.one";
  if (env === "staging") return "https://stage.curi.one";
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function stripePriceId(): string {
  return getEnv().STRIPE_PRICE_ID.trim();
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; code: string; message: string; status: number };

export async function createCheckoutSession(
  deps?: StripeDeps,
): Promise<CheckoutResult> {
  const getUser = deps?.getUser ?? defaultGetUser;
  const user = await getUser();
  if (!user) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sign in required",
      status: 401,
    };
  }

  const priceId = deps?.priceId ?? stripePriceId();
  // Reject even when tests inject a Stripe mock — callers must pass priceId.
  if (!priceId) {
    return {
      ok: false,
      code: "not_configured",
      message: "Billing is not configured on this environment yet.",
      status: 503,
    };
  }

  let stripe: Stripe;
  try {
    stripe = deps?.stripe ?? createStripeClient();
  } catch {
    return {
      ok: false,
      code: "not_configured",
      message: "Billing is not configured on this environment yet.",
      status: 503,
    };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id, email, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.plan === "academy" || profile?.plan === "paid") {
    return {
      ok: false,
      code: "already_subscribed",
      message: "Already on Academy",
      status: 409,
    };
  }

  let customerId =
    typeof profile?.stripe_customer_id === "string"
      ? profile.stripe_customer_id
      : null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { curi_user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const base = deps?.appUrl ?? appBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/today?upgraded=1`,
    cancel_url: `${base}/upgrade`,
    client_reference_id: user.id,
    metadata: { curi_user_id: user.id },
    subscription_data: {
      metadata: { curi_user_id: user.id },
    },
  });

  if (!session.url) {
    return {
      ok: false,
      code: "stripe_error",
      message: "Checkout session missing URL",
      status: 502,
    };
  }

  return { ok: true, url: session.url };
}

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; code: string; message: string; status: number };

export async function createPortalSession(
  deps?: StripeDeps,
): Promise<PortalResult> {
  const getUser = deps?.getUser ?? defaultGetUser;
  const user = await getUser();
  if (!user) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sign in required",
      status: 401,
    };
  }

  let stripe: Stripe;
  try {
    stripe = deps?.stripe ?? createStripeClient();
  } catch {
    return {
      ok: false,
      code: "not_configured",
      message: "Billing is not configured on this environment yet.",
      status: 503,
    };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id;
  if (!customerId || typeof customerId !== "string") {
    return {
      ok: false,
      code: "no_customer",
      message: "No billing customer on file",
      status: 404,
    };
  }

  const base = deps?.appUrl ?? appBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/profile`,
  });

  return { ok: true, url: session.url };
}
