# Runbook — Curi ops

Deploy, rollback, rotate secrets, and launch checklist for [stage.curi.one](https://stage.curi.one) / production.

## Deploy

### Staging (`staging` branch → stage.curi.one)

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
| `CRON_SECRET` | Vercel | Required for `/api/dev/seed` outside local |

After rotating: Redeploy the affected environment.

## Stripe webhook

Endpoint: `POST /api/billing/webhook`

- Staging: Stripe test mode webhook → `https://stage.curi.one/api/billing/webhook`
- Production: live mode webhook → `https://www.curi.one/api/billing/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Staging seed

```bash
curl -X POST https://stage.curi.one/api/dev/seed \
  -H "Authorization: Bearer $CRON_SECRET"
```

Demo user: `demo@curi.one` (staging OTP bypass `118833` when `APP_ENV=staging`).

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
