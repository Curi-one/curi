# Curi — Analytics & Metrics

**Version:** 1.0  
**Date:** May 2026  
**Tool:** PostHog

> This document defines the event taxonomy, North Star metric, and key dashboards for Curi's analytics system.

---

## North Star Metric

**Lessons completed per active user per week**

This is the product's core promise: a daily habit. If users complete lessons regularly, Curi is working. All other metrics are either leading indicators (funnel efficiency) or lagging indicators (retention, revenue) of this one metric.

Secondary metric: **Day-30 retention** (% of users who complete at least one lesson in week 4).

---

## Funnel Overview

```
Landing page view
    │
    ▼
Topic submitted (onboarding started)
    │
    ▼
Onboarding completed (all 4 steps)
    │
    ▼
Course generated (generating screen complete)
    │
    ▼
Lesson 1 started
    │
    ▼
Lesson 1 completed (reached quiz)
    │
    ▼
Quiz completed (the aha moment + auth trigger)
    │
    ▼
Account created (auth completed)
    │
    ▼
Streak: Day 3 (first real retention signal)
    │
    ▼
Streak: Day 7 (habit forming)
    │
    ▼
Subscription started (conversion)
```

**Target activation rate:** topic_submitted → quiz_completed = 60%  
**Target sign-up rate:** quiz_completed → account_created = 70%  
**Target Day-7 retention:** 40%  
**Target trial-to-paid:** 15%

---

## Event Taxonomy

### Acquisition Events

| Event | Properties | Trigger |
|---|---|---|
| `page_viewed` | `page`, `referrer`, `ref_code` | Every page load |
| `topic_submitted` | `topic`, `source` (input/pill/suggestion) | Topic submitted on landing |
| `suggestion_clicked` | `topic`, `position` | Suggestion pill clicked |

### Onboarding Events

| Event | Properties | Trigger |
|---|---|---|
| `onboarding_started` | `topic` | Onboarding screen shown |
| `onboarding_step_completed` | `step` (1–4), `answer`, `topic` | Each step completed |
| `onboarding_skipped` | `from_step`, `topic` | Skip to depth used |
| `onboarding_completed` | `topic`, `aspect`, `level`, `learning_style`, `curiosity_reason` | All 4 steps done |
| `course_generating_started` | `topic`, `level` | Generation begins |
| `course_generating_completed` | `topic`, `level`, `duration`, `lesson_count` | Generation finishes |
| `read_lesson_1_clicked` | `topic` | CTA after generating |

### Learning Events

| Event | Properties | Trigger |
|---|---|---|
| `lesson_started` | `course_id`, `topic`, `lesson_index`, `lesson_title` | Lesson reader opens |
| `lesson_scrolled_50pct` | `course_id`, `lesson_index` | User scrolled halfway |
| `lesson_scrolled_complete` | `course_id`, `lesson_index` | User reached bottom |
| `audio_started` | `course_id`, `lesson_index`, `speed` | AudioPlayer play |
| `audio_paused` | `course_id`, `lesson_index`, `position_pct` | AudioPlayer paused |
| `flashcards_saved` | `course_id`, `lesson_index`, `card_count` | Cards saved from lesson |
| `quiz_started` | `course_id`, `lesson_index` | Take quiz tapped |
| `quiz_answer_selected` | `course_id`, `lesson_index`, `question_index`, `option` | Option selected |
| `quiz_submitted` | `course_id`, `lesson_index`, `score`, `difficulty_rating` | Quiz submitted |
| `quiz_completed` | `course_id`, `lesson_index`, `score`, `is_first_quiz` | Quiz results shown |
| `lesson_complete_modal_viewed` | `course_id`, `lesson_index`, `streak` | Modal shown |
| `streak_moment_viewed` | `streak`, `trigger` (quiz/auth) | StreakMoment shown |

### Auth Events

| Event | Properties | Trigger |
|---|---|---|
| `auth_wall_shown` | `trigger` (quiz/manual) | Auth screen shown |
| `auth_started` | `method` (email/magic_link), `is_new_user` | Auth form submitted |
| `auth_completed` | `is_new_user`, `had_pending_course`, `pending_quiz_complete` | Auth success |
| `auth_dismissed` | — | Auth screen closed without completing |

### Engagement Events

| Event | Properties | Trigger |
|---|---|---|
| `today_feed_viewed` | `active_course_count`, `streak` | Today feed loads |
| `dashboard_viewed` | `streak`, `total_courses` | Dashboard viewed |
| `library_viewed` | `tab` (in_progress/completed/shelved) | Library viewed |
| `explore_viewed` | `tab` (paths/books/sequences) | Explore opened |
| `course_path_viewed` | `course_id`, `topic`, `progress` | Course path opened |
| `course_shelved` | `course_id`, `topic`, `progress_at_shelve` | Course shelved |
| `course_unshelved` | `course_id`, `topic` | Course unshelved |
| `new_course_started` | `source` (explore/topic_input/suggestion), `topic` | New course created |

