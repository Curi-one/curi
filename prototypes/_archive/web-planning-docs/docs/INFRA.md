# Curi — Infrastructure & Operations

**Version:** 1.0  
**Date:** May 2026

> This document covers deployment, environment configuration, monitoring, and operational runbooks.

---

## Hosting & Infrastructure

| Service | Provider | Plan |
|---|---|---|
| Web hosting | Vercel Pro | $20/mo |
| Database | Supabase Pro | $25/mo |
| Email delivery | Resend | Pay-per-use (~$0.001/email) |
| AI generation | Anthropic API | Pay-per-use (~$0.003/lesson) |
| Payments | Stripe | 2.9% + 30¢ per transaction |
| Error tracking | Sentry Developer | Free (10k errors/mo) |
| Analytics | PostHog Cloud | Free up to 1M events/mo |
| DNS | Cloudflare | Free |

**Total infrastructure cost at launch: ~$50/month** (excl. Anthropic + Stripe transaction fees)

---

## Domain & DNS

Primary domain: `curi.co`

| Record | Type | Value |
|---|---|---|
| `@` | A | Vercel IP (from Vercel DNS setup) |
| `www` | CNAME | `cname.vercel-dns.com` |
| `lessons` | CNAME | Resend sending domain |
| `_dmarc` | TXT | `v=DMARC1; p=quarantine; rua=mailto:dmarc@curi.co` |

Email sending domain: `lessons@curi.co`

---

## Environments

### Local Development

```bash
# Clone and install
git clone https://github.com/[org]/curi.git
cd curi
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in Supabase local dev credentials

# Start Supabase locally
supabase start

# Run migrations
supabase db push

# Seed development data
pnpm db:seed

# Start dev server
pnpm dev
```

### Staging

URL: `https://staging.curi.co`  
Branch: `staging`  
Database: Separate Supabase project (staging)  
Stripe: Test mode keys  
Anthropic: Real API key (small usage)

Auto-deployed on push to `staging` branch.

### Production

URL: `https://curi.co`  
Branch: `main`  
Database: Production Supabase project  
Stripe: Live mode keys  

Auto-deployed on merge to `main`. Requires passing CI.

---

## Environment Variables

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # Server-side ONLY — never expose

# === ANTHROPIC ===
ANTHROPIC_API_KEY=sk-ant-...                 # Server-side ONLY

# === STRIPE ===
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...                     # Server-side ONLY
STRIPE_WEBHOOK_SECRET=whsec_...             # Server-side ONLY
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...

# === RESEND ===
RESEND_API_KEY=re_...                        # Server-side ONLY
RESEND_WEBHOOK_SECRET=...                    # Server-side ONLY
RESEND_FROM_EMAIL=lessons@curi.co

# === POSTHOG ===
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# === SENTRY ===
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...                        # Deploy only

# === APP ===
NEXT_PUBLIC_APP_URL=https://curi.co
CRON_SECRET=...                              # Random 32-byte hex — cron auth
ADMIN_EMAILS=awaisibrahim@gmail.com          # Comma-separated admin emails
```

---

## Vercel Configuration

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/crons/daily-email",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/crons/cleanup",
      "schedule": "0 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/webhooks/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Cron Security

All cron endpoints check:
```typescript
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

Vercel automatically sets the `Authorization: Bearer {CRON_SECRET}` header when invoking cron routes (when `CRON_SECRET` is set as an environment variable).

---

## Database Operations

### Migrations

All schema changes go through Supabase migrations:

```bash
# Create a new migration
supabase migration new add_referral_tracking

# Apply migrations to local DB
supabase db push

# Apply to remote (run in CI/CD for staging/production)
supabase db push --linked
```

### Backups

Supabase Pro includes:
- Daily automatic backups (retained 7 days)
- Point-in-time recovery (PITR) available on Pro plan

Manual backup before any major migration:
```bash
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Monitoring

Supabase dashboard shows:
- Query performance (slow query log)
- Database size
- Connection pool usage
- API request volume

Alert thresholds:
- DB CPU > 80% for 5 min → Slack alert
- Connection pool > 80% utilisation → Slack alert
- Storage > 80% of plan limit → Email alert

---

## Monitoring & Alerting

### Sentry

Error tracking for both client-side React errors and server-side API route errors.

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: 'curi',
  project: 'curi-web',
  silent: true,
  widenClientFileUpload: true,
});
```

Alert rules:
- Any new issue affecting >5% of requests → immediate Slack alert
- Unhandled promise rejection in API route → immediate alert
- Claude API timeout/error → alert within 5 min
- Stripe webhook failure → alert immediately

### Uptime Monitoring

Use Vercel's built-in uptime checks + a free external monitor (e.g., UptimeRobot):
- Check: `GET https://curi.co` every 5 minutes
- Check: `GET https://curi.co/api/health` every 5 minutes
- Alert: email + Slack if down for > 2 consecutive checks

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  // Lightweight DB ping
  const { error } = await supabase.from('users').select('id').limit(1);
  
  return NextResponse.json({
    status: error ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}
```

---

## Runbooks

### Runbook: Daily Email Fails to Send

1. Check Vercel cron logs (Dashboard → Functions → Cron)
2. Check Resend dashboard for send errors
3. Check Sentry for API errors in `/api/crons/daily-email`
4. If Resend is down: emails will be missed. No retry — Resend sends are idempotent per `last_email_sent_at` check. Next day's cron will send the next lesson.
5. If it's a code error: hotfix and redeploy. Check if users were skipped using: `SELECT * FROM users WHERE last_email_sent_at < CURRENT_DATE AND email_enabled = true`

### Runbook: Claude API Errors

Symptoms: Lesson reader shows loading spinner for >10s; Sentry alert fires.

1. Check Anthropic status page (status.anthropic.com)
2. If Anthropic is down: lesson content cannot be generated. Cached lessons still work.
3. Show user-friendly error: *"Your lesson is being prepared. Refresh in a moment."*
4. On recovery: lesson generation retries automatically on next request (no stored failure state)

### Runbook: Stripe Webhook Failures

1. Check Stripe Dashboard → Developers → Webhooks → Recent events
2. Failed webhooks can be replayed from the Stripe Dashboard
3. Common cause: deployment changed API route before webhook processed
4. Verify: `STRIPE_WEBHOOK_SECRET` matches current Stripe webhook endpoint secret

### Runbook: Database Connection Pool Exhaustion

1. Check Supabase Dashboard → Database → Connections
2. Short-term: restart the app (Vercel → Redeploy)
3. Medium-term: enable Supabase connection pooling (PgBouncer) if not already
4. Long-term: audit queries for missing connection releases or N+1 patterns

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
```

Deployments to Vercel happen automatically via Vercel's GitHub integration (not via GitHub Actions).

---

## Security Checklist

Before each production deployment:

- [ ] No `console.log` with sensitive data in API routes
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` used in client-side code
- [ ] All new API routes have auth checks
- [ ] All new API routes have RLS-compatible Supabase queries
- [ ] New Stripe webhook handlers verify signature
- [ ] No new environment variables committed to repo

---

*Curi — curiosity, engineered.*
