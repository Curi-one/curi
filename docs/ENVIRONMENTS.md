# Environments

Three environments with **identical architecture** and **isolated data and secrets**. Never share a database between them.

**Tracking:** Linear workspace [Curi](https://linear.app/curi-one) — project **Curi v1**.

---

## Summary

| | Local | Staging | Production |
|---|---|---|---|
| **Purpose** | Development | Pre-release verification | Live users |
| **URL** | `http://localhost:3000` | `https://stage.curi.one` | `https://curi.one` → `www.curi.one` |
| **Git branch** | any | `staging` | `main` |
| **Deploy** | `pnpm dev` | Auto from `staging` | Auto from `main` — **custom domains off until launch** |
| **Vercel project** | — | `curi-one/curi` (Preview / branch alias) | same project (Production target) |
| **Database** | Supabase local or shared dev project | Dedicated Supabase (TBD) | Dedicated Supabase (TBD) |
| **API mode** | `USE_MOCK_API=true` until Slice 2+ | Mock until backends land | Real |
| **Stripe** | Test keys in `.env.local` (optional) | **Test mode** on Preview; `USE_MOCK_API=false` for real Checkout | **Live mode** |
| **Perplexity** | `.env.local`; `sonar` only | Preview env; `sonar` only (no `sonar-pro`) | Production env at launch; lesson body `sonar-pro` |
| **Auth email** | Console / Inbucket | Real delivery; **staging OTP `118833`** when mail is rate-limited; configure custom SMTP for heavy testing | Real users |
| **Data** | Disposable | Seeded, resettable | Protected |

---

## How it is wired today

```
GitHub Curi-one/curi
  ├── staging ──▶ Vercel Preview ──▶ stage.curi.one
  └── main    ──▶ Vercel Production ──▶ *.vercel.app only
                                         (curi.one / www detached until launch)

Local
  └── pnpm dev ──▶ localhost:3000 ──▶ mock /api/* (lib/mock/store)
```

| Service | Account / ID | Notes |
|---|---|---|
| GitHub | [Curi-one/curi](https://github.com/Curi-one/curi) | Public (Hobby); make private after Pro if desired |
| Vercel team | `curi-one` | Project **`curi`** (Next.js) |
| Staging domain | `stage.curi.one` | Assigned to git branch **`staging`** |
| Prod domains | `curi.one`, `www.curi.one` | Owned by team; **not** attached to project yet |
| Supabase | Project `xoyqmwmudqoncwxvtkps` | Healthy; **no app tables yet** |
| Linear | [linear.app/curi-one](https://linear.app/curi-one) | Delivery tracking |
| Cursor Origin | `awaisibrahim/curi` | Optional mirror; primary remote is GitHub |

Prototype project **`curi-prototype`** (Vite) is legacy — do not deploy product changes there.

---

## Promotion flow

```
feature branch
  → PR into staging (lint, typecheck, tests)
  → merge staging → auto deploy → smoke on stage.curi.one
  → PR staging → main
  → production deploy (vercel.app)
  → at launch: attach curi.one + www to Production
```

No production hot-fix without the same change on staging first.

---

## Environment variables

| Variable | Exposure | Environments |
|---|---|---|
| `APP_ENV` | Server | `local` \| `staging` \| `production` |
| `USE_MOCK_API` | Server | `true` until Slice 2+ backends |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | All (when wired) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | All (when wired) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | All (when wired) |
| `PERPLEXITY_API_KEY` | Server only | Local + Preview (set); Production at launch |
| `STRIPE_SECRET_KEY` | Server only | Staging **test** keys; Prod **live** keys — see [`docs/STRIPE.md`](./STRIPE.md) |
| `STRIPE_WEBHOOK_SECRET` | Server only | Staging, Prod (per webhook endpoint) |
| `STRIPE_PRICE_ID` | Server only | Academy $10/mo Price id (test vs live) |
| `SENTRY_DSN` | Server | Staging, Prod |
| `CRON_SECRET` | Server | Staging, Prod (when cron ships) |

`.env.example` lists names only — **never commit values**.  
Secrets live in `.env.local` (gitignored) and Vercel project env.

Do not infer business logic from hostname except OAuth/magic-link callback URLs.

---

## Local setup

```bash
cp .env.example .env.local
# Fill PERPLEXITY_API_KEY (and later Supabase keys)
pnpm install
pnpm dev
```

```bash
pnpm test && pnpm lint && pnpm typecheck
```

Optional: `supabase start` when local Postgres/Auth is needed.

**Seed (mock):** Dev persona toggle Guest / Member; member fixture has two paths (one due, one done).

---

## Staging

- URL: **https://stage.curi.one**
- Branch: **`staging`**
- Same UI as production; backends swap in per roadmap slice.
- Magic links may use a team catch-all — document when auth ships.
- Cron gated by `CRON_SECRET` until email is ready.

Redeploy after adding env vars if Preview deployment was created earlier:

```bash
git push origin staging
# or: Vercel dashboard → Redeploy latest staging deployment
```

---

## Production (launch)

1. Branch protection on `main`  
2. Attach `www.curi.one` then `curi.one` (apex → www, 308) to Production  
3. Set Production env vars (Supabase, Perplexity, Stripe live, Sentry)  
4. RLS verified; service role never in client bundle  
5. Smoke F1–F2 on staging immediately before attach  

---

## Production checklist (before first user)

- [ ] Branch protection on `main`  
- [ ] RLS verified on all user tables  
- [ ] Service role never in client bundle  
- [ ] Supabase PITR enabled (Pro)  
- [ ] Sentry + PostHog receiving events  
- [ ] Perplexity rate limits and app rate limits configured  
- [ ] `curi.one` / `www` attached and verified  
- [ ] Repo visibility / Vercel Pro decision if org private repos required  
