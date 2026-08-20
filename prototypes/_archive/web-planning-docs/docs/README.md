# Curi — Documentation Index

**Status:** Planning  
**Last updated:** May 2026

> This folder contains all product, technical, and operational documentation for building Curi from prototype to production.

---

## Documents

| Document | What it covers |
|---|---|
| [ROADMAP.md](./ROADMAP.md) | **Start here.** Sequential build plan — 7 phases, ~16 weeks to production v1 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack decisions, directory structure, request flow diagrams |
| [DB_SCHEMA.md](./DB_SCHEMA.md) | Full PostgreSQL schema — includes `shared_lesson_cache` for SEO + cost reduction |
| [API_SPEC.md](./API_SPEC.md) | All API endpoints — request/response shapes, auth requirements, errors |
| [AI_CONTENT.md](./AI_CONTENT.md) | Claude API — shared lesson cache, SEO canonical generation, personalisation, cost model |
| [SEO.md](./SEO.md) | Public `/learn` routes, structured data, OG images, sitemap, conversion mechanics |
| [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md) | Email templates, delivery logic, deliverability requirements |
| [MONETISATION.md](./MONETISATION.md) | Pricing, plan limits, Stripe integration, upgrade flow |
| [ANALYTICS.md](./ANALYTICS.md) | Event taxonomy, North Star metric, dashboards, PostHog setup |
| [GTM.md](./GTM.md) | Go-to-market strategy, beachhead community, acquisition channels |
| [INFRA.md](./INFRA.md) | Hosting, environments, env vars, monitoring, runbooks |

**Existing docs (pre-planning):**
| Document | What it covers |
|---|---|
| [PRD.md](./PRD.md) | Product Requirements Document — full screen spec, features, user flows |

**Root-level docs:**
| Document | What it covers |
|---|---|
| `curi-brand-guidelines-v2.md` | Full brand & design system specification |
| `curi-icp.md` | Ideal Customer Profile — who Curi is built for and why |

---

## Build Sequence Summary

```
Phase 0 — Foundation             (2 weeks)
  Next.js 15 setup, Supabase auth + DB schema (incl. shared_lesson_cache), CI/CD

Phase 1 — Core Loop              (3 weeks)
  Real courses, real lessons, real quiz, real streak, real persistence
  ↳ Milestone: complete loop works end-to-end with real data

Phase 2 — AI Engine + SEO        (3 weeks)  ← expanded
  Claude API, shared lesson cache, pre-seed 420 canonical lessons,
  public /learn pages live and indexed
  ↳ Milestone: every topic generates real content; SEO pages in Google

Phase 3 — Email System           (2 weeks)
  Daily lesson email, transactional emails, unsubscribe
  ↳ Users receive a real email every morning

Phase 4 — Monetisation           (2 weeks)
  Stripe, server-side plan enforcement, upgrade flow
  ↳ First paying customer is possible

Phase 5 — Growth & Sharing       (1 week)
  Certificate PDF, share cards, referral tracking
  ↳ Word-of-mouth hooks exist

Phase 6 — Mobile & Perf          (2 weeks)
  PWA install, Lighthouse ≥ 85 mobile, performance budget
  ↳ App works on phone, installs to home screen

Phase 7 — Analytics & Ops        (1 week)
  PostHog events, Sentry alerts, dashboards, runbooks
  ↳ Production-ready operations
```

---

## Key Decisions

| Decision | Chosen | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes + Vercel-native; replaces Vite prototype |
| Database | Supabase | Managed Postgres + auth + RLS + storage in one |
| AI | Claude Sonnet 4.6 | Editorial quality, long-context, prompt caching |
| Email | Resend + React Email | Developer-first; component-based templates; great deliverability |
| Payments | Stripe | Industry standard; hosted checkout; no PCI scope |
| State management | Zustand | Replaces ~3,500-line monolithic App.jsx useState |
| Auth gate placement | After first quiz | Users experience the product before any commitment |
| Lesson generation timing | Lazy (on first read) | Only pay for Claude calls on lessons users actually read |
| Streak source of truth | `lesson_activity` table | Calculated from activity log, not stored as scalar |
| SEO + cost reduction via `shared_lesson_cache` | One table, two purposes | Canonical lessons (null-style) power `/learn` SEO pages; style-specific variants eliminate duplicate Claude calls across users |
| Canonical lesson pre-seed | Run before launch ($4.20) | Fills SEO pages day 1 and provides ~25% cache hit rate from first user |
| SEO funnel design | Full lesson public, quiz behind CTA | Gives genuine value freely; quiz + streak require account — creates high-intent signup path from organic traffic |

---

## North Star

**Lessons completed per active user per week**

Everything in this documentation exists to optimise that metric. If it doesn't contribute to that, it shouldn't be built.

---

*Curi — curiosity, engineered.*
