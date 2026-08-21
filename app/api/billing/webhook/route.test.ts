import { beforeEach, describe, expect, it, vi } from "vitest";

const getEnv = vi.fn();
const constructEvent = vi.fn();
const handleStripeEvent = vi.fn();

vi.mock("@/lib/env", () => ({
  getEnv: () => getEnv(),
}));

vi.mock("@/lib/billing/checkout", () => ({
  createStripeClient: () => ({
    webhooks: { constructEvent },
  }),
}));

vi.mock("@/lib/billing/webhooks", () => ({
  handleStripeEvent: (...args: unknown[]) => handleStripeEvent(...args),
}));

import { POST } from "@/app/api/billing/webhook/route";

describe("POST /api/billing/webhook", () => {
  beforeEach(() => {
    getEnv.mockReset();
    constructEvent.mockReset();
    handleStripeEvent.mockReset();
  });

  it("returns 400 when stripe-signature is missing", async () => {
    getEnv.mockReturnValue({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
    });

    const res = await POST(
      new Request("http://localhost/api/billing/webhook", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(res.status).toBe(400);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 503 when Stripe secrets are missing", async () => {
    getEnv.mockReturnValue({
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
    });

    const res = await POST(
      new Request("http://localhost/api/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=x" },
        body: "{}",
      }),
    );

    expect(res.status).toBe(503);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 200 when constructEvent succeeds", async () => {
    getEnv.mockReturnValue({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
    });
    const event = { id: "evt_1", type: "checkout.session.completed" };
    constructEvent.mockReturnValue(event);
    handleStripeEvent.mockResolvedValue({ handled: true });

    const res = await POST(
      new Request("http://localhost/api/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=x" },
        body: '{"ok":true}',
      }),
    );

    expect(res.status).toBe(200);
    expect(constructEvent).toHaveBeenCalledWith(
      '{"ok":true}',
      "t=1,v1=x",
      "whsec_x",
    );
    expect(handleStripeEvent).toHaveBeenCalledWith(event);
    await expect(res.json()).resolves.toEqual({ received: true });
  });
});
