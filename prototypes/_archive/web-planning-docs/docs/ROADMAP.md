# Curi — Product Build Roadmap

**Version:** 2.0  
**Date:** May 2026  
**Status:** Planning  

> This document defines the sequential order in which Curi should be built from prototype to production. Each phase has clear entry conditions, deliverables, and exit criteria. Nothing in Phase N+1 should be started until Phase N is complete and verified.

---

## Guiding Principle

**The prototype already proves the UX. What's missing is the engine.**

The current single-file React prototype demonstrates every screen, every flow, and the design system. The build order is therefore backend-first: establish the data layer and AI engine, then wire them to the existing front-end, then add distribution (email, payments, notifications). SEO and cost optimisation are built into Phase 2 — not bolted on later — because the `shared_lesson_cache` architecture simultaneously serves both.

---

## Phase Overview

| Phase | Name | Duration | Key Output |
|---|---|---|---|
| **0** | Foundation | 2 weeks | Repo, CI/CD, auth, database, env config |
| **1** | Core Loop | 3 weeks | Real lessons, real quiz, real streak, real persistence |
| **2** | AI Content Engine + SEO | 3 weeks | Claude API, shared lesson cache, SEO public pages |
| **3** | Email System | 2 weeks | Transactional + daily lesson email delivery |
| **4** | Monetisation | 2 weeks | Stripe, plan enforcement, upgrade flow |
| **5** | Growth & Sharing | 1 week | Certificates, share cards, referral hooks |
| **6** | Mobile & Performance | 2 weeks | PWA, responsive polish, performance budget |
| **7** | Analytics & Ops | 1 week | Event tracking, error monitoring, support tooling |

**Total estimate: ~15 weeks to production-ready v1.**

---

## Phase 0 — Foundation
**Duration:** 2 weeks  
**Parallel to:** Design system token audit, component inventory

### Goals
- Project structure that supports a real product (not a prototype)
- Auth that works
- Database that persists
- CI/CD that deploys automatically

### Tasks

#### 0.1 — Repository & Project Structure
- [ ] Initialise a new Next.js 15 (App Router) project — replaces Vite/React prototype
- [ ] Set up TypeScript strictly
- [ ] Configure ESLint + Prettier with project rules
- [ ] Migrate Tailwind config and CSS tokens from prototype
- [ ] Directory structure: `app/`, `components/`, `lib/`, `server/`, `db/`, `emails/`
- [ ] Set up `pnpm` workspace

#### 0.2 — CI/CD & Environments
- [ ] GitHub repo with branch protection (`main` = production, `staging` = staging)
- [ ] Vercel project connected to GitHub, auto-deploy on push
- [ ] Three environments: `local`, `staging`, `production`
- [ ] Environment variable management via Vercel + `.env.local`
- [ ] Automated lint + typecheck on every PR

#### 0.3 — Authentication (Supabase Auth)
- [ ] Supabase project provisioned
- [ ] Email + magic link auth configured
- [ ] Auth middleware in Next.js (protect `/app/*` routes)
- [ ] `useUser()` hook + server-side session access
- [ ] User row auto-created in `users` table on first sign-up (DB trigger)
- [ ] Auth UI wired to existing Auth screen designs

#### 0.4 — Database (Supabase Postgres)
- [ ] Schema applied (see `DB_SCHEMA.md`)
- [ ] Row Level Security (RLS) policies on all user tables
- [ ] Supabase migrations tracked in `db/migrations/`
- [ ] Seed data for development (demo user, 2 courses in progress, 1 completed)

#### 0.5 — Base Config & Tooling
- [ ] Sentry configured (error tracking)
- [ ] PostHog configured (analytics)
- [ ] Resend configured (email delivery)
- [ ] Anthropic SDK installed and configured
- [ ] All secrets in Vercel environment, never in repo

### Exit Criteria
- A logged-in user can create an account and see a blank dashboard
- All environment variables are set in staging
- Deployment pipeline runs green on every push

---

