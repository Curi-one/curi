# Curi

Daily micro-learning — **production app** at repo root. Prototypes and docs are separate on purpose.

## Repository map

```
Curi/
├── app/              Next.js application (ship this)
├── lib/              Domain logic, API helpers, AI client (later)
├── components/       Product UI components
├── docs/             Product & engineering spec (source of truth)
├── prototypes/       Reference UX only — not deployed
│   ├── web/          Vite web prototype
│   └── mobile/       Phone HTML mock
├── .cursor/          Agent rules & skills
└── AGENTS.md         Agent orchestration
```

| Path | Purpose |
|---|---|
| [`docs/`](./docs/) | PRD, flows, architecture, TDD, UX principles |
| [`prototypes/`](./prototypes/) | Visual reference — read [`prototypes/README.md`](./prototypes/README.md) |
| [`app/`](./app/) | What users will use in production |

Start with [`docs/DECISIONS.md`](./docs/DECISIONS.md) and [`AGENTS.md`](./AGENTS.md).

## Development (production app)

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

```bash
pnpm test && pnpm lint && pnpm typecheck
```

Routes: `/` · `/today` · `/api/health`

## Status

**Slice 1b ✓** — all v1 flows in the frontend with mock `/api/*` routes. Run `pnpm dev` and walk F1–F7 locally.

Slice 2+ replaces mock handler bodies with Supabase + Perplexity; UI stays stable.
