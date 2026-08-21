# Stripe (Academy billing)

Ops guide for **staging (test mode)** and **production (live mode)**. Product code lives in `lib/billing/*` and `app/api/billing/*`. Do not commit secret values.

**Product:** Curi Academy · **$10/month** subscription · free plan = **2 active paths** (`docs/DECISIONS.md`).

---

## Architecture

```
Upgrade UI ──POST /api/billing/checkout──▶ Stripe Checkout Session
                                              │
                     success_url              │  webhook
                     /today?upgraded=1        ▼
Member Today ◀──────────────────── POST /api/billing/webhook
                                              │
                                              ▼
                                    handleStripeEvent()
                                              │
                                              ▼
                                      users.plan = academy | free
                                      (+ stripe_customer_id)

Profile ──POST /api/billing/portal──▶ Stripe Customer Portal
         (cancel / invoices) ──webhook──▶ users.plan = free
```

| Event | Effect |
|---|---|
| `checkout.session.completed` | `plan = academy`, store `stripe_customer_id` |
| `customer.subscription.updated` | `active` / `trialing` / `past_due` → academy; else → free |
| `customer.subscription.deleted` | `plan = free` |

Checkout sets `client_reference_id`, session `metadata.curi_user_id`, and `subscription_data.metadata.curi_user_id` so webhooks can map Stripe → Curi user.

Middleware matcher excludes `/api/*`, so the webhook Route Handler receives the **raw body** for signature verification.

---

## Environment variables

| Variable | Staging (Preview) | Production | Notes |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` | Server only |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (test endpoint) | `whsec_…` (live endpoint) | Per webhook endpoint |
| `STRIPE_PRICE_ID` | Test Price id `price_…` | Live Price id `price_…` | Academy $10/mo recurring |
| `APP_ENV` | `staging` | `production` | Success/cancel URLs |
| `USE_MOCK_API` | **`false`** for real Stripe | forced off | Mock mode returns 501 on checkout |

Also required for plan writes: Supabase service role + app tables (`users.plan`, `users.stripe_customer_id`).

`.env.example` lists names only. Local: put test keys in `.env.local` (gitignored).

---

## Vercel env mapping

| Vercel scope | Branch / target | Stripe mode |
|---|---|---|
| **Preview** (and branch alias `stage.curi.one`) | `staging` | **Test** keys + test `STRIPE_PRICE_ID` + test webhook secret |
| **Production** | `main` | **Live** keys + live `STRIPE_PRICE_ID` + live webhook secret |

After changing env vars, redeploy the affected environment.

---

## Staging setup (Stripe **test mode**)

Work in the Stripe Dashboard with **Test mode** toggled on.

### 1. Product & Price

1. Products → Add product: **Curi Academy**.
2. Price: **$10.00 USD / month** recurring.
3. Copy the Price id (`price_…`) → Vercel Preview `STRIPE_PRICE_ID`.

### 2. Customer Portal

1. Settings → Billing → Customer portal.
2. Enable **cancel subscription**, invoice history, and payment method update as needed.
3. Save. Portal return URL is set in code to `{app}/profile`.

### 3. Webhook endpoint

1. Developers → Webhooks → Add endpoint.
2. URL: `https://stage.curi.one/api/billing/webhook`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Reveal signing secret → Vercel Preview `STRIPE_WEBHOOK_SECRET`.
5. Vercel Preview: `STRIPE_SECRET_KEY=sk_test_…`, `USE_MOCK_API=false`, `APP_ENV=staging`.

### 4. Manual QA (staging)

1. Free member with **2 active paths** (seed or create).
2. Try 3rd path → blocked; open **Upgrade**.
3. Checkout with test card **`4242 4242 4242 4242`**, any future expiry, any CVC.
4. Land on `/today?upgraded=1` → calm “Academy is active” confirmation; query param stripped.
5. Confirm `GET /api/me` (or Profile) shows Academy; create a **3rd path** successfully.
6. Profile → Billing / Manage → Customer Portal → **Cancel**.
7. Webhook fires → plan back to **free**; 3rd-path create blocked again.