## Phase 1 — Core Loop
**Duration:** 3 weeks  
**Depends on:** Phase 0 complete

### Goals
- A user can type a topic, generate a course, read lesson 1, take a quiz, and have their progress persist across browser sessions
- Streak increments correctly and is stored in the database
- The prototype's mock state is fully replaced by real database reads/writes

### Tasks

#### 1.1 — Course Generation Flow
- [ ] `POST /api/courses` — creates a course record in DB
- [ ] Course object validated with Zod
- [ ] Lesson titles stored in `course_lessons` table (one row per lesson)
- [ ] Generating screen wired to real API call (not mock setTimeout)
- [ ] `pendingCourse` state replaced by optimistic write + server confirmation

#### 1.2 — Lesson Reader
- [ ] `GET /api/courses/[id]/lessons/[index]` — returns lesson content
- [ ] Lesson content stored in DB after first generation (cache-on-generate)
- [ ] Lesson reader receives real data props, not hardcoded mock content
- [ ] `progress` field on course updated when lesson is opened (marks as "started")

#### 1.3 — Quiz
- [ ] `GET /api/courses/[id]/lessons/[index]/quiz` — returns 4 questions for a lesson
- [ ] Quiz answers stored in `quiz_attempts` table
- [ ] `POST /api/quiz-attempts` — records answer, score, difficulty rating
- [ ] Quiz completion triggers streak update (server-side)

#### 1.4 — Streak System
- [ ] `lesson_activity` table updated on every quiz completion
- [ ] Streak calculated server-side from `lesson_activity` (not stored as a plain counter)
- [ ] Streak recalculated on every login / daily session
- [ ] "Streak at risk" state: calculated as (today has no activity AND streak > 0)
- [ ] StreakMoment fires client-side after server confirms quiz completion

#### 1.5 — Auth Wall & Post-Auth Save
- [ ] `pendingCourse` + `pendingQuizComplete` flow replaced by server-side session cookie
- [ ] Anonymous course sessions stored temporarily in `pending_courses` table (TTL: 24h)
- [ ] On auth, `pending_courses` are migrated to `courses` with `user_id`
- [ ] `completeAuth()` replaced by server action that does the migration atomically

#### 1.6 — Today Feed
- [ ] `GET /api/feed` — returns active courses with next lesson for each
- [ ] Feed sorted by last activity (most recently active course first)
- [ ] Empty state handled when no active courses exist

#### 1.7 — Library
- [ ] `GET /api/library` — returns all courses grouped by status
- [ ] Status enum: `in_progress`, `completed`, `shelved`
- [ ] Course shelving action: `PATCH /api/courses/[id]` with `{ status: "shelved" }`

### Exit Criteria
- User can complete the full loop: topic → onboarding → generating → lesson → quiz → streak → dashboard
- Progress persists on page refresh
- Multiple browser sessions see the same data

---

## Phase 2 — AI Content Engine + SEO
**Duration:** 3 weeks (expanded from 2)  
**Depends on:** Phase 1 complete

### Goals
- Every lesson is generated by Claude, not from hardcoded templates
- Quiz questions are generated per lesson, grounded in actual content
- **Shared lesson cache** eliminates duplicate Claude calls across users (cost reduction)
- **420 canonical lessons pre-seeded** before launch (30 topics × 14 lessons)
- **Public SEO lesson pages** live at `/learn/[topic]/[lesson]` — indexed by search engines
- All 30 curated topics have fully populated public pages at launch

### Tasks

#### 2.1 — Lesson Generation (Claude API)
- [ ] `lib/ai/generate-lesson.ts` — prompts Claude to write a full lesson + quiz in one call
- [ ] Prompt template: topic, aspect, lesson index, total lessons, previous lesson titles, curiosity reason, learning style
- [ ] Output schema (Zod): combined `{ lesson: {...}, quiz: [...] }`
- [ ] Streaming response: lesson content streams to the client via Server-Sent Events (only for fresh Claude calls — cache hits return JSON instantly)
- [ ] Quality gates: Zod validation + word count guard + retry (max 2 attempts)

