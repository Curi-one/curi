# Curi — Technical Architecture

**Version:** 1.0  
**Date:** May 2026

> This document describes the production architecture for Curi: the stack, how components connect, and the key decisions behind each choice.

---

## Stack Overview

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server components, API routes, edge functions, Vercel-native |
| **Language** | TypeScript (strict) | Type safety across API ↔ client boundary |
| **Styling** | TailwindCSS 4 + CSS custom properties | Design token system maps directly to CSS variables |
| **Icons** | Lucide React | Already in prototype; tree-shakeable |
| **Database** | Supabase (PostgreSQL 15) | Managed Postgres, auth, RLS, realtime, storage — one vendor |
| **Auth** | Supabase Auth | Magic link + email; JWT sessions; integrates with Supabase RLS |
| **AI** | Anthropic Claude API (claude-sonnet-4-6) | Lesson generation, quiz generation, personalisation |
| **Email** | Resend + React Email | Developer-friendly; excellent deliverability; component-based templates |
| **Payments** | Stripe | Industry standard; hosted checkout; Customer Portal |
| **File Storage** | Supabase Storage | Certificates, audio files, OG images |
| **Cron Jobs** | Vercel Cron | Daily email dispatch; pending course cleanup |
| **Analytics** | PostHog | Self-hostable; event tracking; funnels |
| **Error tracking** | Sentry | Real-time error alerts; source map support |
| **OG Images** | Vercel OG (`@vercel/og`) | Edge-rendered, fast, no Puppeteer overhead |
| **PDF** | React PDF (`@react-pdf/renderer`) | Certificate generation |
| **Validation** | Zod | Runtime schema validation on all API boundaries |
| **State (client)** | Zustand | Lightweight; replaces monolithic `useState` in App.jsx |
| **Deployment** | Vercel | Zero-config Next.js hosting; edge network |

---

## Directory Structure

```
curi/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route group — no auth required
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx
│   │   └── unsubscribe/
│   │       └── page.tsx          # Email unsubscribe handler
│   │
│   ├── (app)/                    # Route group — auth required
│   │   ├── layout.tsx            # Auth check + sidebar layout
│   │   ├── today/                # Today feed
│   │   ├── explore/              # Browse catalogue
│   │   ├── library/              # Library
│   │   ├── dashboard/            # Dashboard + analytics
│   │   ├── course/[id]/          # Course path map
│   │   │   └── lesson/[index]/   # Lesson reader + quiz
│   │   ├── flashcards/           # Flashcard decks
│   │   └── profile/              # Settings
│   │
│   ├── (auth)/                   # Auth screens — partially authenticated
│   │   ├── onboarding/           # 4-step onboarding
│   │   ├── generating/           # Generating screen
│   │   └── auth/                 # Sign up / sign in
│   │
│   ├── api/                      # API routes
│   │   ├── courses/
│   │   │   ├── route.ts          # POST /api/courses
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET/PATCH /api/courses/[id]
│   │   │       └── lessons/
│   │   │           └── [index]/
│   │   │               ├── route.ts     # GET lesson content
│   │   │               └── quiz/
│   │   │                   └── route.ts # GET quiz questions / POST answers
│   │   ├── feed/
│   │   │   └── route.ts          # GET /api/feed
│   │   ├── library/
│   │   │   └── route.ts          # GET /api/library
│   │   ├── billing/
│   │   │   ├── checkout/route.ts
│   │   │   └── portal/route.ts
│   │   ├── share/
│   │   │   ├── lesson/[id]/route.ts
│   │   │   └── course/[id]/route.ts
│   │   ├── crons/
│   │   │   ├── daily-email/route.ts
│   │   │   └── cleanup/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   │
│   └── layout.tsx                # Root layout (fonts, PostHog, Sentry)
│
├── components/
│   ├── ui/                       # Primitive components (button, input, badge, etc.)
│   ├── lesson/                   # LessonReader, LessonCard, AudioPlayer
│   ├── quiz/                     # QuizOption, QuizScreen
│   ├── course/                   # CoursePath, CourseCard, ProgressBar
│   ├── feed/                     # TodayFeed, FeedCard
│   ├── library/                  # LibraryCard, TrophyCard
│   ├── navigation/               # Sidebar, Header, MobileNav
│   ├── streaks/                  # StreakMoment, StreakStrip, ContributionGraph
│   └── modals/                   # LessonCompleteModal, CoursePreviewModal, UpgradeModal
│
├── lib/
│   ├── ai/
│   │   ├── generate-lesson.ts    # Claude lesson generation
│   │   ├── generate-quiz.ts      # Claude quiz generation
│   │   ├── prompts.ts            # Prompt templates
│   │   └── cache.ts              # Prompt caching config
│   ├── db/
│   │   ├── client.ts             # Supabase client (server + browser)
│   │   ├── courses.ts            # Course queries
│   │   ├── lessons.ts            # Lesson + content queries
│   │   ├── quiz.ts               # Quiz queries
│   │   ├── streak.ts             # Streak calculation
│   │   └── feed.ts               # Feed construction
│   ├── email/
│   │   ├── send.ts               # Resend wrapper
│   │   └── unsubscribe.ts        # Token generation + validation
│   ├── stripe/
│   │   ├── client.ts             # Stripe SDK instance
│   │   └── webhooks.ts           # Webhook event handlers
│   ├── certificate.ts            # PDF certificate generation
│   ├── og.ts                     # OG image generation helpers
│   └── utils.ts                  # Shared utilities
│
├── emails/                       # React Email templates
│   ├── daily-lesson.tsx
│   ├── welcome.tsx
│   ├── streak-milestone.tsx
│   ├── win-back.tsx
│   └── course-complete.tsx
│
├── store/                        # Zustand stores
│   ├── course-store.ts           # Active course state
│   ├── ui-store.ts               # UI state (nowPlaying, modals)
│   └── user-store.ts             # Cached user data
│
├── db/
│   └── migrations/               # SQL migration files
│
├── types/
│   ├── course.ts
│   ├── lesson.ts
│   ├── quiz.ts
│   └── user.ts
│
└── public/
    ├── fonts/                    # Self-hosted font fallbacks
    ├── icons/                    # PWA icons
    └── manifest.webmanifest
```

