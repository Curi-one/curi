import { Clock3, BookOpen, SlidersHorizontal } from "lucide-react";

export const depthOptions = [
  { name: "Intro", duration: 7, description: "The essentials, clearly explained. Everything you need to understand this topic and talk about it confidently." },
  { name: "Standard", duration: 14, description: "From foundations to nuance. The full mental model, with the details that separate people who truly know this from those who've just skimmed it." },
  { name: "Deep dive", duration: 30, description: "Every angle, every edge case, every debate. The depth that makes you the most informed person in the room on this topic." }
];

export const depthPills = [
  { label: "3 min/day", icon: Clock3 },
  { label: "Any topic", icon: BookOpen },
  { label: "Adaptive depth", icon: SlidersHorizontal },
];

export const curiosityReasons = ["Pure curiosity", "Preparing for something", "For work or a project", "Building foundations", "To teach someone else"];
export const learningOutcomes = ["Build a solid mental model", "Be able to apply it right away", "Understand the vocabulary", "See where people go wrong", "Think more clearly about it"];
export const teachingStyles = ["Through stories", "With real examples", "Build the model first", "Show what breaks"];

/** Cycling word in landing headline — founder beachhead */
export const landingHeadlineSubjects = [
  "term sheets",
  "SAFE notes",
  "cap tables",
  "venture capital",
  "unit economics",
  "liquidation preferences",
  "founder dilution",
  "investor meetings",
];

/** Synced 1-to-1 with landingHeadlineSubjects */
export const landingLessonPeeks = [
  { firstLesson: "What a Term Sheet Actually Is — and What It Isn't", text: "A term sheet is where the investor relationship becomes real. Most founders sign clauses they don't understand because the document arrived before the vocabulary did." },
  { firstLesson: "What a SAFE Is and Why It Replaced Convertible Notes", text: "SAFEs feel simple until they convert. The ownership trade is already being made — it just shows up later, at the priced round." },
  { firstLesson: "What a Cap Table Is and Why It Matters From Day One", text: "A cap table is not just a spreadsheet. It is the map of ownership, incentives, and outcomes across every financing scenario you'll face." },
  { firstLesson: "Why Venture Capital Exists — and When It Makes Sense to Take It", text: "Venture capital is not generic startup money. It is a financing model with specific return requirements, timelines, and power-law expectations." },
  { firstLesson: "CAC and LTV: The Two Numbers That Decide Whether a Business Works", text: "Revenue does not prove a startup works. Unit economics show whether each customer eventually produces durable value — and investors know the difference." },
  { firstLesson: "Liquidation Preferences: Who Gets Paid First in an Exit", text: "Liquidation preferences decide who gets paid first when the company sells. Founder ownership percentage is not the same as founder payout." },
  { firstLesson: "How SAFEs and Convertible Notes Appear on the Table", text: "Every instrument you issue is a future claim on your cap table. Model what you've signed before the priced round arrives and the numbers are fixed." },
  { firstLesson: "The First Meeting: What Investors Are Actually Evaluating", text: "Investor meetings are structured evaluations of market, insight, traction, and risk — not casual updates on your progress." },
];

export const HEADLINE_TOPICS = [
  "term sheets",
  "SAFE notes",
  "cap tables",
  "venture capital",
  "unit economics",
  "liquidation preferences",
  "founder dilution",
  "investor meetings",
];

export const TOPIC_SUGGESTIONS = [
  "Venture Capital",
  "Term Sheets",
  "SAFE Notes",
  "Cap Tables",
  "Unit Economics",
  "Fundraising",
  "Liquidation preferences",
  "How dilution actually works",
];

export const landingSuggestions = [
  {
    topic: "Venture Capital",
    hook: "How VC funds work and what first-time founders need to know before the first institutional round",
    firstLesson: "Why Venture Capital Exists — and When It Makes Sense to Take It",
    lessons: 14,
  },
  {
    topic: "Term Sheets",
    hook: "Valuation, preferences, and governance — the clauses that become real when you sign",
    firstLesson: "What a Term Sheet Actually Is — and What It Isn't",
    lessons: 14,
  },
  {
    topic: "SAFE Notes",
    hook: "Simple until they convert. The ownership math founders need before the priced round",
    firstLesson: "What a SAFE Is and Why It Replaced Convertible Notes",
    lessons: 14,
  },
  {
    topic: "Unit Economics",
    hook: "CAC, LTV, payback — the customer-level math investors expect you to understand",
    firstLesson: "CAC and LTV: The Two Numbers That Decide Whether a Business Works",
    lessons: 14,
  },
];

export const LANDING_PLACEHOLDER_TOPICS = HEADLINE_TOPICS;
export const LANDING_QUICK_PICKS = TOPIC_SUGGESTIONS;
