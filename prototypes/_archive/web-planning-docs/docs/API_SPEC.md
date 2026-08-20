# Curi — API Specification

**Version:** 1.0  
**Date:** May 2026  
**Base URL:** `https://curi.co/api`

> All authenticated endpoints require a valid Supabase session cookie. Responses are JSON unless specified. Errors follow the format: `{ error: string, message: string }`.

---

## Authentication

Supabase Auth manages sessions via `httpOnly` cookies. The session cookie is set automatically by the Supabase auth helpers for Next.js.

| Header | Value |
|---|---|
| `Cookie` | `sb-{ref}-auth-token=...` (set automatically) |

---

## Courses

### `POST /api/courses`
Create a new course.

**Auth:** Required  
**Plan gate:** Free tier — max 2 active non-book courses

**Request body:**
```typescript
{
  topic: string;                    // User's topic input
  aspect: string;                   // Chosen angle
  level: 'Intro' | 'Standard' | 'Deep dive';
  curiosityReason?: string;
  desiredOutcome?: string;
  learningStyle?: string;
  isBookPath?: boolean;
  bookId?: string;
  bookAuthor?: string;
}
```

**Response `201`:**
```typescript
{
  id: string;                       // Course UUID
  topic: string;
  level: string;
  duration: 7 | 14 | 30;
  lessons: string[];                // Array of lesson titles
  status: 'in_progress';
}
```

**Errors:**
- `403 FREE_TIER_LIMIT` — User is on free plan and has 2+ active courses
- `422 VALIDATION_ERROR` — Invalid body

---

### `GET /api/courses/[id]`
Get course details with full lesson list.

**Auth:** Required

**Response `200`:**
```typescript
{
  id: string;
  topic: string;
  aspect: string;
  level: string;
  duration: number;
  progress: number;                 // Next lesson index (0 = not started)
  status: 'in_progress' | 'completed' | 'shelved';
  lessons: {
    index: number;
    title: string;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  completedAt?: string;
}
```

---

### `PATCH /api/courses/[id]`
Update course status.

**Auth:** Required

**Request body:**
```typescript
{
  status?: 'shelved' | 'in_progress';  // Shelve or unshelve
}
```

**Response `200`:** Updated course object

---

### `DELETE /api/courses/[id]`
Delete a course permanently.

**Auth:** Required

**Response `204`:** No content

---

## Lessons

### `GET /api/courses/[id]/lessons/[index]`
Get lesson content. Generates via Claude if not cached.

**Auth:** Required  
**Note:** Response may be slow (up to 10s) if content is being generated for the first time. Use streaming endpoint for better UX.

**Response `200`:**
```typescript
{
  title: string;
  lessonIndex: number;
  totalLessons: number;
  topic: string;
  pullQuote: string;
  bodyParagraphs: string[];
  visualBlock: {
    equation: string;
    caption: string;
  };
  takeaways: string[];
  shareableFact: string;
  rabbitHole?: {                    // null for free tier
    links: { title: string; url: string; summary: string }[];
  };
  wordCount: number;
}
```

**Errors:**
- `403 RABBIT_HOLE_LOCKED` — rabbitHole section locked (free tier)
- `404` — Course or lesson index not found

---

### `GET /api/courses/[id]/lessons/[index]/stream`
Stream lesson content as Server-Sent Events. Use this for the lesson reader.

**Auth:** Required  
**Response:** `text/event-stream`

```
data: {"type":"start","title":"The Anatomy of a SAFE Note"}

data: {"type":"pull_quote","text":"A SAFE is not debt. It is a promise — contingent, patient, and often misread."}

data: {"type":"body","paragraphIndex":0,"text":"When Y Combinator introduced..."}

data: {"type":"body","paragraphIndex":1,"text":"The valuation cap is..."}

data: {"type":"body","paragraphIndex":2,"text":"Most founders..."}

data: {"type":"visual_block","equation":"Ownership = Investment ÷ (Cap + Option Pool)","caption":"..."}

data: {"type":"takeaways","items":["A SAFE converts...","The cap protects...",...]}

data: {"type":"shareable_fact","text":"A post-money SAFE dilutes..."}

data: {"type":"complete"}
```

---

## Quiz

