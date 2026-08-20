import { magazineLessons } from "@/data/course-data";

export const DEV_EXTRA_TOPICS = [
  "Revenue Models", "Product-Market Fit", "Market Sizing", "Go-to-Market Metrics",
  "Customer Discovery", "Metrics Hygiene", "Game Theory", "Network Effects",
  "Founder Resilience", "Time Management", "Cognitive Biases", "Risk Tolerance",
  "Persuasion Tactics", "Influence & Authority", "Storytelling for Business", "Customer Segmentation",
  "Conflict Resolution", "Team Dynamics", "Workplace Motivation", "Behavioral Design",
  "Loss Aversion", "Anchoring Effects", "Social Proof", "Scarcity Tactics",
  "Mental Models", "First Principles Thinking", "Opportunity Cost", "Game-Theoretic Pricing",
  "Brand Loyalty", "Word of Mouth", "Viral Growth", "Retention Psychology",
  "Onboarding Psychology", "Trust & Credibility", "Consumer Behaviour", "Buyer Personas",
  "Emotional Intelligence", "Cognitive Load", "Attention Economics", "Choice Architecture",
  "Status & Signaling", "Reciprocity", "Commitment & Consistency", "Framing Effects",
  "Heuristics & Biases", "Prospect Theory", "Sunk Cost Fallacy", "Confirmation Bias",
  "Groupthink", "Herd Behaviour", "Market Timing", "Competitive Moats",
  "Pricing Experiments", "Customer Lifetime Value", "Churn Psychology", "Negotiation Tactics",
];

export function devGenLessons(topic) {
  const found = magazineLessons[topic];
  if (found) return found;
  return Array.from({ length: 8 }, (_, i) => `${topic}: Module ${i + 1}`);
}

export function makeDevActiveCourses(topics) {
  return topics.map((topic, i) => ({
    id: `dev-active-${topic.replace(/\s+/g, "-").toLowerCase()}`,
    topic,
    aspect: "Core concepts and mental models",
    level: ["Intro", "Standard", "Deep dive"][i % 3],
    progress: Math.max(1, Math.floor(devGenLessons(topic).length * [0.15, 0.35, 0.6, 0.8][i % 4])),
    lessons: devGenLessons(topic),
    ...(i % 6 === 5 ? { bookAuthor: ["Daniel Kahneman", "Robert Cialdini", "Richard Thaler", "Rob Fitzpatrick"][Math.floor(i / 6) % 4] } : {}),
  }));
}

export function makeDevCompletedCourses(topics) {
  const timeLabels = [
    "Completed today", "Completed yesterday", "Completed 3 days ago",
    "Completed last week", "Completed 2 weeks ago", "Completed last month",
    "Completed 2 months ago", "Completed 3 months ago",
  ];
  return topics.map((topic, i) => ({
    id: `dev-completed-${topic.replace(/\s+/g, "-").toLowerCase()}`,
    topic,
    completedOn: timeLabels[i % timeLabels.length],
    certificate: i % 3 !== 0,
    lessons: devGenLessons(topic),
    insight: `Finished ${devGenLessons(topic).length} lessons on ${topic}.`,
  }));
}

export function makeDevPausedCourses(topics) {
  const timeLabels = [
    "Shelved 2 days ago", "Shelved last week", "Shelved 9 days ago",
    "Shelved last month", "Shelved 6 weeks ago",
  ];
  return topics.map((topic, i) => ({
    id: `dev-paused-${topic.replace(/\s+/g, "-").toLowerCase()}`,
    type: "abandoned",
    topic,
    progress: Math.max(1, Math.floor(devGenLessons(topic).length * [0.1, 0.25, 0.4][i % 3])),
    level: "Shelved",
    abandonedOn: timeLabels[i % timeLabels.length],
    lessons: devGenLessons(topic).slice(0, 7),
  }));
}

