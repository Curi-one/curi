# Curi — Email System

**Version:** 1.0  
**Date:** May 2026  
**Provider:** Resend  
**Templates:** React Email

> This document specifies the full email system: templates, triggers, delivery logic, and deliverability requirements.

---

## Email Types

| Type | Trigger | Subject format | Cadence |
|---|---|---|---|
| Daily lesson | Cron, 06:00 UTC | `{Lesson title}` | Daily (per preference) |
| Welcome | First auth completion | `Your {topic} curriculum — {N} lessons, starting now.` | Once |
| Streak milestone | Quiz completion at threshold | `{N}-day streak.` | At 3, 7, 14, 30, 60, 100 |
| Course complete | `courses.status` → `completed` | `You've finished {topic}.` | Per course |
| Win-back | 7 days since last activity | `{topic} — lesson {N} is still there.` | Once per lapse |
| Payment failed | Stripe webhook | `Action needed — your Curi subscription.` | On failure |
| Cancellation confirm | Stripe webhook | `Subscription cancelled.` | Once |

---

## Daily Email

### Delivery Logic

```
06:00 UTC: Cron fires → POST /api/crons/daily-email (CRON_SECRET required)
      │
      ▼
Query users:
  WHERE email_enabled = true
  AND EXISTS (active course with next lesson)
  AND (last_email_sent_at IS NULL OR last_email_sent_at < today in user's tz)
  AND (email_weekends = true OR EXTRACT(DOW FROM NOW() AT TIME ZONE email_delivery_tz) NOT IN (0, 6))
      │
      ▼
For each eligible user (batched, 100 at a time):
  1. Determine primary active course → next lesson title + body
  2. Build email payload
  3. Send via Resend
  4. UPDATE users: last_email_sent_at = NOW()
  5. Track: daily_email_sent (PostHog)
```

### Daily Email Content

The email contains the **full lesson body** (not a preview). This is intentional:
- Users who prefer email-first reading should be fully served
- The email CTA ("Take your quiz") drives back to the app for quiz completion
- This is the core retention loop: lesson in email → quiz in app → streak

**Free tier email** includes an ad slot between body and takeaways.  
**Paid tier email** has no ad slot.

### Email Payload Construction

```typescript
interface DailyEmailPayload {
  to: string;
  userName: string;
  topic: string;
  level: string;
  lessonIndex: number;           // 1-based for display ("Day 7")
  totalLessons: number;
  lessonTitle: string;
  pullQuote: string;
  bodyParagraphs: string[];
  takeaways: string[];
  tomorrowLessonTitle?: string;  // Preview of next lesson (null if last)
  quizUrl: string;               // Deep link to quiz in app
  unsubscribeUrl: string;
  isPaidUser: boolean;
}
```

---

## React Email Templates

All templates live in `/emails/`. They are rendered server-side to HTML using `@react-email/render`.

### Design Tokens in Email Context

Web fonts (Fraunces, Plus Jakarta Sans) load in Apple Mail and some Gmail clients. All templates use a robust fallback stack:

```typescript
const fonts = {
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  ui: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', Courier, monospace",
};

const colors = {
  bg: '#FAF9F5',
  surface: '#F4F1E8',
  ink: '#0A0908',
  mid: '#6B6760',
  silver: '#9E9B94',
  light: '#D4D0C8',
  vermilion: '#C1121F',
};
```

### Template: `daily-lesson.tsx`

Structure (maps to brand guidelines §12.3):

```
┌─────────────────────────────────┐
│  EMAIL HEADER                   │  ← wordmark + Vermilion underline + metadata
│  Cu·ri                          │     "Day 7 · Venture Capital · Standard"
├─────────────────────────────────┤
│  LESSON TITLE                   │  ← Fraunces 32px, Ink
│  The Anatomy of a SAFE Note     │
├─────────────────────────────────┤
│  LESSON BODY                    │  ← PJS 16px Light, 1.75 line-height
│  [paragraph 1]                  │
│  [paragraph 2]                  │
│  [paragraph 3]                  │
├─────────────────────────────────┤
│  PULL QUOTE (if present)        │  ← Fraunces 18px italic, Vermilion left border
│  "A SAFE is not debt..."        │
├─────────────────────────────────┤
│  AD SLOT (free tier only)       │  ← "Supported by" label, partner copy
├─────────────────────────────────┤
│  TAKEAWAYS                      │  ← Mono Vermilion numbers + PJS 15px items
│  01. A SAFE converts...         │
│  02. The valuation cap...       │
│  03. Post-money SAFEs...        │
├─────────────────────────────────┤
│  TAKE YOUR QUIZ →               │  ← Primary CTA, Ink background, Vermilion border-bottom
├─────────────────────────────────┤
│  TOMORROW                       │  ← Paper background
│  Next: Priced Rounds & SAFEs   │
├─────────────────────────────────┤
│  FOOTER                         │  ← Wordmark left, unsubscribe right
│  © 2026 Curi    Unsubscribe    │     Mono 8px address
└─────────────────────────────────┘
```