---

## Production setup (Stripe **live mode**)

Separate from test: different Product/Price, keys, and webhook.

### 1. Live Product & Price

1. Toggle **Live mode**.
2. Create Academy product + **$10/mo** price (or activate the same product in live).
3. Copy live `price_…` → Vercel **Production** `STRIPE_PRICE_ID`.

### 2. Live webhook

1. Webhooks → Add endpoint (live).
2. URL: Prefer **`https://www.curi.one/api/billing/webhook`** once the custom domain is attached.
3. Until launch, Production may only be on a `*.vercel.app` URL — use the **Production deployment URL from Vercel** for the webhook until `curi.one` / `www` are attached (`docs/ENVIRONMENTS.md`).
4. Same three events as staging.
5. Live signing secret → Vercel Production `STRIPE_WEBHOOK_SECRET`.
6. Production: `STRIPE_SECRET_KEY=sk_live_…`, `APP_ENV=production`.

### 3. Customer Portal (live)

Configure cancel + invoices in live mode the same way as test.

### 4. Smoke (live)

Use a real card on a throwaway account, or Stripe’s live test carefully; prefer confirming webhook delivery in Dashboard → Webhooks → attempts before announcing launch.

---

## Local webhook testing (Stripe CLI)

```bash
# Terminal A — app
pnpm dev

# Terminal B — forward test events
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Put the CLI-printed `whsec_…` in `.env.local` as `STRIPE_WEBHOOK_SECRET`, plus `STRIPE_SECRET_KEY=sk_test_…` and `STRIPE_PRICE_ID=price_…`. Set `USE_MOCK_API=false` and ensure Supabase (or your local DB path) can update `users`.

Trigger:

```bash
stripe trigger checkout.session.completed
```

For a full Checkout UI flow, use the Upgrade page against test keys (not mock mode).

---

## Failure modes / troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Upgrade shows “Billing is not configured…” / 503 | Missing `STRIPE_SECRET_KEY` or `STRIPE_PRICE_ID` | Set Preview/Prod env; redeploy |
| Checkout 501 | `USE_MOCK_API=true` | Set `false` on staging for real Stripe |
| Webhook 400 Missing signature | Non-Stripe caller or proxy stripping header | Call from Stripe; check raw body |
| Webhook 503 | Missing secret key or webhook secret | Align Dashboard secret with Vercel env |
| Webhook 400 constructEvent failed | Wrong `whsec` (test vs live / wrong endpoint) | Copy secret from the endpoint that receives events |
| Paid in Stripe but still free | Webhook not delivered or user id missing on session | Check endpoint logs; ensure `client_reference_id` / metadata set (code does this) |
| Portal 404 no_customer | Never completed Checkout | Complete Checkout once so `stripe_customer_id` is stored |
| Success URL wrong host | `APP_ENV` mismatch | `staging` → stage.curi.one; `production` → www.curi.one |

---

## Launch checklist

- [ ] Staging test purchase upgrades plan; 3rd path unlocks; cancel returns to free
- [ ] Preview env: test keys + price + webhook secret; `USE_MOCK_API=false`
- [ ] Production env: live keys + live price + live webhook secret
- [ ] Live webhook URL matches Production hostname (vercel.app until custom domain)
- [ ] Customer Portal enabled (cancel + invoices) in live mode
- [ ] No secrets in git; rotation noted in `docs/RUNBOOK.md`
- [ ] Slice 6 exit: “Test purchase on staging upgrades plan; 3rd path unlocks” (`docs/ROADMAP.md`)

See also: short pointer in [`docs/RUNBOOK.md`](./RUNBOOK.md) · flow F6 in [`docs/FLOWS.md`](./FLOWS.md).