export const DEV_NEW_USER_ACTIVE  = ["Business Models", "Behavioral Economics", "Unit Economics"];
export const DEV_POWER_ACTIVE     = ["Business Models", "Behavioral Economics", "Unit Economics", "Pricing Psychology", "Negotiation", "Customer Psychology", "Competitive Strategy", "Sales Psychology"];
export const DEV_POWER_COMPLETED  = ["Marketing Psychology", "Branding & Positioning", "Decision-Making & Risk", "Habit Formation", "Leadership Psychology", "Money Psychology", "Game Theory", "Network Effects", "Cognitive Biases", "Persuasion Tactics"];
export const DEV_POWER_PAUSED     = ["Risk Tolerance", "Storytelling for Business", "Customer Segmentation", "Market Sizing", "Mental Models"];
export const DEV_STRESS_ACTIVE    = Object.keys(magazineLessons).concat(DEV_EXTRA_TOPICS.slice(0, 12));
export const DEV_STRESS_COMPLETED = DEV_EXTRA_TOPICS.slice(0, 50);
export const DEV_STRESS_PAUSED    = DEV_EXTRA_TOPICS.slice(12, 32);

/**
 * Seed flashcard decks for dev modes.
 * SM-2 state: ease (default 2.5), interval (days), reps, due (timestamp).
 * daysUntilDue: negative = overdue, 0 = due today, positive = future.
 */