### Template: `welcome.tsx`

Sent immediately after first lesson + auth. Sets expectations and previews the curriculum.

```
Subject: Your Venture Capital curriculum — 14 lessons, starting now.

Body:
- Greeting: "You read lesson 1. Here's what comes next."
- Complete lesson list (numbered, mono, PJS) — all 14 titles
- CTA: "Continue to Lesson 2 →"
- Delivery time confirmation: "Your next lesson arrives tomorrow morning."
- Unsubscribe link
```

### Template: `streak-milestone.tsx`

Minimal. The number is the message.

```
Subject: 7-day streak.

Body:
- Large Fraunces number: "7"
- Label: "days straight."
- One sentence: "That's genuine momentum."
- CTA: "Keep it going →"
- No images, no padding, just type.
```

### Template: `win-back.tsx`

Sent 7 days after last activity if streak > 0.

```
Subject: Venture Capital — lesson 8 is still there.

Body:
- Topic name large
- Progress bar (HTML table, ink fill)
- "You were 8 lessons in. Lesson 8 is waiting."
- CTA: "Continue Lesson 8 →"
- No guilt language. Factual and patient.
```

### Template: `course-complete.tsx`

```
Subject: You've finished Venture Capital.

Body:
- Topic name at display size
- Completion date
- Certificate download link
- Suggested next track (1–2 curated recommendations)
- CTA: "Start your next track →"
```

---

## Deliverability Requirements

### Domain Authentication

Before sending any email:
- [ ] SPF record: `v=spf1 include:amazonses.com ~all` (Resend uses SES)
- [ ] DKIM: Resend-provided DNS entries added to `curi.co`
- [ ] DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@curi.co`
- [ ] From address: `lessons@curi.co` (not a generic Gmail/Outlook)
- [ ] Reply-to: `hello@curi.co`

### Warm-up Schedule

Sending high volume from a fresh domain triggers spam filters. Warm up gradually:

| Week | Max daily sends |
|---|---|
| 1 | 50 |
| 2 | 200 |
| 3 | 500 |
| 4 | 1,000 |
| 5+ | Uncapped |

### Bounce & Complaint Handling

Via Resend webhooks → `POST /api/webhooks/resend`:

| Event | Action |
|---|---|
| `email.bounced` (hard) | Set `email_enabled = false`; log bounce type |
| `email.complained` | Set `email_enabled = false`; suppress immediately |
| `email.bounced` (soft) | Log; retry after 24h; disable after 3 soft bounces |

Maintain bounce rate < 2% and complaint rate < 0.1% to preserve deliverability.

---

## Unsubscribe System

### One-click Unsubscribe

RFC 8058 compliance (List-Unsubscribe-Post header):

```
List-Unsubscribe: <https://curi.co/unsubscribe?token={token}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Token Generation

```typescript
// Generated once per user, stored hashed in user_preferences
function generateUnsubscribeToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  // Store hashed; send plain in email
  return token;
}
```

### Unsubscribe Flow

`GET /unsubscribe?token={plainToken}` → hash token → find user → set `email_enabled = false` → redirect to confirmation page.

No form. No confirmation step. Immediate, one-click.

---

## Subject Line Rules (from brand guidelines)

- No emojis
- No brackets
- No `[Curi]` prefix
- No exclamation marks
- No "Re:" or "Fwd:" simulations
- Subject line = headline (specific, not teasing)
- Daily lesson: subject is the lesson title verbatim
- No "Don't miss..." or "Last chance..."

---

## Testing

Before deploying any email template:
1. Preview in React Email dev server (`pnpm email:dev`)
2. Send test to real mailboxes: Gmail (web), Gmail (iOS), Apple Mail (macOS), Outlook (web)
3. Check spam score via Mail-tester.com (target: > 9/10)
4. Verify all links work
5. Verify unsubscribe token works
6. Check plain-text version renders correctly

---

*Curi — curiosity, engineered.*
