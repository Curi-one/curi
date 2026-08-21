# Runbook — Curi ops

Deploy, rollback, rotate secrets, and launch checklist for [stage.curi.one](https://stage.curi.one) / production.

## Design system showcase

Staging / local only: [https://stage.curi.one/design-system](https://stage.curi.one/design-system)

Gated by `APP_ENV` (`local` \| `staging`). Production returns 404.



```bash
git push origin staging
# Vercel auto-deploys Preview/staging domain
```

### Production (`main` → www.curi.one)

1. Merge PR into `main` after staging smoke.
2. Confirm Vercel Production deployment succeeds.
3. Smoke F1 (guest clarify → lesson → quiz → auth) and F2 (Today).

## Rollback

1. Vercel → Project **curi** → Deployments → promote previous Production deployment.
2. Or `git revert` the bad commit on `main` and push.
3. If a migration is the cause: do **not** drop columns blindly — write a forward-fix migration.

## Secrets rotation

| Secret | Where | Notes |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (Preview + Prod) | Rotate in Supabase → Settings → API; update Vercel; redeploy |
| `PERPLEXITY_API_KEY` | Vercel | Rotate in Perplexity dashboard |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Vercel | Test mode on Preview; live on Production |
| `STRIPE_PRICE_ID` | Vercel | Academy $10/mo price |
| `SENTRY_DSN` | Vercel | Optional until Slice 7 exit |
| `NEXT_PUBLIC_POSTHOG_KEY` | Vercel | Optional until Slice 7 exit |
| `CRON_SECRET` | Vercel | Required for `/api/dev/seed` and `/api/cron/daily-email` |
| `RESEND_API_KEY` | Vercel Preview + Prod | Resend dashboard → API Keys |
| `EMAIL_FROM` | Vercel Preview + Prod | e.g. `Curi <lessons@curi.one>` — domain must be verified in Resend |

After rotating: Redeploy the affected environment.

## Stripe webhook

Full ops guide (Dashboard setup, Vercel env, QA, CLI, launch checklist): **[`docs/STRIPE.md`](./STRIPE.md)**.

Endpoint: `POST /api/billing/webhook`

- Staging (test mode): `https://stage.curi.one/api/billing/webhook`
- Production (live mode): `https://www.curi.one/api/billing/webhook` (or Production URL from Vercel until custom domain is attached)
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Staging seed

```bash
curl -X POST https://stage.curi.one/api/dev/seed \
  -H "Authorization: Bearer $CRON_SECRET"
```

Demo user: `demo@curi.one` (staging OTP bypass `118833` when `APP_ENV=staging`).

## Daily lesson email (staging)

Requires [PR #20](https://github.com/Curi-one/curi/pull/20) merged and Vercel env:

- `RESEND_API_KEY` — Resend API key (server only)
- `EMAIL_FROM` — `Curi <lessons@curi.one>` (domain verified in Resend)
- `CRON_SECRET` — authorizes cron route; also set as GitHub Actions secret for hourly dispatch; **signs daily-email lesson deep links** (`/api/email/open`)

**Scheduling:** Vercel Hobby allows at most one cron per day in `vercel.json`, so hourly sends use GitHub Actions (`.github/workflows/daily-email-cron.yml`) calling the API route. Upgrade to Vercel Pro to use native hourly crons instead.

Manual test:

```bash
curl -s "https://stage.curi.one/api/cron/daily-email?force=1&email=you@example.com" \
  -H "Authorization: Bearer $CRON_SECRET"
```

`force=1` skips delivery hour, weekend, and already-sent-today checks (for manual QA). Optional `email=` limits to one inbox.

User must have **Email → Send daily email** on, a due lesson today, and the current hour must match their delivery time (user timezone).

Preview (no send): Profile → Email → **Preview today's email**, or `GET /api/me/email-preview` when signed in.

## Production checklist (launch)

- [ ] Branch protection on `main`
- [ ] Attach `www.curi.one` then `curi.one` (apex → www)
- [ ] Production env: Supabase, Perplexity, Stripe live, Sentry, PostHog
- [ ] RLS verified; service role never in client bundle
- [ ] Stripe live webhook receiving events
- [ ] Sentry + PostHog receiving events
- [ ] Smoke F1–F2 on staging immediately before attach

## Observability

- Errors: `lib/observability/sentry.ts` (logs until `SENTRY_DSN` set; then wire `@sentry/nextjs`).
- Product events: `lib/observability/analytics.ts` — north star: `path_created`, `lesson_completed`, `auth_completed`, `upgrade_started`, `upgrade_completed`.