#### 2.2 — Shared Lesson Cache (`shared_lesson_cache`)
- [ ] `lib/ai/lesson-cache.ts` — `getLessonFromSharedCache()` and `storeInSharedCache()`
- [ ] Cache key: `(topic_slug, lesson_index, learning_style)`
- [ ] Full resolution order: user's `lesson_content` → shared style match → shared canonical fallback → generate fresh
- [ ] On shared cache hit: copy content to user's `lesson_content` (so it's a Layer 1 hit next time)
- [ ] On fresh generation from curated topic: store result in `shared_lesson_cache` (benefits next user)
- [ ] Hit counter increment on every cache hit (`hit_count`, `last_hit_at`)
- [ ] Non-curated (custom user topics): skip shared cache entirely
- [ ] See `AI_CONTENT.md` for full lookup logic and TypeScript implementation

#### 2.3 — Canonical Lesson Pre-seed Script
- [ ] `scripts/seed-canonical-lessons.ts` — generates all 420 canonical lessons before launch
- [ ] Learning style: `null` (neutral/canonical variant)
- [ ] Generates lesson + quiz for each of 30 topics × 14 lessons
- [ ] Skips already-seeded entries (idempotent)
- [ ] 500ms rate-limit between calls (avoid Anthropic rate limits)
- [ ] Includes `lesson_slug` and `meta_description` fields (SEO fields, canonical only)
- [ ] Target cost: ~$4.20 total (420 calls × ~$0.01 each)

#### 2.4 — Personalisation Layer
- [ ] Lesson prompt includes `curiosityReason`, `learningStyle` from course context
- [ ] Style-specific prompt instructions injected for each of the 4 learning styles
- [ ] Canonical generation uses a "canonical mode" prompt variant (no personalisation, clear for cold readers)
- [ ] See `AI_CONTENT.md §Personalisation Style Instructions` for full mapping

#### 2.5 — Anthropic Prompt Caching (API-level)
- [ ] System prompt (~2000 tokens) marked with `cache_control: { type: 'ephemeral' }`
- [ ] Topic-level context block (all lesson titles) also marked for caching
- [ ] 5-minute TTL per Anthropic default; ~55% token cost reduction on sequential lesson generation

#### 2.6 — Topic Matching
- [ ] `lib/ai/topic-matcher.ts` — fuzzy match user topic input to curated topic key
- [ ] Strategies: exact → Levenshtein (≤2) → keyword containment
- [ ] Match → use curated lesson titles + `content_source = 'curated'`
- [ ] No match → full Claude title generation + `content_source = 'ai'`

#### 2.7 — Public SEO Pages (`/learn`)
- [ ] `app/(marketing)/learn/page.tsx` — topic directory (30 curated topics)
- [ ] `app/(marketing)/learn/[topic]/page.tsx` — topic landing page with full lesson list
- [ ] `app/(marketing)/learn/[topic]/[lesson]/page.tsx` — individual lesson page
- [ ] `generateStaticParams()` pre-builds all 420 lesson pages at deploy time (SSG)
- [ ] `export const revalidate = 86400` (24h ISR)
- [ ] All pages use canonical lesson data from `shared_lesson_cache` (learning_style = null)
- [ ] JSON-LD structured data: `Article` schema per lesson, `Course` schema per topic
- [ ] Breadcrumb JSON-LD on lesson pages
- [ ] OG image route: `app/api/og/learn/[topic]/[lesson]/route.tsx` using `@vercel/og`
- [ ] Internal linking: prev/next lesson, related topics (3), full track CTA

#### 2.8 — Conversion CTAs on SEO Pages
- [ ] "Take the quiz for this lesson →" CTA after lesson body
- [ ] If authenticated: routes to quiz for this topic in their active course (creates course if needed)
- [ ] If anonymous: creates `pending_course` for this topic → lesson → quiz → auth wall
- [ ] "Start the full track →" secondary CTA → topic landing page
- [ ] Anxiety reducer: "Free to start · No account needed until after your first quiz"

