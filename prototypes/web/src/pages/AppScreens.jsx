import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  Headphones,
  Landmark,
  Layers2,
  LayoutDashboard,
  Library,
  LineChart,
  Loader2,
  Lock,
  LogIn,
  Paperclip,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
  X,
  ZoomIn
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BOOK_CATEGORIES,
  BOOK_PATHS,
  BROWSE_CATEGORIES,
  FOUNDER_START_HERE,
  LEARNING_SEQUENCES,
  TRENDING_SUBJECTS,
} from "@/data/browse-data";
import { magazineLessons } from "@/data/course-data";
import {
  curiosityReasons,
  depthOptions,
  HEADLINE_TOPICS,
  landingHeadlineSubjects,
  landingLessonPeeks,
  landingSuggestions,
  LANDING_PLACEHOLDER_TOPICS,
  LANDING_QUICK_PICKS,
  learningOutcomes,
  teachingStyles,
  TOPIC_SUGGESTIONS,
} from "@/data/onboarding-data";
import {
  DEV_EXTRA_TOPICS,
  DEV_NEW_USER_ACTIVE,
  DEV_POWER_ACTIVE,
  DEV_POWER_COMPLETED,
  DEV_POWER_PAUSED,
  DEV_STRESS_ACTIVE,
  DEV_STRESS_COMPLETED,
  DEV_STRESS_PAUSED,
  makeDevActiveCourses,
  makeDevCompletedCourses,
  makeDevPausedCourses,
} from "@/lib/dev-utils";
import { buildCourseLessons, defaultLessons, durationForDepth } from "@/lib/lesson-utils";

const landingDepthOptions = [
  { level: "Intro",      label: "Intro",     sub: "7 lessons · 1 week",   description: "The essentials, clearly explained." },
  { level: "Standard",   label: "Standard",  sub: "14 lessons · 2 weeks",  description: "Full mental model, with real nuance." },
  { level: "Deep dive",  label: "Deep dive", sub: "30 lessons · 1 month",  description: "Every angle, every edge case." },
];


