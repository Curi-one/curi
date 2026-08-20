/** Extended analytics mock data — mirrors PostHog / Stripe / Resend dashboards. */

export const ADMIN_NORTH_STAR = {
  label: "Lessons per active user / week",
  value: 3.4,
  target: 4.0,
  deltaPct: 6.2,
  trend: [2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.35, 3.4],
};

export const ADMIN_FUNNEL = [
  { step: "Landing view", count: 4820, rate: 100 },
  { step: "Topic submitted", count: 2890, rate: 60 },
  { step: "Onboarding done", count: 2310, rate: 80 },
  { step: "Lesson 1 started", count: 1980, rate: 86 },
  { step: "Quiz completed", count: 1740, rate: 88 },
  { step: "Account created", count: 1220, rate: 70 },
  { step: "Day 7 retained", count: 488, rate: 40 },
  { step: "Subscribed", count: 183, rate: 15 },
];

export const ADMIN_RETENTION_COHORTS = [
  { cohort: "May 2026", d1: 72, d3: 58, d7: 41, d14: 34, d30: 28 },
  { cohort: "Apr 2026", d1: 70, d3: 55, d7: 39, d14: 32, d30: 26 },
  { cohort: "Mar 2026", d1: 68, d3: 52, d7: 37, d14: 30, d30: 24 },
  { cohort: "Feb 2026", d1: 65, d3: 49, d7: 35, d14: 28, d30: 22 },
];

export const ADMIN_STREAK_DISTRIBUTION = [
  { bucket: "0 days", count: 412 },
  { bucket: "1–3", count: 298 },
  { bucket: "4–7", count: 241 },
  { bucket: "8–14", count: 186 },
  { bucket: "15–30", count: 98 },
  { bucket: "30+", count: 49 },
];

export const ADMIN_TRIAL_CONVERSION = [
  { week: "W1", trials: 42, converted: 5 },
  { week: "W2", trials: 38, converted: 6 },
  { week: "W3", trials: 45, converted: 7 },
  { week: "W4", trials: 51, converted: 9 },
  { week: "W5", trials: 48, converted: 8 },
  { week: "W6", trials: 44, converted: 7 },
];

export const ADMIN_UPGRADE_TRIGGERS = [
  { trigger: "Course limit (2 paths)", count: 89 },
  { trigger: "Book path (paid)", count: 64 },
  { trigger: "Learning sequence", count: 41 },
  { trigger: "Manual upgrade", count: 28 },
];

export const ADMIN_REVENUE_DETAIL = {
  mrr: 18420,
  arr: 221040,
  netRevenue30d: 17890,
  arpu: 14.2,
  ltv: 168,
  trialToPaidPct: 15.2,
  failedPayments: 7,
  expansionMrr: 420,
  contractionMrr: 180,
};

export const ADMIN_PLAN_TREND = [
  { month: "Jan", paid: 312, free: 540 },
  { month: "Feb", paid: 338, free: 562 },
  { month: "Mar", paid: 361, free: 589 },
  { month: "Apr", paid: 398, free: 612 },
  { month: "May", paid: 431, free: 648 },
  { month: "Jun", paid: 456, free: 689 },
  { month: "Jul", paid: 472, free: 812 },
];

export const ADMIN_EMAIL_METRICS = [
  { type: "Daily lesson", sent: 8420, openRate: 48, ctr: 14, unsub: 0.2 },
  { type: "Streak at risk", sent: 1240, openRate: 52, ctr: 22, unsub: 0.1 },
  { type: "Course complete", sent: 890, openRate: 61, ctr: 18, unsub: 0.15 },
  { type: "Welcome", sent: 1420, openRate: 72, ctr: 31, unsub: 0.05 },
];

export const ADMIN_LESSON_DROPOFF = [
  { path: "Business Models", lesson: 1, started: 412, completed: 389, dropPct: 6 },
  { path: "Business Models", lesson: 5, started: 298, completed: 241, dropPct: 19 },
  { path: "Negotiation", lesson: 3, started: 267, completed: 198, dropPct: 26 },
  { path: "Behavioral Economics", lesson: 7, started: 198, completed: 156, dropPct: 21 },
  { path: "Pricing Psychology", lesson: 2, started: 331, completed: 298, dropPct: 10 },
];

export const ADMIN_CACHE_STATS = {
  hitRatePct: 91,
  totalEntries: 1842,
  avgLatencyMs: 42,
  claudeCallsSaved: 12840,
};

export const DATE_RANGE_OPTIONS = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "ytd", label: "Year to date" },
];