#### 2.9 — Sitemap & Robots
- [ ] `app/sitemap.ts` — dynamically includes all 420+ lesson URLs + 30 topic URLs
- [ ] Priority: landing (1.0) > topic pages (0.9) > lesson pages (0.8)
- [ ] `public/robots.txt` — allow `/learn/*`, disallow `/app/*`, `/api/*`, `/admin/*`

### Exit Criteria
- Any curated topic lesson loads instantly (from shared cache) for the 2nd+ user
- Custom topic lessons generate correctly and stream to client
- All 420 canonical lesson pages render at `/learn/[topic]/[lesson]`
- Pages appear in Google Search Console after sitemap submission
- Cache hit rate tracking visible (via `hit_count` column in Supabase dashboard)
- Quiz CTA on public lesson pages creates a `pending_course` and correctly navigates to quiz

---

## Phase 3 — Email System
**Duration:** 2 weeks  
**Depends on:** Phase 1 complete (can run in parallel with Phase 2)

### Goals
- Users receive a daily email with their next lesson
- Transactional emails work (welcome, streak milestone, win-back)
- Email preferences are respected

### Tasks

#### 3.1 — Email Infrastructure
- [ ] Resend account configured with `curi.co` domain (DKIM, SPF, DMARC verified)
- [ ] React Email component library set up in `emails/` directory
- [ ] Email preview server (`email-preview` script in `package.json`)
- [ ] Unsubscribe link with one-click token-based unsubscribe

#### 3.2 — Email Templates (React Email)
- [ ] `DailyLessonEmail` — the core daily lesson email (see brand guidelines §12.3)
  - Header (wordmark + metadata)
  - Lesson title (Fraunces)
  - Lesson body (3 paragraphs)
  - Pull quote
  - Ad slot (free tier only)
  - Takeaways
  - Tomorrow teaser
  - Footer
- [ ] `WelcomeEmail` — sent immediately after first lesson completion + auth
- [ ] `StreakMilestoneEmail` — sent at streaks: 3, 7, 14, 30, 60, 100
- [ ] `WinBackEmail` — sent 7 days after last activity (if streak > 0)
- [ ] `CourseCompleteEmail` — sent when all lessons in a course are finished

#### 3.3 — Daily Email Job
- [ ] Vercel Cron job: `POST /api/crons/daily-email` runs at 06:00 UTC
- [ ] Job queries all users where: `email_enabled = true` AND `last_email_sent_at < today`
- [ ] Respects per-user preferred delivery time (converts to UTC)
- [ ] Respects `send_on_weekends` preference
- [ ] Builds email payload from next lesson in active course
- [ ] Marks `last_email_sent_at` after send

#### 3.4 — Transactional Email Triggers
- [ ] Welcome email: trigger on `POST /api/auth/complete` (first sign-up only)
- [ ] Streak milestone: trigger in quiz completion handler when streak crosses threshold
- [ ] Win-back: trigger from second daily cron job that checks for lapsed users
- [ ] Course complete: trigger when `progress = duration` for a course

#### 3.5 — Email Preferences
- [ ] Preferences stored in `user_preferences` table
- [ ] Profile screen preference changes write to DB immediately
- [ ] Unsubscribe token generated per user, stored hashed in DB
- [ ] `GET /unsubscribe?token=xxx` route that sets `email_enabled = false`

### Exit Criteria
- A real email lands in inbox at the configured delivery time with correct lesson content
- Unsubscribe link works and prevents future sends
- All transactional emails send at the correct trigger points

---

## Phase 4 — Monetisation
**Duration:** 2 weeks  
**Depends on:** Phase 0–1 complete

### Goals
- Users can upgrade from free to paid
- Plan limits are enforced server-side (not just client-side)
- Stripe manages billing, subscriptions, and cancellation

### Tasks