### `GET /api/courses/[id]/lessons/[index]/quiz`
Get quiz questions for a lesson (without correct answers).

**Auth:** Required

**Response `200`:**
```typescript
{
  lessonIndex: number;
  lessonTitle: string;
  questions: {
    id: string;
    questionIndex: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }[];
}
```

---

### `POST /api/courses/[id]/lessons/[index]/quiz`
Submit quiz answers. Returns score and streak update.

**Auth:** Required

**Request body:**
```typescript
{
  answers: {
    questionId: string;
    selectedOption: 'A' | 'B' | 'C' | 'D';
  }[];
  difficultyRating?: 'Easy' | 'Medium' | 'Hard';
}
```

**Response `200`:**
```typescript
{
  score: number;                    // 0–4
  maxScore: 4;
  answers: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    correctOption: string;          // Revealed after submission
  }[];
  streakBefore: number;
  streakAfter: number;
  streakChanged: boolean;
  courseProgress: number;           // Updated progress index
  courseCompleted: boolean;
}
```

**Side effects:**
- Inserts `quiz_attempts` record
- Updates `lesson_activity` (upsert)
- Updates `courses.progress`
- If `courseCompleted`: sets `courses.status = 'completed'`, triggers completion email

---

## Feed

### `GET /api/feed`
Get the today feed for the authenticated user.

**Auth:** Required

**Response `200`:**
```typescript
{
  greeting: string;                 // "Good morning, Awais"
  date: string;                     // "Wednesday, 27 May"
  streak: number;
  streakAtRisk: boolean;
  courses: {
    courseId: string;
    topic: string;
    aspect: string;
    level: string;
    progress: number;
    duration: number;
    nextLesson: {
      index: number;
      title: string;
    };
    isPrimary: boolean;             // First/most active course
  }[];
  flashcardDecks: {
    id: string;
    topic: string;
    lessonTitle: string;
    cardCount: number;
  }[];
}
```

---

## Library

### `GET /api/library`
Get all courses grouped by status.

**Auth:** Required

**Response `200`:**
```typescript
{
  inProgress: CourseListItem[];
  completed: CompletedCourseListItem[];
  shelved: CourseListItem[];
}

// CourseListItem
{
  id: string;
  topic: string;
  aspect: string;
  level: string;
  progress: number;
  duration: number;
  createdAt: string;
}

// CompletedCourseListItem
{
  id: string;
  topic: string;
  level: string;
  duration: number;
  completedAt: string;
  hasCertificate: boolean;
}
```

---

## Dashboard

### `GET /api/dashboard`
Get dashboard analytics data.

**Auth:** Required

**Response `200`:**
```typescript
{
  streak: number;
  streakAtRisk: boolean;
  lessonActivity: {
    date: string;                   // "YYYY-MM-DD"
    count: number;
  }[];                              // Last 26 weeks
  stats: {
    recallStrength: number;         // % quiz correct answers (last 30 days)
    returnRhythm: number;           // Active days per week (last 4 weeks)
    conceptsHeld: number;           // Unique lessons completed
    quizzesCompleted: number;
  };
  activeCourses: CourseListItem[];
  completedCourses: CompletedCourseListItem[];
}
```

---

## Flashcards

### `GET /api/flashcards`
Get all flashcard decks.

**Auth:** Required

**Response `200`:**
```typescript
{
  decks: {
    id: string;
    topic: string;
    lessonTitle: string;
    cardCount: number;
    createdAt: string;
  }[];
}
```

### `GET /api/flashcards/[id]`
Get a specific deck with all cards.

**Response `200`:**
```typescript
{
  id: string;
  topic: string;
  lessonTitle: string;
  cards: {
    id: string;
    front: string;
    back: string;
    sortOrder: number;
  }[];
}
```

### `POST /api/flashcards`
Create a new deck with cards.

**Request body:**
```typescript
{
  courseId?: string;
  lessonIndex?: number;
  topic: string;
  lessonTitle: string;
  cards: { front: string; back: string }[];
}
```

### `DELETE /api/flashcards/[id]`
Delete a deck and all its cards.

**Response `204`:** No content

---

## User & Preferences

### `GET /api/user`
Get authenticated user profile.

