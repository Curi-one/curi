# Curi — SEO Architecture

**Version:** 1.0  
**Date:** May 2026

> Every lesson generated becomes a public, indexable page. The SEO layer is not a separate content strategy — it is the product content, made public. Google reads the lesson. The reader becomes a user.

---

## The Core Loop

```
Google indexes /learn/venture-capital/what-is-venture-capital
    │
    ▼
Founder searching "how does venture capital work" finds it
    │
    ▼
Reads the full lesson (no gate — the lesson IS the SEO content)
    │
    ▼
"Take the quiz for this lesson →" CTA at bottom
    │
    ▼
Auth screen → creates account → lesson marked complete → streak begins
    │
    ▼
Daily habit loop (email, quiz, streak)
```

The SEO page is not a teaser or a summary — it is the complete lesson. This is deliberate. The product earns trust by giving the best version of the content away for free. The quiz, the streak, and the daily return are what require an account.

---

## URL Structure

### Public Routes (no auth)

```
/learn                                              Topic directory
/learn/[topic-slug]                                 Topic landing page
/learn/[topic-slug]/[lesson-slug]                   Individual lesson
/learn/[topic-slug]/[lesson-slug]/quiz              Public quiz (anon, not tracked)
```

### Examples

```
/learn/venture-capital
/learn/venture-capital/what-is-venture-capital
/learn/venture-capital/how-vcs-make-money
/learn/venture-capital/the-fund-structure-explained

/learn/term-sheets
/learn/term-sheets/anatomy-of-a-term-sheet
/learn/term-sheets/valuation-pre-vs-post-money

/learn/safe-notes
/learn/safe-notes/what-is-a-safe-note
```

### Slug Generation

Topic slugs are pre-defined for the 30 curated topics:
```typescript
const TOPIC_SLUGS: Record<string, string> = {
  'Venture Capital': 'venture-capital',
  'Term Sheets': 'term-sheets',
  'SAFE Notes': 'safe-notes',
  'Cap Tables': 'cap-tables',
  // ...
};
```

Lesson slugs are generated from the lesson title:
```typescript
function lessonSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
// "What is a SAFE Note?" → "what-is-a-safe-note"
```

---

## Page Specifications

### `/learn` — Topic Directory

**Purpose:** Sitemap-style index of all 30 curated topics. Targets queries like "micro-learning startup finance".

**Layout:**
```
Curi — A learning system for curious founders

[Topic Card Grid — 2 columns]
  ┌────────────────────────┐  ┌────────────────────────┐
  │ VENTURE CAPITAL        │  │ TERM SHEETS            │
  │ 14-lesson track        │  │ 14-lesson track        │
  │ Starts: What is VC?    │  │ Starts: Anatomy of...  │
  │ → Begin the track      │  │ → Begin the track      │
  └────────────────────────┘  └────────────────────────┘
  ...
```

**SEO meta:**
- Title: `Founder Finance — A micro-learning system | Curi`
- Description: `Learn venture capital, term sheets, cap tables, and more. 3 minutes a day. Structured lessons with quizzes. Free to start.`

**Rendering:** Static (rebuilt on deploy). Topics never change at this tier.

---

### `/learn/[topic-slug]` — Topic Landing Page

**Purpose:** Full curriculum listing for one topic. Targets queries like "learn venture capital" or "venture capital explained".

**Layout:**
```
  VENTURE CAPITAL                          ← Fraunces 52px
  14 lessons · 3 min each · Free to start

  "Venture capital is not a funding source.
   It is a wager on a specific kind of company."     ← Pull quote from Lesson 1

  ─────────────────────────────────────

  THE CURRICULUM                           ← All 14 lesson titles
  01  What is Venture Capital?             ← Clickable
  02  How VCs Make Money                  ← Clickable
  03  The Fund Structure Explained        ← Clickable
  ...
  14  Choosing the Right Investor

  ─────────────────────────────────────

  [Read Lesson 1 →]                        ← Primary CTA
  Free to start · No account needed until after your first quiz

```

