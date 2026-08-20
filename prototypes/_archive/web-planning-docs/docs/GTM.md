# Curi — Go-to-Market Strategy

**Version:** 1.0  
**Date:** May 2026

> This document defines the launch strategy, beachhead community, acquisition channels, and growth mechanics for Curi's initial market entry.

---

## Launch Thesis

Curi's launch is a **community-first, distribution-second** strategy. The goal is not to reach the widest possible audience — it is to reach the specific audience for whom Curi is a painkiller (not a vitamin) and achieve saturation within that community before expanding.

**The beachhead:** Technical first-time founders, outside top-tier accelerator networks, who are preparing to raise or actively fundraising.

**The beachhead community:** Indie Hackers + Entrepreneur First alumni + founder Slack groups in UK/Europe/ANZ.

**The metric that determines expansion:** When Curi has touched >20% of this community in any one of these channels and D30 retention is >25%, expand to the next community.

---

## Phase 1 Launch: Manual Founder Outreach

**Week 1–4 post-launch**

### Tactic: Founder-to-Founder Direct

Awais personally reaches out to 100 first-time founders in his network and the Indie Hackers community. Not a broadcast — individual messages.

Message frame: *"I built Curi because I needed it. It's a 3-minute-a-day learning system for the financial concepts founders need to know when they're raising. Would you try it and tell me if it actually helps?"*

**Target:** 100 outreach → 40 signups → 25 complete Lesson 1 → 15 become weekly actives

### Tactic: Indie Hackers Show HN / Product Hunt style post

Write an honest, founder-voice post: *"I built a thing that taught me what I wish I'd known before my first round."*

Include a specific lesson as a sample (e.g., the SAFE note lesson in full). Do not lead with features — lead with the insight.

**Target:** 500 signups on launch week from IH community

### Tactic: Founder Slack Groups

Identify 5–10 founder Slack communities (EF alumni, Seedcamp, SFC, regional). Become genuinely helpful in those communities for 4 weeks before mentioning Curi. When the time is right, share one lesson publicly and let it do the work.

---

## Phase 2: Content Distribution

**Month 2–3**

### Tactic: Daily Insight Thread

Every weekday, post one insight from Curi's lesson library to Twitter/X:
- Format: clean, typographic card (dark background, Fraunces white text, Curi wordmark)
- Content: the shareable_fact from that day's lesson
- No product push — just the insight. Brand at the bottom.
- Accumulate a following around the subject matter, not the product

Example:
```
A post-money SAFE dilutes everyone at the cap table equally,
including the founders who issued it.

Most founders realise this too late.

Day 7 · Venture Capital
— Curi
```

**Target:** 1,000 Twitter followers by Month 3; 5% click-through to landing

### Tactic: LinkedIn Long-Form

Weekly essay (500–700 words) on a founder-finance topic. Written in Curi's voice. Ends with a natural mention: *"This is Day 3 of Curi's Venture Capital track. If you'd like the full curriculum…"*

Topics rotate through the 30 curated subject areas. Over 30 weeks, this builds a searchable back-catalogue of founder knowledge content.

**Target:** 50 newsletter signups per essay → course starts

### Tactic: SEO Topic Pages

For each of the 30 curated topics, publish a public landing page:
- `/venture-capital` — "The Venture Capital curriculum"
- Full lesson list visible (titles only)
- First lesson rendered in full (as a sample)
- CTA: "Start the full 14-lesson track →"

Long-term organic traffic from searches like "how does venture capital work" or "what is a liquidation preference".

**Target:** 3 months to first organic traffic; 12 months to meaningful volume

---

## Growth Mechanics Built into Product

### Shareable Facts
Each lesson generates a `shareable_fact`. This is visible in the lesson reader and copyable with one tap. Format is designed for Twitter/X posting.

The lesson reader includes:
- "Copy this insight" → copies fact text
- "Share" → opens native share sheet (mobile) or clipboard (desktop)

No explicit referral incentive at launch — the content earns sharing.

### Completion Certificates
Course completion generates a certificate with the user's name and topic. Designed to be posted on LinkedIn.

Framing: *"Finished the Curi Venture Capital track — 14 lessons, 14 days."*

This works because it signals something real (14 consecutive days of learning) in a format (certificate) LinkedIn readers understand. No artificial badge inflation.

### Referral Code
Every user gets a referral code. The landing page reads `ref=code` params.

**Phase 1 referral:** no reward — track only. Use data to design the reward scheme.
**Phase 2 referral (if data supports):** refer 3 friends → 1 month free, or refer 5 → annual plan.

---

## Activation Metrics by Channel

| Channel | Expected Activation Rate | Notes |
|---|---|---|
| Direct outreach | 70%+ | Pre-qualified, warm |
| Indie Hackers | 50% | High-intent audience |
| Twitter content | 30% | Cold but interested |
| LinkedIn essays | 40% | Slightly warmer than Twitter |
| SEO / organic | 20% | Very cold, low intent |
| Referral | 60% | Social proof from trusted source |

---

## Messaging Architecture

### Primary Claim
*"Three minutes a day. Any topic. Knowledge that compounds."*

### Secondary Claims
- *"A learning system, not another course"*
- *"What YC gives YC founders — for everyone else"*
- *"Structured knowledge on the subjects that cost you money if you don't know them"*

### Social Proof (to be acquired post-launch)
- "This is the first learning product I've actually used consistently" — [Founder name, company]
- Specific outcome: "I walked into my Series A term sheet negotiation understanding every clause."

### Anti-Claims (what Curi is not)
Never describe Curi as: AI-powered, personalised AI tutor, ChatGPT for learning. These reduce perceived quality. Curi is an editorial system that happens to be powered by AI.

---

## Launch Checklist

- [ ] Product stable (all Phase 0–1 tasks complete)
- [ ] Email system live
- [ ] 30 curated topic tracks complete (lesson titles + AI-generated content passing QA)
- [ ] Stripe live, payments tested
- [ ] Error monitoring (Sentry) active
- [ ] Analytics (PostHog) tracking all funnel events
- [ ] Domain, DKIM, SPF all verified (emails not in spam)
- [ ] Landing page live with correct copy and CTA
- [ ] Certificate download functional
- [ ] 10 beta users tested the full flow (topic → course → Lesson 1 → quiz → auth → streak)

---

## ICP Expansion Roadmap

| Phase | ICP | Trigger to move |
|---|---|---|
| Launch | Technical first-time founders, pre-seed, outside YC | D30 retention > 25% in founder community |
| Year 2 | Career changers in high-knowledge fields (law, medicine, finance) | 1,000 active paid users |
| Year 3 | Any domain, any topic | Product is general-topic AI generation at editorial quality |

The founder niche is the proof of concept — that Curi can serve a specific, high-stakes learning need better than every alternative. Once proven, the infrastructure (AI generation, editorial standards, habit loop, email system) transfers to every domain.

---

*Curi — curiosity, engineered.*