#### 4.1 — Stripe Setup
- [ ] Stripe account configured with `curi.co`
- [ ] Products created: `curi_free` (default), `curi_paid` (subscription)
- [ ] Price object: monthly (e.g. $12/mo) + annual (e.g. $99/yr)
- [ ] Stripe webhook endpoint: `POST /api/webhooks/stripe`

#### 4.2 — Upgrade Flow
- [ ] `POST /api/billing/checkout` — creates Stripe Checkout session, returns URL
- [ ] Redirect to Stripe Checkout (hosted page)
- [ ] On success: webhook updates `users.plan = "paid"`, stores `stripe_customer_id`
- [ ] On cancel: user returned to app, no change
- [ ] Customer Portal link: `POST /api/billing/portal` → Stripe Customer Portal URL

#### 4.3 — Plan Enforcement (Server-Side)
- [ ] Free tier limits enforced in API routes (not just UI):
  - `POST /api/courses`: reject if `plan = "free"` AND `active_custom_courses >= 2`
  - `GET /api/courses/[id]/lessons/[index]` rabbit hole section: 404 if `plan = "free"`
  - Browse book paths: `GET /api/books/[id]`: 403 if `plan = "free"`
- [ ] UI paywall triggers remain (for UX), but are no longer the only gate

#### 4.4 — Stripe Webhook Handlers
- [ ] `customer.subscription.created` → set plan to paid
- [ ] `customer.subscription.deleted` → set plan to free, log cancellation date
- [ ] `invoice.payment_failed` → send payment failure email, flag account
- [ ] `customer.subscription.updated` → handle plan changes (annual ↔ monthly)

#### 4.5 — Billing Screen
- [ ] Current plan displayed (free / paid + renewal date)
- [ ] "Manage billing" → Stripe Customer Portal
- [ ] Cancel link in Stripe Portal (not in app)

### Exit Criteria
- A user can successfully upgrade, be charged, and access paid features
- Cancellation via Stripe Portal correctly downgrades the plan
- Plan limits are enforced server-side and cannot be bypassed by UI manipulation

---

## Phase 5 — Growth & Sharing
**Duration:** 1 week  
**Depends on:** Phase 1–4 complete

### Goals
- Users can share lesson insights and course completions
- Certificates are downloadable
- Referral hook exists

### Tasks

#### 5.1 — Certificate Download
- [ ] `GET /api/courses/[id]/certificate` — generates a PDF certificate
- [ ] Certificate includes: user name, course topic, completion date, Curi wordmark
- [ ] Uses `@react-pdf/renderer` or Puppeteer + HTML template
- [ ] Certificate stored in Supabase Storage after generation (served from CDN)
- [ ] Download button in Course Complete screen wired to API

#### 5.2 — Lesson Share Card
- [ ] `GET /api/share/lesson/[id]` — generates an OG share image (1200×630)
- [ ] Uses `@vercel/og` (Edge runtime image generation)
- [ ] Image: dark background, shareable fact in Fraunces, `Curi · Day N` watermark
- [ ] Copy to clipboard action in lesson reader (copies text + URL)

#### 5.3 — Course Completion Share
- [ ] `GET /api/share/course/[id]` — generates a completion OG image
- [ ] White background, course topic in Fraunces 72px, Vermilion rule, wordmark

#### 5.4 — Referral
- [ ] Each user gets a unique referral slug (`ref=awais-x7k2`)
- [ ] Landing page reads `ref` param and stores in cookie
- [ ] On sign-up: referral recorded in `referrals` table
- [ ] Phase 1 referral: no reward, just tracking — reward scheme designed post-launch based on data

### Exit Criteria
- Certificate PDF downloads correctly with user's name
- Share image renders correctly when URL is posted to Twitter/LinkedIn

---

## Phase 6 — Mobile & Performance
**Duration:** 2 weeks  
**Depends on:** Phase 1–3 complete

### Goals
- The web app works as a PWA with home screen install
- Core Web Vitals are green on mobile
- Lesson reader is as good on mobile as desktop

### Tasks

