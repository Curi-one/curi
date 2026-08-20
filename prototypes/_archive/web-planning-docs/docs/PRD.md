# Curi — Product Requirements Document

**Version:** 1.0  
**Date:** May 2026  
**Status:** Living document — prototype stage  
**Author:** Awais Ibrahim

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target User](#3-target-user)
4. [Product Positioning](#4-product-positioning)
5. [Core Value Proposition](#5-core-value-proposition)
6. [User Flows](#6-user-flows)
7. [Screen-by-Screen Specification](#7-screen-by-screen-specification)
8. [Feature Inventory](#8-feature-inventory)
9. [Data Architecture](#9-data-architecture)
10. [Tech Stack](#10-tech-stack)
11. [Design System Summary](#11-design-system-summary)
12. [Monetisation](#12-monetisation)
13. [Analytics & Retention Hooks](#13-analytics--retention-hooks)
14. [Open Questions & Future Work](#14-open-questions--future-work)

---

## 1. Product Overview

Curi is a **daily micro-learning system**. A user types any topic they are curious about, receives a personalised, progressive curriculum of 7–30 lessons, and works through one lesson per day — each taking roughly three minutes to read, followed by a short quiz.

The core loop is: **Topic → Personalised Path → Daily Lesson → Quiz → Streak**.

Curi is not a course platform, not a podcast, not a newsletter, not an AI chatbot. It is a new category: a personal knowledge system that compounds quietly, every morning, permanently. The closest analogy is a private museum of knowledge, curated for a single visitor, open every day.

**The aha moment** is reading lesson 1 — encountering actual substantive content, not a syllabus. Every UX decision is calibrated to reach that moment as fast as possible.

---

## 2. Problem Statement

The current self-directed learning model is broken. Formal education is slow and inaccessible. Every other alternative — podcasts, books, courses, newsletters — has a 90%+ abandonment rate, because:

- They require sustained blocks of time that busy people never find
- They deliver content without structure, so nothing compounds
- They motivate through guilt or FOMO rather than through the pleasure of getting smarter
- They don't confirm that anything was retained

First-time founders — Curi's launch audience — face this problem acutely. They are encountering investor terminology, cap table mechanics, and fundraising processes for the first time, often mid-deal. Every existing learning option is either too slow (books, MBAs), too unstructured (podcasts), or too generic (courses). And the knowledge gaps carry real financial consequences: an unfamiliar liquidation preference, an undervalued pro-rata right, a misread SAFE note.

---

## 3. Target User

### Launch ICP (Ideal Customer Profile)

**The technical first-time founder — pre-seed, outside a top-tier accelerator network.**

Specifically:
- **Age:** 25–38
- **Background:** Computer science, engineering, or hard sciences. Understands product and code deeply.
- **Stage:** Building their first company. Either preparing for or actively navigating a first institutional raise.
- **Gap:** Almost no formal business training. Knows that knowledge gaps are costing them — in equity, negotiating power, and decision quality.
- **Network:** Not in YC, Techstars, or equivalent. Does not have a peer cohort handing them this knowledge.
- **Pain:** Has started Venture Deals, Zero to One, Coursera courses. Has not finished any of them.
- **Communities:** Indie Hackers, Entrepreneur First, regional accelerators, founder Slack groups.

### What they want
Not more content — **a path**. Delivered daily, in the time that already exists between everything else. The structure that the YC batch gives YC founders, without the selection process.

### ICP Evolution

| Phase | ICP |
|---|---|
| **Launch** | Technical first-time founders, pre-seed, outside top accelerator networks |
| **Year 2** | Operators and career changers in high-knowledge fields |
| **Year 3+** | Anyone learning anything (the full mission) |

---

## 4. Product Positioning

> For **intellectually curious professionals** who want to feel smarter without the overhead of formal learning — Curi is the **only daily learning system** that delivers a structured, expert-verified curriculum on any subject in three minutes a day — so knowledge compounds quietly, permanently, every morning.

**Against:**
- Coursera/Udemy: too long, too passive, too generic
- Blinkist: summaries without structure; no quiz, no retention
- Duolingo: gamification-first, not substance-first
- Substack: unstructured, no progression
- ChatGPT: answers without curriculum; no path, no retention

**Curi's edge:** personalised sequencing + daily habit enforcement + quiz-based retention + editorial quality. The sum of those four things exists nowhere else.

---

## 5. Core Value Proposition

**Three minutes a day. Any topic. Knowledge that compounds.**

Five pillars:

1. **Personalised path** — not a generic curriculum; built around the user's angle, motivation, and depth preference
2. **Spaced repetition** — lessons build on each other; quizzes reinforce retention; the habit creates compounding
3. **Editorial quality** — lessons read like a well-written explainer from an expert friend, not a textbook or listicle
4. **One action per day** — the entire UX is optimised to remove friction from the single daily return
5. **Depth on demand** — Intro (7 lessons), Standard (14 lessons), Deep dive (30 lessons) — user chooses the investment

---

## 6. User Flows

### 6.1 Primary Flow: New Unauthenticated User

```
Landing
  │
  ├─ Types topic or clicks suggestion pill
  │
  └─ Onboarding (4 steps)
       1. Why: motivation (Pure curiosity / Preparing for something / For work / etc.)
       2. Angle: topic aspect/lens (topic-specific suggestions or default)
       3. Style: teaching approach (Stories / Real examples / Model first / Show what breaks)
       4. Depth: Intro (7) / Standard (14) / Deep dive (30)
       │
       └─ Generating screen
            │ Lessons stream in one-by-one (230ms each, 1.6s warmup)
            │
            └─ CTA: "Read lesson 1" (non-signed-in)
                 │
                 └─ Lesson Reader
                      │
                      └─ Quiz (4 multiple-choice questions)
                           │
                           ├─ Auth wall appears (after first quiz)
                           │    │
                           │    └─ Sign up → saves course with progress: 1
                           │              → streak = 1 → StreakMoment → Today feed
                           │
                           └─ (if backed out of auth) → returns to lesson
```

### 6.2 Returning Authenticated User — Daily Return

```
Today feed (home)
  │
  ├─ Primary action: "Continue [topic]" card → Lesson Reader
  │
  └─ Lesson Reader
       │
       └─ Quiz
            │
            ├─ Lesson Complete modal (next lesson preview, streak count)
            │    │
            │    └─ StreakMoment overlay → Today feed (or back to source)
            │
            └─ (if last lesson) → Course Complete screen → certificate + next path suggestion
```

### 6.3 Browse & Start a Curated Course

```
Explore (Browse)
  │
  ├─ Browse by category (6 categories × 5 subjects)
  ├─ Browse books (curated reading paths)
  ├─ Filter by subject/keyword
  │
  └─ Subject card → Course Preview Modal
       │
       ├─ "Start this path" → Lesson Reader (directly, no onboarding)
       │
       └─ (paywalled for free tier if ≥2 active courses)
```

### 6.4 Library / Archive

```
Library
  │
  ├─ In progress (active courses) → open lesson or view path map
  ├─ Completed → Course Path (read-only, all lessons accessible, quiz retakeable)
  └─ Shelved → Course Path (view progress, cannot advance)
```

### 6.5 Auth Back-Navigation Logic

```
pendingCourse + pendingQuizComplete = true  → back goes to lesson
pendingCourse (quiz not done)              → back goes to generating
no pendingCourse                           → back goes to authBackTarget (landing or today)
```

---

## 7. Screen-by-Screen Specification

### 7.1 Landing Screen

**Purpose:** Communicate the value proposition and get the user to type a topic with minimal friction.

**Key elements:**
- `Curi` wordmark (Fraunces, italic *ri*, Vermilion underline)
- H1: `Explore [typewriter cycling topic]` — serif display, Vermilion blinking cursor
- Subheadline: `"Type any topic and get a path built for you. You choose the depth — one lesson a day. It's a learning system built on spaced repetition, so you actually remember what you learned."`
- Input: `"What are you curious about..."` — full-width, rounded, autofocus
- Suggestion pills: 8 topic ideas cycling in batches (fade transition every 3.6s)
- Anxiety reducer: `"Free to start · No account needed"`
- **No auth gate** — user can start entirely without an account

**Routing:**
- Submit input → `handleTopicSelect()` → onboarding
- Click pill → `handleTopicSelect()` → onboarding (with defaults pre-filled)

---

### 7.2 Onboarding Screen

**Purpose:** Personalise the course before generating. 4 sequential steps, one question per step.

**Steps:**

| # | Eyebrow | Question | Options |
|---|---|---|---|
| 1 | Your motivation | Why are you exploring this? | Pure curiosity / Preparing for something / For work or a project / Building foundations / To teach someone else |
| 2 | Your angle | What angle should Curi take? | Topic-specific suggestions (4 per topic) or defaults |
| 3 | How you learn | How do ideas click for you? | Through stories / With real examples / Build the model first / Show what breaks |
| 4 | How deep | How far do you want to go? | Intro (7 lessons) / Standard (14 lessons) / Deep dive (30 lessons) |

**UX details:**
- Progress pip strip (4 dots, expands active pill to 32px width)
- Selecting an option on steps 1–3 auto-advances after 340ms
- Step 4 requires explicit "Build my path" button
- Topic label shown as context above each question
- Back button goes to previous step; forward button advances
- When entered from landing suggestion click: all steps pre-filled with sensible defaults; "Skip to depth →" shortcut appears

**Routing:**
- `onGenerate()` → Generating screen + `isGenerating = true`

---

### 7.3 Generating Screen

**Purpose:** Stream the lesson list as it's "built", creating anticipation and showing the curriculum quality before the user commits.

**Key elements:**
- Topic name as large serif heading
- Lessons reveal one by one (230ms interval, 1.6s initial warmup)
- Progress bar fills as lessons appear
- `buildingMessage(pct, topic)` — contextual loading copy: *"Finding the best angle..."*, *"Sequencing the concepts..."*, etc.
- When complete:
  - Non-signed-in: CTA `"Read lesson 1"` (primary, no save required)
  - Signed-in: CTA `"Start reading"` (saves immediately)

**Course construction logic:**
1. Check if topic matches a known `magazineLessons` key (exact match, case-insensitive)
2. If yes: use curated lesson titles
3. If no: use `defaultLessons(topic, aspect)` template
4. Append personalised extras based on `curiosityReason`, `desiredOutcome`, `learningStyle`
5. Slice to depth (7 / 14 / 30)

---

### 7.4 Lesson Reader

**Purpose:** The core product surface. A single lesson rendered as a long-form editorial article.

**Layout:** Full-screen, no sidebar. Back button + lesson metadata at top.

**Content structure per lesson:**
1. **Provenance line** — `"Lesson N of N · Topic"` (JetBrains Mono, Silver)
2. **Lesson title** — large Fraunces serif, 52px, `-0.02em` tracking
3. **Pull quote** — Fraunces italic, Vermilion left border (2px)
4. **Body paragraphs** — Plus Jakarta Sans Light, 16px, 1.75 line-height
5. **Visual block** — dark card with equation (`Equity × Terms = Outcome`), topic-specific caption
6. **Takeaways** — numbered list, Vermilion monospace numbers, 3–5 key points
7. **Shareable fact** — a single insight, formatted for sharing
8. **Rabbit Hole** — further reading (locked behind paid plan)

**Controls:**
- Back button (context-aware label: Home / Course / Library / Lessons / Dashboard)
- Audio listen button → floating AudioPlayer
- Flashcard save → saves a card set for this lesson
- View flashcards → navigates to Flashcard screen
- "Take quiz" button — fixed at bottom after scroll

**Navigation:**
- Can jump to specific lesson index via `initialLessonIndex`
- `lessonBackScreen` determines where back/quiz-complete returns to

---

### 7.5 Quiz

**Purpose:** Confirm retention after each lesson. Gates the streak increment.

**Format:** 4 multiple-choice questions per lesson.

**Question generation:** `lessonBlurb(title, index, total, topic)` builds text from lesson title and topic context; questions are topic-contextual.

**UX rules:**
- Option letters: A, B, C, D (JetBrains Mono, Silver)
- Correct: Ink fill background, White text, Vermilion option letter
- Incorrect: Paper background, Silver text (dimmed, not red)
- No explanation shown — result is binary
- "Submit" button only appears after an option is selected
- Difficulty rating prompt appears after submission (optional: Easy / Medium / Hard)

**Auth gate:**
- Non-signed-in users who complete the quiz trigger `pendingQuizComplete = true` → navigate to Auth
- Auth → `completeAuth()` saves course with `progress: 1`, fires streak + StreakMoment

---

### 7.6 Today Feed (Home)

**Purpose:** The daily return screen. Show what's due, celebrate progress, surface exploration hooks.

**Content sections:**

1. **Greeting + date** — personalised (`"Good morning, Awais"`)
2. **Primary lesson card** — the next lesson in the active course. Large, prominently placed. Audio listen button.
3. **Course progress bar** — fraction display (`3 / 14 lessons`) + endowed progress bar
4. **Additional active courses** — secondary lesson cards below primary
5. **Flashcard decks** — if any card sets exist, show review prompt
6. **Academy Insights** — recall strength, return rhythm, concepts held, decision depth
7. **Empty state** — if no courses: CTA to explore or start a new course

**Feed construction (`buildDailyFeed`):**
- Groups lessons by recency (today, yesterday, N days ago)
- Surfaces lessons at current progress index
- Handles multi-course users (one card per active course)

**Audio:**
- Each lesson card has a listen button
- Triggers floating AudioPlayer (Web Speech API)
- Toggle play/pause per item; speed: 0.8× / 1× / 1.25× / 1.5× / 2×

---

### 7.7 Dashboard (Progress / Analytics)

**Purpose:** Show learning momentum, stats, and course map.

**Sections:**

1. **Streak display** — large Fraunces number, "N-day streak", StreakStrip (7-day mini calendar)
2. **Lesson Contribution Graph** — GitHub-style heatmap, 26 weeks, amber heat scale
3. **Metric cards:**
   - Recall strength (%)
   - Return rhythm (days/week)
   - Concepts held (count)
   - Decision depth (qualitative)
4. **Active courses grid** — progress bars, depth badge, "Continue" CTA
5. **Completed courses** — compact list with completion date
6. **Learner identity card** — `"The Technical Founder"` — personalised archetype description

---

### 7.8 Library

**Purpose:** Full course catalogue — in progress, completed, shelved.

**Three tabs / sections:**

| Section | Description |
|---|---|
| In progress | Active courses with progress bar and "Continue" action |
| Completed | Completed courses with completion date, "View path" and "Retake quiz" options |
| Shelved | Abandoned/paused courses — can view path but not continue |

**Course card variants:**
- `LibraryCard` — standard card for in-progress/shelved
- `TrophyCard` — celebratory card for completed courses, with certificate status

---

### 7.9 Course Path Screen

**Purpose:** Visual map of every lesson in a course — like a game level map.

**Layout:**
- Course header: title, aspect, level, progress fraction, SVG progress ring
- Chapter sections: `Opening / Depths` (14 lessons), `Foundations / Structure / Mastery` (21 lessons), `Part I–IV` (30 lessons)
- Each lesson is a node: `cleared` (done) / `current` (available) / `paused` (abandoned) / `locked` (future)
- Click a cleared/current node → opens lesson reader
- Press `Escape` → back

---

### 7.10 Explore (Browse)

**Purpose:** Curated catalogue of 30+ topics and 20+ book paths.

**Tabs:**
1. **Paths** — 6 categories × 5 subjects = 30 subjects
2. **Books** — curated reading paths for known startup books (Venture Deals, Zero to One, etc.)
3. **Sequences** — multi-path bundles (paid tier) e.g. "Raise-ready fundamentals" (3 paths, 6 weeks)

**Browse categories:**
- Raising Capital (5 subjects)
- Deal Terms (5 subjects)
- Founder Finance (5 subjects)
- Ownership (5 subjects)
- Investor Readiness (5 subjects)
- Operating Basics (5 subjects)

**Interactions:**
- Click subject card → `CoursePreviewModal` with topic description, lesson count, first lesson title
- Click book → `BookPreviewModal` with author, hook, all lesson titles
- "Start this path" → immediately starts course (no onboarding for browse paths)
- Free tier: max 2 active custom courses (browse paths count separately)
- `CourseCarousel` — horizontal scroll of featured subjects with topic thumbnails

---

### 7.11 Auth Flow

**Purpose:** Account creation / sign in. Minimal friction.

**Trigger points:**
- After first quiz completion (primary gate — user has already experienced value)
- Manual "Sign in / Sign up" from header
- Upgrade flow for non-signed-in users

**Fields:** Name + Email (email-only option also supported)

**Post-auth logic:**
- If `pendingCourse + pendingQuizComplete`: save course with `progress: 1`, streak = 1, StreakMoment, → today feed
- If `pendingCourse` only: save course with `progress: 0`, → today feed
- Otherwise: → `authBackTarget` (today or landing)

---

### 7.12 Flashcard Screen

**Purpose:** Spaced repetition review of saved flashcard decks.

**Mechanics:**
- Card sets are created per lesson from the lesson reader
- Each set has a topic, lesson title, and N cards (front/back)
- Flip animation to reveal answer
- Self-assessment: Knew it / Almost / Didn't know
- Cards shuffle; incorrect cards resurface
- Delete set option

**Note:** This is the explicit spaced repetition layer — explicitly positions Curi as "a learning system, not just daily content."

---

### 7.13 Profile Screen

**Purpose:** Account settings, learning preferences, email configuration, billing.

**Sections:**

| Section | Fields |
|---|---|
| Account | Name, email, certificate name |
| Learning preferences | Curiosity context, goal, lesson depth default, learning style |
| Daily email | Enabled toggle, delivery time (morning/evening), format (Full/Summary), weekends, weekly digest |
| Theme | System / Light / Dark |
| Plan | Free / Paid badge, Upgrade CTA, Billing link |
| Danger zone | Sign out |

---

### 7.14 Course Complete Screen

**Purpose:** Celebrate finishing a course. Bridge to the next path.

**Elements:**
- Completion headline + course topic (large serif)
- Streak display
- Certificate preview (downloadable PDF via `lib/certificate.js`)
- Shareable fact card
- "Start a new path" CTA → topic selector
- "Go to home" secondary CTA

---

### 7.15 Upgrade Screen

**Purpose:** Paywall for paid features.

**Free tier limits:**
- Max 2 active custom courses
- No book paths (paid-only)
- No sequence bundles
- No Rabbit Hole (further reading section in lesson)
- Lesson email ads (free tier only)

**Paid tier unlocks:**
- Unlimited active courses
- All book paths
- Sequence bundles
- Rabbit Hole section
- Ad-free emails

---

### 7.16 Lesson Complete Modal

**Purpose:** Interstitial after each quiz. Celebrates the moment before navigating away.

**Content:**
- Lesson title completed
- Next lesson title preview
- Current streak count
- `N of N lessons done` progress
- "Continue" closes modal → StreakMoment animation → back to source screen

---

### 7.17 StreakMoment

**Purpose:** Full-screen streak celebration overlay. Appears for ~1.9s after each lesson completion and after auth-save.

**Design:** Large Fraunces streak number, streak label, `streak-pop` CSS keyframe animation.

---

### 7.18 Previous Courses Page

**Purpose:** Full list view of all courses across all states (active, completed, shelved).

**Tabs:** Active / Completed / Shelved

**Actions per course:**
- Active: Open course path
- Completed: Open course path (all lessons accessible)
- Shelved: Open course path (read-only view)

---

### 7.19 Archive Reader

**Purpose:** Read any lesson from a completed course.

- Same layout as Lesson Reader
- Sidebar lesson list for navigation
- "Retake quiz" option → Archive Quiz screen

---

### 7.20 Daily Email Preview

**Purpose:** Preview of the daily lesson email. Dev/demo tool + future real email.

**Email structure:**
1. Header with wordmark + metadata (Day N · Topic · Level)
2. Lesson title (Fraunces 32px)
3. Lesson body (PJS Light, 16px)
4. Pull quote (Vermilion left border)
5. Ad placement (free tier only)
6. Takeaways
7. Tomorrow teaser
8. Footer with unsubscribe

---

## 8. Feature Inventory

### Core Features (built)

| Feature | Status | Notes |
|---|---|---|
| Topic input + typewriter headline | ✅ | Auto-cycling through 12 subjects |
| Suggestion pills (cycling batches) | ✅ | 8 topics, 4 per batch, 3.6s cycle |
| 4-step onboarding with smart defaults | ✅ | Pre-fills when entering from landing |
| Lesson generation (streaming reveal) | ✅ | 230ms per lesson, 1.6s warmup |
| Curated lesson sets (30+ topics) | ✅ | Hand-authored for known topics |
| Default lesson templates (any topic) | ✅ | Dynamic from topic+aspect |
| Lesson depth: Intro / Standard / Deep | ✅ | 7 / 14 / 30 lessons |
| Lesson reader (full editorial layout) | ✅ | Pull quote, takeaways, equation visual |
| Multiple choice quiz (4 questions) | ✅ | Difficulty rating, no answer explanation |
| Auth wall after first quiz | ✅ | Smooth post-auth course save + streak |
| Streak tracking + StreakMoment | ✅ | Increments per quiz completion |
| Lesson activity contribution graph | ✅ | 26-week heatmap, amber heat scale |
| Today feed | ✅ | Feed built from active courses |
| Dashboard + analytics | ✅ | Metrics, contribution graph, badges |
| Library (in progress / completed / shelved) | ✅ | Three tabs, Trophy cards |
| Course path map | ✅ | Chapter groups, lesson nodes, progress ring |
| Explore / Browse catalogue | ✅ | 30 subjects, book paths, sequences |
| Course preview modal | ✅ | Description, lesson list, start CTA |
| Book paths | ✅ | 20+ books with curated lessons |
| Sequence bundles (paid) | ✅ | Multi-path, ~6 weeks each |
| Flashcard decks (spaced repetition) | ✅ | Save from lesson, review in Flashcards screen |
| Audio player (Web Speech API) | ✅ | Floating player, speed control |
| Course complete screen + certificate | ✅ | PDF certificate via canvas |
| Lesson complete modal | ✅ | Next lesson preview, streak count |
| Profile + preferences | ✅ | Full settings, email config |
| Daily email preview | ✅ | Preview mode with tomorrow teaser |
| Archive reader | ✅ | Re-read completed course lessons |
| Archive quiz retake | ✅ | Retake quiz on archived lessons |
| Upgrade screen + paywall | ✅ | Free/paid plan gating |
| Billing screen | ✅ | Plan management |
| Endowed progress effect | ✅ | +1 step added to progress bar visually |
| Dev toolbar | ✅ | 6 state presets for testing |
| Shareable fact card | ✅ | One insight per lesson, formatted for sharing |

### Features Not Yet Built

| Feature | Priority | Notes |
|---|---|---|
| Real AI lesson generation (Claude API) | High | Currently uses curated/template lessons |
| Real authentication (Supabase/Auth0) | High | Currently mock state |
| Actual daily email delivery | High | Preview exists, no sending |
| Push notifications | Medium | Streak at-risk warning |
| Real payment/billing (Stripe) | High | Currently mock plan toggle |
| Persistent storage | High | All state is in-memory; lost on refresh |
| Mobile app (React Native) | Medium | Web-first prototype |
| Social sharing of shareable facts | Low | Card exists, no share action |
| Certificate download (functional) | Medium | Canvas code exists in lib/certificate.js |
| Rabbit Hole (further reading links) | Low | UI placeholder, no real data |
| Real quiz question generation | High | Currently uses lessonBlurb templates |
| Search within library | Medium | Toggle exists in Library, scope TBD |
| Curi catalogue / topic directory | Medium | Browse exists, needs SEO/discoverability |

---

## 9. Data Architecture

### Core State (App.jsx)

All state is React `useState` — in-memory only. No persistence between sessions.

```
screen              — current active screen
topic               — active course topic input
aspect              — chosen angle/lens
level               — depth (Intro / Standard / Deep dive)
curiosityReason     — onboarding step 1 answer
desiredOutcome      — onboarding step 2 answer  
learningStyle       — onboarding step 3 answer
generatedLessons    — lessons revealed so far during generation
isGenerating        — generation in progress flag
signedIn            — auth status
courses             — array of active/in-progress Course objects
activeCourseId      — which course is primary
streak              — cumulative daily streak count
lessonActivityByDay — { "YYYY-MM-DD": count } lesson activity log
pendingCourse       — course awaiting auth save (pre-auth lesson reading)
pendingQuizComplete — true when quiz done but auth not yet completed
cardSets            — flashcard deck array
nowPlaying          — audio player state
plan                — "free" | "paid"
user                — { name, email, certificateName, preferences }
```

### Course Object Schema

```json
{
  "id": "number | string",
  "topic": "string",
  "aspect": "string",
  "level": "Intro | Standard | Deep dive",
  "duration": "number (7 | 14 | 30)",
  "context": {
    "curiosityReason": "string",
    "desiredOutcome": "string",
    "learningStyle": "string"
  },
  "progress": "number (lesson index)",
  "lessons": ["string", ...],
  "lastDifficulty": "Easy | Medium | Hard | null",
  "bookAuthor": "string (optional — book paths only)",
  "bookId": "string (optional)"
}
```

### Completed Course Schema (seed data)

```json
{
  "id": "string",
  "topic": "string",
  "completedOn": "string (human label)",
  "certificate": "boolean",
  "lessons": ["string", ...],
  "insight": "string (strongest area note)"
}
```

### FlashCard Set Schema

```json
{
  "id": "string",
  "topic": "string",
  "lessonTitle": "string",
  "cards": [{ "front": "string", "back": "string" }]
}
```

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | TailwindCSS 3 + custom CSS tokens |
| Icons | Lucide React |
| Audio | Web Speech API (SpeechSynthesisUtterance) |
| Certificate | HTML Canvas (lib/certificate.js) |
| Routing | None — single `useState("screen")` state machine |
| Fonts | Google Fonts: Fraunces (serif display) + Plus Jakarta Sans (UI/body) — loaded in index.html |
| Data | Hardcoded JS modules in `/src/data/` |
| State | React `useState` + `useMemo` — no external state library |
| Persistence | None (prototype) |

### File Structure

```
src/
├── App.jsx              — Root component; all state + routing
├── pages/
│   ├── Landing.jsx      — Landing page component
│   └── AppScreens.jsx   — All other screens (~7000 lines)
├── components/
│   ├── ui/              — Shadcn-style primitive components
│   ├── Sidebar.jsx      — Left nav (authenticated)
│   ├── Header.jsx       — Top nav (mobile / unauthenticated)
│   ├── AudioPlayer.jsx  — Floating audio player
│   ├── StreakMoment.jsx — Full-screen streak animation
│   ├── LessonCompleteModal.jsx
│   ├── CourseLessonList.jsx
│   └── ...
├── data/
│   ├── course-data.js   — SEED_COURSES, completedCourses, magazineLessons
│   ├── onboarding-data.js — Options for each step, topic suggestions
│   ├── browse-data.js   — BROWSE_CATEGORIES, BOOK_PATHS, LEARNING_SEQUENCES
│   └── profile-data.js
├── lib/
│   ├── lesson-utils.js  — buildCourseLessons, getLessonsForSubject, COURSE_SUMMARIES
│   ├── date-utils.js    — localDateKey, buildLessonActivitySeed
│   ├── feed-utils.js    — lessonBlurb
│   ├── lesson-content.js
│   ├── topic-utils.js
│   ├── certificate.js   — PDF/canvas certificate generation
│   ├── dev-utils.js     — Dev mode fixtures
│   └── utils.js
└── styles.css           — CSS custom properties (--c-* tokens), animations
```

---

## 11. Design System Summary

Full specification: `curi-brand-guidelines-v2.md`

### Core Principle

Strict monotone palette with a single disciplined accent (Vermilion `#C1121F`). Vermilion appears **once per screen maximum** — when something is the most important thing on that surface.

### Colour Tokens (app implementation)

```css
--c-bg:           #FAFAF8   /* body background */
--c-surface:      #F3F1EC   /* card / sidebar */
--c-ink:          #1C1917   /* primary text */
--c-ink-3:        #6B6760   /* secondary text */
--c-ink-4:        #9E9B94   /* label / caption */
--c-line:         #E8E4DC   /* standard border */
--c-line-strong:  #D4D0C8   /* strong border */
--c-vermilion:    #C1121F   /* accent — once per screen */
```

### Typography

| Role | Font | Sizes |
|---|---|---|
| Display/Headline | Fraunces (Fraunces Light, italic) | 3.2rem → 52px |
| UI/Body | Plus Jakarta Sans (Light 300) | 10px → 18px |
| Metadata/Labels | JetBrains Mono | 8px → 11px |

### Layout

- Desktop: Sidebar (84px) + main content area
- Mobile: No sidebar; sticky top header with wordmark + auth buttons
- Content max-width: 680px (lesson reader), 1280px (dashboard)
- Lesson + Course Path screens: full-screen, no outer padding

### Animations

- `curi-animate-in` class on all screen transitions: `translateY(20px) → 0 + opacity 0 → 1`, 900ms
- `streak-pop` keyframe: scale + fade for StreakMoment
- `section-enter` on section/article elements
- Spring easing: `cubic-bezier(0.16, 1, 0.3, 1)` throughout

---

## 12. Monetisation

### Current Model

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 2 active custom courses, no book paths, no sequences, email ads |
| Paid | TBD | Unlimited courses, all book paths, all sequences, no ads |

### Paywall Trigger Points

1. Creating a 3rd custom course (`tryNewCourse` checks `courses.filter(c => !c.bookAuthor).length >= 2`)
2. Starting any book path with `tier: "paid"`
3. Starting any learning sequence
4. Accessing Rabbit Hole section in lesson reader

### Upgrade Flow

1. Soft paywall modal with feature list
2. If signed in: unlock plan (`setPlan("paid")`)
3. If not signed in: go to auth first, then upgrade

---

## 13. Analytics & Retention Hooks

### Habit Mechanics

| Hook | Mechanism |
|---|---|
| **Streak** | Increments per quiz completion. Visible in sidebar, today feed, dashboard. Shows "at risk" state (orange flame) if streak exists but no lesson today. |
| **Endowed Progress Effect** | All progress bars add 1 virtual step — starting at ~7% rather than 0%. Psychologically, you've already begun. |
| **StreakMoment** | Full-screen celebration for ~1.9s. Fires after each quiz and after auth-save. Disproportionate reward for a small action. |
| **Lesson Complete Modal** | Shows next lesson title before navigating away — creates a micro-cliffhanger. |
| **Streak at Risk** | Sidebar flame turns orange and shows `N!` if today's lesson hasn't been done. |
| **Contribution Graph** | 26-week heatmap. Visual representation of the learning habit forming. Strong "don't break the chain" signal. |
| **Course Path Map** | Visual progress map with cleared/current/locked nodes. Game-like forward momentum. |
| **Academy Insights** | Recall strength, return rhythm, concepts held, decision depth — makes the habit feel like it's working. |
| **Daily Email** | Morning lesson delivery. Tomorrow teaser creates anticipation. |
| **Free to start** | No account needed until after first quiz. Maximum reduction of initial commitment. |
| **Read before auth** | Auth gate placed after first quiz, not after course generation. By then the user has experienced the product and invested in finishing lesson 1. |

---

## 14. Open Questions & Future Work

### Product Questions

1. **Spaced repetition algorithm** — Currently the flashcard screen is manual. Should Curi schedule which flashcards surface when (SM-2 algorithm or similar)?
2. **Quiz question quality** — Current questions are generated from lesson title templates. Real questions should be authored per lesson or generated via AI.
3. **Daily email timing** — The email preference exists (morning/evening) but no scheduling system yet. When should email delivery be built?
4. **Topic expansion** — Current curated content is 100% founder/startup finance. When does general topic support become real (vs template-only)?
5. **Multi-course management** — With multiple active courses, should there be a "primary" concept more explicit than `activeCourseId`? Should courses have explicit pause/resume actions?
6. **Rabbit Hole** — The further reading section exists in the lesson layout but has no content. What's the curation model?

### Technical Questions

1. **Persistence layer** — Supabase vs custom backend? What data absolutely must persist (streak, progress) vs what can be reconstructed?
2. **AI content generation** — Claude API integration for on-the-fly lesson content, quiz generation, and personalisation. How much is pre-authored vs generated?
3. **State management** — Single-file App.jsx at ~3,500 lines is approaching unsustainable. When to split into context providers or Zustand/Jotai?
4. **Mobile** — Is the current responsive design sufficient for launch, or does a native mobile app need to be on the roadmap explicitly?
5. **Certificate generation** — `lib/certificate.js` exists but certificate download action is not wired to a button. When should this ship?

### Growth Questions

1. **ICP validation** — Has the founder-finance content been tested with real first-time founders?
2. **Activation metric** — What is the North Star? Lesson 1 completion? First quiz? Streak of 3?
3. **Retention signal** — At what streak length / lesson count does a user become retained?
4. **Launch community** — Which specific community (Indie Hackers / EF / a specific Slack) is the beachhead?
5. **Word-of-mouth hook** — Shareable facts and certificates exist. What's the actual share mechanic?

---

## Appendix A: Curated Topic Library

30 founder-finance topics with full lesson sets (10–14 lessons each):

Venture Capital · Term Sheets · Unit Economics · SAFE Notes · Cap Tables · Fundraising · Burn Rate · Founder Equity · Investor Meetings · Data Rooms · Closing a Round · Liquidation Preferences · Pro-Rata Rights · Board Control · Gross Margin · CAC Payback · Net Revenue Retention · Option Pools · Dilution · Liquidation Waterfalls · Pitch Narrative · Market Sizing · Pricing Strategy · Go-to-Market Metrics · Investor Updates · Hiring Before Seed · Founder Agreements · Customer Discovery · Metrics Hygiene · Advisor Equity

## Appendix B: Book Paths Library

20+ books with curated lesson sets (8–12 lessons each):

**Fundraising & VC:** Venture Deals (Brad Feld) · Secrets of Sand Hill Road (Scott Kupor) · Angel (Jason Calacanis) · Mastering the VC Game (Jeffrey Bussgang) · Startup Boards (Brad Feld) · The Founder's Dilemmas (Noam Wasserman)

**Startup Fundamentals:** Zero to One (Peter Thiel) · The Lean Startup (Eric Ries) · The Hard Thing About Hard Things (Ben Horowitz) · Blitzscaling (Reid Hoffman)

**Unit Economics & Finance:** (TBC)

## Appendix C: Depth Options

| Level | Lessons | Duration | Description |
|---|---|---|---|
| Intro | 7 | ~1 week | The essentials, clearly explained |
| Standard | 14 | ~2 weeks | Full mental model with real nuance |
| Deep dive | 30 | ~1 month | Every angle, every edge case |

## Appendix D: Learning Sequences (Paid)

| Sequence | Paths | Duration |
|---|---|---|
| Raise-ready fundamentals | Unit Economics + Term Sheets + Venture Capital | ~6 weeks |
| Ownership & dilution | Cap Tables + SAFE Notes + Founder Equity | ~4 weeks |
| The full fundraise | Investor Meetings + Fundraising + Closing a Round | ~5 weeks |

---

*Curi — curiosity, engineered.*

*This document was generated on 26 May 2026 from a comprehensive review of the codebase, brand guidelines, and ICP documentation.*