### Streak Events

| Event | Properties | Trigger |
|---|---|---|
| `streak_milestone` | `streak_count`, `milestone` (3/7/14/30/60/100) | Streak reaches milestone |
| `streak_broken` | `previous_streak`, `topic` | Streak resets to 0 |
| `streak_at_risk_shown` | `streak` | At-risk state displayed |

### Email Events

| Event | Properties | Trigger |
|---|---|---|
| `daily_email_sent` | `user_id`, `topic`, `lesson_index`, `plan` | Email dispatched |
| `email_opened` | `email_type`, `topic` | Resend webhook |
| `email_cta_clicked` | `email_type`, `topic` | Resend webhook |
| `email_unsubscribed` | `method` (link/profile) | Unsubscribe action |

### Monetisation Events

| Event | Properties | Trigger |
|---|---|---|
| `upgrade_modal_viewed` | `trigger` (course_limit/book_path/sequence/rabbit_hole) | Paywall shown |
| `upgrade_cta_clicked` | `trigger`, `plan_selected` (monthly/annual) | Upgrade button tapped |
| `checkout_started` | `plan`, `price_id` | Stripe checkout opened |
| `subscription_created` | `plan`, `price`, `interval` | Stripe webhook |
| `subscription_cancelled` | `plan`, `duration_months` | Stripe webhook |
| `payment_failed` | — | Stripe webhook |
| `billing_portal_opened` | — | Customer Portal link clicked |

### Sharing Events

| Event | Properties | Trigger |
|---|---|---|
| `certificate_downloaded` | `course_id`, `topic` | Certificate PDF opened |
| `shareable_fact_copied` | `course_id`, `lesson_index` | Copy fact action |
| `og_image_viewed` | `type` (lesson/course), `id` | OG image rendered |

---

## Key Dashboards

### 1. Acquisition Funnel Dashboard

Steps: landing → topic → onboarding → lesson 1 → quiz → auth

Key questions:
- Where do users drop off?
- What topics are most popular at submission?
- Which suggestion pills get clicked most?
- Does entering from a suggestion pill (with defaults) improve onboarding completion?

### 2. Retention Dashboard

Metrics tracked weekly and monthly:
- D1, D3, D7, D14, D30 retention (% of cohort who complete a lesson)
- Average streak length by cohort
- Streak distribution (histogram: 0, 1–3, 4–7, 7–14, 14–30, 30+)
- % of users who break streak in first week vs. second week

### 3. Content Performance Dashboard

Per-lesson metrics (aggregated across all courses):
- Quiz pass rate (% scoring 3+/4)
- Difficulty rating distribution (Easy/Medium/Hard)
- Audio listen rate (% of reads with audio started)
- Flashcard save rate
- Drop-off rate (lesson_started but no quiz_submitted)

### 4. Revenue Dashboard

Powered by Stripe (also tracked in PostHog):
- MRR (monthly recurring revenue)
- New subscriptions this week/month
- Churn rate
- Trial-to-paid conversion rate (quiz_completed → subscription_created within 30 days)
- Average revenue per user
- Plan distribution (monthly vs. annual)

### 5. Email Performance Dashboard

Per email type:
- Open rate (target: > 45%)
- Click-through rate (target: > 12%)
- Unsubscribe rate (target: < 0.3%)
- Delivery success rate (target: > 98%)

---

## Key Ratios to Watch

| Ratio | Formula | Target | Meaning |
|---|---|---|---|
| Activation rate | quiz_completed / topic_submitted | > 60% | Onboarding + content quality |
| Auth conversion | account_created / quiz_completed | > 70% | Auth wall friction |
| D7 retention | lesson completed on Day 7 / account_created | > 40% | Habit formation |
| Email-driven return | today_feed_viewed via email CTA / email_sent | > 25% | Email effectiveness |
| Trial-to-paid | subscription_created / account_created (D30) | > 15% | Monetisation |
| Streak survival | streak ≥ 7 / account_created (D14) | > 30% | Habit durability |

---

## Implementation Notes

### PostHog Setup

```typescript
// app/layout.tsx
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,  // Manual control
    capture_pageleave: true,
    autocapture: false,       // Manual events only — avoid noise
  });
}
```

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

export function track(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, {
    ...properties,
    $timestamp: new Date().toISOString(),
  });
}

export function identify(userId: string, traits: Record<string, unknown>) {
  posthog.identify(userId, traits);
}
```

### User Identification

On auth completion:
```typescript
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.plan,
  createdAt: user.createdAt,
});
```

### Super Properties (set once, included on all events)
```typescript
posthog.register({
  platform: 'web',
  app_version: process.env.NEXT_PUBLIC_APP_VERSION,
});
```

---

*Curi — curiosity, engineered.*