**SEO meta:**
- Title: `Venture Capital — 14-lesson curriculum | Curi`
- Description: `A structured 14-lesson track on venture capital for first-time founders. Learn how VCs think, how funds work, and what they're looking for. 3 minutes a day.`
- JSON-LD: `Course` schema (see §Structured Data)

**Rendering:** Static (ISR, 24h revalidation). Content changes rarely.

---

### `/learn/[topic-slug]/[lesson-slug]` — Individual Lesson Page

**Purpose:** The primary SEO surface. A complete, indexable lesson. Targets long-tail queries like "what is a valuation cap safe note" or "how does option pool dilution work".

**Layout:**
```
  ← Back to Venture Capital               ← Breadcrumb

  LESSON 3 OF 14 · VENTURE CAPITAL

  The Fund Structure Explained             ← Fraunces 52px

  "A venture fund is not a savings account.
   It is a portfolio of bets, structured to
   survive nine failures and one win."      ← Pull quote, Vermilion border

  [Full lesson body — 3 paragraphs]

  [Visual block — equation card]

  ─── KEY TAKEAWAYS ───

  01  Most VC funds have a 10-year life...
  02  The 2-and-20 model means...
  03  A fund's portfolio construction...

  ─────────────────────────────────────
  TRACK YOUR RETENTION

  Did this lesson stick?
  Take a 4-question quiz — it takes 90 seconds.

  [Take the quiz →]                        ← Primary CTA → auth if needed

  ─────────────────────────────────────
  WHAT COMES NEXT

  ← Lesson 2: How VCs Make Money          ← Prev lesson link
  → Lesson 4: LP and GP Dynamics          ← Next lesson link

  ─────────────────────────────────────
  THE FULL TRACK

  This lesson is part of the Venture Capital
  14-lesson curriculum.

  [See all 14 lessons →]                  ← → topic landing page

```

**SEO meta:**
- Title: `{Lesson title} | Curi`
- Description: First sentence of pull quote (≤160 chars) + topic/track context
- OG image: Dynamically generated (`/api/og/learn/[topic]/[lesson]`)
- Canonical: `https://curi.co/learn/[topic-slug]/[lesson-slug]`
- JSON-LD: `Article` schema (see §Structured Data)

**Rendering:** ISR with 24h revalidation. `generateStaticParams` pre-builds all 30×14=420 canonical lesson pages at deploy time.

```typescript
// app/learn/[topic]/[lesson]/page.tsx
export async function generateStaticParams() {
  const lessons = await getAllCanonicalLessons(); // From DB
  return lessons.map(l => ({
    topic: l.topicSlug,
    lesson: l.lessonSlug,
  }));
}

export const revalidate = 86400; // 24 hours
```

---

## Content Source: Canonical Lessons

SEO pages use **canonical lessons** — a `learning_style = null` variant stored in `shared_lesson_cache`. These are:

- Neutral in style (no story-first or model-first framing — balanced)
- Pre-generated for all 30 curated topics before launch
- Authoritative — the "official" Curi version of each lesson
- Publicly readable (no RLS restriction)
- Referenced by SEO pages; optionally used by app users with no style preference

See `AI_CONTENT.md` §Shared Lesson Cache for generation and lookup logic.

### Pre-seeding canonical lessons before launch

```bash
# Script: scripts/seed-canonical-lessons.ts
# Generates all 30 × 14 = 420 canonical lessons before launch
# Cost: ~420 Claude calls × $0.01 = ~$4.20 total
# Run once, store permanently

pnpm run seed:canonical-lessons
```

---

## Structured Data (JSON-LD)

