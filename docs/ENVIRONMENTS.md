# Environments

Three environments with **identical architecture** and **isolated data and secrets**. Never share a database between them.

---

## Summary

| | Local | Staging | Production |
|---|---|---|---|
| **Purpose** | Development | Pre-release verification | Live users |
| **URL** | `http://localhost:3000` | `https://stage.curi.one` | `https://curi.one` (apex → www) |
| **Deploy** | Developer machine | Auto from `staging` branch | Auto from `main` after CI — **domains off until launch** |
| **Database** | Supabase local or dedicated dev project | Dedicated Supabase project | Dedicated Supabase project |
| **Stripe** | Test mode | Test mode | Live mode |
| **Perplexity** | Real key, low usage | Real key | Real key |
| **Auth email** | Inbucket / console log | Real delivery, catch-all OK | Real users |
| **Data** | Disposable | Seeded, resettable | Protected |

---

## Promotion flow

```
feature branch
  → PR (lint, typecheck, tests)
  → merge staging
  → smoke F1 + F2 on staging
  → merge main
  → production
```

No production hot-fix without the same change on staging first.

---

## Environment variables

| Variable | Exposure | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | All |
| `PERPLEXITY_API_KEY` | Server only | All |
| `STRIPE_SECRET_KEY` | Server only | Staging (test), Prod (live) |
| `STRIPE_WEBHOOK_SECRET` | Server only | Staging, Prod |
| `SENTRY_DSN` | Server | Staging, Prod |
| `CRON_SECRET` | Server | Staging, Prod (when cron ships) |
| `APP_ENV` | Server | `local` \| `staging` \| `production` |

`.env.example` lists names only — never commit values. Vercel holds per-environment secrets.

Do not infer business logic from hostname except OAuth/magic-link callback URLs.

---

## Local setup (Slice 1+)

```bash
supabase start          # optional local Postgres + Auth
cp .env.example .env.local
pnpm install
pnpm dev
```

**Seed:** member with three paths (two due, one done today) so F2 is testable without repeating F1.

---

## Staging

- Same flows as production with test Stripe and seeded data.  
- Magic links may route to a team catch-all inbox — document the address.  
- Cron routes gated by `CRON_SECRET` until email is ready.

---

## Production checklist (before first user)

- [ ] Branch protection on `main`  
- [ ] RLS verified on all user tables  
- [ ] Service role never in client bundle  
- [ ] Supabase PITR enabled (Pro)  
- [ ] Sentry + PostHog receiving events  
- [ ] Perplexity rate limits and app rate limits configured
