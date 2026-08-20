# Prototypes (reference only)

Visual and interaction reference for building the **production app** at the repo root (`app/`, `lib/`).

**Do not import** prototype code into the Next.js app. **Do not deploy** these folders.

| Folder | What it is |
|---|---|
| [`web/`](./web/) | Vite/React web prototype — full screen flows, admin, brand tokens |
| [`mobile/`](./mobile/) | Single-file phone mock — multi-path Today, stack navigation |
| [`_archive/`](./_archive/) | Superseded planning docs from prototype era — see root [`docs/`](../docs/) |

## When to use

- **Layout and chrome** — spacing, typography, tab bar, lesson reader feel  
- **Brand** — [`web/curi-brand-guidelines-v2.md`](./web/curi-brand-guidelines-v2.md), ICP in `web/curi-icp.md`  

## Source of truth for behaviour

[`../docs/FLOWS.md`](../docs/FLOWS.md) and [`../docs/DECISIONS.md`](../docs/DECISIONS.md) override prototypes where they differ.

## Running prototypes (optional)

```bash
# Web (Vite)
cd prototypes/web && npm install && npm run dev

# Mobile — open prototypes/mobile/index.html in a browser
```

These use their own dependencies; the main app uses `pnpm` at repo root.
