# Curi

Daily micro-learning — **Next.js monolith** at repo root.

## Links

| | |
|---|---|
| Staging | [stage.curi.one](https://stage.curi.one) (`staging` branch) |
| GitHub | [Curi-one/curi](https://github.com/Curi-one/curi) |
| Linear | [Curi v1](https://linear.app/curi-one/project/curi-v1-05a9e167751d) |
| Spec | [`docs/`](./docs/) |

Production custom domains (`curi.one` / `www`) are **detached until launch**.

## Repository map

```
Curi/
├── app/              Next.js application (ship this)
├── lib/              Domain logic, API helpers, AI client
├── components/       Product UI
├── docs/             Product & engineering spec
├── prototypes/       UX reference only — not deployed
├── .cursor/          Agent rules & skills
└── AGENTS.md         Agent orchestration
```

## Architecture (short)

Browser → **Next.js on Vercel** (`/api/*`) → **Supabase** (auth + Postgres + `content_cache`) → **Perplexity** on cache miss only.

Today: UI + mock APIs (`USE_MOCK_API=true`). Slice 2+ replaces mock handlers; contracts stay in `lib/api/schemas.ts`.

Details: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) · [`docs/ENVIRONMENTS.md`](./docs/ENVIRONMENTS.md).

## Local development

```bash
cp .env.example .env.local
# Set PERPLEXITY_API_KEY (required for Slice 2+ AI); keep USE_MOCK_API=true for now
pnpm install
pnpm dev
```

```bash
pnpm test && pnpm lint && pnpm typecheck
```

## Staging

Push to **`staging`** → Vercel Preview → **https://stage.curi.one**

## Status

**Slice 1b ✓** — all v1 flows + mock `/api/*` on staging.  
Next: Linear **Slice 2** (Supabase + Perplexity) — see [`docs/TRACKING.md`](./docs/TRACKING.md).
