# Curi — Monetisation

**Version:** 1.0  
**Date:** May 2026

> This document defines the pricing strategy, plan limits, upgrade flow, and billing architecture.

---

## Plan Structure

| Feature | Free | Paid |
|---|---|---|
| Custom courses | 2 active max | Unlimited |
| Book paths | ✗ | ✓ All 20+ |
| Learning sequences | ✗ | ✓ All |
| Rabbit Hole (further reading) | ✗ | ✓ |
| Daily email ads | Yes | No |
| Certificate download | ✓ | ✓ |
| Audio player | ✓ | ✓ |
| Flashcards | ✓ | ✓ |
| Quiz history | ✓ | ✓ |

**Free tier is permanently free.** No trial period, no time limit. Users experience the full core loop for free — the paywall is on breadth (more courses, book paths) not depth (lesson quality is identical for free and paid).

---

## Pricing

| Plan | Monthly | Annual | Effective/mo |
|---|---|---|---|
| Free | $0 | — | — |
| Paid | $12/month | $96/year | $8/month |

Annual plan = 2 months free. This is the primary offer — presented first in the upgrade screen.

**Rationale for $12/month:**
- Below Blinkist ($16/mo) and Masterclass ($15/mo)
- Above Duolingo Plus ($7/mo)
- The value frame is "daily learning system", not "content subscription"
- At 3 min/day × 365 = ~18 hours of structured learning per year: ~$0.65/hour

---

## Paywall Trigger Points

### 1. Course Limit (Free → Paid)

Triggered when a free user tries to start a 3rd custom course.

Copy: *"You have 2 active paths. Paid plan gives you unlimited paths."*

### 2. Book Path (Free → Paid)

Triggered when a free user tries to start any book path.

Copy: *"Book paths are on the paid plan. 20+ books, structured as 14-lesson tracks."*

### 3. Learning Sequence (Free → Paid)

Triggered when a free user tries to start a learning sequence.

Copy: *"Learning sequences — bundled, multi-week curricula — are on the paid plan."*

### 4. Rabbit Hole (Free → Paid)

Triggered in the lesson reader when a free user taps "Further reading".

Copy: *"The Rabbit Hole is part of the paid plan. It's a curated reading list from the lesson author — books, papers, and essays that go deeper."*

---

## Upgrade Screen Design

The upgrade screen follows brand principles: no urgency, no artificial scarcity, factual.

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│  ANNUAL                                     │
│  $96 / year — $8 / month                   │   ← Recommended (shown first)
│  ───────────────────────────────            │
│  Save $48 compared to monthly               │
│  [Begin — $96/year] ← primary CTA          │
│                                             │
│  MONTHLY                                    │
│  $12 / month                               │
│  [Begin — $12/month] ← ghost button        │
│                                             │
├─────────────────────────────────────────────┤
│  WHAT YOU GET                               │
│                                             │
│  Unlimited active tracks                   │
│  All 20+ book paths                        │
│  Learning sequences                        │
│  Rabbit Hole (further reading)             │
│  No ads in your daily email               │
│                                             │
└─────────────────────────────────────────────┘
```

No features removed from free tier in the upgrade screen (no crossed-out items, no lock icons). Just what's added.

### Copy Rules (per brand voice)

- No "Unlock your potential"
- No "Limited time offer"
- No "Cancel anytime" as primary reassurance (it's a footnote if needed)
- No testimonials at launch
- Lead with what's included, not what they're missing

---

## Stripe Configuration

### Products & Prices

```
Product: Curi Paid Plan
  Price: curi_monthly → $12/month (recurring)
  Price: curi_annual  → $96/year  (recurring)
```

### Checkout Session

```typescript
const session = await stripe.checkout.sessions.create({
  customer: user.stripeCustomerId ?? undefined,
  customer_email: user.stripeCustomerId ? undefined : user.email,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${APP_URL}/app/today?upgraded=1`,
  cancel_url: `${APP_URL}/app/profile`,
  metadata: { userId: user.id },
  subscription_data: {
    metadata: { userId: user.id }
  },
  // Allow promotion codes (for referral/partner discounts)
  allow_promotion_codes: true,
});
```

### Customer Portal

Self-serve billing management. No custom cancellation flow — Stripe handles it:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${APP_URL}/app/profile`,
});
```

Portal allows: plan change (monthly ↔ annual), cancel subscription, update payment method, view invoices.

### Webhook Events & Handlers

```typescript
// POST /api/webhooks/stripe

switch (event.type) {
  case 'customer.subscription.created':
  case 'customer.subscription.updated':
    // Set plan = 'paid', store subscription ID + end date
    await updateUserPlan(userId, 'paid', subscription);
    break;
    
  case 'customer.subscription.deleted':
    // Plan downgrades to 'free' at period end
    await updateUserPlan(userId, 'free', null);
    // Log cancellation date for win-back campaigns
    break;
    
  case 'invoice.payment_failed':
    // Send payment failed email
    // Do NOT immediately downgrade — give grace period (Stripe handles retries)
    await sendPaymentFailedEmail(userId);
    break;
    
  case 'invoice.payment_succeeded':
    // Confirm plan is still active (safety check)
    await confirmUserPlanActive(userId);
    break;
}
```

---

## Plan Enforcement Logic

### Server-side Checks

Every plan-gated API route checks the user's plan before executing:

```typescript
// POST /api/courses — create a new course
async function POST(request: Request) {
  const user = await getAuthUser(request);
  
  if (!request.body.isBookPath && user.plan === 'free') {
    const activeCount = await countActiveCourses(user.id);
    if (activeCount >= 2) {
      return planError('FREE_TIER_LIMIT', 
        'You have 2 active paths. Upgrade to start more.'
      );
    }
  }
  
  if (request.body.isBookPath && user.plan === 'free') {
    return planError('BOOK_PATH_LOCKED',
      'Book paths are on the paid plan.'
    );
  }
  
  // ... proceed with course creation
}
```

### Client-side Checks (UX layer)

Client checks run before the API call to avoid round trips:

```typescript
function tryStartCourse(topic: string, isBook = false) {
  const { plan, activeCourseCount } = useUserStore();
  
  if (plan === 'free') {
    if (!isBook && activeCourseCount >= 2) {
      setUpgradeModalOpen(true);
      setUpgradeTrigger('course_limit');
      return;
    }
    if (isBook) {
      setUpgradeModalOpen(true);
      setUpgradeTrigger('book_path');
      return;
    }
  }
  
  // Proceed to course creation
  startCourse(topic, isBook);
}
```

---

## Free Tier Abuse Prevention

### Rate Limiting

- Max 3 course creations per hour per user (prevents rapid test-and-delete cycling)
- Max 5 topic submissions per hour per IP (anonymous users)

### Pending Course Limits

Anonymous users (pre-auth) can only have 1 pending course. If they try to start a second before authenticating, they're prompted to sign up first.

---

## Revenue Projections (Conservative)

| Month | Active Users | Paid Conversion | MRR |
|---|---|---|---|
| Month 3 | 500 | 10% → 50 paid | $600 |
| Month 6 | 2,000 | 12% → 240 paid | $2,880 |
| Month 12 | 5,000 | 15% → 750 paid | $9,000 |

Target: $10k MRR by Month 12 (viable indie product). This requires ~833 paid subscribers at $12/month or a mix of monthly + annual.

---

*Curi — curiosity, engineered.*