---

## Request Flow Diagrams

### 1. New User: Topic → Lesson

```
Browser                     Next.js Server              Supabase          Claude API
  │                              │                          │                   │
  ├─ POST /api/courses ─────────►│                          │                   │
  │  { topic, aspect, level,     │                          │                   │
  │    curiosityReason, ... }     │                          │                   │
  │                              ├─ INSERT courses ─────────►│                   │
  │                              │  INSERT course_lessons    │                   │
  │                              │◄─ course.id ─────────────┤                   │
  │◄─ { courseId, lessons[] } ──┤                          │                   │
  │                              │                          │                   │
  ├─ GET /api/courses/[id]       │                          │                   │
  │   /lessons/0 ───────────────►│                          │                   │
  │                              ├─ SELECT lesson_content   │                   │
  │                              │  WHERE course_id + index ►│                   │
  │                              │◄─ NULL (not yet cached) ─┤                   │
  │                              │                          │                   │
  │                              ├─ messages.create() ──────────────────────────►│
  │                              │  { system: cached prompt │                   │
  │                              │    user: lesson request }│                   │
  │                              │◄─ streaming response ────────────────────────┤
  │                              │                          │                   │
  │                              ├─ INSERT lesson_content ──►│                   │
  │◄─ streaming lesson body ────┤  INSERT quiz_questions    │                   │
  │                              │                          │                   │
```

### 2. Quiz Completion → Streak Update

```
Browser                     Next.js Server              Supabase
  │                              │                          │
  ├─ POST /api/courses/[id]      │                          │
  │   /lessons/[i]/quiz ────────►│                          │
  │  { answers[] }               │                          │
  │                              ├─ SELECT quiz_questions    │
  │                              │  (with correct_option) ──►│
  │                              │◄─ questions ─────────────┤
  │                              │                          │
  │                              ├─ Score answers            │
  │                              ├─ INSERT quiz_attempts ───►│
  │                              │                          │
  │                              ├─ INSERT lesson_activity  ►│
  │                              │  ON CONFLICT DO UPDATE   │
  │                              │                          │
  │                              ├─ SELECT calculate_streak()►│
  │                              │◄─ streak: 7 ─────────────┤
  │                              │                          │
  │                              ├─ UPDATE courses.progress ►│
  │                              │  (progress + 1)          │
  │                              │                          │
  │◄─ { score, streak,          ┤                          │
  │     streakChanged: true } ──┤                          │
  │                              │                          │
  ├─ Show StreakMoment ──────────►(client-side only)         │
```

---

## Authentication Architecture

### Session Model

Supabase Auth issues a JWT stored in an `httpOnly` cookie. The cookie is read by Next.js middleware on every request.

```
┌─────────────┐   magic link   ┌──────────────────┐
│   Browser   │◄──────────────►│  Supabase Auth   │
└─────────────┘                └──────────────────┘
       │                                │
       │  httpOnly cookie (JWT)         │  Validates JWT
       │                                │
       ▼                                ▼
┌─────────────────────────────────────────────────┐
│              Next.js Middleware                  │
│  - Reads session cookie                          │
│  - Injects user into request context             │
│  - Redirects unauthenticated /app/* requests     │
└─────────────────────────────────────────────────┘
```

### Anonymous → Authenticated Flow

Pre-auth (anonymous) users get a session cookie with a `pendingSessionToken`. When they complete auth:

1. Server reads `pendingSessionToken` from cookie
2. Finds `pending_courses` row with that token
3. Creates real `courses` record linked to new `user_id`
4. Deletes `pending_courses` row
5. Clears `pendingSessionToken` cookie
6. Returns new session JWT

This is atomic — if any step fails, the pending course is preserved and the migration is retried.

