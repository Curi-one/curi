---
name: curi-flow-verify
description: Verifies Curi implementation against FLOWS.md exit criteria. Use before merge, after a slice, or when user asks if a flow works correctly.
---

# Curi flow verification

Read `docs/FLOWS.md` for the target flow (F1–F7).

## Per flow

| Flow | Verify |
|---|---|
| F1 | Guest: topic → clarify → depth → generate → L1 → quiz → auth → Today |
| F2 | Multi-path Today; due/done; complete sheet CTAs |
| F3 | Explore + clarify; free cap → upgrade |
| F4 | Library tabs; path map |
| F6 | Upgrade at 3rd path |
| F7 | Progress + profile |

## Output

```markdown
## Flow verification — F[n]

| Step | Spec | Status | Evidence |
|---|---|---|---|
| ... | ... | pass/fail | test file or route |
```

Run `pnpm test` and relevant e2e if present. Fail the task if Critical steps fail.