function Landing({ topic, setTopic, onSubmit, onTopicSelect, level = "Standard", setLevel }) {
  const topicInputRef = useRef(null);
  const [headlineText, setHeadlineText] = useState("");
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [typePhase, setTypePhase] = useState("typing");
  const [cursorOn, setCursorOn] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(id);
  }, []);

  // Typewriter loop
  useEffect(() => {
    const target = HEADLINE_TOPICS[headlineIdx];
    if (typePhase === "typing") {
      if (headlineText.length < target.length) {
        const id = setTimeout(() => setHeadlineText(target.slice(0, headlineText.length + 1)), 58);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => setTypePhase("deleting"), 2400);
        return () => clearTimeout(id);
      }
    } else if (typePhase === "deleting") {
      if (headlineText.length > 0) {
        const id = setTimeout(() => setHeadlineText((t) => t.slice(0, -1)), 32);
        return () => clearTimeout(id);
      } else {
        setHeadlineIdx((i) => (i + 1) % HEADLINE_TOPICS.length);
        setTypePhase("typing");
      }
    }
  }, [headlineText, headlineIdx, typePhase]);

  return (
    <Page className="landing-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl px-5 sm:px-6">

        {/* ── Wordmark ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span
              className="font-serif text-[20px] leading-none text-foreground"
              style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}
            >
              Cu<em className="italic">ri</em>
            </span>
            <span
              className="absolute left-0 right-0"
              style={{ bottom: "-3px", height: "3px", background: "var(--c-vermilion)" }}
              aria-hidden
            />
          </div>
        </div>

        {/* ── Headline ─────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="font-serif text-[2.5rem] font-normal leading-[1.13] tracking-[-0.025em] text-foreground sm:text-[3.1rem]">
            Explore{" "}
            <em className="italic">
              {headlineText}
              <span
                className="ml-px inline-block w-[2px]"
                style={{
                  height: "0.82em",
                  background: "var(--c-vermilion)",
                  opacity: cursorOn ? 1 : 0,
                  transition: "opacity 80ms",
                  verticalAlign: "middle",
                  display: "inline-block",
                }}
                aria-hidden
              />
            </em>
          </h1>
          <p className="mt-4 text-[15px] leading-[1.75] text-muted-foreground">
            Curiosity, engineered.<br />
            Three minutes a day. Founder paths, any depth.
          </p>
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <form onSubmit={onSubmit} className="mb-8">
          <div
            className="flex cursor-text items-center gap-3 rounded-2xl bg-card px-5 py-4"
            onMouseDown={(e) => {
              if (e.target.closest("button")) return;
              topicInputRef.current?.focus();
            }}
          >
            <input
              ref={topicInputRef}
              id="landing-topic"
              type="text"
              data-slot="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. term sheets, SAFEs, cap tables..."
              className="landing-topic-input min-w-0 flex-1 border-0 bg-transparent text-[17px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/38 focus-visible:ring-0"
              autoComplete="off"
              autoFocus
              aria-label="What do you want to explore?"
            />
            <button
              type="submit"
              disabled={!topic.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all duration-150 hover:scale-[1.07] active:scale-95 disabled:opacity-20"
              aria-label="Start exploring"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Depth selector */}
          <div className="mt-3">
            <p className="mb-2 text-label uppercase tracking-[0.28em] text-muted-foreground/50">
              How deep?
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {landingDepthOptions.map(({ level: optLevel, label, sub }) => {
                const selected = level === optLevel;
                return (
                  <button
                    key={optLevel}
                    type="button"
                    onClick={() => setLevel?.(optLevel)}
                    className={`flex flex-col items-start border px-3 py-2.5 text-left transition-all duration-150 ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/60 bg-card text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <span className={`text-caption font-medium leading-tight ${selected ? "text-background" : "text-foreground"}`}>
                      {label}
                    </span>
                    <span className={`mt-0.5 text-label leading-tight ${selected ? "text-background/60" : "text-muted-foreground/50"}`}>
                      {sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* ── Topic suggestion list ─────────────────────────────── */}
        <div>
          {TOPIC_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onTopicSelect(suggestion)}
              className={`group flex w-full items-center gap-4 py-[15px] text-left text-[15px] text-muted-foreground transition-colors hover:text-foreground${
                i < TOPIC_SUGGESTIONS.length - 1 ? " border-b border-border/35" : ""
              }`}
            >
              <span className="shrink-0 text-ui text-muted-foreground/35 transition-colors group-hover:text-muted-foreground">
                →
              </span>
              {suggestion}
            </button>
          ))}
        </div>

      </div>
    </Page>
  );
}

// ── Endowed Progress ────────────────────────────────────────────────────────
// Committing to a learning path (topic → onboarding → generating) is itself
// a meaningful act. We treat it as one pre-completed step so every new course
// starts with a visible head start. This is the Endowed Progress Effect:
// people who feel they've already begun are more likely to continue.
const ENDOWED_STEPS = 1;

/**
 * Returns the visual progress percentage for a course, adding one endowed step
 * to both the numerator and denominator. Completed courses always return 100.
 * Exact lesson-count text ("3 / 14") should remain factual — use this only
 * for progress bars, rings, and adjacent percentage labels.
 */
function endowedPct(progress, total) {
  if (total <= 0) return 0;
  const p = Math.min(progress, total);
  if (p >= total) return 100;
  return Math.round(((p + ENDOWED_STEPS) / (total + ENDOWED_STEPS)) * 100);
}

const retentionSignals = [
  { label: "Recall strength", value: "82%", note: "Based on recent business psychology quizzes", icon: "lens" },
  { label: "Return rhythm", value: "5/7", note: "Days you came back this week", icon: "flame" },
  { label: "Concepts held", value: "41", note: "Models, biases, and frameworks reinforced", icon: "column" },
  { label: "Decision depth", value: "Deepening", note: "You retain trade-offs better than definitions", icon: "chart" }
];

const learnerIdentity = {
  title: "The Curious Operator",
  description: "You are building the business and behavioral fluency that compounds in every decision.",
  principle: "Three minutes a day. The judgment that compounds long before you need it.",
  todayPrompt: "Return to one model today. Make it easier to use in the next real decision."
};

const earnedBadges = [
  { title: "Sharp Judgment", level: "Level 3", detail: "7-day streak", icon: "flame", tone: "amber", progress: 100 },
  { title: "Model Builder", level: "Unlocked", detail: "41 concepts reinforced", icon: "lens", tone: "blue", progress: 100 },
  { title: "Path Finisher", level: "2 completed", detail: "Personal library growing", icon: "award", tone: "violet", progress: 100 }
];

const upcomingBadges = [
  { title: "Pattern Spotter", requirement: "Read 20 lessons", progress: "18/20", icon: "book", tone: "blue", percent: 90 },
  { title: "Bias Aware", requirement: "Score 90% on 5 quizzes", progress: "3/5", icon: "chart", tone: "amber", percent: 60 },
  { title: "Learning Stack", requirement: "Create 5 learning paths", progress: "3/5", icon: "column", tone: "violet", percent: 60 }
];

const personalityCues = [
  "You are not collecting business trivia. You are building operating judgment.",
  "Your pattern is steady return, not speed.",
  "The goal is to recognise the trade-off before it costs you a decision."
];

const lessonVisuals = {
  "Business Models": {
    imageTitle: "The engine underneath the product",
    imageCaption: "Revenue logic, margin structure, and repeatability decide whether a business compounds or just survives one good year.",
    equation: "Margin × Repeatability = Compounding Business Model",
    formulaNote: "Two companies can sell the same product and be entirely different businesses underneath. The model — not the product — predicts the future."
  },
  "Unit Economics": {
    imageTitle: "The business inside each customer",
    imageCaption: "CAC, LTV, payback, and margin decide whether growth creates value or only consumes capital.",
    equation: "Healthy Growth = Margin × Retention ÷ CAC",
    formulaNote: "Revenue is only impressive when the unit underneath it can eventually pay for its own acquisition, service, and expansion."
  },
  "Pricing Psychology": {
    imageTitle: "A price is never just a number",
    imageCaption: "Anchors, framing, and context shape what a price feels like long before anyone compares it to a competitor.",
    equation: "Anchor × Framing = Perceived Price",
    formulaNote: "People rarely know what something is worth. They judge it relative to the first number they saw — which means that number is a design choice."
  },
  "Behavioral Economics": {
    imageTitle: "The person economics forgot",
    imageCaption: "Loss aversion, mental accounting, and present bias quietly override the rational actor every model assumes.",
    equation: "Bias × Stakes = Decision Distortion",
    formulaNote: "Classical economics assumes a person who weighs every option calmly. Real decisions are made by a person who doesn't — and that gap is where the insight lives."
  },
  "Negotiation": {
    imageTitle: "Decided before anyone speaks",
    imageCaption: "Preparation, leverage, and the other side's real constraints matter more than performance once the conversation starts.",
    equation: "Leverage × Preparation = Negotiating Power",
    formulaNote: "The person who understands their BATNA and the other side's constraints rarely needs to raise their voice to get a better outcome."
  },
  "Marketing Psychology": {
    imageTitle: "Why attention turns into belief",
    imageCaption: "Framing, social proof, and story decide whether a message gets noticed, trusted, and repeated by someone else.",
    equation: "Attention × Trust = Message That Sticks",
    formulaNote: "Features don't sell — transformations do. The same fact framed two ways can produce two completely different decisions."
  },
  "Customer Psychology": {
    imageTitle: "The job behind the purchase",
    imageCaption: "Motivation, friction, and the moment of struggle explain far more than demographics ever will.",
    equation: "Motivation − Friction = Action Taken",
    formulaNote: "Nobody buys a product. They hire it to do a job — and understanding the job is what separates guessing from knowing."
  },
  "Branding & Positioning": {
    imageTitle: "Owning a space before the comparison starts",
    imageCaption: "Differentiation, naming, and category framing decide what a brand gets compared to in someone's mind.",
    equation: "Distinctiveness × Memory = Position Owned",
    formulaNote: "Positioning beats a better product more often than anyone wants to admit, because people choose from the category they remember, not the one that's objectively best."
  },
  "Decision-Making & Risk": {
    imageTitle: "How the mind handles uncertainty",
    imageCaption: "Fast intuition, slow deliberation, and base rates compete every time a decision has real stakes.",
    equation: "Bias × Stakes = Decision Risk",
    formulaNote: "Humans don't misjudge risk randomly — they misjudge it in predictable directions. Knowing the direction is most of the fix."
  },
  "Habit Formation": {
    imageTitle: "The loop behind every return visit",
    imageCaption: "Cues, routines, and rewards explain why some products become daily rituals and others get deleted after a week.",
    equation: "Trigger × Reward × Repetition = Habit",
    formulaNote: "A habit is not willpower — it's a loop. Understanding the loop is what separates products people return to from products people forget."
  },
  "Competitive Strategy": {
    imageTitle: "Choosing where to compete",
    imageCaption: "Durable advantage, switching costs, and counter-positioning decide whether a lead lasts or evaporates.",
    equation: "Durability × Differentiation = Moat",
    formulaNote: "Strategy is choice, not ambition. Most 'strategies' are just goals — the real work is choosing where to compete and how to win there."
  },
  "Leadership Psychology": {
    imageTitle: "Why people actually follow",
    imageCaption: "Trust, psychological safety, and feedback decide whether a team performs under pressure or just performs when things are easy.",
    equation: "Trust × Candour = Team Performance",
    formulaNote: "Title doesn't make a leader — choosing people does. The teams that perform under pressure built trust long before the pressure arrived."
  },
  "Sales Psychology": {
    imageTitle: "Why people actually say yes",
    imageCaption: "Emotion, social proof, and buying signals explain decisions that logic only justifies afterward.",
    equation: "Trust × Relevance = Yes",
    formulaNote: "People buy on emotion and justify with logic after the fact. Selling well means understanding that order, not fighting it."
  },
  "Money Psychology": {
    imageTitle: "Why a dollar isn't always a dollar",
    imageCaption: "Loss aversion, mental accounting, and the pain of paying shape financial decisions more than any spreadsheet does.",
    equation: "Loss Aversion × Framing = Financial Behaviour",
    formulaNote: "Losing $100 hurts roughly twice as much as finding $100 feels good. That single asymmetry quietly shapes spending, saving, and risk for life."
  },
  default: {
    imageTitle: "A decision map for the concept",
    imageCaption: "Every business and psychology concept has a definition on the surface and a decision, incentive, or trade-off underneath.",
    equation: "Judgment = Concept × Context × Consequence",
    formulaNote: "A concept becomes useful when you can use it to make a better decision under pressure."
  }
};

function getLessonVisual(topic) {
  return lessonVisuals[topic] || lessonVisuals.default;
}

const shareableFacts = {
  "Business Models": {
    fact: "Two companies can sell the same product at the same price and be fundamentally different businesses once you look at margin structure.",
    reflection: "The business model — not the product — is usually what predicts whether a company compounds or plateaus.",
    tag: "business-models"
  },
  "Unit Economics": {
    fact: "A company can grow revenue quickly and still destroy value if each customer costs too much to acquire or serve.",
    reflection: "Revenue alone doesn't prove a business works. The unit underneath the revenue determines whether growth deserves more investment.",
    tag: "unit-economics"
  },
  "Pricing Psychology": {
    fact: "Prices ending in .99 are processed by the brain as meaningfully cheaper than the round number just one cent above.",
    reflection: "A price is never just a number — it's a signal about quality, scarcity, and who the product is for.",
    tag: "pricing-psychology"
  },
  "Behavioral Economics": {
    fact: "Losses feel roughly twice as painful as equivalent gains feel good — a single asymmetry called loss aversion.",
    reflection: "Classical economics assumes a rational actor who weighs every option calmly. Real decisions are made by someone who doesn't.",
    tag: "behavioral-economics"
  },
  "Negotiation": {
    fact: "Most negotiations are decided by preparation before anyone sits down, not by performance once the talking starts.",
    reflection: "Knowing your BATNA — your real alternative — changes the entire shape of a conversation, even if you never mention it.",
    tag: "negotiation"
  },
  default: {
    fact: "The expensive mistakes in business usually come from misunderstood incentives, not missing definitions.",
    reflection: "A good lesson should not just explain a term. It should make the next decision less reactive.",
    tag: "business-knowledge"
  }
};

function getShareableFact(topic) {
  return shareableFacts[topic] || shareableFacts.default;
}

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addLocalDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** YYYY-MM-DD in local time */
function localDateKey(d = new Date()) {
  const x = startOfLocalDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Synthetic history for demo: streak days + scattered extras up to lessonsCompleted */
function buildLessonActivitySeed(streak, lessonsCompleted) {
  const map = {};
  const end = startOfLocalDay(new Date());
  const safeStreak = Math.max(0, Math.min(streak, 370, lessonsCompleted || streak));
  for (let s = 0; s < safeStreak; s++) {
    const k = localDateKey(addLocalDays(end, -s));
    map[k] = 1;
  }
  let remaining = Math.max(0, lessonsCompleted - safeStreak);
  for (let r = 0; r < remaining; r++) {
    const off = safeStreak + 1 + Math.floor((r * 397) % 320);
    const k = localDateKey(addLocalDays(end, -off));
    map[k] = (map[k] || 0) + 1;
  }
  return map;
}

function totalLessonsCompletedTally(courses) {
  const activeSum = courses.reduce((t, c) => t + (c.progress || 0), 0);
  return activeSum + completedCourses.length * 14;
}

function lessonContributionLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const CONTRIBUTION_WEEKS = 26;
const CONTRIBUTION_ROWS = 7;

function LessonContributionGraph({ activityByDay }) {
  const end = startOfLocalDay(new Date());
  const start = addLocalDays(end, -(CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS - 1));
  const startDow = start.getDay();
  const todayKey = localDateKey(new Date());

  const cells = [];
  for (let i = 0; i < CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS; i++) {
    const date = addLocalDays(start, i);
    const key = localDateKey(date);
    const count = activityByDay[key] || 0;
    cells.push({ key, date, count, isToday: key === todayKey });
  }

  const columns = [];
  for (let c = 0; c < CONTRIBUTION_WEEKS; c++) {
    columns.push(cells.slice(c * CONTRIBUTION_ROWS, c * CONTRIBUTION_ROWS + CONTRIBUTION_ROWS));
  }

  const totalLessons = cells.reduce((s, c) => s + c.count, 0);
  const activeDays = cells.filter((c) => c.count > 0).length;

  // Amber heat scale — cool grey → warm amber → deep gold
  const HEAT = ["#E4E4E4", "#FEF3C7", "#FDE68A", "#FBBF24", "#D97706"];

  const rowLabel = (row) => {
    const dow = (startDow + row) % 7;
    if (row !== 1 && row !== 3 && row !== 5) return null;
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dow];
  };

  const CELL = 13;
  const GAP = 3;

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lesson rhythm</p>
          <p className="mt-0.5 text-xs text-muted-foreground">26 weeks · each cell is one day</p>
        </div>
        <div className="flex items-baseline gap-4 text-right">
          <div>
            <span className="font-serif text-2xl tabular-nums text-foreground">{activeDays}</span>
            <span className="ml-1.5 text-label text-muted-foreground">active days</span>
          </div>
          <div>
            <span className="font-serif text-2xl tabular-nums text-foreground">{totalLessons}</span>
            <span className="ml-1.5 text-label text-muted-foreground">lessons</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {/* Row labels */}
          <div className="flex shrink-0 flex-col gap-[3px]">
            <div style={{ height: 16 }} aria-hidden />
            {Array.from({ length: CONTRIBUTION_ROWS }, (_, row) => (
              <div
                key={`rw-${row}`}
                style={{ height: CELL, fontSize: 10 }}
                className="flex items-center justify-end pr-1.5 text-muted-foreground/70"
              >
                {rowLabel(row)}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {columns.map((week, wi) => {
            const first = week[0];
            const prevFirst = wi > 0 ? columns[wi - 1][0] : null;
            const showMonth = first && (!prevFirst || first.date.getMonth() !== prevFirst.date.getMonth());
            return (
              <div key={`w-${wi}`} className="flex flex-col gap-[3px]">
                {/* Month label */}
                <div style={{ height: 16, fontSize: 10 }} className="flex items-center font-medium text-muted-foreground">
                  {showMonth ? first.date.toLocaleString(undefined, { month: "short" }) : null}
                </div>
                {/* Day cells */}
                <div className="grid grid-rows-7 gap-[3px]">
                  {week.map((cell) => {
                    const lv = lessonContributionLevel(cell.count);
                    const label = cell.count === 0
                      ? `${cell.key}: no lesson`
                      : `${cell.key}: ${cell.count} lesson${cell.count === 1 ? "" : "s"}`;
                    return (
                      <div
                        key={cell.key}
                        title={label}
                        aria-label={label}
                        style={{
                          width: CELL,
                          height: CELL,
                          background: HEAT[lv],
                          outline: cell.isToday ? "2px solid #0D0D0D" : "none",
                          outlineOffset: "1px",
                          transition: "background 200ms",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend + today marker */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-label text-muted-foreground">
          <span
            style={{ display: "inline-block", width: 11, height: 11, outline: "2px solid #0D0D0D", outlineOffset: 1, background: HEAT[0] }}
          />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label text-muted-foreground">Less</span>
          <div className="flex gap-[3px]">
            {HEAT.map((color, i) => (
              <div key={i} style={{ width: 11, height: 11, background: color }} />
            ))}
          </div>
          <span className="text-label text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

// ── Dev toolbar (stress-test / state preview) ─────────────────────────────

const DEV_MODES = [
  { id: "empty",          label: "Empty",          desc: "Signed out, no data" },
  { id: "new-user",       label: "New user",        desc: "3 paths · streak 3" },
  { id: "power-user",     label: "Power user",      desc: "8 active · 10 completed · streak 47" },
  { id: "library-stress", label: "Library stress",  desc: `${Object.keys(magazineLessons).length + 12} active · 50 completed · 20 paused` },
  { id: "daily-email",    label: "Daily email",     desc: "Morning lesson email preview" },
  { id: "course-complete", label: "Course complete", desc: "Completion · certificate · next path" },
];

function DevToolbar({ devMode, onSetMode }) {
  const [open, setOpen] = useState(false);
  const active = devMode !== "off";
  return (
    <div className="fixed bottom-4 left-4 z-[9999]" style={{ fontFamily: "Inter, sans-serif" }}>
      {open ? (
        <div
          className="mb-2 flex w-52 flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-xl"
          style={{ fontSize: 12 }}
        >
          <div className="mb-0.5 flex items-center justify-between">
            <span className="text-label font-bold uppercase tracking-widest text-muted-foreground">Dev states</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground/60 transition hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => { onSetMode("off"); setOpen(false); }}
            className={`rounded-lg px-3 py-1.5 text-left transition ${devMode === "off" ? "bg-foreground text-background" : "text-foreground hover:bg-muted"}`}
          >
            <div className="font-semibold" style={{ fontSize: 11.5 }}>Reset</div>
            <div className="opacity-50" style={{ fontSize: 10 }}>Restore default state</div>
          </button>
          {DEV_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onSetMode(m.id); setOpen(false); }}
              className={`rounded-lg px-3 py-1.5 text-left transition ${devMode === m.id ? "bg-foreground text-background" : "text-foreground hover:bg-muted"}`}
            >
              <div className="font-semibold" style={{ fontSize: 11.5 }}>{m.label}</div>
              <div className={devMode === m.id ? "opacity-60" : "text-muted-foreground"} style={{ fontSize: 10 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm transition-all ${
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border/60 bg-card/90 text-muted-foreground hover:text-foreground backdrop-blur"
        }`}
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
        aria-label="Toggle dev state panel"
      >
        <SlidersHorizontal className="h-2.5 w-2.5" aria-hidden />
        {active ? DEV_MODES.find((m) => m.id === devMode)?.label ?? "Dev" : "Dev"}
      </button>
    </div>
  );
}


function AmbientMarks() {
  return (
    <div className="ambient-marks pointer-events-none absolute inset-0 opacity-100">
      <div className="absolute inset-0 bg-card" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-muted/40 to-card" />
    </div>
  );
}

/** Zig-zag layout for lesson nodes (normalized 0–100 viewBox coordinates). */
/** Split lessons into named chapters by course length */
function buildChapters(n) {
  if (n <= 7) return [{ label: null, start: 0, end: n }];
  if (n <= 14) {
    const mid = Math.ceil(n / 2);
    return [
      { label: "Opening", start: 0, end: mid },
      { label: "Depths",  start: mid, end: n },
    ];
  }
  if (n <= 21) {
    const t = Math.ceil(n / 3);
    return [
      { label: "Foundations", start: 0,     end: t },
      { label: "Structure",   start: t,     end: t * 2 },
      { label: "Mastery",     start: t * 2, end: n },
    ];
  }
  const q = Math.ceil(n / 4);
  return [
    { label: "Part I",   start: 0,     end: q },
    { label: "Part II",  start: q,     end: q * 2 },
    { label: "Part III", start: q * 2, end: q * 3 },
    { label: "Part IV",  start: q * 3, end: n },
  ];
}

function CoursePathScreen({ course, streak, onBack, onOpenLesson }) {
  const lessons = course.lessons || [];
  const n = lessons.length;
  const type = course.courseType;
  const progress = typeof course.progress === "number" ? course.progress : 0;

  const doneCount = type === "completed" ? n : Math.max(0, Math.min(progress, n));
  const pct = type === "completed" ? 100 : endowedPct(doneCount, n);
  const chapters = useMemo(() => buildChapters(n), [n]);

  // Progress ring
  const ringR = 28;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = (pct / 100) * ringCirc;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onBack(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  function lessonState(i) {
    if (type === "completed") return "cleared";
    if (type === "abandoned") {
      if (i < progress) return "cleared";
      if (i === progress) return "paused";
      return "locked";
    }
    if (i < progress) return "cleared";
    if (i === progress) return "current";
    return "locked";
  }

  const canOpen = (i) =>
    typeof onOpenLesson === "function" &&
    (type === "completed" || (type === "active" && i <= progress));

  const backLabel = type === "abandoned" ? "Library" : "Dashboard";

  return (
    <section className="curi-animate-in relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel}
        </Button>

        {/* ── Course header ───────────────────────────────────── */}
        <div className="mb-8 flex items-start gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {type === "completed" ? "Mastered" : type === "abandoned" ? "Shelved" : "Exploring"}
              {streak > 0 && type === "active" ? ` · ${streak}-day streak` : ""}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-normal sm:text-4xl">{course.topic}</h1>
            {(course.aspect || course.level) && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {[course.aspect, course.level].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{doneCount} of {n} lessons complete</span>
                <span className="font-medium tabular-nums text-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/60 transition-[width] duration-500 ease-spring"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative mt-1 shrink-0">
            <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
              <circle cx="34" cy="34" r={ringR} fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
              <circle
                cx="34" cy="34" r={ringR} fill="none"
                stroke="hsl(var(--foreground) / 0.55)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${ringDash} ${ringCirc}`}
                style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-ui font-semibold tabular-nums text-foreground">{pct}%</span>
            </div>
          </div>
        </div>

        {/* ── Lesson chapters ─────────────────────────────────── */}
        <div className="space-y-6">
          {chapters.map((chapter, ci) => {
            const chapterLessons = lessons.slice(chapter.start, chapter.end);
            return (
              <div key={ci}>

                {/* Chapter label */}
                {chapter.label && (
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground/55">
                      {chapter.label}
                    </span>
                    <div className="h-px flex-1 bg-border/50" aria-hidden />
                  </div>
                )}

                {/* Lesson rows */}
                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[21px] top-5 bottom-5 w-px bg-border/50" aria-hidden />

                  <div className="space-y-px">
                    {chapterLessons.map((lessonTitle, li) => {
                      const i = chapter.start + li;
                      const state = lessonState(i);
                      const clickable = canOpen(i);
                      const isCurrent = state === "current";
                      const isCleared = state === "cleared";
                      const isPaused = state === "paused";

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => clickable && onOpenLesson?.(i)}
                          disabled={!clickable}
                          className={`group relative w-full rounded-xl px-4 py-3 text-left transition-all duration-150 ${
                            isCurrent
                              ? "bg-foreground text-background"
                              : isCleared || isPaused
                                ? "hover:bg-muted/40"
                                : "cursor-default"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Node indicator */}
                            <div className="mt-[3px] shrink-0">
                              {isCleared ? (
                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground/65">
                                  <Check className="h-2 w-2 stroke-[3] text-background" aria-hidden />
                                </div>
                              ) : isCurrent ? (
                                <div className="lesson-node-current h-3.5 w-3.5 rounded-full border-2 border-background/80 bg-background/90" />
                              ) : isPaused ? (
                                <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-500/50 bg-amber-500/15" />
                              ) : (
                                <div className="h-3.5 w-3.5 rounded-full border border-border/60 bg-muted/30" />
                              )}
                            </div>

                            {/* Lesson content */}
                            <div className="min-w-0 flex-1">
                              {isCurrent && (
                                <p className="mb-0.5 text-label font-semibold uppercase tracking-[0.15em] text-background/55">
                                  Up next
                                </p>
                              )}
                              {isPaused && (
                                <p className="mb-0.5 text-label font-semibold uppercase tracking-[0.15em] text-amber-600">
                                  Shelved here
                                </p>
                              )}
                              <p className={`text-sm leading-snug ${
                                isCurrent
                                  ? "font-medium text-background"
                                  : isCleared
                                    ? "text-foreground"
                                    : isPaused
                                      ? "text-foreground/80"
                                      : "text-muted-foreground/50"
                              }`}>
                                {lessonTitle}
                              </p>
                            </div>

                            {/* Lesson number + action hint */}
                            <div className={`shrink-0 flex items-center gap-1.5 ${isCurrent ? "text-background/50" : "text-muted-foreground/30"}`}>
                              {(isCleared || isCurrent) && (
                                <ArrowRight className={`h-3.5 w-3.5 transition-all ${
                                  isCurrent
                                    ? "opacity-60"
                                    : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-60"
                                }`} aria-hidden />
                              )}
                              <span className="w-7 text-right text-label tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── State footers ───────────────────────────────────── */}
        {type === "completed" && (
          <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 px-5 py-5 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/8">
              <Check className="h-4 w-4 text-foreground/60" strokeWidth={2.5} aria-hidden />
            </div>
            <p className="font-serif text-lg font-normal text-foreground">Course complete.</p>
            <p className="mt-1 text-sm text-muted-foreground">{n} lessons · tap any row to revisit</p>
          </div>
        )}
        {type === "abandoned" && (
          <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm font-medium text-foreground">Paused at lesson {progress + 1}</p>
            <p className="mt-1 text-sm text-muted-foreground">Restart anytime — your progress is saved.</p>
          </div>
        )}

      </div>
    </section>
  );
}

// ── Floating audio player ─────────────────────────────────────────────────

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function AudioPlayer({ nowPlaying, playbackRate, onToggle, onStop, onRestart, onSpeedChange }) {
  if (!nowPlaying) return null;

  const isPlaying = nowPlaying.state === "playing";

  function cycleSpeed() {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    onSpeedChange(next);
  }

  const speedLabel = playbackRate === 1 ? "1×" : `${playbackRate}×`;

  // 16 bars with varied heights for a natural waveform look
  const BAR_HEIGHTS = [40, 75, 55, 90, 45, 100, 60, 80, 35, 95, 50, 70, 42, 88, 58, 65];

  return (
    <div
      className="audio-player fixed bottom-5 right-5 z-50 w-[300px] overflow-hidden rounded-2xl border border-border/70 bg-background"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
      role="region"
      aria-label="Audio player"
    >
      {/* Header: thumbnail + title + close */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <TopicThumbnail topic={nowPlaying.topic} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground/55">
            {nowPlaying.topic}
          </p>
          <p className="mt-0.5 line-clamp-2 text-ui font-semibold leading-snug text-foreground">
            {nowPlaying.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onStop}
          aria-label="Close player"
          className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/40 transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {/* Waveform visualiser */}
      <div className="flex items-end justify-center gap-[2.5px] px-4 pb-3" style={{ height: 28 }} aria-hidden>
        {BAR_HEIGHTS.map((h, i) =>
          isPlaying ? (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-foreground/35 animate-[audioBar_0.7s_ease-in-out_infinite]"
              style={{ height: `${h}%`, animationDelay: `${((i * 0.09) % 0.7).toFixed(2)}s` }}
            />
          ) : (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-border/80"
              style={{ height: `${Math.round(h * 0.25)}%` }}
            />
          )
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/50" aria-hidden />

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3">

        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart from beginning"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/50 transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>

        {/* Play / Pause — primary */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? "Pause" : "Resume"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition hover:opacity-75 active:scale-95"
        >
          {isPlaying
            ? <Pause className="h-4 w-4" aria-hidden />
            : <Play  className="h-4 w-4 translate-x-px" aria-hidden />}
        </button>

        {/* Speed cycle */}
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${speedLabel}. Click to change.`}
          className="flex h-8 min-w-[44px] items-center justify-center rounded-full border border-border/60 bg-muted/40 px-2.5 text-label font-semibold text-muted-foreground transition hover:border-border hover:text-foreground"
        >
          {speedLabel}
        </button>
      </div>
    </div>
  );
}

// ── Sidebar tooltip ───────────────────────────────────────────────────────
function SidebarTooltip({ label }) {
  return (
    <span
      className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground/90 px-2 py-1 text-label font-medium leading-none text-background opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100"
      aria-hidden
    >
      {label}
    </span>
  );
}

function SidebarNavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ padding: "10px 6px" }}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl transition-colors duration-100 ${
        active
          ? "bg-foreground/[0.08] text-foreground"
          : "text-muted-foreground/50 hover:bg-foreground/[0.05] hover:text-foreground/80"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.1 : 1.6} aria-hidden />
      <span className={`text-label font-medium leading-none tracking-wide ${active ? "opacity-100" : "opacity-70"}`}>
        {label}
      </span>
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ screen, streak, plan, user, todayHasLesson, onToday, onBrowse, onLibrary, onAnalytics, onNewCourse, onProfile, onUpgrade }) {
  const activeGroup = {
    today:    ["today", "lesson", "quiz", "coursePath", "courseComplete"],
    browse:   ["browse"],
    library:  ["library", "previousCourses", "archiveReader", "archiveQuiz", "courseLessonList"],
    progress: ["dashboard"],
    create:   ["landing", "newPath", "onboarding", "generating"],
  };
  const isActive = (key) => activeGroup[key]?.includes(screen);
  const streakAtRisk = streak > 0 && !todayHasLesson;

  return (
    <aside className="sidebar relative flex h-screen w-[84px] shrink-0 flex-col border-r border-border/70 bg-sidebar">

      {/* Wordmark — "Cu·ri" Fraunces Light, italic ri, Vermilion underline */}
      <div className="flex justify-center px-3 pb-4 pt-5">
        <button
          type="button"
          onClick={onToday}
          aria-label="Curi"
          className="relative inline-block transition-opacity hover:opacity-80"
        >
          <span
            className="font-serif text-[19px] leading-none text-foreground"
            style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}
          >
            Cu<em className="italic">ri</em>
          </span>
          <span
            className="absolute left-0 right-0"
            style={{ bottom: "-3px", height: "3px", background: "var(--c-vermilion)" }}
            aria-hidden
          />
        </button>
      </div>

      <div className="mx-3 h-px bg-border/60" aria-hidden />

      {/* Primary nav */}
      <nav className="mt-3 flex flex-col gap-1 px-2" aria-label="Main">
        <SidebarNavBtn icon={BookOpen}  label="Home"     active={isActive("today")}    onClick={onToday} />
        <SidebarNavBtn icon={Compass}   label="Paths"    active={isActive("browse")}   onClick={onBrowse} />
        <SidebarNavBtn icon={Library}   label="Library"  active={isActive("library")}  onClick={onLibrary} />
        <SidebarNavBtn icon={BarChart3} label="Progress" active={isActive("progress")} onClick={onAnalytics} />
      </nav>

      <div className="mx-3 my-3 h-px bg-border/60" aria-hidden />

      {/* New Course */}
      <div className="px-2">
        <SidebarNavBtn icon={Sparkles} label="New" active={isActive("create")} onClick={onNewCourse} />
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1 px-2 pb-5">

        {/* Streak */}
        {streak > 0 && (
          <button
            type="button"
            onClick={onToday}
            title={streakAtRisk ? `${streak}-day streak — get curious today to keep it` : `${streak}-day streak`}
            style={{ padding: "10px 6px" }}
            className={`flex w-full flex-col items-center gap-1.5 rounded-xl transition-colors ${
              streakAtRisk
                ? "text-orange-500 hover:bg-orange-500/10"
                : "text-amber-500 hover:bg-amber-500/10"
            }`}
          >
            <Flame size={18} strokeWidth={streakAtRisk ? 2.2 : 1.8} aria-hidden />
            <span className="text-label font-semibold tabular-nums leading-none">
              {streak}{streakAtRisk ? "!" : ""}
            </span>
          </button>
        )}

        {/* Upgrade */}
        {plan !== "paid" && (
          <button
            type="button"
            onClick={onUpgrade}
            style={{ padding: "10px 6px" }}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl text-violet-500/70 transition hover:bg-violet-500/10 hover:text-violet-600"
          >
            <ArrowUp size={18} strokeWidth={1.8} aria-hidden />
            <span className="text-label font-medium leading-none opacity-80">Upgrade</span>
          </button>
        )}

        {/* Profile */}
        <button
          type="button"
          onClick={onProfile}
          aria-label={user.name}
          title={user.name}
          style={{ padding: "10px 6px" }}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl transition hover:bg-muted/60"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-label font-semibold text-background">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="max-w-full truncate text-label font-medium leading-none text-muted-foreground/60">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </div>
    </aside>
  );
}


function Header({ signedIn, user, alwaysShowBar, onLogo, onProfile, onSignIn, onSignUp }) {
  return (
    <header
      className={`sticky top-0 z-30 -mx-5 flex items-center justify-between bg-background/80 px-5 pb-3.5 pt-3 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-14 xl:px-14${alwaysShowBar ? "" : " md:hidden"}`}
    >
      <button type="button" className="relative inline-block px-2 py-1 transition-opacity hover:opacity-75" onClick={onLogo} aria-label="Curi">
        <span
          className="font-serif text-[19px] leading-none text-foreground"
          style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}
        >
          Cu<em className="italic">ri</em>
        </span>
        <span className="absolute left-2 right-2" style={{ bottom: 0, height: "3px", background: "var(--c-vermilion)" }} aria-hidden />
      </button>

      {signedIn ? (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onProfile} aria-label="Open profile">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSignIn}>
            <LogIn className="h-3.5 w-3.5" aria-hidden />
            Sign in
          </Button>
          <Button size="sm" onClick={onSignUp}>
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            Sign up
          </Button>
        </div>
      )}
    </header>
  );
}

function Page({ children, className = "", style }) {
  return <section className={`curi-animate-in flex flex-1 flex-col ${className}`} style={style}>{children}</section>;
}

function Onboarding({ topic, aspect, setAspect, level, setLevel, suggestions, curiosityReason, setCuriosityReason, desiredOutcome, setDesiredOutcome, learningStyle, setLearningStyle, onGenerate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const selectedDepth = depthOptions.find((o) => o.name === level) || depthOptions[1];
  const allFilled = !!aspect;

  const steps = [
    { key: "why",   eyebrow: "Your motivation",  title: "Why are you exploring this?",      hint: "Helps Curi decide which details to surface first.",           value: curiosityReason, setValue: setCuriosityReason, options: curiosityReasons },
    { key: "angle", eyebrow: "Your angle",       title: "What angle should Curi take?",     hint: "Shapes the lens every lesson is written through.",            value: aspect,          setValue: setAspect,          options: suggestions },
    { key: "style", eyebrow: "How you learn",    title: "How do ideas click for you?",      hint: "Affects how concepts are introduced and examples are chosen.", value: learningStyle,    setValue: setLearningStyle,   options: teachingStyles },
    { key: "depth", eyebrow: "How deep",         title: "How far do you want to go?",       hint: "Pick the length that fits your schedule.",                    isDepth: true },
  ];

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function goTo(i) {
    setAnimKey((k) => k + 1);
    setStepIndex(i);
  }

  function advance(overrideValue) {
    const v = overrideValue ?? step?.value;
    if (!v && !step?.isDepth) return;
    if (!isLastStep) goTo(stepIndex + 1);
  }

  function selectAndAdvance(setValue, value) {
    setValue(value);
    window.setTimeout(() => advance(value), 340);
  }

  return (
    <Page className="onboarding-page relative justify-center overflow-hidden py-10 lg:py-14">
      <div className="dot-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-transparent to-transparent" aria-hidden />

      <div className="mx-auto w-full max-w-lg px-1">

        {/* Progress pip strip */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s.key}
                type="button"
                disabled={i >= stepIndex}
                onClick={() => i < stepIndex && goTo(i)}
                aria-label={`Step ${i + 1}: ${s.eyebrow}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-spring ${
                  i === stepIndex
                    ? "w-8 bg-foreground"
                    : i < stepIndex
                      ? "w-3 cursor-pointer bg-foreground/30 hover:bg-foreground/50"
                      : "w-3 cursor-default bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-label font-medium tabular-nums text-muted-foreground">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        {/* Topic context */}
        <p className="mb-2 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          {topic}
        </p>

        {/* Animated step */}
        <div key={`step-${animKey}`} className="onboarding-step-enter">
          <p className="mb-1 text-label font-semibold uppercase tracking-[0.2em] text-primary/70">
            {step.eyebrow}
          </p>
          <h2 className="mb-1.5 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.75rem]">
            {step.title}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{step.hint}</p>

          {step.isDepth ? (
            <div className="space-y-3">
              {depthOptions.map((option) => {
                const selected = level === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setLevel(option.name)}
                    className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 ease-out ${
                      selected
                        ? "border-foreground/25 bg-card shadow-md"
                        : "border-border/60 bg-card/50 hover:border-border hover:bg-card hover:shadow-sm"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{option.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    {selected && (
                      <p className="mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                        {levelDescription(option.name)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {step.options.map((option) => {
                const selected = step.value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAndAdvance(step.setValue, option)}
                    className={`relative rounded-2xl border p-4 text-left text-sm font-medium leading-snug transition-all duration-200 ease-out ${
                      selected
                        ? "scale-[1.01] border-foreground/25 bg-card text-foreground shadow-md"
                        : "border-border/60 bg-card/50 text-foreground/80 hover:border-border hover:bg-card hover:text-foreground hover:shadow-sm"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      </span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => goTo(stepIndex - 1)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
            {step.isDepth ? (
              <Button
                type="button"
                onClick={onGenerate}
                disabled={!allFilled}
                className="w-full px-8 gap-2 sm:w-auto sm:min-w-[260px]"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Build my path
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => advance()}
                disabled={!step.value}
                className="px-6 gap-1.5"
              >
                {stepIndex === steps.length - 2 ? "Almost there" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

function Stepper({ active }) {
  const steps = ["Topic", "Context", "Depth", "Path"];
  return (
    <nav className="flex items-center" aria-label="Course setup progress">
      {steps.map((label, index) => {
        const n = index + 1;
        const done = n < active;
        const current = n === active;
        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <div
                className={`mx-2 h-px flex-1 transition-colors duration-500 sm:mx-3 ${done ? "bg-foreground/25" : "bg-border/60"}`}
                aria-hidden
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`rounded-full transition-all duration-300 ease-spring ${
                  done
                    ? "h-1.5 w-1.5 bg-foreground/30"
                    : current
                      ? "h-2 w-2 bg-foreground ring-2 ring-foreground/15 ring-offset-2 ring-offset-background"
                      : "h-1.5 w-1.5 bg-border"
                }`}
              />
              <span
                className={`text-label leading-none transition-colors duration-200 ${
                  current ? "font-semibold text-foreground" : done ? "text-foreground/35" : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function levelDescription(option) {
  if (option === "Intro") return "Clean foundations, no assumed vocabulary.";
  if (option === "Standard") return "A quicker pace with richer context.";
  return "Less explanation, more interpretation.";
}

const WARMUP_MSGS = [
  "Analysing your choices…",
  "Mapping the territory…",
  "Choosing your angle…",
  "Sequencing the arc…",
  "Following your curiosity…",
];

/** Short editorial standfirst for each lesson row — reads like a magazine sub-deck. */
function lessonBlurb(title, index, total, topic) {
  const t = title.toLowerCase();
  const pos = index / Math.max(total - 1, 1);

  if (pos === 0) return "The first foothold: the definition, pressure, and founder decision this path is built around.";
  if (pos >= 0.92) return "The synthesis: what you can now explain before a raise, negotiation, or board-level decision.";

  if (t.includes("why") && pos < 0.25) return "The opening question: why this matters before investor pressure makes it expensive.";
  if (t.includes("origin") || t.includes("born") || t.includes("began") || t.includes("history") || t.includes("founding") || t.includes("dream"))
    return "The roots: the financing pattern, incentive, or market pressure that made this idea necessary.";
  if (t.includes("debate") || t.includes("tension") || t.includes("argument") || t.includes("problem") || t.includes("trouble"))
    return "The live tension: where founders and investors can be right for different reasons.";
  if (t.includes("tool") || t.includes("practical") || t.includes("apply") || t.includes("decision") || t.includes("daily"))
    return "The practical form: how this idea changes a real founder decision.";
  if (t.includes("limit") || t.includes("cannot") || t.includes("fail") || t.includes("wrong") || t.includes("wall"))
    return "The edge: where a clean definition stops being enough.";
  if (t.includes("future") || t.includes("next") || t.includes("forward") || t.includes("tomorrow"))
    return "The next-round question: what this changes as the company, raise, or cap table compounds.";
  if (t.includes("mental model") || t.includes("pattern") || t.includes("map") || t.includes("framework") || t.includes("model"))
    return "A frame you can carry into investor calls, diligence, and internal decisions.";
  if (t.includes("people") || t.includes("thinker") || t.includes("figure") || t.includes("who shaped") || t.includes("maker"))
    return "The people and incentives behind the term, metric, or financing pattern.";
  if (t.includes("example") || t.includes("case") || t.includes("story") || t.includes("concrete"))
    return "Where the abstract lands: the idea made visible in a real company situation.";
  if (t.includes("word") || t.includes("vocabulary") || t.includes("language") || t.includes("term") || t.includes("unlocks"))
    return "The vocabulary that makes the rest of the raise, model, or negotiation legible.";
  if (t.includes("difference") || t.includes("distinction") || t.includes("vs") || t.includes("between"))
    return "A distinction worth holding: two terms that look alike until money or control is at stake.";
  if (t.includes("quiet") || t.includes("hidden") || t.includes("beneath") || t.includes("inside") || t.includes("strange"))
    return "The part founders often learn too late. Pay attention here.";
  if (t.includes("economics") || t.includes("power") || t.includes("politics") || t.includes("money"))
    return "The forces underneath: who benefits, who decides, and what it costs.";

  if (pos < 0.25) return "The foundations: the concepts that carry the rest of the path.";
  if (pos < 0.5)  return "The mechanism: what makes the term, metric, or financing structure move.";
  if (pos < 0.75) return "The deeper layer: where incentives, ownership, and timing start to matter.";
  return "The synthesis: the threads drawn together into a founder decision.";
}

function buildingMessage(pct, topic) {
  if (pct < 20) return `Mapping the territory for ${topic}…`;
  if (pct < 45) return "Sequencing the lessons…";
  if (pct < 70) return "Refining the arc…";
  if (pct < 90) return "Almost there…";
  return "Finishing touches…";
}

function Generating({ topic, lessons, totalLessons = 14, complete, onSave, signedIn }) {
  const pct = totalLessons > 0 ? Math.round((lessons.length / totalLessons) * 100) : 0;
  const isWarmup = lessons.length === 0 && !complete;
  const [warmupIdx, setWarmupIdx] = useState(0);

  useEffect(() => {
    if (!isWarmup) return;
    const id = window.setInterval(() => setWarmupIdx((i) => (i + 1) % WARMUP_MSGS.length), 650);
    return () => window.clearInterval(id);
  }, [isWarmup]);

  return (
    <Page className="generating-page justify-center py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl px-1 sm:px-2">

        {isWarmup ? (
          /* Warmup: anticipation state */
          <div className="flex flex-col items-center gap-8 py-12 text-center sm:py-20">
            <div className="relative">
              <div className="generating-pulse h-24 w-24 rounded-full border border-primary/20 bg-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="generating-sparkle h-9 w-9 text-primary" strokeWidth={1.5} aria-hidden />
              </div>
            </div>
            <div className="space-y-2">
              <p key={warmupIdx} className="generating-msg text-lg font-medium text-foreground sm:text-xl">
                {WARMUP_MSGS[warmupIdx]}
              </p>
              <p className="text-sm text-muted-foreground">{topic}</p>
            </div>
            <div className="w-40 overflow-hidden rounded-full bg-muted" style={{ height: "3px" }}>
              <div className="generating-bar-breathe h-full rounded-full bg-primary/60" />
            </div>
          </div>
        ) : (
          /* Building + complete: path outline */
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="border-b border-border/60 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {totalLessons}-lesson founder path
                  </p>
                  <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                    {topic}
                  </h1>
                </div>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                  complete
                    ? "border-foreground/20 bg-foreground/8 text-foreground/70"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}>
                  {complete
                    ? <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
                    : <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{complete ? "All lessons written" : buildingMessage(pct, topic)}</span>
                  <span className="tabular-nums font-medium text-foreground">{lessons.length} / {totalLessons}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out bg-foreground/55"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Lesson list ────────────────────────────── */}
            <div className="max-h-[min(58vh,34rem)] overflow-y-auto">
              {Array.from({ length: totalLessons }, (_, index) => {
                const lesson = lessons[index];
                const isLive = lesson && index === lessons.length - 1 && !complete;

                if (complete && lesson) {
                  if (index === 0) {
                    return (
                      <button
                        key={`lesson-${index}`}
                        type="button"
                        onClick={onSave}
                        className="group w-full border-b border-border/40 px-6 py-4 text-left transition-colors hover:bg-muted/30 sm:px-8 sm:py-5"
                      >
                        <div className="lesson-reveal flex items-start gap-4 sm:gap-5">
                          <span className="w-7 shrink-0 pt-px font-serif text-sm tabular-nums text-foreground/60 select-none">01</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-serif text-[1.05rem] font-normal leading-snug text-foreground sm:text-lg">{lesson}</p>
                            <p className="lesson-blurb mt-1.5 text-ui leading-relaxed text-muted-foreground">{lessonBlurb(lesson, index, totalLessons, topic)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 pt-1 text-xs text-muted-foreground/50 transition-colors group-hover:text-foreground">
                            {signedIn ? "Start" : "Read free"}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <div key={`lesson-${index}`} className="border-b border-border/40 px-6 py-4 last:border-b-0 opacity-30 sm:px-8 sm:py-5">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span className="w-7 shrink-0 pt-px font-serif text-sm tabular-nums text-muted-foreground/45 select-none">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[1.05rem] font-normal leading-snug text-foreground sm:text-lg">{lesson}</p>
                          <p className="lesson-blurb mt-1.5 text-ui leading-relaxed text-muted-foreground">{lessonBlurb(lesson, index, totalLessons, topic)}</p>
                        </div>
                        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" aria-hidden />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`lesson-${index}`} className={`border-b border-border/40 px-6 py-4 last:border-b-0 sm:px-8 sm:py-5 ${isLive ? "lesson-row-live" : ""}`}>
                    {lesson ? (
                      <div className="lesson-reveal flex gap-4 sm:gap-5">
                        <span className="w-7 shrink-0 pt-px font-serif text-sm tabular-nums text-muted-foreground/45 select-none">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[1.05rem] font-normal leading-snug text-foreground sm:text-lg">{lesson}</p>
                          <p className="lesson-blurb mt-1.5 text-ui leading-relaxed text-muted-foreground">{lessonBlurb(lesson, index, totalLessons, topic)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 sm:gap-5" aria-hidden>
                        <span className="w-7 shrink-0 pt-px font-serif text-sm tabular-nums text-muted-foreground/20 select-none">{String(index + 1).padStart(2, "0")}</span>
                        <div className="flex-1 space-y-2.5 pt-1">
                          <Skeleton className="h-5 w-5/6 rounded" />
                          <Skeleton className="h-3.5 w-1/2 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </Page>
  );
}

/* Academy analytics tier — SVG/CSS only */
function AcademyInsights({ streak, lessonsCompleted, courses, activityByDay }) {
  // Reading days by weekday — derived from real activityByDay data
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun–Sat
  Object.entries(activityByDay ?? {}).forEach(([key]) => {
    const d = new Date(key + "T00:00:00");
    dowCounts[d.getDay()] += 1;
  });
  const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxDow = Math.max(1, ...dowCounts);

  // All topics touched (active + completed)
  const allTopics = [
    ...courses.map((c) => ({ topic: c.topic, pct: Math.round((c.progress / Math.max(c.lessons?.length || 1, 1)) * 100), status: "active" })),
    ...completedCourses.map((c) => ({ topic: c.topic, pct: 100, status: "completed" })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LineChart className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2 className="text-base font-semibold tracking-tight text-foreground">Academy insights</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        {/* Reading days by weekday */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reading pattern</CardTitle>
            <CardDescription>Which days of the week you complete lessons most often</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end justify-between gap-1.5 sm:gap-2">
              {dowCounts.map((v, i) => (
                <div key={`dow-${i}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end justify-center bg-muted/40">
                    <div
                      className="w-[68%] min-h-[4px] bg-foreground/70 transition-all"
                      style={{ height: `${Math.max(4, (v / maxDow) * 100)}%` }}
                    />
                  </div>
                  <span className="text-label font-medium text-muted-foreground">{weekLabels[i].slice(0, 2)}</span>
                </div>
              ))}
            </div>
            {Object.keys(activityByDay ?? {}).length === 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">Complete some lessons to see your reading pattern.</p>
            )}
          </CardContent>
        </Card>

        {/* Topics explored — real data */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Founder concepts explored</CardTitle>
            <CardDescription>Every fundraising, finance, and ownership path you've started or finished in Curi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((t) => (
                <div
                  key={t.topic}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm ${
                    t.status === "completed"
                      ? "border-foreground/20 bg-foreground/8 text-foreground"
                      : "border-border/60 bg-muted/30 text-foreground/80"
                  }`}
                >
                  {t.status === "completed" && <Check className="h-3.5 w-3.5 shrink-0 text-foreground/60" aria-hidden />}
                  <span>{t.topic}</span>
                  {t.status === "active" && <span className="tabular-nums text-muted-foreground">{t.pct}%</span>}
                </div>
              ))}
              {allTopics.length === 0 && (
                <p className="text-sm text-muted-foreground">No founder paths yet. Start one to see your knowledge base grow.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

/** Small radial dial for quiz recall (mock %). */
// ── Feed helpers ─────────────────────────────────────────────────────────

function feedDateLabel(daysAgo) {
  if (daysAgo === -1) return "Tomorrow";
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = addLocalDays(new Date(), -daysAgo);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function buildDailyFeed(courses) {
  const items = [];
  courses.forEach((course) => {
    const total = course.lessons.length;
    const progress = course.progress || 0;
    const todayIdx = Math.min(progress, total - 1);
    // Today's lesson (unread)
    items.push({
      id: `${course.id}-today`,
      daysAgo: 0,
      topic: course.topic,
      courseId: course.id,
      lessonIndex: todayIdx,
      title: course.lessons[todayIdx],
      lessonNumber: todayIdx + 1,
      totalLessons: total,
      isRead: false,
      isToday: true,
    });
    // Tomorrow's lesson (locked preview)
    const tomorrowIdx = progress + 1;
    if (tomorrowIdx < total) {
      items.push({
        id: `${course.id}-tomorrow`,
        daysAgo: -1,
        topic: course.topic,
        courseId: course.id,
        lessonIndex: tomorrowIdx,
        title: course.lessons[tomorrowIdx],
        lessonNumber: tomorrowIdx + 1,
        totalLessons: total,
        isRead: false,
        isToday: false,
        isLocked: true,
      });
    }
    // Past completed lessons
    for (let i = progress - 1; i >= 0 && progress - i <= 21; i--) {
      const daysAgo = progress - i;
      items.push({
        id: `${course.id}-${i}`,
        daysAgo,
        topic: course.topic,
        courseId: course.id,
        lessonIndex: i,
        title: course.lessons[i],
        lessonNumber: i + 1,
        totalLessons: total,
        isRead: true,
        isToday: false,
      });
    }
  });
  return items.sort((a, b) => a.daysAgo - b.daysAgo);
}

function groupDailyFeed(items) {
  const map = new Map();
  items.forEach((item) => {
    const k = item.daysAgo;
    if (!map.has(k)) map.set(k, { daysAgo: k, label: feedDateLabel(k), items: [] });
    map.get(k).items.push(item);
  });
  return [...map.values()].sort((a, b) => a.daysAgo - b.daysAgo);
}

// ── Topic thumbnail ───────────────────────────────────────────────────────

function topicSwatch(topic) {
  const palette = {
    "venture capital":          ["#8BA0B8", "#102A43"],
    "term sheets":              ["#C7A27A", "#3B240D"],
    "unit economics":           ["#7FA88D", "#12351F"],
    "safe notes":               ["#9A86B8", "#2B1744"],
    "cap tables":               ["#B88D7A", "#3C190E"],
    fundraising:                ["#7C9FB0", "#0D2B36"],
    "burn rate":                ["#C18A6B", "#421A0B"],
    "founder equity":           ["#A6A06D", "#332F0B"],
    "liquidation preferences":  ["#B78A9E", "#3D1023"],
    "pro-rata rights":          ["#8B9AB8", "#17233D"],
    "board control":            ["#8AA08A", "#173317"],
    "option pools":             ["#A887B5", "#33163F"],
    dilution:                   ["#B89772", "#39240A"],
  };
  const key = topic.toLowerCase();
  if (palette[key]) return palette[key];
  const hues = [25, 145, 200, 260, 45, 310, 18, 190];
  const h = hues[topic.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % hues.length];
  return [`hsl(${h} 32% 60%)`, `hsl(${h} 60% 16%)`];
}

function TopicThumbnail({ topic, size = 64 }) {
  const [bg, fg] = topicSwatch(topic);
  const initial = (topic || "?").slice(0, 1).toUpperCase();
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ width: size, height: size, background: bg }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          color: fg,
          opacity: 0.28,
          fontSize: size * 0.62,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
        aria-hidden
      >
        {initial}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(140deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 6px)",
        }}
        aria-hidden
      />
    </div>
  );
}

// ── Lesson feed card ──────────────────────────────────────────────────────

function LessonFeedCard({ item, onClick, onListen, nowPlaying }) {
  const blurb = lessonBlurb(item.title, item.lessonIndex, item.totalLessons, item.topic);
  const isActive  = nowPlaying?.id === item.id;
  const isPlaying = isActive && nowPlaying?.state === "playing";
  const isPaused  = isActive && nowPlaying?.state === "paused";

  if (item.isLocked) {
    return (
      <div className="flex w-full gap-3.5 rounded-lg border border-border/50 bg-card p-4 sm:gap-4 sm:p-5">
        <div className="opacity-40">
          <TopicThumbnail topic={item.topic} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-foreground/50 sm:text-[15px]">
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground/60 sm:text-ui">
            {blurb}
          </p>
          <div className="mt-3 h-px bg-border/40" aria-hidden />
          <div className="mt-2 flex items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 text-label text-muted-foreground/40">
              <Lock className="h-3 w-3" aria-hidden />
              Unlocks after today's lesson
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex w-full gap-3.5 rounded-lg border border-border/50 bg-card p-4 transition-colors duration-150 hover:border-border/80 sm:gap-4 sm:p-5">
      {/* Thumbnail — clicking it opens the lesson */}
      <button type="button" onClick={onClick} className="shrink-0 focus:outline-none" tabIndex={-1} aria-hidden>
        <TopicThumbnail topic={item.topic} />
      </button>

      <div className="min-w-0 flex-1">
        {/* Title + blurb — clicking opens the lesson */}
        <button
          type="button"
          onClick={onClick}
          className="block w-full text-left focus:outline-none"
        >
          <h3
            className={`text-[14px] font-semibold leading-snug tracking-tight sm:text-[15px] ${
              item.isRead ? "text-foreground/55" : "text-foreground"
            }`}
          >
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground sm:text-ui">
            {blurb}
          </p>
        </button>

        <div className="mt-3 h-px bg-border/55" aria-hidden />

        <div className="mt-2 flex items-center justify-end gap-3">
          {/* ── Listen / audio button ── */}
          <button
            type="button"
            onClick={() => onListen?.(item)}
            className={`flex items-center gap-1.5 text-label font-semibold uppercase tracking-wider transition-colors duration-150 ${
              isPlaying
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            }`}
            aria-label={isPlaying ? "Pause audio" : isPaused ? "Resume audio" : "Listen to lesson"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3" aria-hidden />
                <span className="flex items-end gap-px h-3" aria-hidden>
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_infinite]" style={{ height: "35%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.18s_infinite]" style={{ height: "100%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.36s_infinite]" style={{ height: "55%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.12s_infinite]" style={{ height: "80%" }} />
                </span>
              </>
            ) : (
              <>
                <Headphones className="h-3 w-3" aria-hidden />
                {isPaused ? "Resume" : "Listen"}
              </>
            )}
          </button>

          {/* ── Read now / Read ── */}
          <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-1 text-label font-semibold uppercase tracking-wider transition-colors duration-150 ${
              item.isRead
                ? "text-muted-foreground/45"
                : "text-primary hover:text-primary/80"
            }`}
          >
            {item.isRead && <Check className="h-3 w-3 stroke-[2.5]" aria-hidden />}
            {item.isRead ? "Read" : "Read now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Library page ─────────────────────────────────────────────────────────

function CourseLessonList({ course, user, onBack, onOpenLesson }) {
  const isCompleted = course.type === "completed";
  const isPaused    = course.type === "abandoned";
  const lessons     = course.lessons || [];
  const total       = lessons.length;
  const progress    = isCompleted ? total : (course.progress || 0);
  const nextIndex   = Math.min(progress, total - 1);
  const pct         = isCompleted ? 100 : endowedPct(progress, total);

  const statusLabel = isCompleted ? "Mastered" : isPaused ? "Shelved" : "Exploring";

  return (
    <Page className="items-center py-8">
      <div className="w-full max-w-[640px] px-4 sm:px-6">

        {/* Nav */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Library
          </Button>
        </div>

        {/* Course header */}
        <div className="mb-8 border-b border-border pb-8">
          <div className="mb-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">{statusLabel}</div>
          <h1 className="font-serif text-3xl leading-snug text-foreground">{course.topic}</h1>
          {course.aspect && (
            <p className="mt-1 text-sm text-muted-foreground">{course.aspect}</p>
          )}

          {/* Progress bar + fraction */}
          <div className="mt-5 flex items-center gap-4">
            <div className="h-[2px] flex-1 bg-border">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {progress} / {total} lessons
            </span>
          </div>

          {/* Continue CTA */}
          {!isCompleted && progress < total && (
            <button
              type="button"
              onClick={() => onOpenLesson(nextIndex)}
              className="mt-5 flex w-full items-center justify-between border border-border bg-card px-5 py-4 text-left transition hover:bg-muted/40"
            >
              <div>
                <div className="text-label uppercase tracking-[0.24em] text-muted-foreground">
                  {progress === 0 ? "Start here" : "Continue"}
                </div>
                <div className="mt-0.5 font-serif text-base text-foreground">
                  {lessons[nextIndex]}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-foreground/60">
                Lesson {nextIndex + 1}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </div>
            </button>
          )}
        </div>

        {/* Certificate & badge — completed courses only */}
        {isCompleted && (
          <div className="mb-8 border border-border bg-card">
            <div style={{ height: "4px", background: "var(--c-vermilion)" }} />

            {/* Preview */}
            <div className="px-6 py-7 text-center">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-serif text-base leading-none text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}>
                  Cu<em className="italic">ri</em>
                  <span className="block" style={{ height: "2px", width: "28px", background: "var(--c-vermilion)", marginTop: "2px" }} />
                </span>
                <span className="text-label text-muted-foreground">
                  {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="mt-4 mb-1 text-label uppercase tracking-[0.3em] text-muted-foreground">Certificate of Completion</div>
              <div className="mx-auto mb-3 h-px w-16 bg-border" />
              {user?.name && (
                <p className="mb-1 text-sm text-muted-foreground">This certifies that</p>
              )}
              {user?.name && (
                <p className="font-serif text-xl leading-snug text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
                  {user.name}
                </p>
              )}
              <p className={`text-sm text-muted-foreground ${user?.name ? "mt-1" : ""}`}>
                {user?.name ? (course.bookAuthor ? "has read" : "has completed the path") : (course.bookAuthor ? "Book path complete" : "Path completed")}
              </p>
              <h2
                className="mt-2 font-serif leading-tight text-foreground"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 400, fontVariationSettings: "'SOFT' 50, 'WONK' 1", fontStyle: course.bookAuthor ? "italic" : "normal" }}
              >
                {course.topic}
              </h2>
              {course.bookAuthor && (
                <p className="mt-1 text-sm text-muted-foreground">by {course.bookAuthor}</p>
              )}
              <p className="mt-3 text-label text-muted-foreground">{total} lessons · curi.app</p>
            </div>

            {/* Download row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
              <p className="text-label text-muted-foreground">Download and add to LinkedIn or your portfolio.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateAndDownload("certificate", { userName: user?.name || "", topic: course.topic, bookAuthor: course.bookAuthor, lessonCount: total })}
                  className="inline-flex items-center gap-1.5 border border-border bg-foreground px-3.5 py-2 text-label font-medium text-background transition hover:bg-foreground/85"
                >
                  <ArrowDown className="h-3 w-3" aria-hidden />
                  Certificate
                </button>
                <button
                  type="button"
                  onClick={() => generateAndDownload("badge", { userName: user?.name || "", topic: course.topic, bookAuthor: course.bookAuthor, lessonCount: total })}
                  className="inline-flex items-center gap-1.5 border border-border px-3.5 py-2 text-label font-medium text-foreground/65 transition hover:border-foreground/25 hover:text-foreground"
                >
                  <ArrowDown className="h-3 w-3" aria-hidden />
                  Badge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson list */}
        <div className="divide-y divide-border">
          {lessons.map((lessonTitle, i) => {
            const done    = i < progress || isCompleted;
            const current = i === progress && !isCompleted;
            const locked  = i > progress && !isCompleted;

            return (
              <button
                key={i}
                type="button"
                onClick={() => !locked && onOpenLesson(i)}
                disabled={locked}
                className={`flex w-full items-center gap-4 px-1 py-4 text-left transition-colors ${
                  locked
                    ? "cursor-default opacity-35"
                    : "hover:bg-muted/30"
                }`}
              >
                {/* Status icon */}
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                  done ? "text-foreground" : current ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {done && (
                    <div className="flex h-5 w-5 items-center justify-center bg-foreground">
                      <Check className="h-3 w-3 text-background" strokeWidth={2.5} aria-hidden />
                    </div>
                  )}
                  {current && <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />}
                  {locked && <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
                </div>

                {/* Lesson number + title */}
                <div className="min-w-0 flex-1">
                  <div className="text-label uppercase tracking-[0.2em] text-muted-foreground/60">
                    Lesson {i + 1}
                  </div>
                  <div className={`mt-0.5 text-sm leading-snug ${done || current ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {lessonTitle}
                  </div>
                </div>

                {/* Action label */}
                {done && (
                  <span className="shrink-0 text-label text-muted-foreground/60">Review</span>
                )}
                {current && (
                  <span className="shrink-0 text-label font-medium text-foreground">Continue</span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </Page>
  );
}

function trophyBgColor(topic) {
  const hash = topic.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const palette = [
    "bg-stone-800 text-stone-50",
    "bg-amber-900 text-amber-50",
    "bg-rose-900 text-rose-50",
    "bg-slate-800 text-slate-50",
    "bg-teal-900 text-teal-50",
    "bg-violet-900 text-violet-50",
    "bg-orange-900 text-orange-50",
    "bg-emerald-900 text-emerald-50",
  ];
  return palette[hash % palette.length];
}

function TrophyCard({ course, onClick }) {
  const total    = course.lessons?.length || 1;
  const bgClass  = trophyBgColor(course.topic);
  const initials = topicInitials(course.topic);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99] ${bgClass}`}
    >
      {/* Ghost initials — background texture */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end overflow-hidden p-2 select-none opacity-[0.11]" aria-hidden>
        <span className="font-serif text-[11rem] leading-none tracking-tighter">{initials}</span>
      </div>

      <div className="relative flex min-h-[240px] flex-col justify-between p-5 sm:p-6">
        {/* Completion mark */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/10">
          <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden />
        </div>

        {/* Topic + meta */}
        <div>
          <p className="font-serif text-2xl leading-tight tracking-[-0.02em]">{course.topic}</p>
          {course.bookAuthor && (
            <p className="mt-1 text-caption italic opacity-50">by {course.bookAuthor}</p>
          )}
          <p className="mt-2 text-label opacity-45">{total} lessons · {course.completedOn || "Completed"}</p>
        </div>
      </div>
    </button>
  );
}

function LibraryCard({ course, onClick }) {
  const isCompleted = course.type === "completed";
  const isPaused    = course.type === "abandoned";
  const total    = course.lessons?.length || 1;
  const progress = isCompleted ? total : (course.progress || 0);
  const pct      = isCompleted ? 100 : endowedPct(progress, total);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      <CourseCoverArea topic={course.topic} height={120} />
      <div className="h-[3px] w-full bg-muted" aria-hidden>
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted ? "bg-emerald-500" : isPaused ? "bg-amber-400" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="p-3.5">
        <p className="text-ui font-semibold leading-snug text-foreground">{course.topic}</p>
        {course.bookAuthor && (
          <p className="mt-0.5 text-label italic text-muted-foreground/60">by {course.bookAuthor}</p>
        )}
        <p className={`mt-1 text-caption ${isCompleted ? "text-emerald-600/80" : "text-muted-foreground"}`}>
          {isCompleted
            ? (course.completedOn || "Completed")
            : isPaused
              ? `Shelved · ${progress} / ${total} lessons`
              : `${progress} / ${total} lessons`}
        </p>
      </div>
    </button>
  );
}

const LIBRARY_ROW_CAP = 10;

function LibraryScreen({ courses, completedCourses, abandonedCourses, onOpenLesson, onOpenArchive, onOpenCoursePath, onOpenLessonList, onNewCourse, streak = 0 }) {
  const [tab, setTab]             = useState(completedCourses.length > 0 ? "completed" : "active");
  const [query, setQuery]         = useState("");
  const [showAll, setShowAll]     = useState(false);
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "paths" | "books"

  const activeRows    = courses.map((c) => ({ ...c, type: "active" }));
  const completedRows = completedCourses.map((c) => ({ ...c, type: "completed", progress: c.lessons.length }));
  const pausedRows    = abandonedCourses.map((c) => ({ ...c, type: "abandoned" }));

  const totalPaths   = activeRows.length + completedRows.length + pausedRows.length;
  const totalLessons = courses.reduce((s, c) => s + (c.progress || 0), 0)
                     + completedCourses.reduce((s, c) => s + c.lessons.length, 0);

  const tabs = [
    { key: "completed", label: "Mastered",    isTrophy: true,  allRows: completedRows },
    { key: "active",    label: "Exploring",   isTrophy: false, allRows: activeRows    },
    { key: "paused",    label: "Shelved",     isTrophy: false, allRows: pausedRows    },
  ];

  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0];

  // Type filter meta — only show when tab has both kinds
  const tabPathCount = activeTab.allRows.filter((c) => !c.bookAuthor).length;
  const tabBookCount = activeTab.allRows.filter((c) => !!c.bookAuthor).length;
  const showTypeFilter = tabPathCount > 0 && tabBookCount > 0;

  const q = query.trim().toLowerCase();
  const searchedRows = q
    ? activeTab.allRows.filter((c) =>
        c.topic?.toLowerCase().includes(q) ||
        c.bookAuthor?.toLowerCase().includes(q) ||
        c.aspect?.toLowerCase().includes(q)
      )
    : activeTab.allRows;

  const filteredRows = typeFilter === "paths"
    ? searchedRows.filter((c) => !c.bookAuthor)
    : typeFilter === "books"
      ? searchedRows.filter((c) => !!c.bookAuthor)
      : searchedRows;

  const isSearching = q.length > 0;
  const fullyShown  = showAll || isSearching || filteredRows.length <= LIBRARY_ROW_CAP;
  const displayRows = fullyShown ? filteredRows : filteredRows.slice(0, LIBRARY_ROW_CAP);
  const hiddenCount = filteredRows.length - LIBRARY_ROW_CAP;

  function switchTab(key) {
    setTab(key);
    setQuery("");
    setShowAll(false);
    setTypeFilter("all");
  }

  return (
    <Page className="library-page py-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-7 flex items-start justify-between gap-4">
          <h1 className="font-serif text-3xl text-foreground">Library</h1>
          <Button variant="outline" size="sm" className="mt-1 shrink-0" onClick={onNewCourse}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            New path
          </Button>
        </div>

        {/* Achievement stats strip */}
        {totalPaths > 0 && (
          <div className="mb-7 grid grid-cols-2 divide-x divide-border border-y border-border py-5">
            <div className="px-4 sm:px-6">
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{completedCourses.length}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">mastered</p>
            </div>
            <div className="px-4 sm:px-6">
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{totalLessons}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">lessons read</p>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="mb-5 flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                tab === t.key
                  ? "bg-foreground text-background"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {t.label}
              {t.allRows.length > 0 && (
                <span className={`text-xs tabular-nums ${tab === t.key ? "opacity-55" : "opacity-40"}`}>
                  {t.allRows.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter — paths vs books, only when tab has both */}
        {showTypeFilter && (
          <div className="mb-4 flex gap-1.5">
            {[
              { key: "all",   label: "All",   count: activeTab.allRows.length },
              { key: "paths", label: "Paths", count: tabPathCount },
              { key: "books", label: "Books", count: tabBookCount },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => { setTypeFilter(f.key); setShowAll(false); }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                  typeFilter === f.key
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                <span className={`tabular-nums ${typeFilter === f.key ? "opacity-55" : "opacity-40"}`}>{f.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Per-tab search — shows when tab has 4+ items */}
        {activeTab.allRows.length >= 4 && (
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
              placeholder={`Search ${activeTab.label.toLowerCase()}…`}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-9 text-sm placeholder:text-muted-foreground/50 focus:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-foreground/8 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Tab content */}
        {isSearching && filteredRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/55 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
            No paths match &ldquo;{query}&rdquo;.
          </p>
        ) : activeTab.allRows.length === 0 ? (
          <EmptyState
            icon={Library}
            title={
              tab === "completed" ? "No mastered paths yet" :
              tab === "active"    ? "Nothing to explore yet" :
                                   "Nothing shelved"
            }
            description={
              tab === "completed" ? "Finish a curiosity and it'll appear here as a trophy." :
              tab === "active"    ? "Follow a new curiosity to start exploring."            :
                                   "Shelved curiosities will appear here."
            }
          >
            {tab === "active" && (
              <Button onClick={onNewCourse}>
                <Sparkles className="h-4 w-4" aria-hidden />
                New path
              </Button>
            )}
          </EmptyState>
        ) : activeTab.isTrophy ? (
          /* ── Mastered tab: trophy wall ── */
          <>
            <div className="grid grid-cols-2 gap-4">
              {displayRows.map((course) => (
                <TrophyCard key={course.id} course={course} onClick={() => onOpenLessonList(course)} />
              ))}
            </div>
            {!fullyShown && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/50 py-2.5 text-xs text-muted-foreground/55 transition-colors hover:border-border/70 hover:text-muted-foreground"
              >
                <ChevronDown className="h-3 w-3" aria-hidden />
                Show {hiddenCount} more
              </button>
            )}
          </>
        ) : (
          /* ── In Progress / Paused tabs: compact list ── */
          <>
            <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/50 bg-card">
              {displayRows.map((course) => {
                const isPaused   = course.type === "abandoned";
                const isCompleted = course.type === "completed";
                const total      = course.lessons?.length || 1;
                const progress   = isCompleted ? total : (course.progress || 0);
                const pct        = isCompleted ? 100 : endowedPct(progress, total);
                const colorClass = topicCoverColor(course.topic);
                const initials   = topicInitials(course.topic);

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onOpenLessonList(course)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-label font-semibold ${colorClass}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ui font-medium text-foreground">{course.topic}</p>
                      {course.bookAuthor && (
                        <p className="text-label italic text-muted-foreground/55">by {course.bookAuthor}</p>
                      )}
                      <p className="text-label text-muted-foreground/65">
                        {isPaused ? `Shelved · ${progress} / ${total}` : `${progress} / ${total} lessons`}
                      </p>
                    </div>
                    <div className="hidden w-14 shrink-0 sm:block">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${isPaused ? "bg-amber-400/70" : "bg-primary/60"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-label tabular-nums text-muted-foreground/40">{pct}%</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/20 transition-all group-hover:text-muted-foreground/55" aria-hidden />
                  </button>
                );
              })}
            </div>
            {!fullyShown && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/50 py-2.5 text-xs text-muted-foreground/55 transition-colors hover:border-border/70 hover:text-muted-foreground"
              >
                <ChevronDown className="h-3 w-3" aria-hidden />
                Show {hiddenCount} more
              </button>
            )}
          </>
        )}
      </div>
    </Page>
  );
}


// ── Search toggle — icon that expands to a full bar ───────────────────────
function SearchToggle({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  function expand() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={expand}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/45 transition-colors hover:bg-muted hover:text-muted-foreground"
        aria-label="Search lessons"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
      </button>
    );
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-muted-foreground/35" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (!value) setOpen(false); }}
        placeholder="Search lessons…"
        className="h-7 w-48 bg-muted/40 pl-8 pr-7 text-caption text-foreground placeholder:text-muted-foreground/40 ring-1 ring-border/30 focus:outline-none focus:ring-foreground/20 rounded-lg"
        aria-label="Search lessons"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); setOpen(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ── Today feed (main home screen) ─────────────────────────────────────────

function TodayFeed({ courses, onOpenLesson, onNewCourse, onBrowse, signedIn, onAuthSignIn, onAuthSignUp, onListen, nowPlaying, cardSets = [], onStartReview, lessonDoneToday = false, reviewDoneToday = false, streak = 0 }) {
  if (!signedIn) {
    return (
      <Page className="items-center py-16">
        <div className="w-full max-w-md px-2">
          <EmptyState
            icon={BookOpen}
            title="Your reading home"
            description="Sign in to pick up where your curiosity left off."
          >
            <Button onClick={onAuthSignIn}>
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in
            </Button>
            <Button variant="outline" onClick={onAuthSignUp}>
              <UserPlus className="h-4 w-4" aria-hidden />
              Create account
            </Button>
          </EmptyState>
        </div>
      </Page>
    );
  }

  if (courses.length === 0) {
    return (
      <Page className="items-center py-10 sm:py-14">
        <div className="w-full max-w-[580px] px-4 sm:px-6">

          {/* Welcome */}
          <div className="mb-8 border-b border-border pb-8">
            <h1 className="font-serif text-3xl leading-snug text-foreground" style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1", fontWeight: 300 }}>
              Your daily founder fluency
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              One lesson a day on the concepts that matter when you&apos;re building and raising. Three minutes, every morning.
            </p>
          </div>

          {/* Two primary actions — paths first */}
          <div className="mb-8 space-y-2">

            {/* Browse founder paths */}
            <button
              type="button"
              onClick={onBrowse}
              className="group flex w-full items-center justify-between border border-border bg-card px-6 py-5 text-left transition hover:bg-muted/30"
            >
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Library className="h-4 w-4 shrink-0" aria-hidden />
                  Browse founder paths
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Venture capital, term sheets, SAFEs, cap tables, unit economics — curated for first-time founders.
                </p>
              </div>
              <ArrowRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:text-foreground" aria-hidden />
            </button>

            {/* Custom path */}
            <button
              type="button"
              onClick={onNewCourse}
              className="group flex w-full items-center justify-between border border-border bg-card px-6 py-5 text-left transition hover:bg-muted/30"
            >
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                  Create a custom path
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Type a specific topic — best for founder-finance angles not in the library yet.
                </p>
              </div>
              <ArrowRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:text-foreground" aria-hidden />
            </button>
          </div>

        </div>
      </Page>
    );
  }

  const [searchQuery, setSearchQuery] = useState("");

  const feed = buildDailyFeed(courses);

  // Filter feed items when there is an active search query
  const query = searchQuery.trim().toLowerCase();
  const filteredFeed = query
    ? feed.filter((item) =>
        item.title.toLowerCase().includes(query) ||
        (item.topic && item.topic.toLowerCase().includes(query))
      )
    : feed;

  const groups = groupDailyFeed(filteredFeed);
  const todayGroup = groups.filter((g) => g.daysAgo === 0);
  const pastGroups = groups.filter((g) => g.daysAgo > 0);

  // "Done today" — all of today's lessons are read (unfiltered)
  const rawTodayItems = groupDailyFeed(feed).filter((g) => g.daysAgo === 0).flatMap((g) => g.items);
  const todayAllRead = rawTodayItems.length > 0 && rawTodayItems.every((i) => i.isRead);

  // Due-card count for nudge strip
  const nowTs = Date.now();
  const totalDue = cardSets.reduce((sum, s) => sum + s.cards.filter((c) => (c.due ?? 0) <= nowTs).length, 0);
  const dailyComplete = lessonDoneToday && (totalDue === 0 || reviewDoneToday);
  const ritualStep = !lessonDoneToday ? 1 : totalDue > 0 && !reviewDoneToday ? 2 : null;

  return (
    <Page className="today-feed-page py-5 sm:py-7">
      <div className="mx-auto w-full max-w-2xl space-y-5">

        {/* ── Today's ritual ── */}
        {!query && (
          <div
            className="rounded-2xl border border-border/60 bg-card px-4 py-3.5"
            style={{ borderRadius: "var(--r-lg)" }}
          >
            <p className="text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              Today&apos;s ritual
            </p>
            <p className="mt-1.5 text-ui leading-relaxed text-foreground">
              {dailyComplete
                ? "Daily complete — lesson and review done."
                : ritualStep === 1
                  ? `Read today's lesson · ~3 min${totalDue > 0 ? ` · then ${totalDue} card${totalDue !== 1 ? "s" : ""} to review` : ""}`
                  : ritualStep === 2
                    ? `Remember · ${totalDue} card${totalDue !== 1 ? "s" : ""} due from earlier lessons`
                    : lessonDoneToday
                      ? "Lesson done — review unlocks when cards are due."
                      : "Read · remember · return tomorrow."}
            </p>
          </div>
        )}

        {/* ── Status row: streak (left) + search icon (right) ── */}
        {!query && (
          <div className="flex items-center justify-between">

            {/* Streak / done callout */}
            {streak > 0 && !dailyComplete && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                <span className="text-ui text-muted-foreground">
                  <span className="font-semibold text-foreground">{streak}-day streak</span>
                  {ritualStep === 1 ? " — finish today's lesson to keep it" : " — finish review to complete today"}
                </span>
              </div>
            )}
            {dailyComplete && (
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
                <span className="text-ui text-muted-foreground">Done for today — see you tomorrow</span>
              </div>
            )}
            {streak === 0 && !dailyComplete && <span />}

            {/* Search — icon only, expands on click */}
            <SearchToggle value={searchQuery} onChange={setSearchQuery} />
          </div>
        )}

        {/* Search active — full bar */}
        {query && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-muted-foreground/35" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your lessons…"
              className="h-9 w-full bg-muted/40 pl-9 pr-8 text-ui text-foreground placeholder:text-muted-foreground/45 ring-1 ring-border/30 focus:outline-none focus:ring-foreground/20"
              aria-label="Search lessons"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Today — Step 1: lessons */}
        {todayGroup.length > 0 && !query && (
          <div className="mb-1 flex items-center gap-2">
            <span className="eyebrow">Read</span>
            {!lessonDoneToday && totalDue > 0 && (
              <span className="text-label text-muted-foreground/50">Step 1 of 2</span>
            )}
          </div>
        )}
        {todayGroup.map((group) => (
          <section key={group.label} aria-labelledby={`feed-day-${group.daysAgo}`}>
            <div className="mb-3 flex items-center gap-2.5">
              <h2
                id={`feed-day-${group.daysAgo}`}
                className="eyebrow"
              >
                {group.label}
              </h2>
              <span
                className="text-label font-semibold tabular-nums text-muted-foreground/30"
                aria-hidden
              >
                {group.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <LessonFeedCard
                  key={item.id}
                  item={item}
                  onClick={() => onOpenLesson(item.courseId, item.lessonIndex)}
                  onListen={onListen}
                  nowPlaying={nowPlaying}
                />
              ))}
            </div>
          </section>
        ))}

        {/* ── Step 2: Review due cards (after today's lessons) ── */}
        {totalDue > 0 && onStartReview && !query && (
          <section aria-labelledby="today-review">
            <div className="mb-2 flex items-center gap-2">
              <h2 id="today-review" className="eyebrow">Remember</h2>
              {lessonDoneToday && <span className="text-label text-muted-foreground/50">Step 2 of 2</span>}
            </div>
            <button
              type="button"
              onClick={onStartReview}
              className="group flex w-full items-center justify-between gap-3 border border-border/60 bg-card px-4 py-3.5 text-left transition-colors hover:border-foreground/20 hover:bg-muted/20 active:scale-[0.995]"
              style={{ borderRadius: "var(--r-lg)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06]">
                  <Layers2 size={13} className="text-foreground/55" />
                </div>
                <div>
                  <p className="text-ui font-semibold leading-tight text-foreground">
                    Review {totalDue} card{totalDue !== 1 ? "s" : ""} from your lessons
                  </p>
                  <p className="text-label text-muted-foreground/55">
                    {lessonDoneToday ? "~2 min · spaced repetition" : "After today's lesson · ~2 min"}
                  </p>
                </div>
              </div>
              <ArrowRight size={13} className="shrink-0 text-muted-foreground/35 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/50" />
            </button>
          </section>
        )}

        {/* Past groups */}
        {pastGroups.map((group) => (
          <section key={group.label} aria-labelledby={`feed-day-${group.daysAgo}`}>
            <div className="mb-3 flex items-center gap-2.5">
              <h2
                id={`feed-day-${group.daysAgo}`}
                className="eyebrow"
              >
                {group.label}
              </h2>
              <span
                className="text-label font-semibold tabular-nums text-muted-foreground/30"
                aria-hidden
              >
                {group.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <LessonFeedCard
                  key={item.id}
                  item={item}
                  onClick={() => onOpenLesson(item.courseId, item.lessonIndex)}
                  onListen={onListen}
                  nowPlaying={nowPlaying}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Search no-results */}
        {query && todayGroup.length === 0 && pastGroups.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No lessons matching <span className="font-medium text-foreground">"{searchQuery}"</span>
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-muted-foreground/60 underline-offset-2 hover:text-foreground hover:underline transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}


// ── Browse data ───────────────────────────────────────────────────────────

// ── Browse marketplace components ──────────────────────────────────────── ────────────────────────────────────────

/** Colored cover art used in marketplace cards */
function CourseCoverArea({ topic, height, width }) {
  const [bg, fg] = topicSwatch(topic);
  const initial = (topic || "?")[0].toUpperCase();
  return (
    <div className={`relative overflow-hidden shrink-0 ${width ? "rounded-xl" : "w-full"}`} style={{ height, width: width ?? undefined, background: bg }}>
      {/* Large atmospheric letter */}
      <div
        className="absolute inset-0 flex items-end justify-end select-none pointer-events-none"
        style={{
          color: fg,
          opacity: 0.18,
          fontSize: height * 1.55,
          fontWeight: 800,
          lineHeight: 0.78,
          paddingRight: "6%",
        }}
        aria-hidden
      >
        {initial}
      </div>
      {/* Diagonal texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(138deg, transparent, transparent 5px, rgba(255,255,255,0.045) 5px, rgba(255,255,255,0.045) 6px)",
        }}
        aria-hidden
      />
    </div>
  );
}

/** Full-width hero card shown at the top of Browse */
function FeaturedCourseCard({ subject, onClick }) {
  const summary = getCourseSummary(subject);
  const lessons = getLessonsForSubject(subject.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-border/50 bg-card text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      <CourseCoverArea topic={subject.name} height={190} />
      <div className="px-5 pb-5 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Featured · {subject.tag}
            </p>
            <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
              {subject.name}
            </h3>
          </div>
          <span className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-label font-semibold text-muted-foreground">
            {lessons.length} lessons
          </span>
        </div>
        <p className="mt-2.5 text-ui leading-relaxed text-foreground/70 line-clamp-3">
          {summary}
        </p>
        <div className="mt-4 flex items-center gap-2 text-ui font-semibold text-foreground group-hover:gap-3 transition-all duration-150">
          See path
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </div>
      </div>
    </button>
  );
}

/** Portrait card for horizontal carousels */
function MarketplaceCard({ subject, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      <CourseCoverArea topic={subject.name} height={108} />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-label font-semibold uppercase tracking-[0.15em] text-muted-foreground/55">
          {subject.tag}
        </p>
        <p className="text-ui font-semibold leading-snug text-foreground">
          {subject.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground/80">
          {subject.description}
        </p>
      </div>
    </button>
  );
}

/** Search-result row — shown when the user types in the search bar */
function SearchResultCard({ subject, onClick }) {
  const lessons = getLessonsForSubject(subject.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-xl border border-border/50 bg-card p-3.5 text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      <CourseCoverArea topic={subject.name} height={54} width={54} />
      <div className="min-w-0 flex-1">
        <p className="text-label font-semibold uppercase tracking-[0.15em] text-muted-foreground/55">
          {subject.tag}
        </p>
        <p className="text-ui font-semibold leading-snug text-foreground">{subject.name}</p>
        <p className="mt-0.5 line-clamp-1 text-caption text-muted-foreground">{subject.description}</p>
      </div>
      <div className="shrink-0 text-label font-medium text-muted-foreground/50">
        {lessons.length} lessons
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60" aria-hidden />
    </button>
  );
}

/** Book search result row — same anatomy as SearchResultCard */
function BookSearchResultCard({ book, plan, onClick }) {
  const p = bookPalette(book.id);
  const cat = BOOK_CATEGORIES.find((c) => c.books.some((b) => b.id === book.id));
  const locked = book.tier === "paid" && plan !== "paid";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-xl border border-border/50 bg-card p-3.5 text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      {/* Mini book cover thumbnail */}
      <div className="relative flex h-[54px] w-[54px] shrink-0 overflow-hidden rounded-lg" aria-hidden>
        <div style={{ width: "5px", height: "100%", flexShrink: 0, background: p.spine }} />
        <div className="relative flex-1" style={{ background: p.bg }}>
          <span
            className="pointer-events-none absolute inset-0 flex select-none items-end justify-end"
            style={{ color: "rgba(255,255,255,0.09)", fontSize: "44px", fontWeight: 800, lineHeight: 0.82, paddingRight: "6%" }}
          >
            {book.title[0]}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-label font-semibold uppercase tracking-[0.15em] text-muted-foreground/55">
          {cat?.name ?? "Book"}{locked ? " · Academy" : ""}
        </p>
        <p className="text-ui font-semibold leading-snug text-foreground">{book.title}</p>
        <p className="mt-0.5 line-clamp-1 text-caption text-muted-foreground">{book.author}</p>
      </div>

      <div className="shrink-0 text-label font-medium text-muted-foreground/50">
        {book.lessons.length} ch.
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60" aria-hidden />
    </button>
  );
}

/** Horizontal carousel section */
function CourseCarousel({ label, subjects, onPreview }) {
  return (
    <section aria-labelledby={`carousel-${label}`}>
      <h2
        id={`carousel-${label}`}
        className="mb-3 text-lg font-bold tracking-tight text-foreground"
      >
        {label}
      </h2>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
        {subjects.map((subject) => (
          <MarketplaceCard
            key={subject.name}
            subject={subject}
            onClick={() => onPreview(subject)}
          />
        ))}
      </div>
    </section>
  );
}




// ── Course preview helpers ────────────────────────────────────────────────

function getLessonsForSubject(name) {
  const book = BOOK_PATHS.find((b) => b.title.toLowerCase() === name.toLowerCase());
  if (book) return book.lessons;
  const exact = Object.keys(magazineLessons).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (exact) return magazineLessons[exact];
  const sub = BROWSE_CATEGORIES.flatMap((c) => c.subjects).find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  return defaultLessons(name, sub?.tag || "").slice(0, 14);
}

const COURSE_SUMMARIES = {
  "Venture Capital": "Venture capital is not generic startup money. It is a financing model with specific return requirements, fund timelines, partner incentives, and power-law expectations. This path teaches technical first-time founders how VC investors think before, during, and after the first institutional raise.",
  "Term Sheets": "A term sheet is where the investor relationship becomes real. This path explains valuation, option pools, liquidation preferences, pro-rata rights, governance, and negotiation so first-time founders know what they are agreeing to before the legal documents arrive.",
  "Unit Economics": "Revenue does not prove a startup works. Unit economics show whether each customer can eventually produce durable value. This path covers CAC, LTV, gross margin, payback, retention, burn multiple, and the model investors expect founders to understand.",
  "SAFE Notes": "SAFEs feel simple until they convert. This path explains post-money math, caps, discounts, MFN clauses, pro-rata rights, stacked SAFEs, and priced-round conversion so founders can understand dilution before it becomes permanent.",
  "Cap Tables": "A cap table is not just a spreadsheet. It is the map of ownership, incentives, dilution, and outcomes across every financing scenario. This path teaches founders how to read and model the table before signing terms that reshape it.",
  "Fundraising": "Fundraising is a sales process with a specific buyer and high stakes. This path covers investor fit, outreach, first meetings, process management, diligence, term sheets, and close mechanics for founders raising without a top-tier accelerator network.",
  "Burn Rate": "Burn is the clock behind the company. This path explains gross burn, net burn, runway, default alive, hiring plans, burn multiple, and how spend changes leverage in the next raise.",
  "Founder Equity": "Founder equity is ownership, incentive, control, and future payout all at once. This path covers founder splits, vesting, option pools, dilution, secondary sales, preferences, and what ownership really means at exit.",
  "Investor Meetings": "Investor meetings are not casual updates. They are structured evaluations of market, founder insight, traction, ambition, and risk. This path teaches what investors are listening for and how to answer without pretending certainty.",
  "Data Rooms": "A data room is where narrative meets evidence. This path covers the documents, metrics, financials, customer proof, legal basics, and hygiene founders need before diligence turns interest into scrutiny.",
  "Closing a Round": "Closing is its own operating phase. This path explains timelines, lawyers, signatures, wires, allocation, communication, and the small mistakes that slow a round after investors have said yes.",
  "Liquidation Preferences": "Liquidation preferences decide who gets paid first in an exit. This path explains participating and non-participating structures, preference stacks, downside protection, and why founder ownership can diverge from founder payout.",
  "Pro-Rata Rights": "Pro-rata rights help investors maintain ownership in future rounds. This path explains why the clause matters, when it is standard, how it affects allocation, and why founders should understand the future round implications.",
  "Board Control": "Control terms shape who can approve major company decisions. This path explains board seats, protective provisions, information rights, founder consent, and how governance changes after institutional capital.",
  "Gross Margin": "Gross margin determines how much revenue is left to fund growth and operations. This path explains why margin quality changes valuation, fundraising ceiling, and the story a founder can credibly tell.",
  "CAC Payback": "CAC payback shows how quickly customer acquisition turns back into cash. This path teaches founders how investors read payback, why it changes by motion, and how it affects growth speed.",
  "Net Revenue Retention": "Net revenue retention shows whether existing customers expand or shrink. This path explains churn, expansion, contraction, cohorts, and why NRR can make a company more fundable.",
  "Option Pools": "Option pools are how startups hire with future ownership. This path explains pool sizing, pre-money pool shuffles, grant strategy, dilution, and the negotiation founders often miss.",
  "Dilution": "Dilution is the price of financing growth. This path explains how founder ownership changes across SAFEs, priced rounds, option pools, and future scenarios.",
  "Liquidation Waterfalls": "A liquidation waterfall shows who gets paid and in what order. This path explains why equity percentage is not enough to understand exit outcomes.",
  "Pitch Narrative": "A pitch narrative translates technical progress into a fundable company. This path helps founders connect market, product, traction, team, and urgency into a story investors can evaluate.",
  "Market Sizing": "Market size is not a slide decoration. This path explains TAM, SAM, SOM, bottoms-up modelling, wedge markets, and what investors are really testing when they ask how big it can get.",
  "Pricing Strategy": "Pricing turns value into margin and signal. This path explains packaging, willingness to pay, sales motion, gross margin, and how pricing connects to unit economics.",
  "Go-to-Market Metrics": "GTM metrics show whether demand can become repeatable growth. This path covers pipeline, conversion, sales cycle, activation, retention, and what early-stage investors can reasonably expect.",
  "Investor Updates": "Investor updates build trust before and after the raise. This path teaches concise reporting, asks, metrics, narrative discipline, and how to keep useful people engaged.",
  "Hiring Before Seed": "Hiring before seed is a runway decision as much as a team decision. This path explains role sequencing, payroll pressure, equity trade-offs, and when not to hire yet.",
  "Founder Agreements": "Founder agreements prevent future ambiguity. This path explains vesting, IP assignment, decision rights, departure scenarios, and the conversations cofounders should have early.",
  "Customer Discovery": "Customer discovery turns conversations into evidence. This path teaches founders how to ask better questions, recognise signal, and convert learning into fundraise-ready proof.",
  "Metrics Hygiene": "Metrics hygiene keeps your numbers credible under diligence. This path covers definitions, tracking, source of truth, cohort consistency, and explaining numbers without hand-waving.",
  "Advisor Equity": "Advisor equity should buy specific leverage, not vague access. This path covers grant sizes, vesting, expectations, and how to avoid messy promises."
};

function getCourseSummary(subject) {
  if (COURSE_SUMMARIES[subject.name]) return COURSE_SUMMARIES[subject.name];
  return `${subject.description} This path builds from definitions into founder decisions, investor incentives, and the trade-offs that matter when money, runway, and ownership are on the line.`;
}

// ── Course preview modal ──────────────────────────────────────────────────

function CoursePreviewModal({ subject, onClose, onStart, atPathLimit = false }) {
  const lessons = getLessonsForSubject(subject.name);
  const summary = getCourseSummary(subject);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-stretch justify-end sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Path preview: ${subject.name}`}
    >
      <div
        className="course-preview-backdrop absolute inset-0 bg-foreground/20 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="course-preview-panel relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] border border-border/60 bg-card shadow-2xl sm:max-h-[88vh] sm:max-w-[540px] sm:rounded-3xl">
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-border/60" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground sm:right-5 sm:top-5"
          aria-label="Close"
        >
          <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Cover header */}
          <CourseCoverArea topic={subject.name} height={140} />

          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pt-5">
            <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              {subject.tag} · {lessons.length} lessons
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
              {subject.name}
            </h2>
            <p className="mt-3 text-ui leading-relaxed text-foreground/75">{summary}</p>
          </div>

          <div className="border-t border-border/50">
            <div className="px-5 pb-1 pt-4 sm:px-6">
              <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                What you'll cover
              </p>
            </div>
            {lessons.map((lesson, i) => {
              const blurb = lessonBlurb(lesson, i, lessons.length, subject.name);
              return (
                <div key={i} className="flex items-start gap-3.5 border-t border-border/35 px-5 py-3.5 first:border-t-0 sm:px-6">
                  <span className="w-5 shrink-0 pt-[3px] text-right text-label tabular-nums text-muted-foreground/30 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-ui font-medium leading-snug text-foreground/85">{lesson}</p>
                    <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground/70">{blurb}</p>
                  </div>
                </div>
              );
            })}
            <div className="h-4" aria-hidden />
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 bg-muted/15 px-5 py-4 sm:px-6 sm:py-5">
          {atPathLimit ? (
            <>
              <div className="flex w-full items-center justify-center gap-2 rounded-full border border-border/60 bg-muted/60 py-3 text-sm font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                2 active paths — at your limit
              </div>
              <p className="mt-2 text-center text-label text-muted-foreground">
                Finish or shelve an active path in your Library to start a new one.
              </p>
            </>
          ) : (
            <>
              <Button type="button" onClick={onStart} size="lg" className="w-full">
                <ArrowRight className="h-4 w-4" aria-hidden />
                Start this path
              </Button>
              <p className="mt-2 text-center text-label text-muted-foreground">
                No setup needed · built for first-time founders · ~5 min per lesson
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Book preview modal ───────────────────────────────────────────────────

function BookPreviewModal({ book, plan, onClose, onStart, onUpgrade }) {
  const locked = book.tier === "paid" && plan !== "paid";
  const p = bookPalette(book.id);
  const cat = BOOK_CATEGORIES.find((c) => c.books.some((b) => b.id === book.id));

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-stretch justify-end sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Book preview: ${book.title}`}
    >
      <div
        className="course-preview-backdrop absolute inset-0 bg-foreground/20 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="course-preview-panel relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] border border-border/60 bg-card shadow-2xl sm:max-h-[88vh] sm:max-w-[540px] sm:rounded-3xl">
        {/* Drag handle — mobile only */}
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-border/60" />
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 shadow-sm transition hover:bg-black/50 hover:text-white sm:right-5 sm:top-5"
          aria-label="Close"
        >
          <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Book cover header */}
          <div
            className="relative flex h-44 w-full items-end overflow-hidden sm:h-52"
            style={{ background: p.bg }}
          >
            {/* Spine */}
            <div className="absolute inset-y-0 left-0 w-3" style={{ background: p.spine }} />
            {/* Atmospheric title letter */}
            <div
              className="pointer-events-none absolute inset-0 select-none flex items-end justify-end"
              style={{
                color: "rgba(255,255,255,0.07)",
                fontSize: "220px",
                fontWeight: 800,
                lineHeight: 0.78,
                paddingRight: "3%",
              }}
              aria-hidden
            >
              {book.title[0]}
            </div>
            {/* Content */}
            <div className="relative z-10 flex-1 px-7 pb-5 pl-9">
              {cat && (
                <p className="mb-2 text-label font-semibold uppercase tracking-[0.22em]" style={{ color: p.spine }}>
                  {cat.name}
                </p>
              )}
              <h2
                className="font-serif leading-tight text-white"
                style={{ fontSize: "22px", fontStyle: "italic", fontWeight: 400 }}
              >
                {book.title}
              </h2>
              <p className="mt-1.5 text-caption" style={{ color: "rgba(255,255,255,0.5)" }}>
                {book.author}
              </p>
            </div>
          </div>

          {/* Meta + hook */}
          <div className="px-5 pb-4 pt-5 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-label font-medium text-muted-foreground">
                {book.lessons.length} chapters
              </span>
              {book.tier === "free" ? (
                <span className="rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2.5 py-1 text-label font-medium text-emerald-700">
                  Free
                </span>
              ) : (
                <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-label font-medium text-muted-foreground">
                  Academy
                </span>
              )}
            </div>
            <p className="text-ui leading-relaxed text-foreground/80">{book.hook}</p>
          </div>

          {/* Chapter list */}
          <div className="border-t border-border/50">
            <div className="px-5 pb-1 pt-4 sm:px-6">
              <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                Chapters
              </p>
            </div>
            {book.lessons.map((chapter, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 border-t border-border/35 px-5 py-3.5 first:border-t-0 sm:px-6"
              >
                <span className="w-5 shrink-0 pt-[3px] text-right text-label tabular-nums text-muted-foreground/30 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="min-w-0 flex-1 text-ui font-medium leading-snug text-foreground/85">
                  {chapter}
                </p>
              </div>
            ))}
            <div className="h-4" aria-hidden />
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="shrink-0 border-t border-border/50 bg-muted/15 px-5 py-4 sm:px-6 sm:py-5">
          {locked ? (
            <>
              <Button type="button" onClick={onUpgrade} size="lg" className="w-full">
                Unlock with Academy
              </Button>
              <p className="mt-2 text-center text-label text-muted-foreground">
                Unlock all 100 books · chapter-by-chapter · earn a certificate
              </p>
            </>
          ) : (
            <>
              <Button type="button" onClick={onStart} size="lg" className="w-full">
                <BookOpen className="h-4 w-4" aria-hidden />
                Start reading
              </Button>
              <p className="mt-2 text-center text-label text-muted-foreground">
                ~5 min per chapter · earn a certificate on completion
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Browse (marketplace layout) ───────────────────────────────────────────

function SequenceCard({ sequence, plan, onUpgrade, onStartCourse }) {
  const locked = sequence.tier === "paid" && plan !== "paid";
  return (
    <div className="border border-border bg-card">
      <div style={{ height: "3px", background: "var(--c-vermilion)" }} />
      <div className="px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-label uppercase tracking-[0.26em] text-muted-foreground">
              {sequence.paths.length} paths · {sequence.duration}
            </div>
            <h3 className="mt-1 font-serif text-xl leading-snug text-foreground" style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1", fontWeight: 400 }}>
              {sequence.title}
            </h3>
          </div>
          {locked && <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{sequence.description}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {sequence.paths.map((path, i) => (
            <span key={path} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {i > 0 && <span className="text-muted-foreground/30">→</span>}
              <span className="border border-border px-2 py-0.5 text-foreground/70">{path}</span>
            </span>
          ))}
        </div>
        {locked ? (
          <button type="button" onClick={onUpgrade} className="text-xs font-medium text-foreground/60 transition hover:text-foreground">
            Unlock with Academy →
          </button>
        ) : (
          <button type="button" onClick={() => onStartCourse(sequence.paths[0])} className="border border-foreground bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-foreground/85">
            Start with {sequence.paths[0]} →
          </button>
        )}
      </div>
    </div>
  );
}

function bookPalette(id) {
  const palettes = [
    { bg: "#0F1E33", spine: "#C1121F" },
    { bg: "#0D1F0E", spine: "#4A7A4C" },
    { bg: "#111111", spine: "#888888" },
    { bg: "#271207", spine: "#C97C3A" },
    { bg: "#1A0A2E", spine: "#7B61FF" },
    { bg: "#0A1628", spine: "#3B82F6" },
    { bg: "#1C1109", spine: "#D97706" },
    { bg: "#0F1A0F", spine: "#22C55E" },
    { bg: "#1A0F0F", spine: "#EF4444" },
    { bg: "#0F1A1C", spine: "#06B6D4" },
    { bg: "#160D1C", spine: "#A855F7" },
    { bg: "#1A1510", spine: "#F59E0B" },
    { bg: "#101820", spine: "#6366F1" },
    { bg: "#12100E", spine: "#D1D5DB" },
    { bg: "#0D1C14", spine: "#10B981" },
    { bg: "#1C1018", spine: "#F43F5E" },
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

function BookCover({ book, plan, onPreview, onUpgrade }) {
  const locked = book.tier === "paid" && plan !== "paid";
  const p = bookPalette(book.id);

  return (
    <button
      type="button"
      onClick={() => locked ? onUpgrade() : onPreview(book)}
      onKeyDown={(e) => e.key === "Enter" && (locked ? onUpgrade() : onPreview(book))}
      aria-label={`${book.title} by ${book.author}${locked ? " — unlock with Academy" : " — preview"}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      {/* Book cover visual — 2:3 portrait */}
      <div className="relative flex w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
        <div className="h-full shrink-0" style={{ width: "7px", background: p.spine }} />
        <div className="relative flex flex-1 flex-col justify-between px-3 py-3" style={{ background: p.bg }}>
          <div className="flex items-start justify-between gap-1">
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: locked ? "rgba(255,255,255,0.3)" : p.spine }}>
              {locked ? "Academy" : "Free"}
            </span>
            {locked && <Lock className="mt-0.5 h-2 w-2 shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} aria-hidden />}
          </div>
          <div
            className="pointer-events-none absolute inset-0 select-none flex items-end justify-end"
            style={{ color: "rgba(255,255,255,0.06)", fontSize: "80px", fontWeight: 800, lineHeight: 0.8, paddingRight: "4%" }}
            aria-hidden
          >
            {book.title[0]}
          </div>
        </div>
      </div>

      {/* Title + author below the cover */}
      <div className="p-3">
        <p className="text-ui font-semibold leading-snug text-foreground line-clamp-2">{book.title}</p>
        <p className="mt-0.5 text-label text-muted-foreground/70 truncate">{book.author}</p>
        <p className="mt-1 text-label text-muted-foreground/50">{book.lessons.length} chapters</p>
      </div>
    </button>
  );
}

const BOOKS_PAGE_SIZE = 18;

function BooksTab({ plan, onStartBook, onUpgrade }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [previewBook, setPreviewBook] = useState(null);

  const activeCat      = activeFilter ? BOOK_CATEGORIES.find((c) => c.id === activeFilter) : null;
  const filteredBooks  = activeCat ? activeCat.books : BOOK_PATHS;
  const totalPages     = Math.ceil(filteredBooks.length / BOOKS_PAGE_SIZE);
  const pageBooks      = filteredBooks.slice(page * BOOKS_PAGE_SIZE, (page + 1) * BOOKS_PAGE_SIZE);

  const filterOptions = [
    { id: null, label: "All", count: BOOK_PATHS.length },
    ...BOOK_CATEGORIES.map((c) => ({ id: c.id, label: c.name, count: c.books.length })),
  ];

  function selectFilter(id) { setActiveFilter(id); setPage(0); }

  return (
    <div>
      {previewBook && (
        <BookPreviewModal
          book={previewBook}
          plan={plan}
          onClose={() => setPreviewBook(null)}
          onStart={() => { onStartBook(previewBook); setPreviewBook(null); }}
          onUpgrade={() => { onUpgrade(); setPreviewBook(null); }}
        />
      )}

      <BrowseFilterChips options={filterOptions} activeFilter={activeFilter} onSelect={selectFilter} />

      {!activeFilter ? (
        /* All — category carousel rows */
        <div className="space-y-9">
          {BOOK_CATEGORIES.map((cat) => (
            <section key={cat.id} aria-labelledby={`bc-${cat.id}`}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 id={`bc-${cat.id}`} className="text-[15px] font-bold tracking-tight text-foreground">{cat.name}</h2>
                  <span className="text-[15px] font-bold text-muted-foreground/30" aria-hidden>{cat.books.length}</span>
                </div>
                <button type="button" onClick={() => selectFilter(cat.id)}
                  className="shrink-0 text-caption font-medium text-muted-foreground/60 transition hover:text-foreground">
                  See all <ArrowRight className="inline h-3 w-3" aria-hidden />
                </button>
              </div>
              <p className="mb-3 text-caption leading-relaxed text-muted-foreground">{cat.description}</p>
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
                {cat.books.map((book) => (
                  <div key={book.id} style={{ width: "130px", flexShrink: 0 }}>
                    <BookCover book={book} plan={plan} onPreview={setPreviewBook} onUpgrade={onUpgrade} />
                  </div>
                ))}
              </div>
            </section>
          ))}
          {plan !== "paid" && (
            <div className="border-t border-border pt-6 text-center">
              <p className="text-caption text-muted-foreground">
                <button type="button" onClick={onUpgrade} className="font-medium text-foreground underline hover:opacity-70">
                  Unlock all books with Academy
                </button>{" "}— Venture Deals and The Mom Test are always free.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Category focus — grid + pagination */
        <div>
          {activeCat && <p className="mb-5 text-caption leading-relaxed text-muted-foreground">{activeCat.description}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pageBooks.map((book) => (
              <BookCover key={book.id} book={book} plan={plan} onPreview={setPreviewBook} onUpgrade={onUpgrade} />
            ))}
          </div>
          <BrowsePagination page={page} totalPages={totalPages} onPage={setPage} />
          {plan !== "paid" && (
            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-caption text-muted-foreground">
                <button type="button" onClick={onUpgrade} className="font-medium text-foreground underline hover:opacity-70">
                  Unlock all books with Academy
                </button>{" "}— Venture Deals and The Mom Test are always free.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared Browse components ─────────────────────────────────────────────

/** Filter chip row — shared by PathsTab and BooksTab */
/**
 * Two-chip filter bar that scales to any number of categories.
 *   [All N]   [Category name ×]  ← when a category is active
 *   [All N]   [Browse N categories ▾]  ← when showing all
 * Clicking the second chip opens a searchable popover listing every category.
 */
function BrowseFilterChips({ options, activeFilter, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const wrapRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const allOpt   = options[0]; // { id: null, label: "All", count: N }
  const catOpts  = options.slice(1);
  const activeOpt = activeFilter != null ? catOpts.find((o) => o.id === activeFilter) : null;

  const filtered = q.trim()
    ? catOpts.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()))
    : catOpts;

  function pick(id) { onSelect(id); setOpen(false); setQ(""); }

  return (
    <div className="mb-6 flex items-center gap-2">
      {/* All chip */}
      <button
        type="button"
        onClick={() => pick(null)}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-caption font-medium transition ${
          !activeFilter
            ? "border-foreground bg-foreground text-background"
            : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
        }`}
      >
        All
        <span className={`ml-1.5 tabular-nums ${!activeFilter ? "opacity-60" : "opacity-40"}`}>
          {allOpt.count}
        </span>
      </button>

      {/* Category picker chip + dropdown */}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); setQ(""); }}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-caption font-medium transition ${
            activeFilter != null
              ? "border-foreground bg-foreground text-background"
              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          {activeOpt ? activeOpt.label : `${catOpts.length} categories`}
          {activeFilter != null && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear category filter"
              className="ml-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); pick(null); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), pick(null))}
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""} ${activeFilter != null ? "opacity-60" : "opacity-50"}`} aria-hidden />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute left-0 top-full z-40 mt-1.5 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            {/* Search — shown when > 8 categories */}
            {catOpts.length > 8 && (
              <div className="border-b border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden />
                  <input
                    autoFocus
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search categories…"
                    className="flex-1 bg-transparent text-caption text-foreground placeholder:text-muted-foreground/40 outline-none"
                  />
                  {q && (
                    <button type="button" onClick={() => setQ("")} className="text-muted-foreground/50 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Category list */}
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-caption text-muted-foreground/60">No categories match.</p>
              ) : (
                filtered.map((opt) => {
                  const active = opt.id === activeFilter;
                  return (
                    <button
                      key={String(opt.id)}
                      type="button"
                      onClick={() => pick(opt.id)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-caption transition ${
                        active
                          ? "bg-foreground/6 font-semibold text-foreground"
                          : "text-foreground/80 hover:bg-muted/50"
                      }`}
                    >
                      <span className="min-w-0 truncate">{opt.label}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground/50">{opt.count}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Prev / numbered dots / Next — shared by PathsTab and BooksTab */
function BrowsePagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-caption font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30 depth-btn-light"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        Previous
      </button>
      <div className="flex items-center gap-1">
        {(() => {
          const WING = 1;
          const pages = [];
          for (let i = 0; i < totalPages; i++) {
            const isEdge = i === 0 || i === totalPages - 1;
            const isNear = Math.abs(i - page) <= WING;
            if (isEdge || isNear) pages.push({ type: "page", i });
            else if (pages[pages.length - 1]?.type !== "ellipsis") pages.push({ type: "ellipsis", i });
          }
          return pages.map((item) =>
            item.type === "ellipsis" ? (
              <span key={`e-${item.i}`} className="px-1 text-caption text-muted-foreground/40" aria-hidden>…</span>
            ) : (
              <button
                key={item.i}
                type="button"
                onClick={() => onPage(item.i)}
                className={`h-7 min-w-[28px] rounded-full px-2 text-caption font-medium transition ${
                  page === item.i ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Page ${item.i + 1}`}
                aria-current={page === item.i ? "page" : undefined}
              >
                {item.i + 1}
              </button>
            )
          );
        })()}
      </div>
      <button
        type="button"
        disabled={page === totalPages - 1}
        onClick={() => onPage(page + 1)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-caption font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30 depth-btn-light"
      >
        Next
        <ArrowRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}

/** Path card sized for grid use (category focus mode) */
function PathGridCard({ subject, onClick }) {
  const lessons = getLessonsForSubject(subject.name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-left transition-colors duration-150 hover:border-border/80 active:scale-[0.99]"
    >
      <CourseCoverArea topic={subject.name} height={96} />
      <div className="p-3">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">{subject.tag}</p>
        <p className="mt-0.5 text-ui font-semibold leading-snug text-foreground">{subject.name}</p>
        <p className="mt-1 text-label text-muted-foreground/70">{lessons.length} lessons</p>
      </div>
    </button>
  );
}

/** Paths tab — filter chips + category browse + paginated grid when filtered */
const PATHS_PAGE_SIZE = 12;

function PathsTab({ onPreview, plan, onUpgrade, onStartCourse, atPathLimit = false }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(0);

  const allSubjects = BROWSE_CATEGORIES.flatMap((c) => c.subjects);
  const activeCat   = activeFilter ? BROWSE_CATEGORIES.find((c) => c.name === activeFilter) : null;
  const filteredSubjects = activeCat ? activeCat.subjects : allSubjects;
  const totalPages = Math.ceil(filteredSubjects.length / PATHS_PAGE_SIZE);
  const pageSubjects = filteredSubjects.slice(page * PATHS_PAGE_SIZE, (page + 1) * PATHS_PAGE_SIZE);

  const filterOptions = [
    { id: null, label: "All", count: allSubjects.length },
    ...BROWSE_CATEGORIES.map((c) => ({ id: c.name, label: c.name, count: c.subjects.length })),
  ];

  function selectFilter(id) { setActiveFilter(id); setPage(0); }

  return (
    <div>
      {atPathLimit && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
          <div className="mt-px h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/70" style={{ marginTop: 6 }} />
          <p className="text-caption leading-relaxed text-muted-foreground">
            You have 2 active paths. Finish or shelve one in your Library to start another.
            Books are always available.
          </p>
        </div>
      )}
      <BrowseFilterChips options={filterOptions} activeFilter={activeFilter} onSelect={selectFilter} />

      {!activeFilter ? (
        /* All mode — start here + category carousel rows */
        <div className="space-y-9">
          <section aria-labelledby="path-start-here">
            <div className="mb-3">
              <h2 id="path-start-here" className="text-[15px] font-bold tracking-tight text-foreground">
                Start here
              </h2>
              <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
                For founders preparing to raise or navigating their first institutional round.
              </p>
            </div>
            <FeaturedCourseCard
              subject={FOUNDER_START_HERE[0]}
              onClick={() => onPreview(FOUNDER_START_HERE[0])}
            />
            <div className="mt-3 -mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
              {FOUNDER_START_HERE.slice(1).map((subject) => (
                <MarketplaceCard
                  key={subject.name}
                  subject={subject}
                  onClick={() => onPreview(subject)}
                />
              ))}
            </div>
          </section>

          {BROWSE_CATEGORIES.map((cat) => (
            <section key={cat.name} aria-labelledby={`path-cat-${cat.name}`}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 id={`path-cat-${cat.name}`} className="text-[15px] font-bold tracking-tight text-foreground">
                    {cat.name}
                  </h2>
                  <span className="text-[15px] font-bold text-muted-foreground/30" aria-hidden>{cat.subjects.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => selectFilter(cat.name)}
                  className="shrink-0 text-caption font-medium text-muted-foreground/60 transition hover:text-foreground"
                >
                  See all <ArrowRight className="inline h-3 w-3" aria-hidden />
                </button>
              </div>
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
                {cat.subjects.map((s) => (
                  <MarketplaceCard key={s.name} subject={s} onClick={() => onPreview(s)} />
                ))}
              </div>
            </section>
          ))}

        </div>
      ) : (
        /* Category focus mode — grid + pagination */
        <div>
          <p className="mb-5 text-caption leading-relaxed text-muted-foreground">
            {activeCat?.subjects?.length} paths in {activeCat?.name}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pageSubjects.map((s) => (
              <PathGridCard key={s.name} subject={s} onClick={() => onPreview(s)} />
            ))}
          </div>
          <BrowsePagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

function Browse({ onPreview, onStartCourse, onStartBook, plan, onUpgrade, courses = [] }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("paths");
  const [previewBook, setPreviewBook] = useState(null);
  const [searchFilter, setSearchFilter] = useState("all"); // "all" | "paths" | "books"
  const q = query.trim().toLowerCase();

  const allSubjects = BROWSE_CATEGORIES.flatMap((c) => c.subjects);
  const trendingAsSubjects = TRENDING_SUBJECTS.map((t) => ({
    name: t.name,
    description: t.teaser,
    tag: allSubjects.find((s) => s.name === t.name)?.tag ?? "Path",
  }));

  const searchResults = q
    ? [
        ...TRENDING_SUBJECTS.filter((s) => s.name.toLowerCase().includes(q) || s.teaser.toLowerCase().includes(q)).map((s) => ({
          name: s.name,
          description: s.teaser,
          tag: allSubjects.find((a) => a.name === s.name)?.tag ?? "Path",
        })),
        ...allSubjects.filter(
          (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q)
        ),
      ].filter((s, i, arr) => arr.findIndex((a) => a.name === s.name) === i)
    : [];

  const bookSearchResults = q
    ? BOOK_PATHS.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.hook.toLowerCase().includes(q)
      )
    : [];

  // Reset filter when query changes
  useEffect(() => { setSearchFilter("all"); }, [query]);

  const visiblePaths = searchFilter === "books" ? [] : searchResults;
  const visibleBooks = searchFilter === "paths" ? [] : bookSearchResults;
  const hasResults   = searchResults.length > 0 || bookSearchResults.length > 0;
  const bothHaveResults = searchResults.length > 0 && bookSearchResults.length > 0;

  const featured = trendingAsSubjects[0];

  return (
    <Page className="browse-page py-5 sm:py-7">
      {previewBook && (
        <BookPreviewModal
          book={previewBook}
          plan={plan}
          onClose={() => setPreviewBook(null)}
          onStart={() => { onStartBook(previewBook); setPreviewBook(null); }}
          onUpgrade={() => { onUpgrade(); setPreviewBook(null); }}
        />
      )}
      <div className="mx-auto w-full max-w-2xl">

        {/* Search */}
        <div className="relative mb-5">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground/40"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search founder paths — term sheets, SAFEs, cap tables..."
            className="h-11 w-full rounded-2xl bg-muted/45 pl-11 pr-4 text-ui text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border/35 outline-none transition focus:ring-border/70 focus:bg-muted/60"
            aria-label="Search founder learning paths"
          />
        </div>

        {/* Tab switcher — hidden when searching */}
        {!q && (
          <div className="mb-7 flex border-b border-line">
            {[
              { id: "paths", label: "Founder paths" },
              { id: "books", label: "Books" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative mr-5 pb-3 text-ui font-medium transition-colors"
                style={{ color: activeTab === tab.id ? "var(--c-ink)" : "var(--c-ink-3)" }}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                )}
              </button>
            ))}
          </div>
        )}

        {q ? (
          /* ── Search results ────────────────────────────────── */
          <div>
            {/* Filter chips — only shown when both types match */}
            {bothHaveResults && (
              <div className="mb-4 flex gap-2">
                {[
                  { id: "all",   label: "All",   count: searchResults.length + bookSearchResults.length },
                  { id: "paths", label: "Paths",  count: searchResults.length },
                  { id: "books", label: "Books",  count: bookSearchResults.length },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSearchFilter(f.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-caption font-medium transition ${
                      searchFilter === f.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    <span className={`ml-1.5 tabular-nums ${searchFilter === f.id ? "opacity-60" : "opacity-40"}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {visiblePaths.map((subject) => (
                <SearchResultCard key={subject.name} subject={subject} onClick={() => onPreview(subject)} />
              ))}
              {visibleBooks.map((book) => (
                <BookSearchResultCard key={book.id} book={book} plan={plan} onClick={() => setPreviewBook(book)} />
              ))}
            </div>

            {!hasResults && (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-foreground">No paths or books match "{query}"</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a broader term, or start a custom path below.</p>
                <Button type="button" className="mt-5" onClick={() => onStartCourse(query)}>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Start a path on "{query}"
                </Button>
              </div>
            )}
          </div>
        ) : activeTab === "paths" ? (
          /* ── Paths tab ─────────────────────────────────────── */
          <PathsTab onPreview={onPreview} plan={plan} onUpgrade={onUpgrade} onStartCourse={onStartCourse} atPathLimit={plan === "free" && courses.filter(c => !c.bookAuthor).length >= 2} />
        ) : (
          /* ── Books tab ─────────────────────────────────────── */
          <BooksTab plan={plan} onStartBook={onStartBook} onUpgrade={onUpgrade} />
        )}
      </div>
    </Page>
  );
}



function WeekPaceStrip({ activityByDay }) {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i)); // left = 6 days ago, right = today
    return (activityByDay[localDateKey(d)] || 0) > 0;
  });
  const done = days.filter(Boolean).length;
  return (
    <div className="space-y-1.5 pt-1.5">
      <div className="flex gap-1">
        {days.map((active, i) => (
          <div key={i} className={`h-2 flex-1 transition-colors ${active ? "bg-foreground/70" : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-label text-muted-foreground">{done} of 7 days</p>
    </div>
  );
}

function ReadingPatternChart({ activityByDay }) {
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  Object.entries(activityByDay ?? {}).forEach(([key]) => {
    const d = new Date(key + "T00:00:00");
    dowCounts[d.getDay()] += 1;
  });

  const FULL   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const SHORT  = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const max    = Math.max(1, ...dowCounts);
  const peak   = Math.max(...dowCounts);
  const hasData = dowCounts.some((v) => v > 0);
  const todayDow = new Date().getDay();
  const peakIdx  = dowCounts.lastIndexOf(peak);
  const activeDays = dowCounts.filter((v) => v > 0).length;

  if (!hasData) {
    return (
      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20">
        <p className="text-caption text-muted-foreground">Read a few lessons to see your weekly pattern.</p>
      </div>
    );
  }

  const BAR_H = 72;

  return (
    <div>
      {/* Bars */}
      <div className="flex items-end gap-1.5" style={{ height: `${BAR_H + 16}px` }}>
        {dowCounts.map((v, i) => {
          const isPeak    = v === peak && v > 0;
          const isToday   = i === todayDow;
          const isWeekend = i === 0 || i === 6;
          const barPx     = v === 0 ? 2 : Math.round(Math.max(10, (v / max) * BAR_H));

          return (
            <div
              key={i}
              className="relative flex flex-1 flex-col items-center justify-end"
              style={{ height: `${BAR_H + 16}px` }}
              title={`${FULL[i]}: ${v} session${v !== 1 ? "s" : ""}`}
            >
              {/* Count above peak only */}
              {isPeak && (
                <span className="absolute top-0 text-[9px] font-semibold tabular-nums text-foreground/60 select-none">
                  {v}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                  v === 0
                    ? "bg-border/40"
                    : isPeak
                      ? "bg-foreground"
                      : isWeekend
                        ? "bg-foreground/22"
                        : "bg-foreground/38"
                }`}
                style={{ height: `${barPx}px` }}
              />
            </div>
          );
        })}
      </div>

      {/* Baseline */}
      <div className="h-px bg-border/60" />

      {/* Day labels */}
      <div className="mt-2 flex gap-1.5">
        {SHORT.map((label, i) => {
          const isToday = i === todayDow;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className={`text-[9.5px] font-medium ${isToday ? "text-foreground/75" : "text-muted-foreground/45"}`}>
                {label}
              </span>
              {isToday && <div className="h-[2px] w-2.5 rounded-full bg-foreground/25" aria-hidden />}
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <p className="mt-3.5 text-caption leading-relaxed text-muted-foreground">
        Most active on{" "}
        <span className="font-medium text-foreground">{FULL[peakIdx]}s</span>
        {" · "}{peak} session{peak !== 1 ? "s" : ""}
        {activeDays >= 5
          ? " · consistent across the week"
          : activeDays >= 3
            ? " · building a rhythm"
            : " · early pattern forming"}
        .
      </p>
    </div>
  );
}

function DashboardRecallDial({ percent }) {
  const p = Math.min(100, Math.max(0, percent));
  const r = 30;
  const cx = 40;
  const cy = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - p / 100);
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" className="shrink-0 text-brand" aria-hidden>
      <circle className="text-muted/40" cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="6" />
      <circle
        className="text-brand transition-[stroke-dashoffset] duration-700 ease-out"
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={String(c)}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

/** Last seven "embers" for streak visualization. */
function DashboardStreakStrip({ streak }) {
  const slots = 7;
  const lit = Math.min(Math.max(streak, 0), slots);
  return (
    <div className="flex gap-1.5 pt-1" role="img" aria-label={`${streak} day streak`}>
      {Array.from({ length: slots }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i < lit ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm ring-1 ring-amber-400/30" : "bg-muted/90"
          }`}
        />
      ))}
    </div>
  );
}

/** Activity micro-bars from recent lesson days (fallback pattern if sparse). */
function DashboardLessonSpark({ activityByDay, seed }) {
  const entries = Object.entries(activityByDay ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const vals = entries.slice(-12).map(([, v]) => Number(v) || 0);
  const data =
    vals.length >= 4 ? vals : Array.from({ length: 12 }, (_, i) => ((Number(seed) || 0) + i * 2 + (i % 3)) % 8);
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-14 items-end gap-1 pt-1" aria-hidden>
      {data.map((v, i) => (
        <div
          key={i}
          className="min-h-[5px] flex-1 rounded-t-md bg-gradient-to-t from-brand/25 via-brand/55 to-brand/85 opacity-90 transition-[height] duration-300"
          style={{ height: `${Math.max(14, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function DashboardMetricCard({ label, value, valueUnit, hint, icon: Icon, trailing, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-5 py-5 transition-all duration-150 hover:border-border hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {label}
        </div>
        {trailing}
      </div>
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="font-serif text-3xl tabular-nums tracking-tight text-foreground">{value}</span>
        {valueUnit ? <span className="text-sm font-medium text-muted-foreground">{valueUnit}</span> : null}
      </div>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

function Dashboard({
  courses,
  completedCourses,
  activeCourseId,
  streak,
  lessonActivityByDay,
  onRead,
  onOpenOtherLesson,
  onNewCourse,
  onUpgrade,
  onProfile,
  onPreviousCourses,
  plan,
  user,
  signedIn,
  onSeedDemo,
  onPreviewComplete,
  onAuthSignIn,
  onAuthSignUp
}) {
  if (!signedIn) {
    return (
      <Page className="items-center py-16">
        <div className="w-full max-w-md px-2">
          <EmptyState
            icon={LayoutDashboard}
            title="Track your curiosity"
            description="Sign in to see where your curiosity has taken you — what you've explored, what you've mastered, what's next."
          >
            <Button onClick={onAuthSignIn}>
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in
            </Button>
            <Button variant="outline" onClick={onAuthSignUp}>
              <UserPlus className="h-4 w-4" aria-hidden />
              Create account
            </Button>
          </EmptyState>
        </div>
      </Page>
    );
  }

  if (courses.length === 0) {
    return (
      <Page className="py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">Welcome back, <span className="font-medium text-foreground">{user.name}</span>.</p>
          <EmptyState
            icon={Library}
            title="Start your first founder path"
            description="Browse curated paths on venture capital, term sheets, and unit economics — or create a custom path on a specific topic."
          >
            <Button onClick={onNewCourse}>
              <Sparkles className="h-4 w-4" aria-hidden />
              New path
            </Button>
          </EmptyState>
        </div>
      </Page>
    );
  }

  const active = courses.find((course) => course.id === activeCourseId) ?? courses[0];
  const progressPercent = endowedPct(active.progress, active.lessons.length);
  const otherActiveCourses = courses.filter((c) => c.id !== active.id);
  const archiveCourseCount = completedCourses.length;

  // Current lesson info for reading bar preview
  const currentLessonIdx = Math.min(active.progress, active.lessons.length - 1);
  const currentLessonTitle = active.lessons[currentLessonIdx];
  const currentLessonBlurb = lessonBlurb(currentLessonTitle, currentLessonIdx, active.lessons.length, active.topic);

  // Weekly pace
  const now = new Date();
  const lessonsThisWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return lessonActivityByDay[localDateKey(d)] || 0;
  }).reduce((sum, n) => sum + n, 0);

  // Days to finish current path
  const lessonsRemaining = active.lessons.length - active.progress;
  const dailyPace = lessonsThisWeek > 0 ? lessonsThisWeek / 7 : streak > 0 ? 1 : 0;
  const daysToFinish = dailyPace > 0 ? Math.ceil(lessonsRemaining / dailyPace) : null;

  return (
    <Page className="dashboard-page py-8">
      <div className="mx-auto w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-3xl text-foreground">
            {user?.name ? `${user.name.split(" ")[0]}'s progress` : "Your progress"}
          </h1>
          <Button variant="outline" size="sm" onClick={onPreviousCourses} className="shrink-0 gap-2">
            <Library className="h-3.5 w-3.5" aria-hidden />
            Archive
            {archiveCourseCount > 0 && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-label tabular-nums text-muted-foreground">
                {archiveCourseCount}
              </span>
            )}
          </Button>
        </div>

        {/* ── Reading hero ─────────────────────────────────────────────────── */}
        <div className="border border-border bg-card">
          {/* Progress accent bar */}
          <div className="h-[3px] w-full bg-muted" aria-hidden>
            <div
              className="h-full bg-foreground/75 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="px-6 py-7">
            <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Exploring · lesson {Math.min(active.progress + 1, active.lessons.length)} of {active.lessons.length}
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
              {active.topic}
            </h2>

            <p className="mt-3 text-sm font-medium text-foreground/80 leading-snug">
              {currentLessonTitle}
            </p>
            {currentLessonBlurb && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {currentLessonBlurb}
              </p>
            )}

            <button
              type="button"
              onClick={onRead}
              className="mt-6 w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 depth-btn-primary"
            >
              Continue exploring
            </button>
          </div>
        </div>

        {/* ── Momentum strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
          {/* Streak */}
          <div className="flex flex-col gap-4 px-5 py-5">
            <div>
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{streak}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">day streak</p>
            </div>
            <DashboardStreakStrip streak={streak} />
          </div>

          {/* This week */}
          <div className="flex flex-col gap-4 px-5 py-5">
            <div>
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{lessonsThisWeek}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">this week</p>
            </div>
            <WeekPaceStrip activityByDay={lessonActivityByDay} />
          </div>

          {/* Days to finish */}
          <div className="flex flex-col justify-between gap-4 px-5 py-5">
            <div>
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">
                {lessonsRemaining === 0 ? "Done" : daysToFinish ?? "—"}
              </p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">days to finish</p>
            </div>
            {lessonsRemaining > 0 && (
              <p className="text-label leading-relaxed text-muted-foreground/65">
                {daysToFinish
                  ? `${lessonsRemaining} lessons left at this pace`
                  : "Explore this week to see an estimate"}
              </p>
            )}
            {lessonsRemaining === 0 && (
              <p className="text-label text-muted-foreground/65">{active.topic} complete.</p>
            )}
          </div>
        </div>

        {/* Finish-line callout */}
        {lessonsRemaining > 0 && daysToFinish && daysToFinish <= 7 && (
          <p className="border-l-2 border-foreground/20 pl-3 py-0.5 text-xs text-muted-foreground">
            {daysToFinish === 1
              ? <>One more day of <span className="font-medium text-foreground">{active.topic}</span>. Finish it.</>
              : <>{daysToFinish} days to finish <span className="font-medium text-foreground">{active.topic}</span>. Keep the streak.</>
            }
          </p>
        )}

        {/* ── Activity ─────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          <LessonContributionGraph activityByDay={lessonActivityByDay} />

          <div>
            <p className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              When you explore
            </p>
            <ReadingPatternChart activityByDay={lessonActivityByDay} />
          </div>
        </div>

        {/* ── Also exploring ───────────────────────────────────────────────── */}
        {otherActiveCourses.length > 0 && (
          <div>
            <p className="mb-2 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
              Also exploring · {otherActiveCourses.length}
            </p>
            <div className="divide-y divide-border/40 border border-border/50">
              {otherActiveCourses.slice(0, 3).map((c) => {
                const pct = endowedPct(c.progress, c.lessons.length);
                const lessonIdx = Math.min(c.progress, c.lessons.length - 1);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onOpenOtherLesson?.(c.id, lessonIdx)}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/20"
                  >
                    <div className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground/30 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                      {c.topic}
                    </span>
                    <span className="shrink-0 text-label tabular-nums text-muted-foreground/50">{pct}%</span>
                  </button>
                );
              })}
              {otherActiveCourses.length > 3 && (
                <button
                  type="button"
                  onClick={onPreviousCourses}
                  className="flex w-full items-center gap-1.5 px-4 py-2.5 text-left text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  +{otherActiveCourses.length - 3} more paths
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </Page>
  );
}

/** Deterministic warm cover color from topic string */
function topicCoverColor(topic) {
  const hash = topic.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const palette = [
    "bg-stone-200 text-stone-700",
    "bg-amber-100 text-amber-800",
    "bg-orange-100 text-orange-700",
    "bg-rose-100 text-rose-800",
    "bg-sky-100 text-sky-800",
    "bg-teal-100 text-teal-800",
    "bg-violet-100 text-violet-800",
    "bg-lime-100 text-lime-800",
  ];
  return palette[hash % palette.length];
}

/** Two-letter initials from a topic name */
function topicInitials(topic) {
  const words = topic.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return topic.slice(0, 2).toUpperCase();
}

function PreviousCoursesPage({ activeCourses, completedCourses, abandonedCourses, activeCourseId, onBack, onOpenCompleted, onOpenActive, onOpenAbandoned }) {
  const [filter, setFilter] = useState("active");
  const [query, setQuery]   = useState("");

  const categories = [
    { key: "active",    label: "Exploring", count: activeCourses.length },
    { key: "completed", label: "Mastered",  count: completedCourses.length },
    { key: "abandoned", label: "Shelved",   count: abandonedCourses.length },
  ];

  const totalCount = activeCourses.length + completedCourses.length + abandonedCourses.length;

  const allRows =
    filter === "active"
      ? activeCourses.map((c) => ({ ...c, _type: "active" }))
      : filter === "completed"
        ? completedCourses.map((c) => ({ ...c, _type: "completed", progress: c.lessons.length }))
        : abandonedCourses.map((c) => ({ ...c, _type: "abandoned" }));

  const q = query.trim().toLowerCase();
  const rows = q ? allRows.filter((c) => c.topic?.toLowerCase().includes(q)) : allRows;

  function handleRowClick(course) {
    if (course._type === "completed") onOpenCompleted(course);
    else if (course._type === "abandoned") onOpenAbandoned(course);
    else onOpenActive(course);
  }

  const emptyMessages = {
    active:    { title: "Nothing to explore yet",  description: "Follow a new curiosity to see it here." },
    completed: { title: "Nothing mastered yet",    description: "Finish a curiosity path to archive it here." },
    abandoned: { title: "Nothing shelved",          description: "Paths you shelve will appear here." },
  };

  return (
    <Page className="py-8 sm:py-10">
      <div className="mx-auto w-full max-w-xl">

        <Button variant="ghost" size="sm" className="mb-6 gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Dashboard
        </Button>

        {/* Header */}
        <div className="mb-5 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">Library</h1>
          {totalCount > 0 && (
            <span className="font-serif text-2xl text-muted-foreground/50 tabular-nums">{totalCount}</span>
          )}
        </div>

        {/* Search */}
        {totalCount >= 4 && (
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search paths…"
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-9 text-sm placeholder:text-muted-foreground/50 focus:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-foreground/8 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Category filter */}
        <div className="mb-5 flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setFilter(cat.key); setQuery(""); }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                filter === cat.key
                  ? "bg-foreground text-background"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {cat.label}
              {cat.count > 0 && (
                <span className={`text-xs tabular-nums ${filter === cat.key ? "opacity-55" : "opacity-45"}`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {q && rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/55 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            No paths match &ldquo;{query}&rdquo;.
          </p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Library}
            title={emptyMessages[filter].title}
            description={emptyMessages[filter].description}
          >
            {filter === "active" && (
              <Button onClick={onBack}>
                <Sparkles className="h-4 w-4" aria-hidden />
                New path
              </Button>
            )}
          </EmptyState>
        ) : (
          <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card">
            {rows.map((course) => {
              const percent = course._type === "completed"
                ? 100
                : endowedPct(course.progress ?? 0, course.lessons?.length ?? 1);
              const colorClass = topicCoverColor(course.topic);
              const initials = topicInitials(course.topic);

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleRowClick(course)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  {/* Cover mark — compact */}
                  <div className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg text-label font-semibold ${colorClass}`}>
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug text-foreground">{course.topic}</p>
                    <p className="mt-0.5 text-label text-muted-foreground">
                      {course._type === "completed"
                        ? course.completedOn
                        : course._type === "abandoned"
                          ? course.abandonedOn
                          : `${course.progress} / ${course.lessons.length} lessons`}
                    </p>
                    {(course._type === "active" || course._type === "abandoned") && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground/40 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-label tabular-nums text-muted-foreground/60">{percent}%</span>
                      </div>
                      )}
                    </div>

                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/25 transition-all group-hover:text-muted-foreground" aria-hidden />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}

function ArchivedCourseReader({ course, selectedLessonIndex, setSelectedLessonIndex, onBack, onRetakeQuiz, userName = "" }) {
  const selectedTitle = course.lessons[selectedLessonIndex] || course.lessons[0];
  // Deterministic stats based on topic string — plausible, consistent, varied
  const _topicHash = (course.topic || "").split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const _absHash = Math.abs(_topicHash);
  const _origScore = 74 + (_absHash % 18);           // 74–91 %
  const _retakes   = 1 + (_absHash % 4);              // 1–4
  const _bestRecall = Math.min(99, _origScore + 3 + (_absHash % 8)); // orig+3 to orig+10
  const archiveStats = [
    { label: "Original score", value: `${_origScore}%` },
    { label: "Retakes",        value: `${_retakes}` },
    { label: "Best recall",    value: `${_bestRecall}%` },
  ];

  return (
    <Page className="items-center py-10">
      <article className="grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-12 sm:py-12">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>Archive</span><span>·</span><span>Lesson {selectedLessonIndex + 1}</span><span>·</span><span>{course.topic}</span>
          </div>
          <h1 className="font-serif text-6xl leading-[0.98] tracking-[-0.045em]">{selectedTitle}</h1>
          <div className="my-10 h-px bg-muted" />
          <div className="space-y-8 font-sans text-[1.42rem] leading-10 text-foreground">
            <p><span className="float-left mr-3 mt-1 font-serif text-7xl leading-[0.78] text-foreground">R</span>eading a completed founder lesson is different from reading it the first time. The point is no longer novelty. The point is recognition: noticing which terms, incentives, and trade-offs still feel usable when a real decision appears.</p>
            <p>This archived lesson remains available so you can revisit the argument, retrieve the core idea, and reconnect it to newer founder paths. Your private library becomes the network of concepts you can call on before meetings, negotiations, and board-level decisions.</p>
            <LessonImage topic={course.topic} />
            <EquationBlock topic={course.topic} />
            <ShareableFact topic={course.topic} title={selectedTitle} />
            <div className="border-l-2 border-brand bg-muted/30 px-6 py-5 font-sans text-base leading-7 text-foreground/80">
              <div className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Review prompt</div>
              Before retaking the quiz, name the founder decision this lesson is meant to make less reactive.
            </div>
            <p>Retention is not storage. It is return. Every retake rebuilds the path back to a concept before you need it in a live conversation. If the first reading gives you contact with a term, the later reading tests whether the term can still guide a decision without help.</p>
            <IdeaDiagram topic={course.topic} />
            <p>When a path is complete, the archive should not feel like a closed folder. It should feel like a set of instruments. You come back when a new investor question appears, when another path echoes the same incentive, or when a quiz reveals that the vocabulary stayed but the trade-off faded.</p>
          </div>
          <button onClick={onRetakeQuiz} className="mt-12 inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-4 font-medium text-white hover:bg-primary/90 depth-btn-primary">Retake quiz <Icon name="arrow" size={16} /></button>
        </div>

        <aside className="space-y-8 text-sm text-muted-foreground">
          <Panel>
            <SectionLabel icon="chart" label="Archive stats" />
            <h3 className="mt-4 font-serif text-3xl text-foreground">Recall record</h3>
            <div className="mt-6 grid gap-3">
              {archiveStats.map((stat) => (
                <div key={stat.label} className="border-t border-border py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                  <div className="mt-2 font-serif text-3xl text-brand">{stat.value}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <SectionLabel icon="lens" label="Retake reason" />
            <p className="mt-4 leading-6">Retaking a quiz after time has passed is stronger than rereading alone. It exposes which founder concepts survived and which ones need rebuilding before a live decision.</p>
          </Panel>
          <Panel>
            <SectionLabel icon="award" label="Credentials" />
            <p className="mt-3 text-xs leading-5">Download your proof of completion for this path.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => generateAndDownload("certificate", { userName, topic: course.topic, lessonCount: course.lessons.length })}
                className="w-full border border-border px-3 py-2 text-left text-xs font-medium text-foreground/65 transition hover:border-foreground/25 hover:text-foreground"
              >
                Download certificate
              </button>
              <button
                type="button"
                onClick={() => generateAndDownload("badge", { userName, topic: course.topic, lessonCount: course.lessons.length })}
                className="w-full border border-border px-3 py-2 text-left text-xs font-medium text-foreground/65 transition hover:border-foreground/25 hover:text-foreground"
              >
                Download badge
              </button>
            </div>
          </Panel>
        </aside>
      </article>
    </Page>
  );
}

function ArchiveQuiz({ course, lessonIndex, answers, setAnswers, onBack, onComplete }) {
  const title = course.lessons[lessonIndex];
  const questions = [
    { q: "What was the lesson mostly trying to clarify?", options: ["A central tension", "A list of dates", "A memorised definition"] },
    { q: "What is the strongest way to remember this lesson?", options: ["Retrieve the idea", "Skim the title", "Wait longer"] },
    { q: "What should a completed founder path become?", options: ["A living archive", "A closed folder", "A badge only"] }
  ];
  const complete = questions.every((_, index) => answers[index]);

  return (
    <Page className="items-center py-10">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to archived lesson
        </Button>

        <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">Retake</p>
        <h1 className="mt-2 font-serif text-3xl font-normal leading-snug text-foreground sm:text-4xl">{title}</h1>

        <div className="mt-10 space-y-8">
          {questions.map((question, index) => (
            <div key={question.q} className="space-y-3">
              <p className="text-sm font-medium text-foreground leading-relaxed">{index + 1}. {question.q}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((previous) => ({ ...previous, [index]: option }))}
                    className={
                      answers[index] === option
                        ? "rounded-xl border-2 border-foreground bg-foreground px-4 py-3 text-left text-sm font-medium text-background transition-all duration-150"
                        : "rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left text-sm text-foreground/70 transition-all duration-150 hover:border-border hover:bg-card hover:text-foreground hover:-translate-y-0.5"
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end border-t border-border pt-8">
          <Button onClick={onComplete} disabled={!complete} size="lg">
            Save retake
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </Page>
  );
}

function BadgeMark({ badge, earned = false }) {
  const toneStyles = {
    amber: {
      outer: earned ? "border-amber-500/35 bg-amber-500/5" : "border-amber-500/20 bg-amber-500/[0.04]",
      inner: "bg-amber-500 text-white",
      text: "text-amber-800 dark:text-amber-300"
    },
    blue: {
      outer: earned ? "border-brand/35 bg-brand-muted" : "border-brand/20 bg-brand-muted/70",
      inner: "bg-primary text-primary-foreground",
      text: "text-brand"
    },
    violet: {
      outer: earned ? "border-violet-500/35 bg-violet-500/5" : "border-violet-500/20 bg-violet-500/[0.04]",
      inner: "bg-violet-600 text-white",
      text: "text-violet-800 dark:text-violet-300"
    }
  };
  const tone = toneStyles[badge.tone] || toneStyles.blue;
  const percent = earned ? 100 : badge.percent || 0;

  return (
    <div className={`group grid grid-cols-[72px_1fr] gap-4 border-t border-border pt-5 ${earned ? "" : "opacity-70"}`}>
      <div className={`relative grid h-16 w-16 place-items-center rounded-full border ${tone.outer}`}>
        <div className="absolute inset-1 rounded-full border border-card/80" />
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{ background: `conic-gradient(currentColor ${percent}%, transparent ${percent}% 100%)` }}
        />
        <div className={`relative grid h-10 w-10 place-items-center rounded-full ${tone.inner}`}>
          <Icon name={badge.icon} size={18} />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-foreground">{badge.title}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{earned ? badge.detail : badge.requirement}</div>
          </div>
          <span className={`shrink-0 text-label uppercase tracking-[0.18em] ${earned ? tone.text : "text-muted-foreground"}`}>
            {earned ? badge.level : badge.progress}
          </span>
        </div>
        {!earned && (
          <div className="mt-3 h-px bg-muted">
            <div className={`h-px ${badge.tone === "amber" ? "bg-amber-500" : badge.tone === "violet" ? "bg-violet-600" : "bg-primary"}`} style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function QuietStat({ icon, label, value }) {
  return (
    <div className="border-b border-border bg-transparent px-2 py-5 sm:border-r sm:last:border-r-0 xl:border-b-0">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        <Icon name={icon} size={14} className="text-brand" />
        <span>{label}</span>
      </div>
      <div className="mt-2 font-serif text-3xl tracking-[-0.035em] text-foreground">{value}</div>
    </div>
  );
}

function RetentionStat({ label, value, note, icon }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon name={icon} size={17} className="text-brand" />
      </div>
      <div className="mt-4 font-serif text-4xl tracking-[-0.04em] text-foreground">{value}</div>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{note}</div>
    </Panel>
  );
}

function MicroStat({ label, value }) {
  return (
    <div className="border-b border-border px-1 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl tracking-[-0.03em] text-brand">{value}</div>
    </div>
  );
}

function MentalModelStep({ number, title, text }) {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-4 border border-border bg-card p-4">
      <div className="font-serif text-xl text-brand">{number}</div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="mt-1 text-sm leading-6 text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}

function getLessonTakeaways(topic) {
  return [
    `Every founder concept has a definition on the surface and an incentive, cost, or control trade-off underneath.`,
    `${topic} becomes useful when it changes what you notice before you sign, spend, hire, or pitch.`,
    `Ask not only "what does this mean?" but "what decision does this change, and who benefits if I misunderstand it?"`,
  ];
}

function getLessonCards(topic) {
  return [
    { front: "Definition", back: "The literal meaning of the term — useful, but not enough to make a good founder decision." },
    { front: "Incentive", back: `The investor, employee, customer, or founder motivation that makes ${topic} matter in practice.` },
    { front: "Trade-off", back: "The thing you gain and the thing you give up when this concept shows up in a real company decision." },
    { front: "Cost of confusion", back: "The equity, runway, leverage, or control you can lose when you understand the word but miss the economics." },
    { front: "Network gap", back: "What top accelerator founders often learn through their network, and what Curi makes explicit." },
    { front: "The better question", back: `Not "what is ${topic}?" but "what decision does ${topic} change, and who benefits if I get it wrong?"` },
  ];
}

function getSocraticPrompt(topic, index) {
  const prompts = [
    `Where could misunderstanding ${topic} cost you equity, runway, or leverage?`,
    `What would you ask an investor or lawyer after today's lesson on ${topic}?`,
    `Which part of ${topic} would you need to explain clearly in a partner meeting?`,
    `What decision in your company would change if you understood ${topic} better?`,
    `What assumption about ${topic} do first-time technical founders usually make too quickly?`,
  ];
  return prompts[index % prompts.length];
}

function getSuggestedPaths(topic) {
  const map = {
    "Venture Capital": [
      {
        topic: "Term Sheets",
        tag: "Next step",
        desc: "You know how VCs think. Now learn the document where their thinking becomes binding. Every clause in your term sheet reflects the fund dynamics you just learned.",
        outcomes: [
          "Recognise every clause in a term sheet and know which ones to push back on",
          "Understand why investors insist on specific terms — and what it signals when they do",
          "Walk into your first term sheet negotiation prepared, not reactive",
        ],
        lessons: [
          "What a Term Sheet Actually Is — and What It Isn't",
          "Pre-Money vs Post-Money: The Single Most Important Number",
          "Option Pool Shuffles and Why They Matter More Than Valuation",
          "Liquidation Preferences: Who Gets Paid First, and How Much",
          "Participation Rights: When 1× Non-Participating Becomes Non-Negotiable",
          "Anti-Dilution Provisions: Ratchets, Weighted Average, and When They Bite",
          "Pro-Rata Rights: The Clause Every Founder Undervalues",
          "Drag-Along and Co-Sale: Understanding Exit Governance",
          "Information Rights, Board Composition, and Approval Rights",
          "Negotiating a Term Sheet: What Moves, What Doesn't, and Why",
        ],
      },
      {
        topic: "Cap Tables",
        tag: "Technical",
        desc: "Every round you've now learned about changes your cap table. This path teaches you to model those changes so you see your future before you sign it.",
        outcomes: [
          "Build and read a cap table at every stage from incorporation to Series A",
          "Model dilution across multiple rounds and understand what you're trading",
          "Spot the cap table structures that disadvantage founders before it's too late",
        ],
        lessons: [
          "What a Cap Table Is and Why It Matters From Day One",
          "Founders, Employees, and Investors: The Three Tables Within the Table",
          "Option Pool Mechanics: Grants, Vesting, and the Cliff",
          "How SAFEs and Convertible Notes Appear on the Table",
          "The Priced Round: How Your Cap Table Changes at the First Institutional Close",
          "Dilution Modelling: Calculating Your Ownership at Every Scenario",
          "Liquidation Waterfalls: Who Gets What in an Exit",
          "Secondary Sales, Transfers, and What Happens to the Table",
          "Red Flags: Cap Table Structures That Signal Founder Disadvantage",
          "Cap Table Hygiene: What to Fix Before Your Series A",
        ],
      },
      {
        topic: "Fundraising",
        tag: "Practice",
        desc: "Theory becomes practice. This path covers the actual process — finding investors, managing a pipeline, and closing — with the VC mechanics you now understand as the map.",
        outcomes: [
          "Run a disciplined fundraising process with a pipeline, not just a list of names",
          "Understand what happens after a yes — diligence, documents, close",
          "Know the signals that tell you when to push, when to wait, and when to walk",
        ],
        lessons: [
          "What Fundraising Is — and What It Isn't",
          "Who to Raise From: Angels, Micro-VCs, and Institutional Seed Funds",
          "Building Your Target List: Thesis Fit Over Warm Intros",
          "The Outreach: What Gets a Response and What Gets Deleted",
          "The First Meeting: What Investors Are Measuring in 30 Minutes",
          "Managing a Process: Running Conversations in Parallel Without Burning Bridges",
          "The Follow-Up: What to Send, When to Send It, and What It Signals",
          "The Term Sheet Arrives: What to Do in the First 48 Hours",
          "Diligence: What Investors Check and How to Prepare",
          "The Close: Mechanics, Timing, and What Founders Get Wrong",
        ],
      },
    ],
    "Term Sheets": [
      {
        topic: "Venture Capital",
        tag: "Context",
        desc: "You know what the clauses mean. Now understand why they exist — the fund economics and investor incentives that produce every term you'll encounter.",
        outcomes: [
          "Connect each term sheet clause to the fund dynamics that created it",
          "Understand the investor's perspective well enough to negotiate from it",
          "Know which terms are structural and which are negotiating positions",
        ],
        lessons: [
          "Why Venture Capital Exists — and When It Makes Sense to Take It",
          "How a VC Fund Actually Works: LP Money, Carry, and Time Pressure",
          "What Investors Are Really Looking For in a Pre-Seed Pitch",
          "The Power Law: Why VCs Need a Unicorn, Not Just a Good Business",
          "How Valuation Works Before You Have Revenue",
          "The Seed Round: Instruments, Terms, and What You're Really Agreeing To",
          "Anti-Dilution, Pro-Rata, and the Clauses That Matter Over Time",
          "Board Seats, Information Rights, and Control You Didn't Know You Were Giving Away",
          "Choosing Investors: The Relationship You'll Have for a Decade",
          "Your Cap Table at Series A: Modelling the Future You're Building Toward",
        ],
      },
      {
        topic: "SAFE Notes",
        tag: "Related",
        desc: "Before the priced round comes the SAFE. These instruments set the terms of conversion — and the economics you'll live with at every future round.",
        outcomes: [
          "Understand how SAFEs convert into the priced round terms you just learned",
          "Model how stacked SAFEs affect your cap table at conversion",
          "Negotiate SAFE terms that protect your future flexibility",
        ],
        lessons: [
          "What a SAFE Is and Why It Replaced Convertible Notes",
          "Post-Money SAFEs: The Change That Changed Everything",
          "Valuation Caps: How They Work and What Is Reasonable",
          "Discount Rates: The Other Way SAFEs Convert",
          "How Multiple SAFEs Stack and Why It Gets Complicated",
          "Converting Your SAFEs: What Happens at the Priced Round",
          "The SAFE Cap Table: Modelling Your Dilution Before You Close",
          "Negotiating SAFE Terms: What Founders Get Wrong Most Often",
        ],
      },
      {
        topic: "Cap Tables",
        tag: "Technical",
        desc: "Every term in your term sheet reshapes your cap table. Build the skill to model exactly what you're agreeing to before you sign.",
        outcomes: [
          "Model the precise cap table impact of every term sheet clause",
          "Understand option pool shuffles, anti-dilution, and participation in numbers",
          "Enter every negotiation knowing the exact dilutive effect of each ask",
        ],
        lessons: [
          "What a Cap Table Is and Why It Matters From Day One",
          "Option Pool Mechanics: Grants, Vesting, and the Cliff",
          "The Priced Round: How Your Cap Table Changes at the First Institutional Close",
          "Dilution Modelling: Calculating Your Ownership at Every Scenario",
          "Liquidation Waterfalls: Who Gets What in an Exit",
          "Anti-Dilution and How It Changes the Table in a Down Round",
          "Pro-Rata Rights and Future Round Modelling",
          "Cap Table Hygiene: What to Fix Before Your Series A",
        ],
      },
    ],
    "Unit Economics": [
      {
        topic: "Fundraising",
        tag: "Application",
        desc: "Unit economics are the language of fundraising. This path shows you how to translate your numbers into the narrative investors need to say yes.",
        outcomes: [
          "Present unit economics in the context investors evaluate them — not in isolation",
          "Know which metrics matter most at each stage and why",
          "Anticipate the unit economics questions every investor will ask",
        ],
        lessons: [
          "What Fundraising Is — and What It Isn't",
          "What Pre-Seed Investors Actually Evaluate",
          "Building Your Target List: Thesis Fit Over Warm Intros",
          "The First Meeting: What Investors Are Measuring in 30 Minutes",
          "The Data Room: What to Prepare and Why",
          "Managing a Process: Running Conversations in Parallel",
          "The Term Sheet Arrives: What to Do in the First 48 Hours",
          "Diligence: What Investors Check and How to Prepare",
          "The Close: Mechanics, Timing, and What Founders Get Wrong",
        ],
      },
      {
        topic: "Venture Capital",
        tag: "Context",
        desc: "Unit economics mean different things at different stages. Understanding how VCs evaluate them at seed versus Series A changes how you present your numbers.",
        outcomes: [
          "Understand how investor expectations for unit economics evolve across rounds",
          "Know when weak unit economics are disqualifying versus acceptable with context",
          "Frame your metrics in the language of the investor you're talking to",
        ],
        lessons: [
          "Why Venture Capital Exists — and When It Makes Sense to Take It",
          "How a VC Fund Actually Works: LP Money, Carry, and Time Pressure",
          "What Investors Are Really Looking For in a Pre-Seed Pitch",
          "The Power Law: Why VCs Need a Unicorn, Not Just a Good Business",
          "The Seed Round: What They Look For at Each Stage",
          "Series A: What Changes, What Gets Harder, What Signals Matter",
          "VC Signalling: How Investor Behaviour Shapes Your Next Round",
          "Choosing Investors: The Relationship You'll Have for a Decade",
        ],
      },
      {
        topic: "Term Sheets",
        tag: "Next step",
        desc: "Strong unit economics get you to the term sheet. Now learn what's inside it — every clause that will govern your relationship with the investors your numbers attracted.",
        outcomes: [
          "Understand every clause in a term sheet and which ones to push back on",
          "Connect your company's economics to the investor terms they typically produce",
          "Walk into your first term sheet negotiation prepared, not reactive",
        ],
        lessons: [
          "What a Term Sheet Actually Is — and What It Isn't",
          "Pre-Money vs Post-Money: The Single Most Important Number",
          "Option Pool Shuffles and Why They Matter More Than Valuation",
          "Liquidation Preferences: Who Gets Paid First, and How Much",
          "Participation Rights: When 1× Non-Participating Becomes Non-Negotiable",
          "Pro-Rata Rights: The Clause Every Founder Undervalues",
          "Drag-Along and Co-Sale: Understanding Exit Governance",
          "Information Rights, Board Composition, and Approval Rights",
          "Negotiating a Term Sheet: What Moves, What Doesn't, and Why",
        ],
      },
    ],
    "SAFE Notes": [
      {
        topic: "Term Sheets",
        tag: "Next step",
        desc: "SAFEs convert into priced rounds governed by term sheets. Understanding the destination makes the conversion mechanics you just learned concrete.",
        outcomes: [
          "See exactly how your SAFE terms translate into the priced round clauses that follow",
          "Know which SAFE terms you negotiated well and which will cost you at conversion",
          "Be fully prepared for your first priced round negotiation",
        ],
        lessons: [
          "What a Term Sheet Actually Is — and What It Isn't",
          "Pre-Money vs Post-Money: The Single Most Important Number",
          "Option Pool Shuffles and Why They Matter More Than Valuation",
          "Liquidation Preferences: Who Gets Paid First, and How Much",
          "Anti-Dilution Provisions: When They Bite and When They Don't",
          "Pro-Rata Rights: The Clause Every Founder Undervalues",
          "Information Rights, Board Composition, and Approval Rights",
          "Negotiating a Term Sheet: What Moves, What Doesn't, and Why",
        ],
      },
      {
        topic: "Cap Tables",
        tag: "Technical",
        desc: "Every SAFE you issue is a future claim on your cap table. Model what you've signed before the priced round arrives and the numbers are fixed.",
        outcomes: [
          "Model exactly how your SAFEs convert at any given priced round valuation",
          "Understand the dilutive difference between pre-money and post-money SAFEs",
          "Build a complete pre-Series A cap table that accounts for all outstanding instruments",
        ],
        lessons: [
          "What a Cap Table Is and Why It Matters From Day One",
          "How SAFEs and Convertible Notes Appear on the Table",
          "Post-Money SAFE Mechanics and Their Cap Table Impact",
          "The Priced Round: How Your Cap Table Changes at the First Institutional Close",
          "Dilution Modelling: Calculating Your Ownership at Every Scenario",
          "Liquidation Waterfalls: Who Gets What in an Exit",
          "Cap Table Hygiene: What to Fix Before Your Series A",
        ],
      },
      {
        topic: "Venture Capital",
        tag: "Context",
        desc: "SAFEs exist because of how VC funds work. Understanding the investor's incentives and timelines makes every SAFE term make more sense.",
        outcomes: [
          "Understand why VCs prefer SAFEs at the pre-seed and what it signals when they don't",
          "Connect SAFE mechanics to the fund economics that produce them",
          "Know how your SAFE fits into the investor's portfolio strategy",
        ],
        lessons: [
          "Why Venture Capital Exists — and When It Makes Sense to Take It",
          "How a VC Fund Actually Works: LP Money, Carry, and Time Pressure",
          "The Power Law: Why VCs Need a Unicorn, Not Just a Good Business",
          "How Valuation Works Before You Have Revenue",
          "The Seed Round: Instruments, Terms, and What You're Really Agreeing To",
          "Anti-Dilution, Pro-Rata, and the Clauses That Matter Over Time",
          "Choosing Investors: The Relationship You'll Have for a Decade",
        ],
      },
    ],
  };
  return map[topic] || [
    {
      topic: `Advanced ${topic}`,
      tag: "Depth",
      desc: `The edge cases, investor incentives, and founder trade-offs inside ${topic} that matter once the basics are familiar.`,
      outcomes: [
        `Recognise the expensive misunderstandings around ${topic}`,
        "Understand the incentives on both sides of the table",
        "Turn the concept into a decision you can explain clearly",
      ],
      lessons: defaultLessons(topic, "Founder decision").slice(0, 8),
    },
    {
      topic: `${topic} in Fundraising`,
      tag: "Application",
      desc: `How ${topic} shows up in investor meetings, diligence, negotiation, and close.`,
      outcomes: [
        `Use ${topic} in a live investor conversation`,
        "Know what to ask before agreeing to a term or metric narrative",
        "Avoid learning the concept only after it has become costly",
      ],
      lessons: defaultLessons(`${topic} in Fundraising`, "Investor conversation").slice(0, 8),
    },
    {
      topic: `${topic} and Founder Control`,
      tag: "Control",
      desc: `The ownership, governance, and leverage questions connected to ${topic}.`,
      outcomes: [
        "Understand how the concept affects control and optionality",
        "See the downstream effects across future rounds",
        "Make a cleaner decision under time pressure",
      ],
      lessons: defaultLessons(`${topic} and Founder Control`, "Control and leverage").slice(0, 8),
    },
  ];
}

function drawCertificate(ctx, W, H, dpr, { userName, topic, bookAuthor, lessonCount, dateStr, isBadge }) {
  ctx.scale(dpr, dpr);
  const w = W, h = H;

  if (isBadge) {
    // Badge: dark background, square
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, w, h);
    // Vermilion left stripe
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(0, 0, 8, h);
    // Topic (hero)
    ctx.textAlign = "center";
    ctx.fillStyle = "#FAFAFA";
    ctx.font = `300 ${topic.length > 12 ? 52 : 64}px Fraunces, Georgia, serif`;
    const topicLines = wrapText(ctx, topic, w * 0.78, w / 2);
    const topicY = h / 2 - (topicLines.length - 1) * 36;
    topicLines.forEach((line, i) => ctx.fillText(line, w / 2, topicY + i * 72));
    // "Path complete" label
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.letterSpacing = "0.2em";
    ctx.fillText("PATH COMPLETE · CURI", w / 2, h - 60);
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(w / 2 - 24, h - 76, 48, 3);
  } else {
    // Certificate: landscape, light background
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, w, h);
    // Vermilion top bar
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(0, 0, w, 7);
    // Outer border
    ctx.strokeStyle = "#D0D0D0";
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    // CURI wordmark top-left
    ctx.textAlign = "left";
    ctx.font = "300 26px Fraunces, Georgia, serif";
    ctx.fillStyle = "#0D0D0D";
    ctx.fillText("Curi", 72, 96);
    ctx.fillStyle = "#C1121F";
    ctx.fillRect(72, 104, 34, 3);
    // Date top-right
    ctx.textAlign = "right";
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(dateStr, w - 72, 96);
    // Certificate of Completion
    ctx.textAlign = "center";
    ctx.font = "400 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText("CERTIFICATE OF COMPLETION", w / 2, 200);
    // Horizontal rule
    ctx.strokeStyle = "#D0D0D0";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2 - 120, 218); ctx.lineTo(w / 2 + 120, 218); ctx.stroke();
    // "This certifies that"
    ctx.font = "300 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#5A5A5A";
    ctx.fillText("This certifies that", w / 2, 278);
    // User name
    ctx.font = `300 ${(userName || "").length > 20 ? 48 : 60}px Fraunces, Georgia, serif`;
    ctx.fillStyle = "#0D0D0D";
    ctx.fillText(userName || "You", w / 2, 360);
    // "has completed / has read"
    ctx.font = "300 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#5A5A5A";
    ctx.fillText(bookAuthor ? "has read" : "has completed the path", w / 2, 418);
    // Topic name (hero)
    const topicFontSize = topic.length > 20 ? 52 : topic.length > 14 ? 64 : 80;
    ctx.font = `400 italic ${topicFontSize}px Fraunces, Georgia, serif`;
    ctx.fillStyle = "#0D0D0D";
    const topicLines = wrapText(ctx, topic, w - 240, w / 2);
    const topicY = 520 - (topicLines.length - 1) * (topicFontSize * 0.6);
    topicLines.forEach((line, i) => ctx.fillText(line, w / 2, topicY + i * (topicFontSize * 1.15)));
    // Author (for book paths)
    let afterTopicY = topicY + topicLines.length * (topicFontSize * 1.15) + 20;
    if (bookAuthor) {
      ctx.font = "300 18px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#5A5A5A";
      ctx.fillText(`by ${bookAuthor}`, w / 2, afterTopicY);
      afterTopicY += 36;
    }
    // Lesson count + curi.app
    ctx.font = "400 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(`${lessonCount} lessons · curi.app`, w / 2, Math.max(afterTopicY + 20, h - 80));
  }
}

function wrapText(ctx, text, maxWidth, _cx) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

async function generateAndDownload(type, { userName, topic, bookAuthor, lessonCount }) {
  const isBadge = type === "badge";
  const W = isBadge ? 800 : 1400;
  const H = isBadge ? 800 : 900;
  const DPR = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d");
  const dateStr = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  await document.fonts.ready;
  drawCertificate(ctx, W, H, DPR, { userName, topic, bookAuthor, lessonCount, dateStr, isBadge });
  const slug = topic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const link = document.createElement("a");
  link.download = `curi-${slug}-${isBadge ? "badge" : "certificate"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Daily Email Preview ───────────────────────────────────────────────────────

const DEMO_EMAIL_LESSON = {
  topic: "Venture Capital",
  lessonIndex: 3,
  lessonTitle: "The Power Law: Why VCs Need a Unicorn, Not Just a Good Business",
  nextTitle: "How Valuation Works Before You Have Revenue",
  level: "Seed stage",
  body: [
    "Venture capital is not patient capital. A fund manager has ten years to return money to their limited partners — and the math of the asset class means that one company must pay for the entire portfolio, including all the failures.",
    "This is the power law. In practice, it means a VC doesn't evaluate whether your company can build a good business. They evaluate whether your company can become large enough to return their entire fund — often 3× or more. For a $100M fund, that means your company needs a realistic path to a $300M+ outcome. For a $500M fund, the number is proportionally terrifying.",
    "The implication for founders is subtle but significant: a VC passing on your round doesn't necessarily mean they think your idea is bad. It often means they think it's too small for their fund size. The same startup that's wrong for a $500M fund could be perfect for a $50M one.",
  ],
  pullQuote: "Most VCs need just one company to return the entire fund. That single constraint shapes every decision they make in a partner meeting — including the ones about you.",
  takeaways: [
    "Power law math means VCs evaluate potential fund-returners, not just good businesses",
    "Fund size determines the outcome threshold — a pass from a large fund isn't a verdict on your idea",
    "Understanding VC incentives lets you target the right investors and frame the right narrative",
  ],
};

function DailyEmailPreview({ courses, streak, user, onContinue, onDashboard }) {
  const dayNum = streak || 8;
  const { topic, lessonTitle, nextTitle, level } = DEMO_EMAIL_LESSON;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const secondaryCourses = courses.filter(c => c.topic !== topic);
  const hasMultiple = secondaryCourses.length > 0;
  const ctaLabel = hasMultiple ? "Open today's lessons" : "Continue today's lesson";
  const subjectLine = hasMultiple
    ? `${courses.length} founder lessons for today — ${lessonTitle}`
    : lessonTitle;

  function PrimaryCtaBtn() {
    return (
      <button
        type="button"
        onClick={onContinue}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#0D0D0D", color: "#FFFFFF",
          fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
          padding: "14px 28px", border: "none", cursor: "pointer",
          transition: "opacity 0.15s", width: "100%", justifyContent: "center",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        {ctaLabel}
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, opacity: 0.6 }}>→</span>
      </button>
    );
  }

  return (
    <Page className="items-center">
      <div className="w-full flex-1 overflow-y-auto" style={{ background: "#F0F0F0", padding: "32px 16px 64px" }}>

        {/* Mock email-client header bar */}
        <div className="mx-auto mb-4 flex items-center justify-between" style={{ maxWidth: 620, fontFamily: "Inter, sans-serif" }}>
          <div style={{ fontSize: 12, color: "#A3A3A3", fontWeight: 500 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Inbox preview
            </span>
          </div>
          <button
            type="button"
            onClick={onDashboard}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#A3A3A3", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
          >
            ← Back to app
          </button>
        </div>

        {/* Email card */}
        <div className="mx-auto overflow-hidden" style={{ maxWidth: 620, background: "#FFFFFF", border: "1px solid #E2E2E2", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          {/* ── Header ───────────────────────────────────────────── */}
          <div style={{ padding: "28px 36px 0", borderBottom: "1px solid #E2E2E2" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 300, color: "#0D0D0D", lineHeight: 1, fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}>
                  Cu<em style={{ fontStyle: "italic" }}>ri</em>
                </div>
                <div style={{ height: 3, width: 32, background: "var(--c-vermilion)", marginTop: 4 }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A3A3A3", lineHeight: 1.4, textAlign: "right" }}>
                {dateStr}
              </div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A3A3A3", marginTop: 12, paddingBottom: 20 }}>
              Day {dayNum} · {hasMultiple ? `${courses.length} active paths` : `${topic} · ${level}`}
            </div>
          </div>

          {/* ── Featured label (multi-course only) ───────────────── */}
          {hasMultiple && (
            <div style={{ padding: "20px 36px 0" }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--c-vermilion)" }}>
                Featured · {topic}
              </div>
            </div>
          )}

          {/* ── Lesson Title ──────────────────────────────────────── */}
          <div style={{ padding: hasMultiple ? "10px 36px 0" : "32px 36px 0" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0D0D0D" }}>
              {lessonTitle}
            </div>
          </div>

          {/* ── Lesson Body ───────────────────────────────────────── */}
          <div style={{ padding: "20px 36px" }}>
            {DEMO_EMAIL_LESSON.body.map((para, i) => (
              <p key={i} style={{ fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: "#0D0D0D", margin: i > 0 ? "16px 0 0" : 0 }}>
                {para}
              </p>
            ))}
          </div>

          {/* ── Pull Quote ────────────────────────────────────────── */}
          <div style={{ padding: "4px 36px 24px 60px", borderLeft: "2px solid #C1121F", margin: "0 36px 8px" }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: "#0D0D0D", margin: 0 }}>
              {DEMO_EMAIL_LESSON.pullQuote}
            </p>
          </div>

          {/* ── Takeaways ─────────────────────────────────────────── */}
          <div style={{ padding: "24px 36px", borderTop: "1px solid #E2E2E2" }}>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A3A3A3", marginBottom: 14 }}>
              Key takeaways
            </div>
            {DEMO_EMAIL_LESSON.takeaways.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: i > 0 ? 10 : 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, color: "var(--c-vermilion)", lineHeight: "24px", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif", fontSize: 14, lineHeight: 1.6, color: "#0D0D0D" }}>
                  {t}
                </span>
              </div>
            ))}
          </div>

          {/* ── Also due today (multi-course) ────────────────────── */}
          {hasMultiple && (
            <div style={{ borderTop: "1px solid #E2E2E2", background: "#F5F5F5" }}>
              <div style={{ padding: "20px 36px 8px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A3A3A3" }}>
                  Also due today
                </div>
              </div>
              {secondaryCourses.map((course, i) => {
                const idx = Math.min(course.progress || 0, course.lessons.length - 1);
                const title = course.lessons[idx] || "Next lesson";
                const isLast = i === secondaryCourses.length - 1;
                return (
                  <div key={course.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 36px", borderBottom: isLast ? "none" : "1px solid #E8E8E8" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A3A3A3", marginBottom: 4 }}>
                        {course.topic}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, lineHeight: 1.4, color: "#0D0D0D", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {title}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onContinue}
                      style={{ flexShrink: 0, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, color: "#0D0D0D", background: "none", border: "1px solid #D4D4D4", padding: "7px 14px", cursor: "pointer", letterSpacing: "0.03em", whiteSpace: "nowrap" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EBEBEB"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      Read →
                    </button>
                  </div>
                );
              })}
              <div style={{ padding: "20px 36px 24px", borderTop: "1px solid #E2E2E2" }}>
                <PrimaryCtaBtn />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#A3A3A3", textAlign: "center", marginTop: 12 }}>
                  {dayNum} day streak — keep it alive
                </p>
              </div>
            </div>
          )}

          {/* ── CTA (single course only) ──────────────────────────── */}
          {!hasMultiple && (
            <div style={{ padding: "28px 36px", borderTop: "1px solid #E2E2E2" }}>
              <PrimaryCtaBtn />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#A3A3A3", textAlign: "center", marginTop: 12 }}>
                {dayNum} day streak — keep it alive
              </p>
            </div>
          )}

          {/* ── Tomorrow Teaser ───────────────────────────────────── */}
          <div style={{ padding: "20px 36px 28px", background: "#EBEBEB", borderTop: "1px solid #E2E2E2" }}>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A3A3A3", marginBottom: 8 }}>
              Tomorrow · {topic}
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 17, color: "#0D0D0D", lineHeight: 1.3 }}>
              {nextTitle}
            </div>
          </div>

          {/* ── Footer ────────────────────────────────────────────── */}
          <div style={{ padding: "20px 36px", borderTop: "1px solid #E2E2E2", background: "#FAFAFA" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 300, color: "#0D0D0D", lineHeight: 1, fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}>
                  Cu<em style={{ fontStyle: "italic" }}>ri</em>
                </div>
                <div style={{ height: 2, width: 26, background: "var(--c-vermilion)", marginTop: 3 }} />
              </div>
              <a href="#" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#A3A3A3", textDecoration: "underline" }}>
                Manage email preferences
              </a>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 8, color: "#C4C4C4", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 12 }}>
              Curi · hello@curi.app · You're receiving this because you enabled daily lesson emails.
            </div>
          </div>

        </div>

        {/* Below-email subject line / metadata (email client style) */}
        <div className="mx-auto mt-5" style={{ maxWidth: 620, fontFamily: "Inter, sans-serif" }}>
          <div style={{ fontSize: 11, color: "#AAAAAA", textAlign: "center", letterSpacing: "0.02em" }}>
            Subject: <span style={{ color: "#555555" }}>{subjectLine}</span>
          </div>
        </div>

      </div>
    </Page>
  );
}

function CourseComplete({ course, streak, plan, user, onStartPath, onDashboard, onUpgrade }) {
  const paths = getSuggestedPaths(course.topic);
  const lessonCount = course.lessons?.length || 14;
  const userName = user?.name || "";

  const shareText = `I just finished a founder path on ${course.topic} with Curi — ${lessonCount} short lessons for first-time founders preparing to raise.\n\n"Founder knowledge compounds when you learn the term, the incentive, and the decision before the room gets expensive."\n\nBuild your own fundraising path → curi.app`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.app")}`;

  function copyText() {
    navigator.clipboard?.writeText(shareText);
  }

  return (
    <Page className="items-center py-12">
      <div className="w-full max-w-[820px] px-4 sm:px-6">

        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Path complete
          </div>
          <h1 className="font-serif text-[4rem] leading-[0.95] tracking-[-0.045em] sm:text-[5.5rem]">
            {course.topic}
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            {lessonCount} lessons · {streak} day streak · Path finished
          </p>
        </div>

        {/* ── Certificate ──────────────────────────────────────────── */}
        <div className="mb-14 border border-border bg-card">
          {/* Vermilion top rule */}
          <div style={{ height: "5px", background: "var(--c-vermilion)" }} />

          {/* Certificate preview */}
          <div className="px-8 py-10 text-center">
            {/* Wordmark row */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <span className="font-serif text-xl leading-none text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}>
                  Cu<em className="italic">ri</em>
                </span>
                <div style={{ height: "3px", width: "34px", background: "var(--c-vermilion)", marginTop: "3px" }} />
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Certificate body */}
            <div className="mx-auto max-w-lg">
              <div className="mb-4 text-label uppercase tracking-[0.3em] text-muted-foreground">Certificate of Completion</div>
              <div className="mx-auto mb-4 h-px w-20 bg-border" />
              <p className="mb-2 text-sm text-muted-foreground">This certifies that</p>
              <p className="font-serif text-3xl leading-snug text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
                {userName || "You"}
              </p>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">has completed the path</p>
              <h2
                className="font-serif leading-tight text-foreground"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 400, fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
              >
                {course.topic}
              </h2>
              <p className="mt-5 text-xs text-muted-foreground">
                {lessonCount} lessons · curi.app
              </p>
            </div>
          </div>

          {/* Download actions */}
          <div className="border-t border-border px-8 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">Download and add to LinkedIn, your portfolio, or share anywhere.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => generateAndDownload("certificate", { userName, topic: course.topic, lessonCount })}
                  className="inline-flex items-center gap-2 border border-border bg-foreground px-4 py-2.5 text-xs font-medium text-background transition hover:bg-foreground/85"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  Download certificate
                </button>
                <button
                  type="button"
                  onClick={() => generateAndDownload("badge", { userName, topic: course.topic, lessonCount })}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  Download badge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement card (shareable preview) */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="relative inline-block">
                  <span className="font-serif text-[17px] leading-none text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}>
                    Cu<em className="italic">ri</em>
                  </span>
                  <span className="absolute left-0 right-0" style={{ bottom: "-2px", height: "2px", background: "var(--c-vermilion)" }} aria-hidden />
                </div>
                <div className="mt-2 font-serif text-2xl leading-snug text-foreground">I finished the {course.topic} path</div>
                <div className="mt-1 text-xs text-muted-foreground">{lessonCount} lessons · {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
              </div>
              <div className="shrink-0 rounded-full bg-muted px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {streak} day streak
              </div>
            </div>
          </div>
          <div className="px-8 py-6">
            <blockquote className="font-serif text-xl leading-snug text-foreground/80">
              "Founder knowledge compounds when you learn the term, the incentive, and the decision before the room gets expensive."
            </blockquote>
            <div className="mt-4 text-xs text-muted-foreground">curi.app</div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mb-14 flex flex-wrap gap-2.5">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 depth-btn-primary"
          >
            Share on X
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-foreground/70 hover:border-foreground/30 hover:text-foreground depth-btn-light"
          >
            Share on LinkedIn
          </a>
          <button
            type="button"
            onClick={copyText}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-foreground/70 hover:border-foreground/30 hover:text-foreground depth-btn-light"
          >
            Copy text
          </button>
        </div>

        {/* Deeper paths */}
        <div className="mb-14 border-t border-border pt-10">
          <div className="mb-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">Where to go next</div>
          <h2 className="font-serif text-3xl leading-tight text-foreground">Build from {course.topic}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">You have the foundation. These paths connect the idea to fundraising, ownership, runway, and investor decisions.</p>

          <div className="mt-8 space-y-6">
            {paths.map((path) => (
              <div key={path.topic} className="overflow-hidden rounded-2xl border border-border bg-card">

                {/* Card header */}
                <div className="px-7 pt-7 pb-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="inline-flex rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {path.tag}
                    </div>
                    <div className="text-xs text-muted-foreground/60 tabular-nums">
                      {path.lessons.length} lessons
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl leading-snug text-foreground">{path.topic}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{path.desc}</p>

                  {/* Outcomes */}
                  <div className="mt-5 space-y-2.5">
                    {path.outcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm leading-snug text-foreground/75">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson list */}
                <div className="border-t border-border px-7 py-5">
                  <div className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">Path outline</div>
                  <ol className="space-y-3">
                    {path.lessons.slice(0, 6).map((lesson, i) => (
                      <li key={i} className="flex items-baseline gap-4">
                        <span className="w-5 shrink-0 font-serif text-sm text-muted-foreground/40 tabular-nums">{i + 1}</span>
                        <span className="text-sm leading-snug text-foreground/70">{lesson}</span>
                      </li>
                    ))}
                    {path.lessons.length > 6 && (
                      <li className="flex items-baseline gap-4">
                        <span className="w-5 shrink-0" />
                        <span className="text-xs text-muted-foreground/50">+ {path.lessons.length - 6} more lessons</span>
                      </li>
                    )}
                  </ol>
                </div>

                {/* Footer CTA */}
                <div className="flex items-center justify-between border-t border-border px-7 py-4">
                  <span className="text-xs text-muted-foreground/60">
                    ~{Math.ceil(path.lessons.length / 7)} weeks at one lesson a day
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartPath(path.topic)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Start this path <Icon name="arrow" size={13} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Upgrade nudge for free users */}
        {plan !== "paid" && (
          <div className="mb-8 border border-border bg-card">
            <div style={{ height: "3px", background: "var(--c-vermilion)" }} />
            <div className="px-7 py-6">
              <div className="mb-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">Curi Academy</div>
              <h3 className="font-serif text-xl leading-snug text-foreground">Unlimited founder paths. Deeper stats. Completion certificates.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">You just finished a founder path. Academy removes the 2-path limit so you can keep building fluency before the raise.</p>
              <button
                type="button"
                onClick={onUpgrade}
                className="mt-4 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85"
              >
                Upgrade to Academy · $10/month
              </button>
            </div>
          </div>
        )}

        {/* Return to dashboard */}
        <div className="border-t border-border pt-8 text-center">
          <button
            type="button"
            onClick={onDashboard}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to dashboard
          </button>
        </div>

      </div>
    </Page>
  );
}

function getLessonSources(topic) {
  const map = {
    "Venture Capital": [
      { name: "Venture Deals", url: "https://www.venturedeals.com", description: "Brad Feld and Jason Mendelson's practical reference on venture financing and startup deals.", type: "Book" },
      { name: "NVCA Model Legal Documents", url: "https://nvca.org/model-legal-documents/", description: "Standard US venture financing documents and explanations used across the ecosystem.", type: "Primary source" },
      { name: "a16z Startup Metrics", url: "https://a16z.com", description: "Investor writing on how venture-backed companies are evaluated and scaled.", type: "Investor" },
      { name: "YC Library", url: "https://www.ycombinator.com/library", description: "Founder-focused essays and talks on fundraising, startup mechanics, and company building.", type: "Founder resource" },
    ],
    "Term Sheets": [
      { name: "NVCA Term Sheet", url: "https://nvca.org/model-legal-documents/", description: "Model venture term sheet and legal document package used as a US market reference.", type: "Primary source" },
      { name: "Venture Deals", url: "https://www.venturedeals.com", description: "Plain-language explanation of term sheet economics, control provisions, and negotiation.", type: "Book" },
      { name: "Cooley GO Docs", url: "https://www.cooleygo.com/documents/", description: "Startup financing document library and practical founder legal explainers.", type: "Legal" },
      { name: "Clerky Handbook", url: "https://handbook.clerky.com", description: "Founder-friendly startup legal and financing basics.", type: "Founder resource" },
    ],
    "Unit Economics": [
      { name: "Bessemer State of the Cloud", url: "https://www.bvp.com/atlas/state-of-the-cloud", description: "Investor benchmarks and frameworks for SaaS growth, retention, and efficiency.", type: "Investor" },
      { name: "SaaS Metrics 2.0", url: "https://www.forentrepreneurs.com/saas-metrics-2/", description: "David Skok's detailed SaaS metrics guide for CAC, LTV, churn, and payback.", type: "Founder resource" },
      { name: "OpenView SaaS Benchmarks", url: "https://openviewpartners.com", description: "Benchmarks and operating metrics for early-stage software companies.", type: "Investor" },
      { name: "KeyBanc SaaS Survey", url: "https://www.key.com/businesses-institutions/industry-expertise/technology.jsp", description: "Annual SaaS operating benchmark data used by founders and investors.", type: "Benchmark" },
    ],
    "SAFE Notes": [
      { name: "Y Combinator SAFE Documents", url: "https://www.ycombinator.com/documents", description: "The original SAFE templates and explanatory documents from Y Combinator.", type: "Primary source" },
      { name: "Clerky SAFE Guide", url: "https://handbook.clerky.com", description: "Founder-oriented explanation of SAFE mechanics and financing paperwork.", type: "Founder resource" },
      { name: "Cooley GO Financing Docs", url: "https://www.cooleygo.com/documents/", description: "Legal templates and explainers for startup financing documents.", type: "Legal" },
      { name: "Carta Equity Education", url: "https://carta.com/learn/", description: "Practical explainers on SAFEs, cap tables, dilution, and equity management.", type: "Founder resource" },
    ],
  };
  return map[topic] || [
    { name: "YC Library", url: "https://www.ycombinator.com/library", description: `Founder essays and talks that provide practical startup context around ${topic}.`, type: "Founder resource" },
    { name: "Carta Learn", url: "https://carta.com/learn/", description: `Equity, cap table, fundraising, and ownership explainers relevant to ${topic}.`, type: "Founder resource" },
    { name: "Cooley GO", url: "https://www.cooleygo.com", description: `Startup legal and financing guides that help founders understand ${topic} in practice.`, type: "Legal" },
    { name: "Venture Deals", url: "https://www.venturedeals.com", description: "Practical venture financing reference for first-time founders.", type: "Book" },
    { name: "Founder Institute Resources", url: "https://fi.co/resources", description: "Founder education library with fundraising, finance, and operating basics.", type: "Founder resource" },
  ];
}

// ─── Spaced-repetition (SM-2) ────────────────────────────────────────────────

/** Create a new card with SM-2 defaults. */
function makeCard(front, back) {
  return {
    id: Math.random().toString(36).slice(2, 9),
    front,
    back,
    ease: 2.5,   // ease factor
    interval: 0, // days until next review (0 = never reviewed)
    due: Date.now(),
    reps: 0,     // successful reviews
  };
}

/**
 * SM-2 update. rating: 1=Again · 2=Hard · 3=Good · 4=Easy
 * Returns the updated card with new ease, interval, reps, due.
 */
function sm2Rate(card, rating) {
  let { ease, interval, reps } = card;
  const EASE_MIN = 1.3;

  if (rating === 1) {           // Again — reset
    ease    = Math.max(EASE_MIN, ease - 0.2);
    interval = 1;
    reps     = 0;
  } else if (rating === 2) {    // Hard
    ease     = Math.max(EASE_MIN, ease - 0.15);
    interval = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
    reps     = Math.max(1, reps);
  } else if (rating === 3) {    // Good
    if      (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else                 interval = Math.round(interval * ease);
    reps += 1;
  } else {                       // Easy
    ease     = Math.min(4.0, ease + 0.15);
    if      (reps === 0) interval = 4;
    else if (reps === 1) interval = 10;
    else                 interval = Math.round(interval * ease * 1.3);
    reps += 1;
  }

  return { ...card, ease, interval, reps, due: Date.now() + interval * 24 * 60 * 60 * 1000 };
}

/** Returns the next-interval preview (in days) for each rating button. */
function sm2Preview(card) {
  const { ease, interval, reps } = card;
  return {
    again: 1,
    hard:  reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2)),
    good:  reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease),
    easy:  reps === 0 ? 4 : reps === 1 ? 10 : Math.round(interval * ease * 1.3),
  };
}

// ─── New Deck Modal ───────────────────────────────────────────────────────────

function NewDeckModal({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const canSave = name.trim().length > 0;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key === "Enter" && canSave) { e.preventDefault(); onSave(name.trim()); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, canSave, name]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
        style={{ animation: "curi-fade-in 0.16s ease both" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground">Flashcards</p>
            <h3 className="mt-0.5 font-serif text-xl text-foreground">New deck</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Term Sheet Basics"
          className="w-full rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-foreground/30 focus:bg-background focus:outline-none"
        />
        <p className="mt-2 text-label text-muted-foreground/45">
          You'll add cards right after — press Enter to continue.
        </p>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground depth-btn-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canSave && onSave(name.trim())}
            disabled={!canSave}
            className="rounded-lg bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-30 depth-btn-primary"
          >
            Create deck
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Editor Modal (edit existing cards only) ─────────────────────────────

function CardEditorModal({ card, onSave, onCancel }) {
  const [front, setFront] = useState(card?.front ?? "");
  const [back,  setBack]  = useState(card?.back  ?? "");
  const canSave = front.trim().length > 0 && back.trim().length > 0;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { onCancel(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSave) onSave({ front: front.trim(), back: back.trim() });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, canSave, front, back]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full rounded-t-3xl border border-border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl"
        style={{ animation: "curi-fade-in 0.18s ease both" }}
      >
        {/* Drag pill (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl text-foreground">Edit card</h3>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <X size={15} />
            </button>
          </div>

          {/* Front */}
          <div className="mb-3 overflow-hidden rounded-xl border border-border/70 bg-muted/20 transition-colors focus-within:border-foreground/30 focus-within:bg-background">
            <div className="border-b border-border/40 px-4 pt-2.5 pb-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/50">Front</span>
            </div>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={2}
              autoFocus
              placeholder="The question or prompt…"
              className="w-full resize-none bg-transparent px-4 pb-3 pt-2 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none"
            />
          </div>

          {/* Back */}
          <div className="mb-5 overflow-hidden rounded-xl border border-border/70 bg-muted/20 transition-colors focus-within:border-foreground/30 focus-within:bg-background">
            <div className="border-b border-border/40 px-4 pt-2.5 pb-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/50">Back</span>
            </div>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={4}
              placeholder="The answer or explanation…"
              className="w-full resize-none bg-transparent px-4 pb-3 pt-2 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-label text-muted-foreground/35">⌘↵ to save</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground depth-btn-light"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => canSave && onSave({ front: front.trim(), back: back.trim() })}
                disabled={!canSave}
                className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-30 depth-btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Practice Session (Anki-style spaced repetition) ─────────────────────────

function PracticeSession({ set, onBack, onUpdateSet, onComplete }) {
  const now = Date.now();

  const [queue, setQueue] = useState(() => {
    const due = set.cards.filter((c) => (c.due ?? 0) <= now);
    return due.length > 0 ? [...due] : [...set.cards];
  });
  const [sessionSize] = useState(() => {
    const due = set.cards.filter((c) => (c.due ?? 0) <= now);
    return due.length > 0 ? due.length : set.cards.length;
  });
  const [ratedCount, setRatedCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [flipped,    setFlipped]    = useState(false);

  const done    = queue.length === 0;
  const card    = queue[0];
  const preview = card ? sm2Preview(card) : null;
  const pct     = Math.round((ratedCount / Math.max(1, sessionSize)) * 100);

  function rate(rating) {
    if (!card) return;
    const updated = sm2Rate(card, rating);
    const updatedCards = set.cards.map((c) => (c.id === updated.id ? updated : c));
    onUpdateSet({ ...set, cards: updatedCards });
    setQueue((prev) => {
      const rest = prev.slice(1);
      if (rating === 1) return [...rest, updated];
      return rest;
    });
    if (rating === 1) setAgainCount((n) => n + 1);
    else              setRatedCount((r) => r + 1);
    setFlipped(false);
  }

  // Keyboard shortcuts 1/2/3/4 when card is flipped
  useEffect(() => {
    if (!flipped || done) return;
    function onKey(e) {
      if (e.key === "1") rate(1);
      else if (e.key === "2") rate(2);
      else if (e.key === "3") rate(3);
      else if (e.key === "4") rate(4);
      else if (e.key === " " || e.key === "Enter") { /* already flipped */ }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, card, done]);

  // Spacebar flips
  useEffect(() => {
    if (flipped || done) return;
    function onKey(e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(true); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, done]);

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    const nextDue = set.cards
      .filter((c) => c.reps > 0)
      .sort((a, b) => (a.due ?? 0) - (b.due ?? 0))[0];
    const daysUntilNext = nextDue
      ? Math.max(1, Math.round(((nextDue.due ?? 0) - now) / (24 * 60 * 60 * 1000)))
      : null;

    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center py-24 text-center">
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm"
          style={{ animation: "section-enter 0.4s ease-spring both" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/70">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Session complete</p>
        <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-foreground">Well done.</h2>
        <div className="mt-6 flex items-center gap-6 text-center">
          <div>
            <p className="font-serif text-3xl leading-none tracking-[-0.03em] text-foreground">{ratedCount}</p>
            <p className="mt-1 text-label uppercase tracking-[0.18em] text-muted-foreground/60">reviewed</p>
          </div>
          {againCount > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl leading-none tracking-[-0.03em] text-foreground">{againCount}</p>
                <p className="mt-1 text-label uppercase tracking-[0.18em] text-muted-foreground/60">relearning</p>
              </div>
            </>
          )}
          {daysUntilNext && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl leading-none tracking-[-0.03em] text-foreground">{daysUntilNext}</p>
                <p className="mt-1 text-label uppercase tracking-[0.18em] text-muted-foreground/60">days to next</p>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => { onComplete?.(); onBack(); }}
          className="mt-10 rounded-lg bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80 depth-btn-primary"
        >
          {onComplete ? "Done" : "Back to decks"}
        </button>
      </div>
    );
  }

  // ── Practice card ────────────────────────────────────────────────────────
  const againInQueue = queue.filter((c) => c.id === card.id).length - 1 + (againCount > 0 ? againCount : 0);
  const remaining = queue.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">

      {/* Nav bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground depth-btn-light"
        >
          <ArrowLeft size={12} /> Decks
        </button>
        <div className="text-center">
          <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">{set.name}</p>
        </div>
        <span className="min-w-[48px] text-right text-xs tabular-nums text-muted-foreground/60">
          {ratedCount + 1}&thinsp;/&thinsp;{sessionSize}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-foreground/40 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Flip card */}
      <div
        className="card-scene cursor-pointer select-none"
        style={{ minHeight: "300px" }}
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        aria-label={flipped ? "Card answer" : "Tap to reveal answer"}
      >
        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div
            className="card-face flex flex-col justify-between rounded-2xl border border-border/50 bg-card px-8 py-8"
            style={{ minHeight: "300px" }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/40">Prompt</p>
            <div className="flex flex-1 items-center py-4">
              <div className="font-serif text-[1.85rem] leading-snug tracking-[-0.02em] text-foreground">
                {card.front}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-label text-muted-foreground/35">
                {card.reps === 0 ? "New card" : `Seen ${card.reps}×`}
              </p>
              <div className="flex items-center gap-1.5 text-label text-muted-foreground/35">
                <span>Tap to reveal</span>
                <kbd className="rounded border border-border/60 px-1 py-0.5 font-mono text-[9px]">Space</kbd>
              </div>
            </div>
          </div>
          {/* Back */}
          <div
            className="card-back-face flex flex-col justify-between rounded-2xl border border-border/50 bg-muted/30 px-8 py-8"
            style={{ minHeight: "300px" }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/40">Answer</p>
            <p className="flex-1 py-4 text-base leading-[1.75] text-foreground/90">{card.back}</p>
            <p className="text-label text-muted-foreground/35">Rate your recall below</p>
          </div>
        </div>
      </div>

      {/* Rating — shown after flip */}
      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {[
            { rating: 1, label: "Again", sub: `${preview.again}d`, key: "1", border: "border-red-200/60",    bg: "hover:bg-red-50/60",     txt: "text-red-500"    },
            { rating: 2, label: "Hard",  sub: `${preview.hard}d`,  key: "2", border: "border-orange-200/60", bg: "hover:bg-orange-50/60",  txt: "text-orange-500" },
            { rating: 3, label: "Good",  sub: `${preview.good}d`,  key: "3", border: "border-border",        bg: "hover:bg-muted/50",      txt: "text-foreground" },
            { rating: 4, label: "Easy",  sub: `${preview.easy}d`,  key: "4", border: "border-emerald-200/60",bg: "hover:bg-emerald-50/60", txt: "text-emerald-600"},
          ].map(({ rating, label, sub, key, border, bg, txt }) => (
            <button
              key={rating}
              type="button"
              onClick={() => rate(rating)}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 text-center transition-all duration-150 active:scale-95 ${border} ${bg}`}
            >
              <span className={`text-ui font-semibold leading-none ${txt}`}>{label}</span>
              <span className="text-label leading-none text-muted-foreground/50">{sub}</span>
              <kbd className="mt-0.5 rounded border border-border/50 px-1 py-px font-mono text-[8px] text-muted-foreground/30 group-hover:border-border/80 group-hover:text-muted-foreground/50 transition-colors">
                {key}
              </kbd>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-label text-muted-foreground/45">
          Recall the answer, then reveal to rate yourself
        </p>
      )}

      {/* Remaining hint */}
      {remaining > 0 && (
        <p className="text-center text-label text-muted-foreground/35 tabular-nums">
          {remaining} card{remaining !== 1 ? "s" : ""} remaining in session
        </p>
      )}
    </div>
  );
}

// ─── Deck stack color palette ────────────────────────────────────────────────

/**
 * Returns a { bg, layer1, layer2, text, accent } color object for a deck name.
 * Colors are warm/editorial to match the app's design language.
 */
function deckStackColor(name) {
  const hash = name.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const palettes = [
    { bg: "#F5F0EB", layer1: "#EDE7DD", layer2: "#E1D8CC", text: "#4A3728", accent: "#7A5A3A" }, // warm stone
    { bg: "#FDF6E3", layer1: "#FAE8B0", layer2: "#F5D880", text: "#6B4C0E", accent: "#A87820" }, // amber
    { bg: "#FDF0EC", layer1: "#FADDD0", layer2: "#F5C4B0", text: "#7A2E18", accent: "#C04020" }, // terracotta
    { bg: "#FCF0F2", layer1: "#F8D4DA", layer2: "#F3B8C0", text: "#7A1828", accent: "#C0203A" }, // rose
    { bg: "#EEF4FC", layer1: "#C8DEFA", layer2: "#A8C8F8", text: "#1A3A6A", accent: "#2560B8" }, // sky
    { bg: "#EDF9F6", layer1: "#B8EEE0", layer2: "#8EE0CC", text: "#0E4A3C", accent: "#147A62" }, // teal
    { bg: "#F4F0FD", layer1: "#DDD4FA", layer2: "#C8BAF6", text: "#320E6A", accent: "#6028C0" }, // violet
    { bg: "#F2F9EE", layer1: "#C8EAB0", layer2: "#A8DA88", text: "#1E4A0E", accent: "#347A20" }, // sage
  ];
  return palettes[hash % palettes.length];
}

// ─── Flashcard Sets Screen ────────────────────────────────────────────────────

function FlashcardScreen({ cardSets, onSaveSet, onDeleteSet, autoStartReview = false, onReviewComplete }) {
  const [view,          setView]          = useState("list");
  const [activeSetId,   setActiveSetId]   = useState(null);
  const [editingCard,   setEditingCard]   = useState(null);   // { idx: number } — edit existing only
  const [editSetName,   setEditSetName]   = useState("");
  const [creatingDeck,  setCreatingDeck]  = useState(false);
  const [showComposer,  setShowComposer]  = useState(false);
  const [composerFront, setComposerFront] = useState("");
  const [composerBack,  setComposerBack]  = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const composerFrontRef = useRef(null);
  const autoReviewStarted = useRef(false);

  const activeSet = cardSets.find((s) => s.id === activeSetId) ?? null;

  useEffect(() => {
    if (!autoStartReview || autoReviewStarted.current || cardSets.length === 0) return;
    const now = Date.now();
    let bestSet = null;
    let bestDue = 0;
    for (const set of cardSets) {
      const due = set.cards.filter((c) => (c.due ?? 0) <= now).length;
      if (due > bestDue) {
        bestDue = due;
        bestSet = set;
      }
    }
    if (bestSet) {
      autoReviewStarted.current = true;
      setActiveSetId(bestSet.id);
      setView("practice");
    }
  }, [autoStartReview, cardSets]);

  // ── Inline composer keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    if (!showComposer || view !== "edit") return;
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!composerFront.trim() || !composerBack.trim() || !activeSet) return;
        const updated = { ...activeSet, cards: [...activeSet.cards, makeCard(composerFront.trim(), composerBack.trim())] };
        onSaveSet(updated);
        setComposerFront("");
        setComposerBack("");
        setTimeout(() => composerFrontRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setShowComposer(false);
        setComposerFront("");
        setComposerBack("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showComposer, view, composerFront, composerBack, activeSet]);

  function addComposerCard() {
    if (!composerFront.trim() || !composerBack.trim() || !activeSet) return;
    const updated = { ...activeSet, cards: [...activeSet.cards, makeCard(composerFront.trim(), composerBack.trim())] };
    onSaveSet(updated);
    setComposerFront("");
    setComposerBack("");
    setTimeout(() => composerFrontRef.current?.focus(), 0);
  }

  function closeComposer() {
    setShowComposer(false);
    setComposerFront("");
    setComposerBack("");
  }

  // ── List view — card stack grid ───────────────────────────────────────────
  if (view === "list") {
    const now        = Date.now();
    const totalCards = cardSets.reduce((s, d) => s + d.cards.length, 0);
    const totalDue   = cardSets.reduce((s, d) => s + d.cards.filter((c) => (c.due ?? 0) <= now).length, 0);
    const mastered   = cardSets.reduce((s, d) => s + d.cards.filter((c) => c.reps > 0).length, 0);

    return (
      <div className="mx-auto w-full max-w-2xl">

        {/* New deck modal */}
        {creatingDeck && (
          <NewDeckModal
            onSave={(name) => {
              const newSet = { id: Math.random().toString(36).slice(2, 9), name, cards: [], sourceId: null };
              onSaveSet(newSet);
              setCreatingDeck(false);
              setActiveSetId(newSet.id);
              setEditSetName(name);
              setShowComposer(true);
              setView("edit");
            }}
            onCancel={() => setCreatingDeck(false)}
          />
        )}

        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Review</p>
            <h1 className="mt-1 font-serif text-3xl tracking-[-0.03em] text-foreground">From your lessons</h1>
          </div>
          <div className="mb-0.5 flex items-center gap-2">
            {totalDue > 0 && (
              <button
                type="button"
                onClick={() => {
                  const now = Date.now();
                  let bestSet = null;
                  let bestDue = 0;
                  for (const set of cardSets) {
                    const due = set.cards.filter((c) => (c.due ?? 0) <= now).length;
                    if (due > bestDue) {
                      bestDue = due;
                      bestSet = set;
                    }
                  }
                  if (bestSet) {
                    setActiveSetId(bestSet.id);
                    setView("practice");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
              >
                Review {totalDue} due
              </button>
            )}
            <button
              type="button"
              onClick={() => setCreatingDeck(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground depth-btn-light"
            >
              <span className="text-sm leading-none">+</span> New deck
            </button>
          </div>
        </div>

        {/* Stats strip */}
        {cardSets.length > 0 && (
          <div className="mb-8 grid grid-cols-3 divide-x divide-border border-y border-border py-5">
            <div className="px-4 sm:px-6">
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{cardSets.length}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">deck{cardSets.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="px-4 sm:px-6">
              <p className="font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">{totalCards}</p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">cards</p>
            </div>
            <div className="px-4 sm:px-6">
              <p className={`font-serif text-4xl leading-none tracking-[-0.04em] ${mastered > 0 ? "text-foreground" : "text-muted-foreground/25"}`}>
                {mastered > 0 ? Math.round((mastered / Math.max(1, totalCards)) * 100) + "%" : "—"}
              </p>
              <p className="mt-2 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/55">learned</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {cardSets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <Layers2 size={22} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground/70">No review cards yet</p>
            <p className="mx-auto mt-2 max-w-[280px] text-ui leading-relaxed text-muted-foreground/50">
              Finish a lesson and pass the quiz — cards save automatically for tomorrow&apos;s review.
            </p>
            <button
              type="button"
              onClick={() => setCreatingDeck(true)}
              className="mt-6 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 depth-btn-primary"
            >
              Create a deck
            </button>
          </div>
        ) : (
          /* ── Card stack grid ── */
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cardSets.map((set) => {
              const dueCount  = set.cards.filter((c) => (c.due ?? 0) <= now).length;
              const learnedN  = set.cards.filter((c) => c.reps > 0).length;
              const mastPct   = set.cards.length > 0 ? Math.round((learnedN / set.cards.length) * 100) : 0;
              const caughtUp  = dueCount === 0 && learnedN > 0;
              const col       = deckStackColor(set.name);
              const initials  = topicInitials(set.name);

              return (
                <div
                  key={set.id}
                  className="group relative select-none"
                  style={{ paddingBottom: "14px" }}
                >
                  {/* ── Stack layers (behind main card, peek below) ── */}
                  {/* Layer 3 — deepest */}
                  <div
                    className="absolute rounded-2xl"
                    style={{
                      left: 14, right: 14,
                      top: 14, bottom: 0,
                      background: col.layer2,
                    }}
                  />
                  {/* Layer 2 — middle */}
                  <div
                    className="absolute rounded-2xl"
                    style={{
                      left: 7, right: 7,
                      top: 7, bottom: 0,
                      background: col.layer1,
                    }}
                  />

                  {/* ── Main card ── */}
                  <div
                    className="relative overflow-hidden rounded-2xl transition-all duration-200 ease-spring group-hover:-translate-y-1.5 group-hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    style={{
                      background: col.bg,
                      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                      minHeight: 192,
                    }}
                    onClick={() => { setActiveSetId(set.id); setEditSetName(set.name); setView("edit"); }}
                  >
                    {/* Ghost initials — identity texture */}
                    <div
                      className="pointer-events-none absolute inset-0 flex items-end justify-end overflow-hidden"
                      aria-hidden
                      style={{ opacity: 0.07 }}
                    >
                      <span
                        className="font-serif leading-none tracking-tighter select-none"
                        style={{ fontSize: "8rem", color: col.text, marginRight: "-8px", marginBottom: "-12px" }}
                      >
                        {initials}
                      </span>
                    </div>

                    <div className="relative flex h-full min-h-[192px] flex-col justify-between p-4">
                      {/* Top: due status — plain text, no pill */}
                      <div className="flex justify-end">
                        {dueCount > 0 ? (
                          <span
                            className="text-label font-semibold tabular-nums"
                            style={{ color: col.accent }}
                          >
                            {dueCount} due
                          </span>
                        ) : caughtUp ? (
                          <span className="text-label font-semibold" style={{ color: "#10b981" }}>✓</span>
                        ) : null}
                      </div>

                      {/* Middle: name + count */}
                      <div>
                        <h3
                          className="font-serif text-[1.15rem] leading-snug tracking-[-0.02em]"
                          style={{ color: col.text }}
                        >
                          {set.name}
                        </h3>
                        <p
                          className="mt-1 text-label leading-none"
                          style={{ color: col.accent, opacity: 0.55 }}
                        >
                          {set.cards.length} card{set.cards.length !== 1 ? "s" : ""}
                        </p>
                        {/* Progress bar */}
                        {learnedN > 0 && (
                          <div
                            className="mt-2 h-[2px] overflow-hidden rounded-full"
                            style={{ background: col.layer2 }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${mastPct}%`,
                                background: caughtUp ? "#10b981" : col.accent,
                                opacity: 0.4,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Bottom: study action */}
                      <div className="flex items-center justify-end">
                        {set.cards.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSetId(set.id);
                              setView("practice");
                            }}
                            className="flex items-center gap-1 text-label font-semibold transition-opacity hover:opacity-80"
                            style={{ color: col.accent, opacity: 0.7 }}
                          >
                            Study
                            <ArrowRight size={11} strokeWidth={2} />
                          </button>
                        ) : (
                          <span
                            className="text-label"
                            style={{ color: col.accent, opacity: 0.35 }}
                          >
                            No cards yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Practice view ──────────────────────────────────────────────────────────
  if (view === "practice" && activeSet) {
    return (
      <PracticeSession
        set={activeSet}
        onBack={() => { setActiveSetId(null); setView("list"); }}
        onUpdateSet={(updated) => onSaveSet(updated)}
        onComplete={onReviewComplete}
      />
    );
  }

  // ── Edit / manage deck view ────────────────────────────────────────────────
  if (view === "edit" && activeSet) {
    const masteredN = activeSet.cards.filter((c) => c.reps > 0).length;
    const canAddCard = composerFront.trim().length > 0 && composerBack.trim().length > 0;
    function toggleCard(id) {
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }

    return (
      <div className="mx-auto w-full max-w-2xl pb-16">

        {/* Card editor modal — editing existing cards only */}
        {editingCard && (
          <CardEditorModal
            card={activeSet.cards[editingCard.idx]}
            onSave={(data) => {
              const updated = {
                ...activeSet,
                cards: activeSet.cards.map((c, i) =>
                  i === editingCard.idx ? { ...c, front: data.front, back: data.back } : c
                ),
              };
              onSaveSet(updated);
              setEditingCard(null);
            }}
            onCancel={() => setEditingCard(null)}
          />
        )}

        {/* Back */}
        <button
          type="button"
          onClick={() => { closeComposer(); setView("list"); }}
          className="mb-6 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground depth-btn-light"
        >
          <ArrowLeft size={12} /> All decks
        </button>

        {/* Deck header */}
        <div className="mb-8 flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${topicCoverColor(activeSet.name)}`}>
            {topicInitials(activeSet.name)}
          </div>
          <div className="min-w-0 flex-1">
            <input
              value={editSetName}
              onChange={(e) => setEditSetName(e.target.value)}
              onBlur={() => editSetName.trim() && editSetName.trim() !== activeSet.name && onSaveSet({ ...activeSet, name: editSetName.trim() })}
              className="w-full bg-transparent font-serif text-2xl tracking-[-0.02em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              placeholder="Deck name"
            />
            <p className="mt-0.5 text-label text-muted-foreground/55">
              {activeSet.cards.length} card{activeSet.cards.length !== 1 ? "s" : ""}
              {masteredN > 0 ? ` · ${masteredN} learned` : ""}
            </p>
          </div>
          {activeSet.cards.length > 0 && (
            <button
              type="button"
              onClick={() => { closeComposer(); setView("practice"); }}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
            >
              Study with Anki
              <ArrowRight size={11} />
            </button>
          )}
        </div>

        {/* Card list header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              Cards{activeSet.cards.length > 0 ? ` · ${activeSet.cards.length}` : ""}
            </p>
            {activeSet.cards.length > 0 && (
              <p className="mt-0.5 text-label text-muted-foreground/40">Tap any card to reveal the answer</p>
            )}
          </div>
          {!showComposer && (
            <button
              type="button"
              onClick={() => { setShowComposer(true); setTimeout(() => composerFrontRef.current?.focus(), 60); }}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <span className="text-sm leading-none">+</span> Add card
            </button>
          )}
        </div>

        {/* Cards */}
        {activeSet.cards.length > 0 && (
          <div className="divide-y divide-border/40 overflow-hidden border border-border/60 bg-card">
            {activeSet.cards.map((card, i) => {
              const isOpen = expandedCards.has(card.id);
              return (
                <div key={card.id} className="group">
                  {/* Clickable card row — tap to reveal back */}
                  <button
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30"
                    aria-expanded={isOpen}
                  >
                    {/* Front / Back label */}
                    <div className="mt-0.5 w-8 shrink-0 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/35">
                      {isOpen ? "Back" : "Front"}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {!isOpen ? (
                        /* Front: show question */
                        <p className="text-ui font-medium leading-snug text-foreground">
                          {card.front}
                        </p>
                      ) : (
                        /* Back: show answer prominently */
                        <>
                          <p className="text-label leading-snug text-muted-foreground/50">
                            {card.front}
                          </p>
                          <p className="mt-2 text-ui leading-relaxed text-foreground">
                            {card.back}
                          </p>
                          {card.reps > 0 && (
                            <p className="mt-1.5 text-label text-muted-foreground/35 tabular-nums">
                              {card.reps}× reviewed · next in {card.interval}d
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Flip indicator */}
                    <ChevronDown
                      size={13}
                      className={`mt-0.5 shrink-0 text-muted-foreground/25 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Hover actions — visible below the row when expanded or on hover */}
                  <div className={`flex items-center justify-end gap-0.5 px-3 pb-2 ${isOpen ? "flex" : "hidden group-hover:flex"}`}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingCard({ idx: i }); }}
                      className="rounded-lg p-1.5 text-muted-foreground/35 transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit card"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSaveSet({ ...activeSet, cards: activeSet.cards.filter((_, j) => j !== i) }); }}
                      className="rounded-lg p-1.5 text-muted-foreground/35 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete card"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Inline card composer ── */}
        {showComposer ? (
          <div className={`overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ${activeSet.cards.length > 0 ? "mt-4" : ""}`}>
            {/* Composer header */}
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <p className="text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground/60">New card</p>
              <button
                type="button"
                onClick={closeComposer}
                className="rounded-full p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
              >
                <X size={13} />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {/* Front field */}
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30 transition-colors focus-within:border-foreground/25 focus-within:bg-background">
                <div className="border-b border-border/40 px-3 pt-2.5 pb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/50">Front</span>
                </div>
                <textarea
                  ref={composerFrontRef}
                  value={composerFront}
                  onChange={(e) => setComposerFront(e.target.value)}
                  rows={2}
                  placeholder="The question or prompt…"
                  className="w-full resize-none bg-transparent px-3 pb-3 pt-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                />
              </div>

              {/* Back field */}
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30 transition-colors focus-within:border-foreground/25 focus-within:bg-background">
                <div className="border-b border-border/40 px-3 pt-2.5 pb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/50">Back</span>
                </div>
                <textarea
                  value={composerBack}
                  onChange={(e) => setComposerBack(e.target.value)}
                  rows={3}
                  placeholder="The answer or explanation…"
                  className="w-full resize-none bg-transparent px-3 pb-3 pt-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-label text-muted-foreground/35">⌘↵ to add another</span>
                <button
                  type="button"
                  onClick={addComposerCard}
                  disabled={!canAddCard}
                  className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background transition-opacity disabled:opacity-30 hover:opacity-80"
                >
                  Add card
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Prompt to open composer when no cards + composer closed */
          activeSet.cards.length === 0 && (
            <button
              type="button"
              onClick={() => { setShowComposer(true); setTimeout(() => composerFrontRef.current?.focus(), 60); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 py-12 text-sm text-muted-foreground/50 transition-colors hover:border-foreground/20 hover:text-muted-foreground"
            >
              <span className="text-base leading-none">+</span> Add your first card
            </button>
          )
        )}

        {/* Danger zone */}
        <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-5">
          <p className="text-xs text-muted-foreground/35">
            {activeSet.sourceId ? "Saved from a lesson" : "Created from scratch"}
          </p>
          <button
            type="button"
            onClick={() => { onDeleteSet(activeSet.id); closeComposer(); setView("list"); setActiveSetId(null); }}
            className="text-xs text-red-500/45 transition-colors hover:text-red-500"
          >
            Delete deck
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Lesson Tutor (AI chatbot) ────────────────────────────────────────────────

/**
 * Self-contained AI tutor panel for a lesson.
 * Renders an expandable chat UI; calls /api/chat (proxied to Anthropic) via fetch.
 * Props: topic (string), lessonTitle (string)
 */
function LessonTutor({ topic, lessonTitle }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", text: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const body = {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: `You are a knowledgeable, concise tutor helping a learner understand "${topic}". They are currently reading a lesson titled "${lessonTitle}". Answer questions clearly and helpfully in 3–5 sentences. Stay focused on the topic. Use plain language — no jargon unless you define it.`,
        messages: newMessages.map((m) => ({ role: m.role, content: m.text })),
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const info = await res.text().catch(() => "");
        if (res.status === 401 || res.status === 403) {
          throw new Error("API key missing or invalid — add ANTHROPIC_API_KEY to .env and restart Vite.");
        }
        throw new Error(`Request failed (${res.status})${info ? `: ${info}` : ""}`);
      }

      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? "Sorry, I couldn't produce a response. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4"
        aria-expanded={open}
      >
        <div className="text-left">
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Ask the tutor</div>
          <p className="mt-1 text-sm text-foreground/70">
            Confused about something? Ask a question about this lesson.
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-150 hover:bg-muted"
          aria-hidden
        >
          <ChevronDown
            size={14}
            className="text-muted-foreground transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>

      {/* Collapsible panel */}
      {open && (
        <div className="mt-6" style={{ animation: "curi-fade-in 0.2s ease both" }}>
          {/* Message thread */}
          <div
            className="flex max-h-80 min-h-[80px] flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-muted/20 p-4"
            aria-live="polite"
          >
            {messages.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground/60">
                Ask anything about <span className="font-medium text-foreground/70">{topic}</span> or this lesson.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-label font-semibold"
                  style={{
                    background: m.role === "user"
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted))",
                    color: m.role === "user"
                      ? "hsl(var(--background))"
                      : "hsl(var(--foreground))",
                  }}
                >
                  {m.role === "user" ? "Y" : "AI"}
                </span>
                <p
                  className="max-w-[82%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: m.role === "user"
                      ? "hsl(var(--foreground) / 0.06)"
                      : "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-label font-semibold text-foreground">
                  AI
                </span>
                <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "120ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
            {error && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="mt-3 flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a question and press Enter…"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-foreground text-background transition-opacity duration-150 disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="mt-2 text-label text-muted-foreground/40">
            Powered by Claude · Answers may contain errors — always verify important information.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Bionic Reading helpers ───────────────────────────────────────────────────

/**
 * Bold the first ⌈length/2⌉ letters of a single token (word).
 * Leading/trailing punctuation is preserved but not counted.
 */
function bionicToken(token, key) {
  const m = token.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/);
  if (!m) return <React.Fragment key={key}>{token}</React.Fragment>;
  const [, pre, word, post] = m;
  const n = Math.max(1, Math.ceil(word.length / 2));
  return (
    <React.Fragment key={key}>
      {pre}
      <strong style={{ fontWeight: 700 }}>{word.slice(0, n)}</strong>
      {word.slice(n)}
      {post}
    </React.Fragment>
  );
}

/** Apply bionic formatting to a plain string, returning an array of nodes. */
function applyBionic(text) {
  return text.split(/(\s+)/).map((token, i) =>
    /^\s+$/.test(token) ? token : bionicToken(token, i)
  );
}

/**
 * A <p> wrapper that, when `enabled`, processes string children through
 * applyBionic while leaving React element children (drop-cap spans, etc.)
 * untouched.
 */
function BionicP({ enabled, children, className, style }) {
  if (!enabled) return <p className={className} style={style}>{children}</p>;
  const nodes = React.Children.toArray(children).flatMap((child) =>
    typeof child === "string" ? applyBionic(child) : [child]
  );
  return <p className={className} style={style}>{nodes}</p>;
}

// ─── Reader display settings ──────────────────────────────────────────────────

const READER_THEMES = [
  {
    id: "light", label: "Light", swatch: "#FAFAFA", swatchBorder: "#D0D0D0",
    vars: { "--background": "0 0% 98%", "--foreground": "0 0% 5%", "--card": "0 0% 97%", "--muted": "0 0% 89%", "--muted-foreground": "0 0% 35%", "--border": "0 0% 78%", "--c-bg": "#FAFAFA", "--c-ink": "#0D0D0D", "--c-line": "#D0D0D0", "--c-tint": "#EBEBEB" },
  },
  {
    id: "sepia", label: "Sepia", swatch: "#F4EFE0", swatchBorder: "#C8BEA8",
    vars: { "--background": "39 52% 91%", "--foreground": "27 41% 17%", "--card": "39 40% 88%", "--muted": "38 25% 83%", "--muted-foreground": "29 20% 42%", "--border": "34 22% 77%", "--c-bg": "#F4EFE0", "--c-ink": "#3B2A1A", "--c-line": "#C8BEA8", "--c-tint": "#EBE4D1" },
  },
  {
    id: "dark", label: "Dark", swatch: "#18171A", swatchBorder: "#3A3840",
    vars: { "--background": "270 5% 9%", "--foreground": "35 11% 88%", "--card": "270 5% 12%", "--muted": "270 4% 15%", "--muted-foreground": "30 3% 48%", "--border": "270 4% 20%", "--c-bg": "#18171A", "--c-ink": "#E2DDD8", "--c-line": "#2E2C30", "--c-tint": "#221F25" },
  },
  {
    id: "paper", label: "Paper", swatch: "#FFFEF9", swatchBorder: "#E0DDD6",
    vars: { "--background": "48 100% 99%", "--foreground": "0 0% 7%", "--card": "48 60% 97%", "--muted": "44 20% 93%", "--muted-foreground": "44 5% 52%", "--border": "44 12% 87%", "--c-bg": "#FFFEF9", "--c-ink": "#111111", "--c-line": "#E0DDD6", "--c-tint": "#F2EFE8" },
  },
];

const READER_FONTS = [
  { id: "sans",  label: "Sans",  family: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: "serif", label: "Serif", family: "'Fraunces', Georgia, serif" },
  { id: "mono",  label: "Mono",  family: "'JetBrains Mono', 'Courier New', monospace" },
];

const READER_SIZES = [
  { id: "s",  size: "1.0rem",  leading: "1.82" },
  { id: "m",  size: "1.22rem", leading: "1.84" },
  { id: "l",  size: "1.44rem", leading: "1.8"  },
  { id: "xl", size: "1.64rem", leading: "1.76" },
];

function LessonReader({ course, lessonIndex, initialLessonIndex, title, backLabel = "Dashboard", signedIn = true, onQuiz, onBack, cardSets = [], onSaveCardSet, onViewFlashcards }) {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(initialLessonIndex ?? lessonIndex);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioProgress, setAudioProgress] = useState(0);
  const utteranceRef = useRef(null);
  const audioStartAtRef = useRef(null);
  const audioPausedElapsedRef = useRef(0);
  const progressIntervalRef = useRef(null);

  // Difficulty rating (collected after quiz, before completing)
  const [lessonDifficulty, setLessonDifficulty] = useState(null); // "easy" | "right" | "hard"

  // Reader display settings
  const [readerTheme, setReaderTheme] = useState("light");
  const [readerFont,  setReaderFont]  = useState("sans");
  const [readerSize,  setReaderSize]  = useState("m");
  const [bionicMode,  setBionicMode]  = useState(false);
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const settingsBtnRef   = useRef(null);
  const settingsPanelRef = useRef(null);

  // Takeaways — open by default so users don't miss the highest-density content
  const [takeawaysOpen, setTakeawaysOpen] = useState(true);

  // Saved quotes
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [quotePick, setQuotePick] = useState(null); // { text, x, y }

  // Deck cards — editable local copy of the lesson's key concepts
  const [deckCards, setDeckCards] = useState(() =>
    getLessonCards(course.topic).map((c) => makeCard(c.front, c.back))
  );
  const [cardIndex,     setCardIndex]     = useState(0);
  const [cardFlipped,   setCardFlipped]   = useState(false);
  const [editingCardIdx, setEditingCardIdx] = useState(null); // number | "new" | null
  const [deckSavedId,   setDeckSavedId]   = useState(null);  // id of saved set for this course

  // Reading progress
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sources panel
  const [showSources, setShowSources] = useState(false);

  const selectedTitle = course.lessons[selectedLessonIndex] || title;
  const isCurrentLesson = selectedLessonIndex === lessonIndex;
  const isReviewLesson = selectedLessonIndex < lessonIndex;
  const nextLessonTitle = course.lessons[lessonIndex + 1];
  // Find any previously saved deck for this course
  const savedDeck = cardSets.find((s) => s.sourceId === String(course.id)) ?? null;
  const takeaways = getLessonTakeaways(course.topic);
  const questions = [
    { q: "What is the lesson’s main distinction?", options: ["Definition and trade-off", "Speed and memory", "Talent and luck"] },
    { q: "What makes a concept useful for founder decisions?", options: ["Understanding what decision it changes", "Memorising the definition quickly", "Having heard it in a pitch"] },
    { q: "What is Curi trying to reinforce?", options: ["Founder decision-making", "Loose startup content", "Daily competition"] }
  ];
  const quizComplete = questions.every((_, i) => quizAnswers[i]);

  useEffect(() => {
    setSelectedLessonIndex(initialLessonIndex ?? lessonIndex);
    setQuizAnswers({});
    setIsPlaying(false);
    setAudioActive(false);
    setAudioProgress(0);
    clearInterval(progressIntervalRef.current);
    audioStartAtRef.current = null;
    audioPausedElapsedRef.current = 0;
    setCardIndex(0);
    setCardFlipped(false);
    setDeckCards(getLessonCards(course.topic).map((c) => makeCard(c.front, c.back)));
    setEditingCardIdx(null);
    setDeckSavedId(null);
    setSavedQuotes([]);
    setQuotePick(null);
    setLessonDifficulty(null);
    window.speechSynthesis?.cancel();
  }, [course.id, initialLessonIndex, lessonIndex]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  // Reading progress — track scroll relative to the article element
  useEffect(() => {
    function findScrollParent(el) {
      let node = el?.parentElement;
      while (node && node !== document.body) {
        const { overflowY } = window.getComputedStyle(node);
        if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
      }
      return null;
    }
    const container = findScrollParent(wrapperRef.current);
    if (!container) return;

    function update() {
      const article = articleRef.current;
      if (!article) return;
      const cRect = container.getBoundingClientRect();
      const aRect = article.getBoundingClientRect();
      // scrolled past = how much of the article bottom has moved above the container bottom
      const scrolledPast = cRect.top - aRect.top + container.clientHeight;
      setReadProgress(Math.min(1, Math.max(0, scrolledPast / aRect.height)));
    }

    container.addEventListener("scroll", update, { passive: true });
    update();
    return () => container.removeEventListener("scroll", update);
  }, []);

  // Reset reading progress when lesson changes
  useEffect(() => { setReadProgress(0); }, [course.id, selectedLessonIndex]);

  // Close reader settings on outside click
  useEffect(() => {
    if (!showReaderSettings) return;
    function onOutside(e) {
      if (settingsBtnRef.current?.contains(e.target)) return;
      if (settingsPanelRef.current?.contains(e.target)) return;
      setShowReaderSettings(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showReaderSettings]);

  // Derived display config
  const theme    = READER_THEMES.find(t => t.id === readerTheme) || READER_THEMES[0];
  const fontCfg  = READER_FONTS.find(f => f.id === readerFont)   || READER_FONTS[0];
  const sizeCfg  = READER_SIZES.find(s => s.id === readerSize)   || READER_SIZES[1];
  const sizeIdx  = READER_SIZES.findIndex(s => s.id === readerSize);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const audioScript = `Lesson ${selectedLessonIndex + 1}. ${selectedTitle}. The first useful thing to know about ${course.topic} is that it is not just a definition. It is a decision tool. Once you understand the incentive underneath the term, investor conversations become less mysterious and less reactive. Today's idea is simple. Every founder concept has a surface and a consequence. The surface is what first-time founders usually learn in a hurry: the acronym, the formula, the clause, the vocabulary. The consequence is quieter. It is the ownership, runway, leverage, or control that changes if you misunderstand it. Think of ${course.topic} as a room with two doors. One door is labelled explanation. It helps you recognise the term. The other is labelled judgment. It helps you decide what to do with the term when money or equity is on the line. Most startup content overfeeds the first door. Curi is trying to train the second. In ${course.topic}, one recurring pressure is the gap between what sounds standard and what is actually costly. Do not ask only what does this mean. Ask what decision does this change, and who benefits if I get it wrong. That question turns passive reading into founder judgment.`;

  const audioDurationSec = Math.ceil(audioScript.split(/\s+/).length / (150 * playbackRate) * 60);

  // Progress interval — only runs while playing
  useEffect(() => {
    clearInterval(progressIntervalRef.current);
    if (!isPlaying || !audioStartAtRef.current) return;
    const durationMs = audioDurationSec * 1000;
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - audioStartAtRef.current;
      setAudioProgress(Math.min(elapsed / durationMs, 1));
    }, 250);
    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying, audioDurationSec]);

  function startUtterance(rate, fromProgress = 0) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(audioScript);
    u.rate = rate;
    u.onend = () => {
      setIsPlaying(false);
      setAudioProgress(1);
      clearInterval(progressIntervalRef.current);
    };
    u.onerror = () => setIsPlaying(false);
    utteranceRef.current = u;
    // Adjust start anchor so elapsed tracks from current progress point
    const durationMs = Math.ceil(audioScript.split(/\s+/).length / (150 * rate) * 60 * 1000);
    audioStartAtRef.current = Date.now() - fromProgress * durationMs;
    window.speechSynthesis.speak(u);
  }

  function toggleAudio() {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.pause();
      audioPausedElapsedRef.current = Date.now() - audioStartAtRef.current;
      setIsPlaying(false);
      return;
    }
    if (window.speechSynthesis.paused && utteranceRef.current) {
      audioStartAtRef.current = Date.now() - audioPausedElapsedRef.current;
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }
    // Fresh start
    audioPausedElapsedRef.current = 0;
    setAudioProgress(0);
    startUtterance(playbackRate, 0);
    setIsPlaying(true);
    setAudioActive(true);
  }

  function stopAudio() {
    window.speechSynthesis.cancel();
    clearInterval(progressIntervalRef.current);
    utteranceRef.current = null;
    audioStartAtRef.current = null;
    audioPausedElapsedRef.current = 0;
    setIsPlaying(false);
    setAudioActive(false);
    setAudioProgress(0);
  }

  function setRate(rate) {
    const currentProgress = audioProgress;
    setPlaybackRate(rate);
    if (audioActive) {
      startUtterance(rate, currentProgress);
      if (!isPlaying) setIsPlaying(true);
    }
  }

  function fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // ── Highlight / save quotes ────────────────────────────────────────────────
  function handleTextSelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setQuotePick(null); return; }
    const text = sel.toString().trim();
    if (text.length < 30) { setQuotePick(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setQuotePick({ text, x: rect.left + rect.width / 2, y: rect.top });
  }

  function saveHighlight() {
    if (!quotePick) return;
    setSavedQuotes((prev) => [quotePick.text, ...prev]);
    setQuotePick(null);
    window.getSelection()?.removeAllRanges();
  }

  // ── Deck cards ─────────────────────────────────────────────────────────────
  function nextCard() { setCardIndex((i) => Math.min(i + 1, deckCards.length - 1)); setCardFlipped(false); }
  function prevCard() { setCardIndex((i) => Math.max(i - 1, 0)); setCardFlipped(false); }

  function saveDeck() {
    if (!onSaveCardSet) return;
    const existing = savedDeck ?? cardSets.find((s) => s.sourceId === String(course.id));
    const set = {
      id:       existing?.id ?? Math.random().toString(36).slice(2, 9),
      sourceId: String(course.id),
      name:     course.topic,
      cards:    deckCards,
    };
    onSaveCardSet(set);
    setDeckSavedId(set.id);
  }

  return (
    <Page
      className={`items-center py-10 ${audioActive ? "pb-28" : ""}`}
      style={{ ...theme.vars, background: `hsl(${theme.vars["--background"]})`, color: `hsl(${theme.vars["--foreground"]})`, minHeight: "100%", flex: "0 0 auto", width: "100%" }}
    >
      {/* Reading progress bar — fixed, 2px, subtle */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 z-50"
        style={{ left: signedIn ? "84px" : "0", right: 0, height: "2px" }}
      >
        <div
          className="h-full transition-[width] duration-200 ease-out"
          style={{
            width: `${readProgress * 100}%`,
            background: `hsl(${theme.vars["--foreground"]} / 0.28)`,
          }}
        />
      </div>

      <div className="w-full max-w-[724px] px-4 sm:px-6" ref={wrapperRef}>

        {/* Minimal nav */}
        <div className="mb-10 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {backLabel}
          </Button>

          {/* Reader settings trigger */}
          <div className="relative" ref={settingsBtnRef}>
            <button
              type="button"
              onClick={() => setShowReaderSettings(v => !v)}
              aria-label="Reader display settings"
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                showReaderSettings
                  ? "border-foreground/30 bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.02em" }}
            >
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 300 }}>A</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>a</span>
            </button>

            {/* Settings panel */}
            {showReaderSettings && (
              <div
                ref={settingsPanelRef}
                className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                style={{ background: `hsl(${theme.vars["--card"]})` }}
              >
                {/* Size */}
                <div className="px-4 pt-4 pb-3">
                  <p className="mb-2.5 text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground">Size</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReaderSize(READER_SIZES[Math.max(0, sizeIdx - 1)].id)}
                      disabled={sizeIdx === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Decrease font size"
                    >
                      <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 500 }}>−</span>
                    </button>
                    <div className="flex flex-1 items-end justify-around gap-1">
                      {READER_SIZES.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setReaderSize(s.id)}
                          aria-label={`Font size ${s.id}`}
                          className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                            readerSize === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span style={{ fontSize: 10 + i * 4, lineHeight: 1, fontFamily: fontCfg.family, fontWeight: readerSize === s.id ? 600 : 400 }}>A</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReaderSize(READER_SIZES[Math.min(READER_SIZES.length - 1, sizeIdx + 1)].id)}
                      disabled={sizeIdx === READER_SIZES.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Increase font size"
                    >
                      <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 500 }}>+</span>
                    </button>
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                {/* Font */}
                <div className="px-4 py-3">
                  <p className="mb-2.5 text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground">Font</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {READER_FONTS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setReaderFont(f.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                          readerFont === f.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                        }`}
                      >
                        <span style={{ fontFamily: f.family, fontSize: 20, lineHeight: 1, fontWeight: f.id === "serif" ? 300 : 400 }}>Aa</span>
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                {/* Theme */}
                <div className="px-4 py-3">
                  <p className="mb-2.5 text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground">Theme</p>
                  <div className="grid grid-cols-4 gap-2">
                    {READER_THEMES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setReaderTheme(t.id)}
                        className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                        aria-label={t.label}
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{
                            background: t.swatch,
                            border: readerTheme === t.id ? "2.5px solid hsl(var(--foreground))" : `1.5px solid ${t.swatchBorder}`,
                            boxShadow: readerTheme === t.id ? "0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--foreground))" : "none",
                          }}
                        >
                          {readerTheme === t.id && (
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: t.id === "dark" ? "#E2DDD8" : "#0D0D0D", opacity: 0.5 }}
                            />
                          )}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                {/* Bionic reading */}
                <div className="px-4 py-3 pb-4">
                  <button
                    type="button"
                    onClick={() => setBionicMode(v => !v)}
                    className="flex w-full items-center justify-between gap-3"
                    aria-pressed={bionicMode}
                  >
                    <div className="text-left">
                      <p className="text-label font-semibold uppercase tracking-[0.22em] text-muted-foreground">Bionic reading</p>
                      <p className="mt-0.5 text-label leading-snug text-muted-foreground/60">
                        Bold fixation points guide the eye
                      </p>
                    </div>
                    {/* Pill toggle */}
                    <span
                      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
                      style={{ background: bionicMode ? "hsl(var(--foreground))" : "hsl(var(--border))" }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform duration-200"
                        style={{ transform: bionicMode ? "translateX(18px)" : "translateX(3px)" }}
                      />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {selectedLessonIndex + 1} / {course.lessons.length}
          </span>
        </div>

        {/* Guest progress strip — shows the 3-step path for non-signed-in users */}
        {!signedIn && isCurrentLesson && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card/60">
            <div className="flex items-center gap-0 divide-x divide-border">
              {[
                { n: "1", label: "Read lesson", done: true },
                { n: "2", label: "Complete the quiz below", done: false },
                { n: "3", label: "Save & unlock lesson 2", done: false },
              ].map((step) => (
                <div key={step.n} className={`flex flex-1 items-center gap-2.5 px-4 py-3 ${step.done ? "text-foreground" : "text-muted-foreground/60"}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-label font-semibold ${step.done ? "bg-foreground text-background" : "border border-border"}`}>
                    {step.done ? "✓" : step.n}
                  </span>
                  <span className="text-label leading-snug">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson article */}
        <article ref={articleRef}>
          <div className="mb-6 flex flex-wrap items-center gap-2.5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>Lesson {selectedLessonIndex + 1}</span>
            <span>·</span>
            <span>{course.topic}</span>
            {isReviewLesson && <span className="border border-border px-3 py-1 tracking-[0.18em] text-muted-foreground">Review</span>}
            {isCurrentLesson && <span className="border border-border px-3 py-1 tracking-[0.18em] text-foreground/70">Today</span>}
          </div>
          <h1 className="font-serif text-5xl leading-[0.97] tracking-[-0.045em] sm:text-[3.6rem]">{selectedTitle}</h1>

          {/* Meta row: read time · listen · sources */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-muted-foreground">5 min read</span>
            <div className="h-3 w-px bg-border mx-1" />

            {/* Listen button */}
            {audioActive ? (
              <button
                type="button"
                onClick={toggleAudio}
                className="flex items-center gap-2 border border-foreground bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/85"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-background" />
                </span>
                Now playing
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleAudio}
                className="flex items-center gap-2 border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Play className="h-3 w-3 shrink-0 translate-x-px" fill="currentColor" strokeWidth={0} aria-hidden />
                Listen to lesson
              </button>
            )}

            {/* Sources button */}
            <button
              type="button"
              onClick={() => setShowSources(true)}
              className="flex items-center gap-2 border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Sources
            </button>
          </div>

          {/* Takeaways accordion */}
          <div className="mt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setTakeawaysOpen((o) => !o)}
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">3 things from this lesson</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${takeawaysOpen ? "rotate-180" : ""}`} />
            </button>
            {takeawaysOpen && (
              <ul className="space-y-4 pb-5">
                {takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm leading-[1.7] text-foreground/80">
                    <span className="mt-[-2px] shrink-0 font-serif text-xl leading-none text-brand">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-8 h-px bg-border" />

          {/* Body — selectable for highlights */}
          <div
            className="space-y-8 text-foreground"
            style={{ fontFamily: fontCfg.family, fontSize: sizeCfg.size, lineHeight: sizeCfg.leading }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            <BionicP enabled={bionicMode}>
              <span className="float-left mr-3 mt-1 font-serif text-7xl leading-[0.78] text-foreground">T</span>
              {"he first useful thing to know about "}
              {course.topic.toLowerCase()}
              {" is that it is not just a definition. It is a decision tool. Once you understand the incentive underneath the term, investor conversations become less mysterious and less reactive."}
            </BionicP>
            <BionicP enabled={bionicMode}>
              {"Today’s idea is simple: every founder concept has a surface and a consequence. The surface is what first-time founders usually learn in a hurry: the acronym, the formula, the clause, the vocabulary. The consequence is quieter. It is the ownership, runway, leverage, or control that changes if you misunderstand it."}
            </BionicP>
            <LessonImage topic={course.topic} />
            <BionicP enabled={bionicMode}>
              {"Think of "}
              {course.topic.toLowerCase()}
              {" as a room with two doors. One door is labelled explanation. It helps you recognise the term. The other is labelled judgment. It helps you decide what to do with the term when money or equity is on the line. Most startup content overfeeds the first door. Curi is trying to train the second."}
            </BionicP>
            <EquationBlock topic={course.topic} />
            <div className="border-l-2 border-brand bg-muted/30 px-6 py-5 font-sans text-base leading-7 text-foreground/80">
              <div className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Key idea</div>
              {bionicMode
                ? applyBionic("A founder concept becomes useful when you can name the trade-off before it costs you equity, runway, leverage, or control.")
                : "A founder concept becomes useful when you can name the trade-off before it costs you equity, runway, leverage, or control."}
            </div>
            <BionicP enabled={bionicMode}>
              {"In "}
              {course.topic.toLowerCase()}
              {", one recurring pressure is the gap between what sounds standard and what is actually costly. A clause, metric, or financing instrument can look normal because everyone uses it, while still shifting value away from the founder who does not understand the mechanics."}
            </BionicP>
            <IdeaDiagram topic={course.topic} />
            <BionicP enabled={bionicMode}>
              {"The trick is to slow down at the exact point where a simple answer becomes tempting. When someone says a term is standard, a valuation is good, or a metric is healthy, the better question is not whether they sound confident. The better question is what incentive they are speaking from. Standard for whom? Good after which option pool? Healthy at what margin and payback?"}
            </BionicP>
            <BionicP enabled={bionicMode}>
              {"This is why the same lesson matters differently to a technical first-time founder than it does to a repeat founder or an MBA. You are not trying to sound fluent. You are trying to build the judgment that top accelerator networks often transmit informally, before the decision is live and expensive."}
            </BionicP>
            <div>
              <h3 className="mb-3 font-sans text-sm uppercase tracking-[0.28em] text-muted-foreground">So what?</h3>
              <BionicP enabled={bionicMode}>
                {"Do not ask only, \"What does this mean?\" Ask, \"What decision does this change, and who benefits if I get it wrong?\" That question turns passive reading into founder judgment. It gives you a tool you can carry into tomorrow’s investor conversation."}
              </BionicP>
            </div>
          </div>
        </article>

        {/* Saved quotes */}
        {savedQuotes.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">Your notes</div>
            <div className="space-y-3">
              {savedQuotes.map((q, i) => (
                <blockquote key={i} className="border-l-2 border-border bg-muted/30 px-5 py-4 font-serif text-lg leading-relaxed text-foreground/90">
                  "{q}"
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Ask the tutor — AI chat for confused readers */}
        <LessonTutor topic={course.topic} lessonTitle={selectedTitle} />

        {/* Inline reflection quiz */}
        {isCurrentLesson ? (
          <section className="mt-16">
            <div className="mb-12 h-px bg-border" />
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reflection</div>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-foreground">
              {signedIn ? "Check your understanding" : "One quick check, then save your progress"}
            </h2>
            {!signedIn && (
              <p className="mt-2 text-sm text-muted-foreground">Answer three questions to complete lesson 1 and create your free account. Lesson 2 unlocks tomorrow.</p>
            )}
            <div className="mt-10 space-y-8">
              {questions.map((question, index) => (
                <div key={question.q}>
                  <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">{index + 1}. {question.q}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => {
                      const letter = ["A", "B", "C", "D"][optIdx];
                      const selected = quizAnswers[index] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [index]: option }))}
                          className={`flex w-full items-center gap-4 border px-5 py-3 text-left text-sm transition-colors duration-150 ${
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-card text-foreground/70 hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          <span className={`shrink-0 font-mono text-label font-medium tracking-[0.2em] ${selected ? "text-brand" : "text-muted-foreground/50"}`}>
                            {letter}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Difficulty rating — appears once quiz is answered */}
            {quizComplete && (
              <div className="mt-10" style={{ animation: "curi-fade-in 0.3s ease both" }}>
                <p className="mb-3 text-label uppercase tracking-[0.28em] text-muted-foreground">
                  How did this lesson feel?
                </p>
                <div className="flex gap-2">
                  {[
                    { id: "easy",  label: "Too easy"   },
                    { id: "right", label: "Just right"  },
                    { id: "hard",  label: "Too hard"    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLessonDifficulty(opt.id)}
                      className={`flex-1 border py-2.5 text-xs font-medium transition-colors duration-150 ${
                        lessonDifficulty === opt.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground/70 hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => { if (quizComplete) onQuiz(lessonDifficulty); }}
                disabled={!quizComplete}
                className={`inline-flex items-center gap-3 px-7 py-3.5 text-sm font-medium transition-colors duration-150 ${
                  quizComplete
                    ? "bg-foreground text-background hover:bg-foreground/85"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                }`}
              >
                {signedIn ? "Complete lesson" : "Save progress & continue"} <Icon name="arrow" size={15} />
              </button>
              {!quizComplete && (
                <span className="text-xs text-muted-foreground">Answer all three to continue</span>
              )}
            </div>

          </section>
        ) : (
          <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
            You are reviewing a completed lesson. Today’s quiz is attached to the current lesson.
          </div>
        )}

        {/* Key concepts — editable study cards */}
        {editingCardIdx !== null && (
          <CardEditorModal
            card={editingCardIdx === "new" ? null : deckCards[editingCardIdx]}
            onSave={(data) => {
              setDeckCards((prev) => {
                if (editingCardIdx === "new") return [...prev, makeCard(data.front, data.back)];
                return prev.map((c, i) => i === editingCardIdx ? { ...c, front: data.front, back: data.back } : c);
              });
              // If active card index is now out of range, clamp it
              if (editingCardIdx !== "new" && cardIndex >= deckCards.length) setCardIndex(deckCards.length - 1);
              setEditingCardIdx(null);
              setDeckSavedId(null); // mark as unsaved after edit
            }}
            onCancel={() => setEditingCardIdx(null)}
          />
        )}
        <section className="mt-12 border-t border-border pt-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Key concepts</div>
              <p className="mt-1.5 text-sm text-muted-foreground">Tap each card to reveal the definition · edit any card to make it your own</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingCardIdx("new")}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <span className="text-sm leading-none">+</span> Add card
            </button>
          </div>

          {/* Flip card with edit button */}
          {deckCards.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingCardIdx(cardIndex)}
                className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-2.5 py-1.5 text-label font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/25 hover:text-foreground"
                aria-label="Edit this card"
              >
                <Pencil size={11} /> Edit
              </button>
              <div className="card-scene" onClick={() => setCardFlipped((v) => !v)}>
                <div className={`card-inner ${cardFlipped ? "flipped" : ""}`}>
                  {/* Front */}
                  <div className="card-face border border-border bg-card px-8 py-10" style={{ minHeight: "200px" }}>
                    <div className="mb-5 text-label uppercase tracking-[0.28em] text-muted-foreground/60">
                      Concept {cardIndex + 1} of {deckCards.length}
                    </div>
                    <div className="font-serif text-[2.4rem] leading-[1.05] tracking-[-0.02em] text-foreground">
                      {deckCards[cardIndex].front}
                    </div>
                    <div className="mt-8 text-label text-muted-foreground/40">Tap to reveal</div>
                  </div>
                  {/* Back */}
                  <div className="card-back-face border border-border bg-muted/20 px-8 py-10" style={{ minHeight: "200px" }}>
                    <div className="mb-5 text-label uppercase tracking-[0.28em] text-muted-foreground/60">
                      Concept {cardIndex + 1} of {deckCards.length}
                    </div>
                    <p className="text-base leading-[1.8] text-foreground/90">{deckCards[cardIndex].back}</p>
                    <div className="mt-8 text-label text-muted-foreground/40">Tap to flip back</div>
                  </div>
                </div>
              </div>

              {/* Dot navigation */}
              <div className="mt-7 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevCard}
                  disabled={cardIndex === 0}
                  className="p-2 text-muted-foreground/40 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Previous card"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="flex items-center gap-2">
                  {deckCards.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCardIndex(i); setCardFlipped(false); }}
                      aria-label={`Card ${i + 1}`}
                      className="transition-all duration-200"
                    >
                      <span
                        className="block rounded-full transition-all duration-200"
                        style={{
                          width: i === cardIndex ? 18 : 6,
                          height: 6,
                          background: i === cardIndex ? "hsl(var(--foreground))" : "hsl(var(--border))",
                        }}
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextCard}
                  disabled={cardIndex === deckCards.length - 1}
                  className="p-2 text-muted-foreground/40 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Next card"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Save to deck / practice CTA */}
          <div className="mt-7 flex items-center gap-3">
            {(() => {
              const isSaved = deckSavedId !== null || savedDeck !== null;
              if (isSaved) {
                return (
                  <>
                    <span className="text-xs text-muted-foreground">
                      ✓ Saved · {deckCards.length} card{deckCards.length !== 1 ? "s" : ""}
                    </span>
                    {onViewFlashcards && (
                      <button
                        type="button"
                        onClick={onViewFlashcards}
                        className="text-xs font-medium text-foreground underline-offset-2 hover:underline transition-colors"
                      >
                        Practice now
                      </button>
                    )}
                  </>
                );
              }
              return (
                <button
                  type="button"
                  onClick={saveDeck}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  Save {deckCards.length} card{deckCards.length !== 1 ? "s" : ""} to study deck
                </button>
              );
            })()}
          </div>
        </section>

        {/* Next lesson teaser */}
        {nextLessonTitle && (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowLabel = tomorrow.toLocaleDateString("en-GB", { weekday: "long" });
          return (
            <div className="mb-10 mt-14 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Up next</span>
                <span className="flex items-center gap-1.5 text-label text-muted-foreground/60">
                  <Icon name="lock" size={11} />
                  Unlocks {tomorrowLabel}
                </span>
              </div>
              <div className="px-6 py-5">
                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground/55">
                  Lesson {lessonIndex + 2} · {course.topic}
                </div>
                <div className="font-serif text-xl leading-snug text-foreground">{nextLessonTitle}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Complete today’s reflection and this lesson unlocks tomorrow. Each one builds on the last.
                </p>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ── Audio player bar — sticky bottom, full width past sidebar ── */}
      {audioActive && (
        <div
          className="audio-player fixed bottom-0 right-0 z-40 border-t-2 border-border bg-card"
          style={{ left: signedIn ? "84px" : "0" }}
        >
          {/* Progress bar — vermilion fill */}
          <div className="h-[3px] bg-border">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${audioProgress * 100}%`, background: "var(--c-vermilion)" }}
            />
          </div>

          <div className="flex items-center gap-4 px-5 py-3.5 sm:px-8">
            {/* Lesson info */}
            <div className="min-w-0 flex-1">
              <div className="text-label uppercase tracking-[0.22em] text-muted-foreground">
                Lesson {selectedLessonIndex + 1} · {course.topic}
              </div>
              <div className="mt-0.5 truncate font-serif text-base leading-snug text-foreground">
                {selectedTitle}
              </div>
            </div>

            {/* Time */}
            <div className="hidden shrink-0 font-mono tabular-nums text-xs text-muted-foreground sm:block">
              {fmtTime(Math.round(audioProgress * audioDurationSec))} / {fmtTime(audioDurationSec)}
            </div>

            {/* Speed */}
            <div className="flex items-center gap-2.5">
              {[0.8, 1, 1.25, 1.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  className={`text-label font-medium transition-colors ${playbackRate === r ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                >
                  {r}×
                </button>
              ))}
            </div>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={toggleAudio}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-foreground/85"
            >
              {isPlaying
                ? <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} aria-hidden />
                : <Play className="h-4 w-4 translate-x-px" fill="currentColor" strokeWidth={0} aria-hidden />
              }
            </button>

            {/* Stop */}
            <button
              type="button"
              onClick={stopAudio}
              aria-label="Stop audio"
              className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground/50 transition hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Floating quote-save tooltip */}
      {quotePick && (
        <div
          style={{ position: "fixed", left: quotePick.x, top: quotePick.y - 48, transform: "translateX(-50%)", zIndex: 50 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={saveHighlight}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-float transition-opacity"
          >
            Save quote
          </button>
        </div>
      )}

      {/* Sources panel */}
      {showSources && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[1px]"
            onClick={() => setShowSources(false)}
          />
          <div className="sources-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col border-l border-border bg-card shadow-float">
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-border px-6 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Sources</div>
                <div className="mt-1 font-serif text-lg leading-snug text-foreground">{course.topic}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowSources(false)}
                className="mt-0.5 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close sources"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-3">
              <p className="text-label leading-relaxed text-muted-foreground">
                These references informed the lesson content. Curi synthesises ideas across sources — always read the originals for full context.
              </p>
            </div>

            {/* Source list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {getLessonSources(course.topic).map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3.5 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-foreground/20 hover:bg-card hover:shadow-soft"
                  >
                    {/* Domain initial avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-label font-semibold text-muted-foreground">
                      {source.name.replace(/^(The |A |An )/, "").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:underline">{source.name}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${
                          source.type === "Academic" ? "bg-muted text-foreground/70" :
                          source.type === "Primary source" ? "bg-amber-500/10 text-amber-700" :
                          "border border-border text-muted-foreground/70"
                        }`}>
                          {source.type}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{source.description}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-label text-muted-foreground/40">
                        <Globe2 className="h-2.5 w-2.5 shrink-0" aria-hidden />
                        <span className="truncate">{source.url.replace(/^https?:\/\//, "").split("/")[0]}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

function LessonImage({ topic }) {
  const visual = getLessonVisual(topic);
  return (
    <figure className="my-10 border-y border-border py-6">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-stretch">
        <div className="relative min-h-[220px] overflow-hidden rounded-[2rem] border border-border bg-muted/30">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-muted/25 to-brand-muted/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,hsl(218_72%_46%_/_0.1),transparent_42%)]" />
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-brand/25" />
          <div className="absolute bottom-8 right-8 h-32 w-32 rounded-t-full border border-border/70" />
          <div className="absolute bottom-10 left-8 right-8 grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-24 border-x border-border/50" />)}
          </div>
        </div>
        <figcaption className="flex flex-col justify-end border-l border-border pl-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Visual note</div>
          <div className="mt-3 font-serif text-3xl leading-tight text-foreground">{visual.imageTitle}</div>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{visual.imageCaption}</p>
        </figcaption>
      </div>
    </figure>
  );
}

function EquationBlock({ topic }) {
  const visual = getLessonVisual(topic);
  return (
    <div className="my-10 border-y border-border py-6 font-sans">
      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Working equation</div>
      <div className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] text-foreground">{visual.equation}</div>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{visual.formulaNote}</p>
    </div>
  );
}

function IdeaDiagram({ topic }) {
  return (
    <div className="my-10 border-y border-border py-6 font-sans">
      <div className="mb-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">Mental model</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">01</div>
          <div className="mt-2 font-medium">Definition</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The acronym, clause, metric, or phrase you need to recognise quickly.</p>
        </div>
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">02</div>
          <div className="mt-2 font-medium">Incentive</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The investor, founder, employee, or customer motivation that makes {topic.toLowerCase()} matter.</p>
        </div>
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">03</div>
          <div className="mt-2 font-medium">Decision</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The choice about runway, ownership, control, pricing, or fundraising this idea should improve.</p>
        </div>
      </div>
    </div>
  );
}

function ShareableFact({ topic, title }) {
  const item = getShareableFact(topic);
  const shareText = `Today I learned: ${item.fact} — from my Curi lesson on ${topic}.`;
  const encoded = encodeURIComponent(shareText);

  function copyShareText() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  }

  return (
    <aside className="my-12 border-y border-border py-7 font-sans">
      <div className="grid gap-7 lg:grid-cols-[0.34fr_1fr] lg:items-start">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Shareable fact</div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A small founder idea from today’s lesson, written to share.</p>
        </div>
        <div>
          <blockquote className="font-serif text-3xl leading-tight tracking-[-0.03em] text-foreground">
            "{item.fact}"
          </blockquote>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{item.reflection}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={copyShareText} className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90 depth-btn-primary">Share on X</button>
            <button onClick={copyShareText} className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground/80 hover:border-brand/40 hover:text-brand depth-btn-light">Share on LinkedIn</button>
            <button onClick={copyShareText} className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground/80 hover:border-brand/40 hover:text-brand depth-btn-light">Copy text</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Quiz({ title, answers, setAnswers, onComplete, onBack }) {
  const questions = [
    { q: "What is the lesson’s main distinction?", options: ["Definition and trade-off", "Speed and memory", "Talent and luck"] },
    { q: "What question turns this into founder judgment?", options: ["Who benefits if I misunderstand this?", "Who disagreed first?", "How long did it take?"] },
    { q: "What is Curi trying to reinforce?", options: ["Founder decision-making", "Loose startup content", "Daily competition"] }
  ];
  const complete = questions.every((_, index) => answers[index]);
  return (
    <Page className="items-center py-10">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to lesson
        </Button>

        <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reflection</p>
        <h1 className="mt-2 font-serif text-3xl font-normal leading-snug text-foreground sm:text-4xl">{title}</h1>

        <div className="mt-10 space-y-8">
          {questions.map((question, index) => (
            <div key={question.q} className="space-y-3">
              <p className="text-sm font-medium text-foreground leading-relaxed">{index + 1}. {question.q}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((previous) => ({ ...previous, [index]: option }))}
                    className={
                      answers[index] === option
                        ? "rounded-xl border-2 border-foreground bg-foreground px-4 py-3 text-left text-sm font-medium text-background transition-all duration-150"
                        : "rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left text-sm text-foreground/70 transition-all duration-150 hover:border-border hover:bg-card hover:text-foreground hover:-translate-y-0.5"
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">The point is not speed, but making the idea usable before a real decision.</p>
          <Button onClick={onComplete} disabled={!complete} className="w-full sm:w-auto sm:self-end" size="lg">
            {complete ? <>Complete lesson <ArrowRight className="h-4 w-4" aria-hidden /></> : "Answer all three to continue"}
          </Button>
        </div>
      </div>
    </Page>
  );
}

function Upgrade({ onClose, onUpgrade }) {
  const features = [
    { label: "Unlimited active learning paths", sub: "Free plan caps at 2 — follow more curiosities in parallel" },
    { label: "Full lesson archive", sub: "Return to any completed lesson from any path, any time" },
    { label: "Full learning analytics", sub: "Progress, streak history, and completion across all paths" },
    { label: "Advanced email preferences", sub: "Control timing, frequency, and format" },
    { label: "Completion certificate", sub: "Issued for every path you finish" },
  ];

  return (
    <Page className="items-center justify-center py-12">
      <div className="w-full max-w-lg px-6">
        {/* Close */}
        <div className="mb-12 flex justify-end">
          <IconButton onClick={onClose} aria-label="Close" variant="ghost" className="rounded-full border border-border/60">
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </IconButton>
        </div>

        {/* Eyebrow */}
        <SectionLabel icon="column" label="Curi Academy" />

        {/* Headline */}
        <h1 className="mt-5 font-serif text-5xl leading-[1.08] tracking-[-0.04em] text-foreground">
          Unlimited curiosity. Every path open.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Follow multiple curiosities in parallel. One lesson per path, every day — with your full history always accessible.
        </p>

        {/* Price hero */}
        <div className="mt-10 border-y border-border py-8">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[5.5rem] leading-[0.9] tracking-[-0.05em] text-foreground">$2.50</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-medium text-foreground/70">/ week</span>
              <span className="text-sm text-muted-foreground">billed as $10 / month</span>
            </div>
          </div>
          {/* Coffee anchor */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-label font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
              Less than a cup of coffee
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        {/* Feature checklist */}
        <ul className="mt-8 space-y-4">
          {features.map(({ label, sub }) => (
            <li key={label} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/60 bg-foreground/10">
                <Check className="h-2.5 w-2.5 stroke-[2.5] text-foreground/70" aria-hidden />
              </span>
              <span>
                <span className="text-sm font-medium leading-snug text-foreground">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{sub}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onUpgrade}
          className="mt-10 w-full rounded-full bg-primary px-6 py-4 text-base font-medium text-white transition-colors hover:bg-primary/90"
        >
          Start Academy — $2.50 a week
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground/70">
          Cancel anytime · No lock-in · Your progress stays
        </p>
      </div>
    </Page>
  );
}

function AuthFlow({ onComplete, onBack, pendingCourse, pendingQuizComplete }) {
  const DEMO_CODE = "123456";
  const KNOWN_EMAILS = ["awais@example.com"];

  const [step, setStep] = useState("email"); // "email" | "otp" | "name"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [codeError, setCodeError] = useState(false);

  const isPostQuiz = pendingCourse && pendingQuizComplete;
  const isReturning = KNOWN_EMAILS.includes(email.trim().toLowerCase());

  function handleSendCode(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setCode("");
    setCodeError(false);
    setStep("otp");
  }

  function handleVerifyCode(e) {
    e.preventDefault();
    if (code.trim() !== DEMO_CODE) {
      setCodeError(true);
      return;
    }
    setCodeError(false);
    if (isReturning) {
      onComplete({ email: email.trim() });
    } else {
      setStep("name");
    }
  }

  function handleCompleteName(e) {
    e.preventDefault();
    onComplete({ email: email.trim(), name: name.trim() || email.split("@")[0] });
  }

  const backLabel = step === "email" ? "Back" : "Back";
  const handleBack = step === "email" ? onBack : () => { setStep("email"); setCode(""); setCodeError(false); };

  return (
    <Page className="items-center py-10 sm:py-14">
      <div className="mx-auto w-full max-w-sm px-1">
        <Button variant="ghost" size="sm" className="mb-8 gap-1 px-0 text-muted-foreground hover:text-foreground" onClick={handleBack} type="button">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Button>

        {isPostQuiz ? (
          <div className="mb-8">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="h-5 w-5 text-emerald-600" aria-hidden />
            </div>
            <h1 className="font-serif text-3xl leading-snug text-foreground">Lesson 1 complete.</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Save your progress on <span className="font-medium text-foreground">{pendingCourse.topic}</span> and unlock lesson 2. Free — no password needed.
            </p>
          </div>
        ) : pendingCourse ? (
          <div className="mb-8">
            <h1 className="font-serif text-3xl leading-snug text-foreground">Save your path</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your <span className="font-medium text-foreground">{pendingCourse.topic}</span> path is ready. Create a free account to keep it — no password.
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="font-serif text-3xl leading-snug text-foreground">
              {step === "name" ? "What should we call you?" : "Welcome to Curi"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step === "email" && "Enter your email — we'll send a code. No password needed."}
              {step === "otp" && <>Check your inbox for a 6-digit code sent to <span className="font-medium text-foreground">{email}</span>.</>}
              {step === "name" && "You're all set after this."}
            </p>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-3">
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
            <Button type="submit" className="w-full" size="lg" disabled={!email.trim()}>
              Send code
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div className="grid gap-2">
              <Label>6-digit code</Label>
              <Input
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(false); }}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center text-lg tracking-widest"
              />
              {codeError && (
                <p className="text-xs text-red-500">That code doesn't match. For this demo, use <span className="font-mono font-semibold">123456</span>.</p>
              )}
              <p className="text-xs text-muted-foreground/70">Demo hint — code is <span className="font-mono font-medium">123456</span></p>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={code.length < 6}>
              {isPostQuiz ? "Verify & save progress" : "Verify code"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Wrong email?{" "}
              <button type="button" onClick={() => { setStep("email"); setCode(""); setCodeError(false); }} className="underline hover:text-foreground">
                Change it
              </button>
            </p>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleCompleteName} className="space-y-3">
            <Field label="Your name" value={name} onChange={setName} placeholder="First name" />
            <Button type="submit" className="w-full" size="lg">
              {isPostQuiz ? "Save progress & unlock lesson 2" : "Get started"}
            </Button>
          </form>
        )}
      </div>
    </Page>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  const id = React.useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" />
    </div>
  );
}

function SettingChips({ label, hint, value, onChange, options }) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const v = typeof opt === "string" ? opt : opt.value;
          const l = typeof opt === "string" ? opt : opt.label;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium leading-none transition-all ${
                value === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingToggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
          checked ? "bg-foreground" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Profile({ user, setUser, plan, streak, courses, onBack, onUpgrade, onBilling, onSignOut }) {
  const [tab, setTab] = useState("account");

  function update(field, value) {
    setUser((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <Page className="py-8 pb-10 sm:py-10">
      <div className="mx-auto w-full max-w-xl">

        {/* Top nav */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={onSignOut} type="button">
            Sign out
          </Button>
        </div>

        {/* Identity header */}
        <header className="mb-7 flex items-center gap-4">
          <Avatar className="h-14 w-14 shrink-0 rounded-xl border border-border/80 shadow-none">
            <AvatarFallback className="rounded-xl text-base font-medium">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xl font-semibold leading-none tracking-tight text-foreground">{user.name}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{user.email}</p>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          {/* ── Account ─────────────────────────────────────────── */}
          <TabsContent value="account" className="mt-5 flex flex-col gap-4">
            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription>Name and email used across Curi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Name" value={user.name} onChange={(value) => update("name", value)} />
                <Field label="Email" value={user.email} onChange={(value) => update("email", value)} type="email" />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-5">
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>Display preference for this device.</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingChips
                  label="Theme"
                  value={user.appTheme}
                  onChange={v => update("appTheme", v)}
                  options={["System", "Light", "Dark"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Learning ────────────────────────────────────────── */}
          <TabsContent value="learning" className="mt-5">
            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-5">
                <CardTitle className="text-base">How you explore</CardTitle>
                <CardDescription>Tell Curi how you think and it shapes every lesson around you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <label className="grid gap-2">
                  <span className="text-sm font-medium leading-none text-foreground">What are you working toward right now?</span>
                  <p className="text-xs leading-relaxed text-muted-foreground">Your current raise, role, or learning goal. Curi uses this to surface what matters most to you.</p>
                  <textarea
                    value={user.goal}
                    onChange={(event) => update("goal", event.target.value)}
                    rows={3}
                    className="min-h-[6rem] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    placeholder="e.g. Preparing for my first seed round, or understanding liquidation preferences before I sign"
                  />
                </label>
                <Separator />
                <SettingChips
                  label="How do you come to this?"
                  hint="Shapes which examples and framings Curi reaches for."
                  value={user.curiosityContext}
                  onChange={v => update("curiosityContext", v)}
                  options={["Pure curiosity", "For work or a project", "Building something", "Studying formally", "To teach someone else"]}
                />
                <Separator />
                <SettingChips
                  label="How far do you want to go?"
                  hint="Sets lesson length and how much ground each session covers."
                  value={user.lessonDepth}
                  onChange={v => update("lessonDepth", v)}
                  options={[
                    { value: "Quick", label: "A taste · ~2 min" },
                    { value: "Standard", label: "The essentials · ~5 min" },
                    { value: "Deep", label: "Full depth · ~10 min" },
                  ]}
                />
                <Separator />
                <SettingChips
                  label="How do ideas click for you?"
                  hint="How Curi sequences and introduces new concepts."
                  value={user.learningStyle}
                  onChange={v => update("learningStyle", v)}
                  options={["Through stories", "With real examples", "Build the model first", "Show what breaks"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Email ───────────────────────────────────────────── */}
          <TabsContent value="email" className="mt-5">
            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-5">
                <CardTitle className="text-base">Daily email</CardTitle>
                <CardDescription>Your lesson digest, delivered on your schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <SettingToggle
                  label="Send daily email"
                  hint="One email per day, covering all your active paths."
                  checked={user.emailEnabled}
                  onChange={v => update("emailEnabled", v)}
                />
                {user.emailEnabled && (
                  <>
                    <Separator />
                    <SettingChips
                      label="Delivery time"
                      value={user.emailTime}
                      onChange={v => update("emailTime", v)}
                      options={[
                        { value: "early-morning", label: "Early morning · 6 AM" },
                        { value: "morning",       label: "Morning · 8 AM" },
                        { value: "midday",        label: "Midday · 12 PM" },
                        { value: "afternoon",     label: "Afternoon · 3 PM" },
                        { value: "evening",       label: "Evening · 6 PM" },
                        { value: "night",         label: "Night · 9 PM" },
                      ]}
                    />
                    <Separator />
                    <SettingChips
                      label="Email format"
                      hint="How much lesson content to include."
                      value={user.emailFormat}
                      onChange={v => update("emailFormat", v)}
                      options={[
                        { value: "Full", label: "Full lesson" },
                        { value: "Summary", label: "Summary + open in app" },
                        { value: "Headlines", label: "Headlines only" },
                      ]}
                    />
                    <SettingToggle
                      label="Weekend delivery"
                      hint="Send lessons on Saturday and Sunday."
                      checked={user.emailWeekends}
                      onChange={v => update("emailWeekends", v)}
                    />
                  </>
                )}
                <Separator />
                <SettingToggle
                  label="Weekly digest"
                  hint="A summary of your week's learning, sent every Sunday."
                  checked={user.emailWeeklyDigest}
                  onChange={v => update("emailWeeklyDigest", v)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Plan ────────────────────────────────────────────── */}
          <TabsContent value="plan" className="mt-5 flex flex-col gap-4">
            <Card className="border-border/70 shadow-none">
              <CardHeader className="flex items-start justify-between gap-3 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">Your plan</CardTitle>
                  <CardDescription>
                    {plan === "paid" ? "Curi Academy · renews monthly" : "Free plan"}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="mt-0.5 shrink-0 font-normal">
                  {plan === "paid" ? "Academy" : "Free"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <span className="text-muted-foreground"><span className="font-medium text-foreground">{streak}</span> day streak</span>
                  <span className="text-muted-foreground"><span className="font-medium text-foreground">{courses.length}</span> active path{courses.length === 1 ? "" : "s"}</span>
                </div>
                <div className="space-y-2.5">
                  {plan === "free" ? (
                    <>
                      {[
                        { label: "Up to 2 active paths",  on: true },
                        { label: "Daily email digest",     on: true },
                        { label: "Lesson quizzes",         on: true },
                        { label: "Unlimited active paths", on: false, note: "Academy" },
                        { label: "Completion certificates",on: false, note: "Academy" },
                        { label: "Full progress analytics",on: false, note: "Academy" },
                      ].map(({ label, on, note }) => (
                        <div key={label} className="flex items-center gap-2.5 text-sm">
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${on ? "bg-foreground/10" : "bg-muted"}`}>
                            {on
                              ? <Check className="h-2.5 w-2.5 stroke-[2.5] text-foreground/60" aria-hidden />
                              : <span className="h-px w-2 bg-muted-foreground/30 block" />}
                          </span>
                          <span className={on ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                          {note && <span className="ml-auto text-label font-medium uppercase tracking-wider text-muted-foreground/50">{note}</span>}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        "Unlimited active paths",
                        "Full progress analytics",
                        "Completion certificates",
                        "Advanced email preferences",
                      ].map(label => (
                        <div key={label} className="flex items-center gap-2.5 text-sm">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                            <Check className="h-2.5 w-2.5 stroke-[2.5] text-foreground/60" aria-hidden />
                          </span>
                          <span className="text-foreground">{label}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row">
                {plan === "free" ? (
                  <Button className="w-full sm:w-auto" type="button" onClick={onUpgrade}>
                    Upgrade to Academy
                  </Button>
                ) : (
                  <Button className="w-full justify-center gap-2 sm:w-auto" type="button" onClick={onBilling}>
                    Billing & invoices
                    <ChevronRight className="h-4 w-4 opacity-70" aria-hidden />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </Page>
  );
}

function Billing({ plan, setPlan, onBack, onUpgrade }) {
  const invoices = [
    { id: "INV-2026-003", date: "May 2026", amount: "$10.00", status: plan === "paid" ? "Paid" : "Preview" },
    { id: "INV-2026-002", date: "April 2026", amount: "$10.00", status: plan === "paid" ? "Paid" : "Preview" },
    { id: "INV-2026-001", date: "March 2026", amount: "$10.00", status: "Preview" },
  ];

  return (
    <Page className="py-8 pb-10 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <Button variant="ghost" size="sm" className="mb-8 h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Profile
        </Button>

        <header className="mb-8">
          <SectionLabel icon="column" label="Billing" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Plan & invoices</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your subscription details and billing history.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Current plan</CardTitle>
              <CardDescription>What you have access to today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SummaryRow label="Plan" value={plan === "paid" ? "Curi Academy" : "Free"} />
              <SummaryRow label="Price" value={plan === "paid" ? "$10 / month" : "Free forever"} />
              <SummaryRow label="Active paths" value={plan === "paid" ? "Unlimited" : "Up to 2"} />
              {plan === "paid" && <SummaryRow label="Renews" value="1 June 2026" />}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row sm:flex-wrap">
              {plan === "paid" ? (
                <Button variant="outline" className="w-full sm:w-auto" type="button" onClick={() => setPlan("free")}>
                  Downgrade to Free
                </Button>
              ) : (
                <Button className="w-full sm:w-auto" type="button" onClick={onUpgrade}>
                  Upgrade to Academy
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Invoices</CardTitle>
              <CardDescription>Recent billing activity.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/80">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{invoice.id}</p>
                      <p className="text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums text-foreground">{invoice.amount}</p>
                      <p className="text-2xs uppercase tracking-wider text-muted-foreground">{invoice.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}


function Panel({ children, className = "" }) {
  return <div className={`rounded-xl border border-border/70 bg-muted/25 p-5 sm:p-6 ${className}`}>{children}</div>;
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 text-label font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
      {icon ? <Icon name={icon} size={14} className="shrink-0 text-muted-foreground/55" /> : null}
      <span>{label}</span>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name={icon} size={16} /> {label}</div>
      <div className="mt-4 font-serif text-3xl tracking-[-0.03em] text-foreground">{value}</div>
    </Panel>
  );
}

function LessonCompleteModal({ data, onClose }) {
  const { lessonTitle, courseTopic, lessonNumber, totalLessons, nextLessonTitle, newStreak } = data;
  const [copied, setCopied] = useState(false);

  const shareText = `Lesson ${lessonNumber} of ${totalLessons} done.\n\nJust read "${lessonTitle}" in my ${courseTopic} path on Curi.\n\nBuilding the knowledge most founders pick up reactively — one lesson at a time.\n\ncuri.app`;
  const tweetUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const liUrl     = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.app")}`;

  function copyText() {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(13,13,13,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="lesson-complete-modal w-full max-w-[480px] bg-card sm:mx-4" style={{ borderTop: "4px solid #C1121F" }}>

        {/* Lesson complete header */}
        <div className="px-7 pb-6 pt-7">
          <div className="mb-2 text-label uppercase tracking-[0.3em] text-muted-foreground">
            {courseTopic} · Lesson {lessonNumber} of {totalLessons}
          </div>
          <h2
            className="font-serif text-[2rem] leading-tight text-foreground"
            style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1", fontWeight: 300 }}
          >
            Lesson {lessonNumber} complete.
          </h2>
          <p
            className="mt-2 font-serif text-lg italic leading-snug text-foreground/55"
            style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}
          >
            {lessonTitle}
          </p>
          {newStreak > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <Flame className="h-4 w-4" aria-hidden />
              {newStreak}-day streak
            </div>
          )}
        </div>

        <div className="mx-7 h-px bg-border" />

        {/* Shareable card */}
        <div className="px-7 py-5">
          <div className="mb-4 text-label uppercase tracking-[0.28em] text-muted-foreground">Share your progress</div>

          {/* Preview of what gets shared */}
          <div className="mb-4 border border-border bg-muted/20 px-5 py-4">
            <div className="relative mb-2 inline-block">
              <span className="font-serif text-[15px] leading-none text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}>
                Cu<em className="italic">ri</em>
              </span>
              <span className="absolute left-0 right-0" style={{ bottom: "-2px", height: "2px", background: "var(--c-vermilion)" }} aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              Lesson {lessonNumber} of {totalLessons} done. Just read &ldquo;{lessonTitle}&rdquo; in my {courseTopic} path.
            </p>
            <p className="mt-3 text-label text-muted-foreground/50">curi.app</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-border bg-foreground px-4 py-2.5 text-xs font-medium text-background transition hover:bg-foreground/85"
            >
              Share on X
            </a>
            <a
              href={liUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-border px-4 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyText}
              className="inline-flex items-center border border-border px-4 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy text"}
            </button>
          </div>
        </div>

        {/* Tomorrow teaser */}
        {nextLessonTitle && (
          <>
            <div className="mx-7 h-px bg-border" />
            <div className="px-7 py-5">
              <div className="mb-3 text-label uppercase tracking-[0.28em] text-muted-foreground">Up next · Tomorrow</div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-serif text-base leading-snug text-foreground/50">
                    {nextLessonTitle}
                  </div>
                  <p className="mt-1.5 text-label text-muted-foreground/50">
                    Lesson {lessonNumber + 1} of {totalLessons} · ~5 min · unlocks tomorrow
                  </p>
                </div>
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
              </div>
            </div>
          </>
        )}

        {/* Close */}
        <div className="flex items-center justify-end border-t border-border px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-foreground transition hover:opacity-70"
          >
            Done
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

      </div>
    </div>
  );
}

function StreakMoment({ streak }) {
  return (
    <div
      className="streak-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-card px-5 py-4 shadow-float"
      style={{
        animation: "streak-pop 0.45s cubic-bezier(0.16,1,0.3,1) both"
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Flame size={16} aria-hidden />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Lesson complete — {streak}-day streak.</div>
          <div className="mt-0.5 text-xs text-muted-foreground">The point is not speed, but return.</div>
        </div>
      </div>
    </div>
  );
}

const icons = {
  arrow: ArrowRight,
  award: Award,
  book: BookOpen,
  chart: BarChart3,
  check: Check,
  clock: Clock3,
  column: Landmark,
  compass: Compass,
  flame: Flame,
  lens: Search,
  level: BarChart3,
  lock: Lock,
  spark: Sparkles,
  user: User,
  zoom: ZoomIn
};

function Icon({ name, size = 20, className = "" }) {
  const LucideIcon = icons[name] || BookOpen;
  return <LucideIcon aria-hidden="true" className={className} size={size} strokeWidth={1.8} />;
}

export {
  ArchiveQuiz,
  ArchivedCourseReader,
  AuthFlow,
  Billing,
  Browse,
  CourseComplete,
  CoursePathScreen,
  CoursePreviewModal,
  DailyEmailPreview,
  Dashboard,
  FlashcardScreen,
  Generating,
  LessonReader,
  LibraryScreen,
  PreviousCoursesPage,
  Profile,
  TodayFeed,
  Upgrade,
};