---

## AI Content Architecture

See `AI_CONTENT.md` for full prompt engineering details.

### Key Principles

1. **Cache-first**: check DB before calling Claude. Same lesson is never generated twice.
2. **Prompt caching**: system prompt (~2000 tokens) is cached via Anthropic's cache_control mechanism. At ~60% hit rate, this cuts API costs by ~40%.
3. **Streaming**: lesson content streams to the client via Server-Sent Events so the reading experience begins immediately.
4. **Zod validation**: every Claude response is validated before storage. Invalid responses trigger a retry (max 2 attempts).

### Cost Model (Estimates)

| Operation | Claude calls | Tokens (avg) | Cost per call |
|---|---|---|---|
| Lesson generation | 1 | ~800 in, ~600 out | ~$0.006 |
| Quiz generation | 1 | ~700 in, ~400 out | ~$0.004 |
| Full 14-lesson course | 28 | — | ~$0.14 |
| With prompt caching at 60% hit | 28 | -60% cached | ~$0.07 |

At 1,000 new courses/month: ~$70–140/month in Claude costs.

---

## Email Architecture

### Daily Email Dispatch

```
06:00 UTC daily
      │
      ▼
Vercel Cron → POST /api/crons/daily-email
      │
      ▼
Query users where:
  email_enabled = true
  AND last_email_sent_at < today
  AND active_courses exist
      │
      ▼
For each user:
  1. Determine next lesson from active course
  2. Generate email payload (topic, lesson title, body, takeaways)
  3. Send via Resend
  4. Update last_email_sent_at
      │
      ▼
Resend webhook → /api/webhooks/resend
  - email.opened  → log to analytics
  - email.clicked → log to analytics
  - email.bounced → disable email for user, alert
```

### Delivery Time Personalisation

User preference: `email_delivery_hour` (0–23) in `email_delivery_tz`.

On cron run, filter is:
```sql
WHERE 
  email_enabled = true
  AND (
    (email_delivery_time = 'morning' AND NOW() AT TIME ZONE email_delivery_tz >= '07:00'::TIME)
    OR
    (email_delivery_time = 'evening' AND NOW() AT TIME ZONE email_delivery_tz >= '18:00'::TIME)
  )
  AND DATE(last_email_sent_at AT TIME ZONE email_delivery_tz) < CURRENT_DATE AT TIME ZONE email_delivery_tz
```

---

## Plan Enforcement

Plan limits are enforced at two levels:

### Level 1: Client UI (UX layer)
- Paywall modal shown before attempting a restricted action
- Provides fast feedback without a network round-trip

### Level 2: Server API (security layer)
- Every API route checks `users.plan` before executing
- Client-side checks are never the only gate

```typescript
// Example: POST /api/courses
const user = await getUser(request);
const activeCourseCount = await getActiveCourseCount(user.id);

if (user.plan === 'free' && !isBookPath && activeCourseCount >= 2) {
  return NextResponse.json(
    { error: 'FREE_TIER_LIMIT', message: 'Upgrade to start more courses.' },
    { status: 403 }
  );
}
```

---

## Deployment & Environments

| Environment | Branch | URL | Purpose |
|---|---|---|---|
| Local | any | `localhost:3000` | Development |
| Preview | feature branches | `curi-*.vercel.app` | PR previews |
| Staging | `staging` | `staging.curi.co` | QA + integration testing |
| Production | `main` | `curi.co` | Live |

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-side only

# Anthropic
ANTHROPIC_API_KEY=              # Server-side only

# Stripe
STRIPE_SECRET_KEY=              # Server-side only
STRIPE_WEBHOOK_SECRET=          # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=                 # Server-side only
RESEND_WEBHOOK_SECRET=          # Server-side only

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=              # Deploy only — source map upload

# App
NEXT_PUBLIC_APP_URL=            # e.g. https://curi.co
CRON_SECRET=                    # Protect cron endpoints from public access
```

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| Unauthenticated access to paid features | RLS on all DB tables; plan check in every API route |
| Quiz answer key exposure | `correct_option` never sent to client; server-side validation only |
| Cron endpoint abuse | `CRON_SECRET` header required; Vercel IP allowlist |
| Stripe webhook replay | Webhook signature verification (`stripe.webhooks.constructEvent`) |
| Pending course token theft | Session token is a secure random UUID; `httpOnly` cookie; 24h TTL |
| SSRF via Rabbit Hole links | URL validation + allowlist of permitted domains |
| Prompt injection | User input sanitised before Claude API; output validated with Zod |

---

## Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| TTFB (Today feed) | < 200ms | Vercel Analytics |
| LCP (Lesson reader) | < 2.5s (mobile) | Lighthouse CI |
| Claude lesson response | < 8s to first chunk | Custom latency metric |
| Email dispatch (1k users) | < 5 minutes | Cron job duration |
| Supabase query P95 | < 50ms | Supabase dashboard |

---

*Curi — curiosity, engineered.*
