/**
 * Flashcard / spaced-repetition (SM-2) analytics — mirrors Anki-style study metrics.
 * Ratings map to product: 1=Again · 2=Hard · 3=Good · 4=Easy
 */

export const STUDY_NORTH_STAR = {
  label: "Reviews per active studier / week",
  value: 42,
  target: 50,
  deltaPct: 11.2,
  trend: [28, 31, 34, 36, 38, 39, 41, 42],
};

export const STUDY_KPI = {
  activeStudiers: 384,
  activeStudiersDeltaPct: 8.6,
  reviewsToday: 2847,
  reviews7d: 18420,
  cardsDueNow: 4128,
  cardsDueOverdue: 892,
  avgEaseFactor: 2.62,
  retentionRatePct: 87,        // % Good+Easy on mature cards
  lapseRatePct: 9.4,           // % Again presses
  avgSessionMin: 8.4,
  cardsPerSession: 18.6,
  deckAdoptionPct: 34,         // % of active users with ≥1 deck
  lessonToDeckPct: 28,         // % lessons that spawn a saved deck
  studyStreakAvg: 6.2,
  matureCardsPct: 41,
};

export const STUDY_KPI_TRENDS = {
  activeStudiers: [298, 312, 328, 341, 356, 368, 378, 384],
  reviews: [14200, 15100, 15800, 16400, 17100, 17600, 18100, 18420],
  retention: [82, 83, 84, 85, 85.5, 86, 86.5, 87],
  lapse: [12.1, 11.8, 11.2, 10.8, 10.2, 9.9, 9.6, 9.4],
};

export const STUDY_REVIEWS_SERIES = [
  { day: "Jun 19", reviews: 2410, sessions: 312 },
  { day: "Jun 20", reviews: 2180, sessions: 289 },
  { day: "Jun 21", reviews: 1950, sessions: 254 },
  { day: "Jun 22", reviews: 2320, sessions: 301 },
  { day: "Jun 23", reviews: 2680, sessions: 348 },
  { day: "Jun 24", reviews: 2790, sessions: 362 },
  { day: "Jun 25", reviews: 2847, sessions: 371 },
];

export const STUDY_RATING_DISTRIBUTION = [
  { rating: "Again", count: 1734, pct: 9.4, color: "#C1121F" },
  { rating: "Hard", count: 2940, pct: 16.0, color: "#D97706" },
  { rating: "Good", count: 11052, pct: 60.0, color: "var(--c-ink)" },
  { rating: "Easy", count: 2694, pct: 14.6, color: "#059669" },
];

export const STUDY_CARD_MATURITY = [
  { stage: "New", description: "Never reviewed", count: 4820, color: "#94A3B8" },
  { stage: "Learning", description: "Interval < 7d", count: 6240, color: "#D97706" },
  { stage: "Young", description: "7–21 day interval", count: 5180, color: "var(--c-ink)" },
  { stage: "Mature", description: "Interval > 21d", count: 8940, color: "#059669" },
];

export const STUDY_INTERVAL_BUCKETS = [
  { bucket: "< 1d", count: 4120 },
  { bucket: "1–6d", count: 5840 },
  { bucket: "7–14d", count: 3920 },
  { bucket: "15–30d", count: 3180 },
  { bucket: "31–90d", count: 4560 },
  { bucket: "90d+", count: 3560 },
];

export const STUDY_DECK_ANALYTICS = [
  { name: "Business Models", source: "lesson", cards: 24, activeUsers: 186, reviews7d: 2840, retentionPct: 89, avgEase: 2.71, dueNow: 412, masteredPct: 58 },
  { name: "Behavioral Economics", source: "lesson", cards: 28, activeUsers: 164, reviews7d: 2510, retentionPct: 88, avgEase: 2.68, dueNow: 378, masteredPct: 52 },
  { name: "Negotiation", source: "lesson", cards: 20, activeUsers: 142, reviews7d: 2180, retentionPct: 85, avgEase: 2.59, dueNow: 356, masteredPct: 44 },
  { name: "Term Sheet Basics", source: "manual", cards: 16, activeUsers: 98, reviews7d: 1420, retentionPct: 82, avgEase: 2.54, dueNow: 198, masteredPct: 38 },
  { name: "Unit Economics", source: "lesson", cards: 22, activeUsers: 118, reviews7d: 1680, retentionPct: 86, avgEase: 2.63, dueNow: 284, masteredPct: 41 },
  { name: "My own notes", source: "manual", cards: 12, activeUsers: 64, reviews7d: 890, retentionPct: 79, avgEase: 2.48, dueNow: 124, masteredPct: 33 },
  { name: "Pricing Psychology", source: "lesson", cards: 18, activeUsers: 108, reviews7d: 1540, retentionPct: 87, avgEase: 2.66, dueNow: 246, masteredPct: 47 },
  { name: "Competitive Strategy", source: "lesson", cards: 26, activeUsers: 94, reviews7d: 1280, retentionPct: 84, avgEase: 2.61, dueNow: 312, masteredPct: 36 },
];