### Topic Landing Page — `Course` schema

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Venture Capital — 14-lesson curriculum",
  "description": "A structured 14-lesson track on venture capital...",
  "provider": {
    "@type": "Organization",
    "name": "Curi",
    "url": "https://curi.co"
  },
  "educationalLevel": "Beginner",
  "timeRequired": "PT42M",
  "numberOfCredits": 14,
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "PT3M"
  }
}
```

### Individual Lesson — `Article` schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Fund Structure Explained",
  "description": "A venture fund is not a savings account...",
  "author": {
    "@type": "Organization",
    "name": "Curi"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Curi",
    "logo": {
      "@type": "ImageObject",
      "url": "https://curi.co/logo.png"
    }
  },
  "datePublished": "2026-05-01",
  "dateModified": "2026-05-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://curi.co/learn/venture-capital/the-fund-structure-explained"
  },
  "isPartOf": {
    "@type": "Course",
    "name": "Venture Capital",
    "url": "https://curi.co/learn/venture-capital"
  },
  "educationalLevel": "Beginner",
  "timeRequired": "PT3M"
}
```

### Breadcrumb

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Learn", "item": "https://curi.co/learn" },
    { "@type": "ListItem", "position": 2, "name": "Venture Capital", "item": "https://curi.co/learn/venture-capital" },
    { "@type": "ListItem", "position": 3, "name": "The Fund Structure Explained" }
  ]
}
```

---

## OG Image Generation

Each lesson gets a dynamically rendered OG image via `@vercel/og` (edge function, no Puppeteer):

**Route:** `GET /api/og/learn/[topic]/[lesson]`

**Design:**
```
┌──────────────────────────────────────────────┐
│                                              │
│  VENTURE CAPITAL · LESSON 3 OF 14           │  ← JetBrains Mono, Silver, 10px
│                                              │
│  The Fund Structure                          │  ← Fraunces, White, 56px
│  Explained                                  │
│                                              │
│  "A venture fund is not a savings account.   │  ← PJS Light Italic, Silver, 16px
│   It is a portfolio of bets."               │
│                                              │
│                              Curi            │  ← Wordmark, bottom-right
│                                 ───          │  ← Vermilion underline
└──────────────────────────────────────────────┘
Background: #0A0908 (Ink)
Dimensions: 1200 × 630
```

```typescript
// app/api/og/learn/[topic]/[lesson]/route.tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }) {
  const lesson = await getCanonicalLesson(params.topic, params.lesson);
  
  return new ImageResponse(
    <div style={{ background: '#0A0908', width: 1200, height: 630, display: 'flex', flexDirection: 'column', padding: '80px' }}>
      <span style={{ fontFamily: 'JetBrains Mono', color: '#9E9B94', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40 }}>
        {lesson.topicName} · Lesson {lesson.index + 1} of {lesson.total}
      </span>
      <span style={{ fontFamily: 'Fraunces', color: '#FAF9F5', fontSize: 62, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 32, maxWidth: 800 }}>
        {lesson.title}
      </span>
      <span style={{ fontFamily: 'Plus Jakarta Sans', color: '#6B6760', fontSize: 18, lineHeight: 1.6, maxWidth: 720, fontStyle: 'italic' }}>
        "{lesson.pullQuote.slice(0, 120)}..."
      </span>
      {/* Wordmark bottom-right */}
    </div>,
    { width: 1200, height: 630 }
  );
}
```

---

## Sitemap

`/sitemap.xml` is dynamically generated and includes all canonical lesson pages:

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lessons = await getAllCanonicalLessons();
  
  const lessonUrls = lessons.map(l => ({
    url: `https://curi.co/learn/${l.topicSlug}/${l.lessonSlug}`,
    lastModified: l.generatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const topicUrls = getTopicSlugs().map(slug => ({
    url: `https://curi.co/learn/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    { url: 'https://curi.co', priority: 1.0, changeFrequency: 'weekly' },
    { url: 'https://curi.co/learn', priority: 0.9, changeFrequency: 'monthly' },
    ...topicUrls,
    ...lessonUrls,
  ];
}
```

---

## Internal Linking Strategy

Strong internal link graph is critical for SEO. Every public page links to adjacent content:

| Page | Links to |
|---|---|
| `/learn` | All 30 topic landing pages |
| `/learn/[topic]` | All lesson pages in topic + 3 related topic suggestions |
| `/learn/[topic]/[lesson]` | Prev lesson, next lesson, topic landing page, 2–3 related topics |

Related topics are pre-defined:
```typescript
const RELATED_TOPICS: Record<string, string[]> = {
  'venture-capital': ['term-sheets', 'safe-notes', 'fundraising'],
  'term-sheets': ['safe-notes', 'cap-tables', 'venture-capital'],
  'safe-notes': ['term-sheets', 'founder-equity', 'cap-tables'],
  // ...
};
```

---

## Conversion Mechanics on SEO Pages

### Primary CTA: "Take the quiz →"

After the lesson content (not interrupting it), placed prominently:
```
─────────────────────────────────────
TRACK YOUR RETENTION

You've read the lesson. Did it stick?
Take a 4-question quiz — 90 seconds.
Your score and streak are saved to your free account.

[Take the quiz for this lesson →]
```

Clicking this:
- If authenticated: goes directly to quiz for this lesson in their active course (or creates course if they don't have this topic)
- If anonymous: creates a pending course for this topic → lesson → quiz → auth wall → streak begins

### Secondary CTA: "Start the full 14-lesson track"

At bottom of lesson, below the quiz CTA:
```
This lesson is part of a 14-lesson Venture Capital curriculum.
One lesson a day. Quizzes. Progress tracking. Free to start.

[Start the full track →]
```

### Anxiety Reducer

Beneath both CTAs:
```
Free to start · No account needed until after your first quiz · Takes 3 minutes a day
```

---

## SEO Content Scope

### Tier 1: Pre-generated (launch day)
- 30 curated topics × 14 lessons = **420 lessons**
- Canonical (null style) variants only
- Pre-seeded before launch via `scripts/seed-canonical-lessons.ts`

### Tier 2: AI-generated as users request (post-launch)
- User-created custom topics
- These generate `lesson_content` but **not** canonical public pages
- Custom topics are private by default (no public URL)

### Tier 3: Future — Community topics
- If a custom topic becomes popular (>50 users studying it), consider promoting it to a canonical page
- Requires editorial review before publishing

---

## Target Keywords

### Primary (by topic)

| Topic | Primary keyword | Secondary keywords |
|---|---|---|
| Venture Capital | "learn venture capital" | "how venture capital works", "vc fund explained", "what is venture capital" |
| Term Sheets | "term sheet explained" | "startup term sheet", "what is a term sheet", "how to read a term sheet" |
| SAFE Notes | "safe note explained" | "what is a safe note", "yc safe note", "safe vs convertible note" |
| Cap Tables | "cap table explained" | "what is a cap table", "startup equity explained" |
| Burn Rate | "burn rate explained" | "what is startup burn rate", "runway calculation" |

### Long-tail (by lesson)

Each lesson title generates organic long-tail traffic. Examples:
- "what is a liquidation preference" → `/learn/liquidation-preferences/what-is-a-liquidation-preference`
- "pro rata rights explained" → `/learn/pro-rata-rights/pro-rata-rights-explained`
- "how option pools affect dilution" → `/learn/option-pools/how-option-pools-affect-dilution`

This is the primary SEO strategy: own the long-tail of founder-finance definitions and explanations.

---

## Analytics for SEO

Events tracked from public pages:

| Event | Properties |
|---|---|
| `public_lesson_viewed` | `topic_slug`, `lesson_slug`, `lesson_index`, `referrer`, `utm_source` |
| `public_quiz_cta_clicked` | `topic_slug`, `lesson_slug`, `was_authenticated` |
| `public_track_cta_clicked` | `topic_slug`, `lesson_slug` |
| `seo_to_signup_conversion` | `topic_slug`, `lesson_slug`, `time_on_page` |

PostHog funnel: `public_lesson_viewed → public_quiz_cta_clicked → auth_completed`

Track this funnel separately from the direct (non-SEO) funnel to measure SEO channel quality.

---

## Robots.txt

```
User-agent: *
Allow: /learn/
Allow: /
Disallow: /api/
Disallow: /app/
Disallow: /admin/

Sitemap: https://curi.co/sitemap.xml
```

---

*Curi — curiosity, engineered.*