export function makeDevCardSets(mode) {
  const DAY = 24 * 60 * 60 * 1000;
  const now  = Date.now();

  function card(id, front, back, reps = 0, ease = 2.5, interval = 0, daysUntilDue = 0) {
    return { id, front, back, ease, interval, reps, due: now + daysUntilDue * DAY };
  }

  // ── Power user: 47-day streak, paid plan — three mature decks ──────────────
  if (mode === "power-user") {
    return [
      {
        id: "dev-deck-bm",
        sourceId: "dev-active-business-models",
        name: "Business Models",
        cards: [
          card("bm-1", "Take rate", "The percentage a marketplace keeps from each transaction. Too high and supply leaves; too low and the business can't sustain itself. Most healthy marketplaces land between 10–30%.", 9, 2.8, 30, 12),
          card("bm-2", "Platform vs pipeline", "A pipeline creates value in a linear chain (make → sell). A platform creates value by connecting producers and consumers and lets them transact directly.", 8, 2.7, 25, 5),
          card("bm-3", "Why freemium works (or doesn't)", "Free users must either convert at a reasonable rate or make the product better for paying users (more liquidity, more content). Otherwise they're just a cost.", 7, 2.6, 21, -1),
          card("bm-4", "Bundling logic", "Bundling makes sense when the combined value feels larger than the sum of parts, or when it simplifies a confusing decision. Unbundling makes sense when one part is clearly superior alone.", 6, 2.7, 18, -2),
          card("bm-5", "What 'build once, sell many' means", "Software's marginal cost of serving one more customer is near zero, which is why software margins can be much higher than physical-goods margins.", 5, 2.5, 12, 3),
          card("bm-6", "Network effects vs economies of scale", "Economies of scale make a product cheaper as you grow. Network effects make a product more valuable as more people use it. The second is usually the more durable advantage.", 3, 2.5, 6, 0),
        ],
      },
      {
        id: "dev-deck-be",
        sourceId: "dev-active-behavioral-economics",
        name: "Behavioral Economics",
        cards: [
          card("be-1", "Loss aversion", "Losses feel roughly twice as painful as equivalent gains feel good. This is why 'don't lose your streak' motivates more than 'gain a point.'", 8, 2.9, 25, 8),
          card("be-2", "The endowment effect", "People value things more once they own them. Free trials and 'already in your cart' work because giving something up feels like a loss, not a missed gain.", 7, 2.7, 20, -1),
          card("be-3", "Anchoring", "The first number presented shapes every judgment that follows, even when that number is arbitrary or irrelevant.", 6, 2.6, 15, 4),
          card("be-4", "Mental accounting", "People treat money differently depending on its source or intended use, even though a dollar is a dollar. A 'bonus' gets spent differently than a 'salary.'", 5, 2.6, 12, -3),
          card("be-5", "Sunk cost fallacy", "Past investment shouldn't affect a future decision, but it almost always does. The question to ask is always: knowing what I know now, would I start this today?", 4, 2.5, 8, 2),
          card("be-6", "Present bias", "People consistently overvalue immediate rewards relative to future ones, even when they know the future reward is objectively better.", 3, 2.5, 6, 0),
          card("be-7", "Default effects", "Whatever option requires no action from the user is the option most people end up with. Defaults are one of the most powerful — and most overlooked — design levers.", 2, 2.5, 3, 1),
        ],
      },
      {
        id: "dev-deck-neg",
        sourceId: "dev-active-negotiation",
        name: "Negotiation",
        cards: [
          card("neg-1", "BATNA", "Your Best Alternative to a Negotiated Agreement. Knowing it before you sit down is what actually creates leverage, not posture.", 4, 2.5, 8, 2),
          card("neg-2", "Calibrated questions", "Open-ended questions starting with 'how' or 'what' get the other side to solve your problem for you, instead of you arguing your position.", 3, 2.5, 5, 0),
          card("neg-3", "Labelling emotions", "Naming the tension out loud — 'it seems like this feels unfair' — tends to defuse it rather than escalate it.", 2, 2.5, 3, 1),
          card("neg-4", "Anchoring in negotiation", "Whoever names the first number shapes the range of the entire conversation, even if the other side rejects the number outright.", 0, 2.5, 0, 0),
        ],
      },
    ];
  }

  // ── Library stress: 89-day streak, paid — six decks at various SR stages ───
  if (mode === "library-stress") {
    return [
      {
        id: "dev-stress-be",
        sourceId: null,
        name: "Behavioral Economics",
        cards: [
          card("sbe-1", "Loss aversion",        "Losses feel roughly twice as painful as equivalent gains feel good — the single biggest driver of risk-averse decisions.",                          12, 3.1, 45, 20),
          card("sbe-2", "Endowment effect",      "People value what they already own more than they'd pay to acquire it fresh — explains why free trials and deposits work.",                       10, 2.9, 35, 9),
          card("sbe-3", "Choice overload",       "Past a certain number of options, more choice reduces the odds someone chooses at all, rather than helping them choose better.",                     8, 2.7, 21, 3),
          card("sbe-4", "Hyperbolic discounting", "People discount future rewards disproportionately fast the further away they are — explains procrastination and under-saving.",                    7, 2.8, 20, 2),
          card("sbe-5", "Confirmation bias",     "People seek and weigh evidence that confirms what they already believe, and discount evidence that doesn't.",                                          5, 2.6, 14, -2),
          card("sbe-6", "Availability heuristic", "People judge how likely something is by how easily examples come to mind, not by actual frequency.",                                                  4, 2.4, 10, -4),
        ],
      },
      {
        id: "dev-stress-pp",
        sourceId: "dev-active-pricing-psychology",
        name: "Pricing Psychology",
        cards: [
          card("pp-1", "Charm pricing",          "Prices ending in 9 (e.g. $9.99) are processed as meaningfully cheaper than the round number just above, even though the gap is a cent.",                6, 2.6, 16, 3),
          card("pp-2", "Decoy pricing",          "A deliberately unattractive middle option makes the option you want chosen look like the obvious good deal by comparison.",                       5, 2.5, 12, 0),
          card("pp-3", "The pain of paying",     "Cash hurts more than a card, and a card hurts more than an auto-renewing subscription — the less visible the payment, the less friction it creates.",   4, 2.5, 10, -1),
          card("pp-4", "Price framing",          "Splitting a price into smaller recurring units ('just $2/day') makes the same total feel smaller than presenting it as one lump sum.",                 3, 2.4, 7, 1),
          card("pp-5", "Willingness to pay",     "The real number is rarely what people say in a survey — it's closer to what they've actually paid for something comparable in the past.",                 2, 2.5, 4, 2),
        ],
      },
      {
        id: "dev-stress-ue",
        sourceId: "dev-active-unit-economics",
        name: "Unit Economics",
        cards: [
          card("ue-1", "LTV / CAC ratio",         "Above 3× = healthy. Below 1× = losing money on every customer. Below 3× = growth probably unsustainable at scale.",                                 8, 2.8, 24, 11),
          card("ue-2", "Gross vs contribution margin", "Gross margin = revenue − COGS. Contribution margin also subtracts variable acquisition costs. Use contribution margin for true per-unit economics.",   7, 2.7, 18, 4),
          card("ue-3", "CAC payback period",       "Months to recover CAC from gross profit. Under 12 months = excellent. Over 24 months = capital-intensive, needs a strong narrative.",                              5, 2.5, 12, -1),
          card("ue-4", "Net revenue retention",     "Revenue from existing customers at period end ÷ start, including expansion, contraction, and churn. Above 100% means existing customers alone grow the business.", 4, 2.6, 9, -3),
          card("ue-5", "Contribution margin vs profit", "A positive contribution margin means each sale covers its own variable cost — the business can still be unprofitable overall if fixed costs are high.",            2, 2.5, 3, 1),
        ],
      },
      {
        id: "dev-stress-cs",
        sourceId: "dev-active-competitive-strategy",
        name: "Competitive Strategy",
        cards: [
          card("cs-1", "The seven powers",      "Scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, process power — the seven sources of durable advantage.", 4, 2.5, 9, -5),
          card("cs-2", "Counter-positioning",   "Winning by adopting a model incumbents won't copy because doing so would damage their existing business.",      3, 2.4, 7, -5),
          card("cs-3", "Switching costs",       "The harder and more costly it is to leave, the more pricing power a business earns over its existing customers.",           2, 2.5, 4, -4),
          card("cs-4", "Blue ocean strategy",   "Compete by making rivals irrelevant in an uncontested space, instead of beating them in an existing one.",                                     2, 2.5, 3, -4),
          card("cs-5", "Game theory basics",    "The best move depends on what you expect the other player to do next — strategy without anticipating a response usually backfires.",                 1, 2.5, 1, -3),
          card("cs-6", "Moat durability",       "Not all advantages last. Patents expire, brands fade, scale gets matched — the strongest moats compound rather than stay static.",        1, 2.5, 1, 0),
        ],
      },
      {
        id: "dev-stress-lp",
        sourceId: "dev-active-leadership-psychology",
        name: "Leadership Psychology",
        cards: [
          card("lp-1", "Psychological safety",  "Teams that feel safe admitting mistakes and disagreeing outperform teams that feel safe but agree on everything.",  4, 2.5, 8, 2),
          card("lp-2", "Radical candour",       "Caring personally and challenging directly aren't opposites — the best feedback does both at once.", 3, 2.5, 5, 0),
          card("lp-3", "Fear of conflict",      "Teams that avoid disagreement don't have fewer problems — they just surface later and more expensively.", 2, 2.5, 3, 1),
          card("lp-4", "Authority without power", "Influence without formal authority comes from trust built over many small exchanges, not from a single ask.", 0, 2.5, 0, 0),
        ],
      },
      {
        id: "dev-stress-custom",
        sourceId: null,
        name: "My own notes",
        cards: [
          card("my-1", "Why people say no without saying no", "'Let me think about it', 'send me more info', 'maybe next quarter' = soft rejection. A real yes usually comes with a specific next step.", 3, 2.5, 6, 0),
          card("my-2", "BATNA in everyday decisions",          "Knowing your real alternative changes every conversation. Without one, you negotiate from anxiety instead of leverage.", 1, 2.5, 1, 2),
          card("my-3", "What a flat outcome signals",             "When a deal lands at the same terms as last time despite changed circumstances, it usually means one side didn't push — worth noticing which side that was.", 0, 2.5, 0, 0),
        ],
      },
    ];
  }

  return [];
}

export const DEV_MODES = [
  { id: "empty",          label: "Empty",          desc: "Signed out, no data" },
  { id: "new-user",       label: "New user",        desc: "3 paths · streak 3" },
  { id: "power-user",     label: "Power user",      desc: "8 active · 10 completed · streak 47" },
  { id: "library-stress", label: "Library stress",  desc: `${Object.keys(magazineLessons).length + 12} active · 50 completed · 20 paused` },
  { id: "daily-email",    label: "Daily email",     desc: "Morning lesson email preview" },
  { id: "course-complete", label: "Course complete", desc: "Completion · certificate · next path" },
  { id: "admin-dashboard", label: "Admin dashboard", desc: "Users, billing, content management" },
];