export const STUDY_LEECH_CARDS = [
  { front: "Participating preferred", deck: "Term Sheet Basics", againCount: 48, ease: 1.42, reps: 3 },
  { front: "Liquidation waterfall", deck: "Business Models", againCount: 41, ease: 1.48, reps: 5 },
  { front: "Post-money SAFE cap", deck: "Term Sheet Basics", againCount: 38, ease: 1.51, reps: 4 },
  { front: "CAC payback period", deck: "Unit Economics", againCount: 34, ease: 1.55, reps: 6 },
  { front: "Endowment effect", deck: "Behavioral Economics", againCount: 31, ease: 1.58, reps: 7 },
  { front: "Anti-dilution ratchet", deck: "Term Sheet Basics", againCount: 29, ease: 1.52, reps: 4 },
];

export const STUDY_SOURCE_BREAKDOWN = [
  { label: "From lessons", value: 68, color: "var(--c-ink)" },
  { label: "Manual decks", value: 22, color: "var(--c-line-strong)" },
  { label: "Imported", value: 10, color: "#94A3B8" },
];

export const STUDY_HOUR_HEATMAP = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  blocks: ["6–9", "9–12", "12–15", "15–18", "18–21", "21–24"],
  values: [
    [12, 28, 18, 22, 45, 38],
    [14, 32, 20, 24, 48, 42],
    [16, 35, 22, 26, 52, 44],
    [15, 33, 21, 25, 50, 41],
    [13, 30, 19, 23, 46, 39],
    [8, 18, 12, 14, 28, 52],
    [6, 14, 10, 12, 22, 48],
  ],
};

export const STUDY_SESSION_STATS = {
  avgDurationMin: 8.4,
  medianDurationMin: 6.2,
  sessions7d: 2418,
  completionRatePct: 78,       // finished due queue vs abandoned mid-session
  mobilePct: 62,
  desktopPct: 38,
  afterLessonPct: 54,          // sessions started within 30min of lesson complete
  morningPct: 41,
  eveningPct: 36,
};

export const STUDY_SESSION_LENGTH_DIST = [
  { bucket: "< 3 min", count: 412 },
  { bucket: "3–5 min", count: 628 },
  { bucket: "5–10 min", count: 892 },
  { bucket: "10–15 min", count: 342 },
  { bucket: "15+ min", count: 144 },
];

export const STUDY_CORRELATION = [
  { metric: "Users who study ≥3×/week", lessonRetentionD30: 52, baseline: 28 },
  { metric: "Users with ≥1 mature card", lessonRetentionD30: 48, baseline: 28 },
  { metric: "Users who never open Cards", lessonRetentionD30: 19, baseline: 28 },
];

export const STUDY_ADOPTION_FUNNEL = [
  { step: "Active learners", count: 1284, rate: 100 },
  { step: "Saved ≥1 deck", count: 436, rate: 34 },
  { step: "Completed 1 session", count: 398, rate: 91 },
  { step: "7-day study streak", count: 142, rate: 36 },
  { step: "≥10 mature cards", count: 98, rate: 69 },
];

export const STUDY_EASE_DISTRIBUTION = [
  { range: "1.3–1.8", count: 1240 },
  { range: "1.8–2.2", count: 2180 },
  { range: "2.2–2.6", count: 4820 },
  { range: "2.6–3.0", count: 5640 },
  { range: "3.0+", count: 1300 },
];

export const STUDY_TOP_STUDIERS = [
  { name: "Priya Shenoy", decks: 6, reviews7d: 186, streak: 21, retentionPct: 92 },
  { name: "Marco Lindqvist", decks: 5, reviews7d: 164, streak: 18, retentionPct: 90 },
  { name: "Maya Okonkwo", decks: 4, reviews7d: 142, streak: 14, retentionPct: 88 },
  { name: "Aisha Bello", decks: 3, reviews7d: 98, streak: 12, retentionPct: 86 },
  { name: "Owen Fitzgerald", decks: 2, reviews7d: 76, streak: 8, retentionPct: 84 },
];

export const STUDY_FORECAST = {
  dueNext24h: 4128,
  dueNext7d: 18420,
  projectedReviews7d: 19200,
  queueClearancePct: 72,       // % users who clear daily due queue
};