#### 6.1 — Progressive Web App
- [ ] `manifest.webmanifest` with Curi icons (192px, 512px, maskable)
- [ ] Service worker via `next-pwa` — offline support for last-read lesson
- [ ] "Add to home screen" prompt triggered after first quiz completion
- [ ] Splash screen styled to brand (Ink background, Curi wordmark)

#### 6.2 — Mobile Layout Audit
- [ ] Lesson reader: 16px body, correct line-height, proper padding on small screens
- [ ] Onboarding: full-height step layout on iPhone SE (375px)
- [ ] Today feed: single-column, card touch targets ≥ 44px
- [ ] Quiz options: easy to tap, no text overflow

#### 6.3 — Performance Budget
- [ ] LCP < 2.5s on mobile 4G
- [ ] CLS = 0 (fonts preloaded, no layout shift)
- [ ] FID/INP < 100ms
- [ ] Bundle: JS < 150kb gzipped for initial load
- [ ] Fonts: Fraunces + Plus Jakarta Sans preloaded in `<head>`, JetBrains Mono lazy-loaded

#### 6.4 — Audio Player (TTS)
- [ ] Evaluate native Web Speech API vs ElevenLabs for quality
- [ ] If ElevenLabs: generate audio file per lesson, store in Supabase Storage
- [ ] AudioPlayer component polished for mobile (large touch targets, background play)

### Exit Criteria
- App installs to iOS home screen and opens correctly
- Lighthouse mobile score ≥ 85 on all three key routes (landing, lesson, quiz)

---

## Phase 7 — Analytics & Operations
**Duration:** 1 week  
**Depends on:** All phases complete

### Goals
- Understand user behaviour at every step of the funnel
- Errors are caught and alerted on before users report them
- Support tooling exists for common issues

### Tasks

#### 7.1 — Event Tracking (PostHog)
- [ ] Core funnel events (see `ANALYTICS.md` for full event taxonomy)
- [ ] `topic_submitted`, `onboarding_completed`, `lesson_started`, `quiz_completed`
- [ ] `streak_broken`, `streak_milestone`, `course_completed`
- [ ] `upgrade_modal_viewed`, `checkout_started`, `subscription_created`
- [ ] `email_opened`, `email_cta_clicked` (via Resend webhooks)

#### 7.2 — Error Monitoring (Sentry)
- [ ] Client-side React error boundaries → Sentry
- [ ] Server-side API route errors → Sentry
- [ ] Alert rules: any error affecting > 5% of requests in 15 minutes
- [ ] Source maps uploaded on every deploy

#### 7.3 — Dashboards
- [ ] PostHog dashboard: daily active users, lesson completion rate, quiz pass rate, streak length distribution
- [ ] Stripe dashboard: MRR, churn, trial-to-paid conversion
- [ ] Resend dashboard: open rate, click rate, unsubscribe rate per email type

#### 7.4 — Operational Tooling
- [ ] Admin route `/admin` (staff only, protected by admin flag on user)
- [ ] View any user's course list and progress
- [ ] Manually trigger a daily email resend for a specific user
- [ ] View Sentry issues and PostHog funnels in same tab

### Exit Criteria
- Full event funnel visible in PostHog from topic submission to subscription creation
- Sentry alerts firing correctly on errors
- Key metrics dashboards built and bookmarked

---

## Post-v1 Backlog (Not Scheduled)

| Feature | Why deferred | When to revisit |
|---|---|---|
| React Native mobile app | Web PWA validates retention first | If D30 retention > 25% |
| Social features (public profiles, shared tracks) | Single-player first | After 1,000 active users |
| SM-2 spaced repetition algorithm | Flashcard system needs usage data first | Post-launch |
| Rabbit Hole (further reading curation) | Content quality first | After AI engine mature |
| SEO / topic landing pages | Growth experiment | After email channel proven |
| Team / company plans | B2B only after B2C works | Year 2 |
| Podcast / audio-first mode | Separate product surface | Year 2 |

---

*Curi — curiosity, engineered.*
