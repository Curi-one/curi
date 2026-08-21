import { describe, expect, it, vi } from "vitest";
import {
  createCheckoutSession,
  createPortalSession,
  isStripeBillingConfigured,
} from "@/lib/billing/checkout";
import { handleStripeEvent } from "@/lib/billing/webhooks";

describe("createCheckoutSession", () => {
  it("returns unauthorized without user", async () => {
    const result = await createCheckoutSession({
      getUser: async () => null,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "unauthorized",
      status: 401,
    });
  });

  it("rejects empty priceId even with an injected Stripe mock", async () => {
    const stripe = {
      customers: { create: vi.fn() },
      checkout: { sessions: { create: vi.fn() } },
    };

    const result = await createCheckoutSession({
      stripe: stripe as never,
      getUser: async () => ({ id: "user-1", email: "a@b.com" }),
      priceId: "",
    });

    expect(result).toMatchObject({
      ok: false,
      code: "not_configured",
      status: 503,
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("creates checkout URL for free member", async () => {
    const sessionsCreate = vi.fn().mockResolvedValue({
      url: "https://checkout.stripe.com/test",
    });
    const customersCreate = vi.fn().mockResolvedValue({ id: "cus_1" });
    const stripe = {
      customers: { create: customersCreate },
      checkout: { sessions: { create: sessionsCreate } },
    };
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                stripe_customer_id: null,
                email: "a@b.com",
                plan: "free",
              },
              error: null,
            }),
          }),
        }),
        update,
      })),
    };

    const result = await createCheckoutSession({
      stripe: stripe as never,
      admin: admin as never,
      getUser: async () => ({ id: "user-1", email: "a@b.com" }),
      priceId: "price_test",
      appUrl: "http://localhost:3000",
    });

    expect(result).toEqual({
      ok: true,
      url: "https://checkout.stripe.com/test",
    });
    expect(customersCreate).toHaveBeenCalled();
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        client_reference_id: "user-1",
        metadata: { curi_user_id: "user-1" },
        subscription_data: {
          metadata: { curi_user_id: "user-1" },
        },
      }),
    );
  });
});

describe("isStripeBillingConfigured", () => {
  it("is false when secret or price is missing", () => {
    const prevSecret = process.env.STRIPE_SECRET_KEY;
    const prevPrice = process.env.STRIPE_PRICE_ID;
    process.env.STRIPE_SECRET_KEY = "";
    process.env.STRIPE_PRICE_ID = "price_x";
    expect(isStripeBillingConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_ID = "";
    expect(isStripeBillingConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = prevSecret;
    process.env.STRIPE_PRICE_ID = prevPrice;
  });
});

describe("createPortalSession", () => {
  it("creates portal URL when customer exists", async () => {
    const portalCreate = vi.fn().mockResolvedValue({
      url: "https://billing.stripe.com/test",
    });
    const stripe = {
      billingPortal: { sessions: { create: portalCreate } },
    };
    const admin = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: "cus_1" },
              error: null,
            }),
          }),
        }),
      })),
    };

    const result = await createPortalSession({
      stripe: stripe as never,
      admin: admin as never,
      getUser: async () => ({ id: "user-1" }),
      appUrl: "http://localhost:3000",
    });

    expect(result).toEqual({
      ok: true,
      url: "https://billing.stripe.com/test",
    });
  });
});

describe("handleStripeEvent", () => {
  it("sets academy on checkout.session.completed", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = { from: vi.fn(() => ({ update })) };

    const result = await handleStripeEvent(
      {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "user-1",
            customer: "cus_1",
            metadata: {},
          },
        },
      } as never,
      { admin: admin as never },
    );

    expect(result.handled).toBe(true);
    expect(update).toHaveBeenCalledWith({
      plan: "academy",
      stripe_customer_id: "cus_1",
    });
  });

  it("sets free on subscription deleted", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = { from: vi.fn(() => ({ update })) };

    const result = await handleStripeEvent(
      {
        type: "customer.subscription.deleted",
        data: { object: { customer: "cus_1", status: "canceled" } },
      } as never,
      { admin: admin as never },
    );

    expect(result.handled).toBe(true);
    expect(update).toHaveBeenCalledWith({ plan: "free" });
  });

  it("sets academy on subscription.updated when active", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = { from: vi.fn(() => ({ update })) };

    const result = await handleStripeEvent(
      {
        type: "customer.subscription.updated",
        data: { object: { customer: "cus_1", status: "active" } },
      } as never,
      { admin: admin as never },
    );

    expect(result.handled).toBe(true);
    expect(update).toHaveBeenCalledWith({ plan: "academy" });
  });

  it("sets free on subscription.updated when canceled or unpaid", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = { from: vi.fn(() => ({ update })) };

    for (const status of ["canceled", "unpaid"] as const) {
      update.mockClear();
      const result = await handleStripeEvent(
        {
          type: "customer.subscription.updated",
          data: { object: { customer: "cus_1", status } },
        } as never,
        { admin: admin as never },
      );

      expect(result.handled).toBe(true);
      expect(update).toHaveBeenCalledWith({ plan: "free" });
    }
  });
});