**Response `200`:**
```typescript
{
  id: string;
  email: string;
  name?: string;
  certificateName?: string;
  plan: 'free' | 'paid';
  subscriptionEndsAt?: string;
  createdAt: string;
  preferences: {
    defaultDepth: string;
    defaultLearningStyle: string;
    emailEnabled: boolean;
    emailDeliveryTime: 'morning' | 'evening';
    emailFormat: 'full' | 'summary';
    emailWeekends: boolean;
    theme: 'system' | 'light' | 'dark';
  };
}
```

### `PATCH /api/user`
Update user profile.

**Request body (all optional):**
```typescript
{
  name?: string;
  certificateName?: string;
}
```

### `PATCH /api/user/preferences`
Update user preferences.

**Request body (all optional):**
```typescript
{
  defaultDepth?: string;
  defaultLearningStyle?: string;
  emailEnabled?: boolean;
  emailDeliveryTime?: 'morning' | 'evening';
  emailDeliveryHour?: number;
  emailDeliveryTz?: string;
  emailFormat?: 'full' | 'summary';
  emailWeekends?: boolean;
  emailWeeklyDigest?: boolean;
  theme?: 'system' | 'light' | 'dark';
}
```

---

## Billing

### `POST /api/billing/checkout`
Create a Stripe Checkout session. Returns the Stripe-hosted checkout URL.

**Auth:** Required

**Request body:**
```typescript
{
  priceId: string;              // Stripe Price ID (monthly or annual)
  successUrl?: string;          // Default: /app/today?upgraded=1
  cancelUrl?: string;           // Default: /app/profile
}
```

**Response `200`:**
```typescript
{
  checkoutUrl: string;          // Redirect user to this URL
}
```

### `POST /api/billing/portal`
Create a Stripe Customer Portal session.

**Auth:** Required

**Response `200`:**
```typescript
{
  portalUrl: string;
}
```

---

## Sharing & OG Images

### `GET /api/share/lesson/[courseId]/[lessonIndex]`
Returns an OG image for a lesson's shareable fact.

**Auth:** Not required (public)  
**Content-Type:** `image/png`  
**Dimensions:** 1200×630

### `GET /api/share/course/[courseId]`
Returns an OG image for course completion.

**Auth:** Not required (public, course must be completed)  
**Content-Type:** `image/png`  
**Dimensions:** 1200×630

### `GET /api/courses/[id]/certificate`
Generate and return a PDF certificate.

**Auth:** Required (must own course and course must be completed)  
**Content-Type:** `application/pdf`

---

## Pending Courses (Pre-Auth)

### `POST /api/pending-courses`
Create an anonymous pending course (before sign-up).

**Auth:** Not required  
**Cookie:** Sets `curi-session` cookie with `sessionToken`

**Request body:** Same as `POST /api/courses`

**Response `201`:**
```typescript
{
  id: string;
  topic: string;
  lessons: string[];
  sessionToken: string;
}
```

### `POST /api/pending-courses/migrate`
Migrate a pending course to the authenticated user's account.

**Auth:** Required  
**Cookie:** Reads `curi-session` cookie

**Response `201`:** The newly created `Course` object

---

## Cron Endpoints (Internal)

Protected by `Authorization: Bearer {CRON_SECRET}` header.

### `POST /api/crons/daily-email`
Dispatch daily lesson emails to eligible users.

### `POST /api/crons/cleanup`
Delete expired pending courses and other stale data.

---

## Webhooks

### `POST /api/webhooks/stripe`
Stripe webhook receiver. Verifies signature, handles events.

Events handled:
- `customer.subscription.created`
- `customer.subscription.deleted`
- `customer.subscription.updated`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

**Response `200`:** `{ received: true }`

---

## Error Reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session but insufficient permissions |
| `FREE_TIER_LIMIT` | 403 | Action blocked by free plan limits |
| `NOT_FOUND` | 404 | Resource doesn't exist or not owned by user |
| `VALIDATION_ERROR` | 422 | Request body fails Zod validation |
| `CONTENT_GENERATION_FAILED` | 502 | Claude API failed to generate valid content |
| `INTERNAL_ERROR` | 500 | Unexpected server error (logged to Sentry) |

---

*Curi — curiosity, engineered.*
