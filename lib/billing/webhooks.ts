import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureEvent } from "@/lib/observability/analytics";

export type WebhookDeps = {
  admin?: SupabaseClient;
};

async function setPlanByUserId(
  admin: SupabaseClient,
  userId: string,
  plan: "free" | "academy",
  stripeCustomerId?: string,
): Promise<void> {
  const patch: Record<string, string> = { plan };
  if (stripeCustomerId) {
    patch.stripe_customer_id = stripeCustomerId;
  }
  const { error } = await admin.from("users").update(patch).eq("id", userId);
  if (error) {
    throw new Error(`users plan update failed: ${error.message}`);
  }
}

async function setPlanByCustomerId(
  admin: SupabaseClient,
  customerId: string,
  plan: "free" | "academy",
): Promise<void> {
  const { error } = await admin
    .from("users")
    .update({ plan })
    .eq("stripe_customer_id", customerId);
  if (error) {
    throw new Error(`users plan by customer failed: ${error.message}`);
  }
}

function customerIdFrom(value: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if ("deleted" in value && value.deleted) return null;
  return value.id;
}

/**
 * Apply Stripe webhook events → users.plan.
 * Idempotent: setting the same plan twice is fine.
 */
export async function handleStripeEvent(
  event: Stripe.Event,
  deps?: WebhookDeps,
): Promise<{ handled: boolean }> {
  const admin = deps?.admin ?? createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.client_reference_id ||
        session.metadata?.curi_user_id ||
        null;
      const customerId = customerIdFrom(session.customer);
      if (!userId) {
        return { handled: false };
      }
      await setPlanByUserId(
        admin,
        userId,
        "academy",
        customerId ?? undefined,
      );
      captureEvent("upgrade_completed", { userId });
      return { handled: true };
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = customerIdFrom(sub.customer);
      if (!customerId) return { handled: false };
      const active =
        sub.status === "active" ||
        sub.status === "trialing" ||
        sub.status === "past_due";
      await setPlanByCustomerId(
        admin,
        customerId,
        active ? "academy" : "free",
      );
      return { handled: true };
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = customerIdFrom(sub.customer);
      if (!customerId) return { handled: false };
      await setPlanByCustomerId(admin, customerId, "free");
      return { handled: true };
    }
    default:
      return { handled: false };
  }
}
