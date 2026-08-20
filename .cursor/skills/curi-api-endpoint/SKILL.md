---
name: curi-api-endpoint
description: Adds or changes Curi Next.js API routes with Zod validation and TDD. Use for app/api routes, domain services, Supabase queries, or plan enforcement.
---

# Curi API endpoint

Read `docs/ARCHITECTURE.md`, `DATA.md`, `DECISIONS.md`.

## Steps

1. Define Zod schemas (request + response).
2. Write `route.test.ts` — expect status, body, auth failures.
3. Implement Route Handler.
4. Enforce: session, plan limits, RLS via user-scoped client.

## Patterns

```typescript
// Fail closed
const session = await getSession();
if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

const parsed = CreateCourseSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
```

## Idempotency

Lesson/quiz completion: unique constraint on activity; return 200 on duplicate.

Skill pairing: `curi-tdd` for tests, `curi-perplexity` if handler calls AI.
