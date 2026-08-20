import { depthOptions } from "@/data/onboarding-data";
import { magazineLessons } from "@/data/course-data";
import { BROWSE_CATEGORIES, BOOK_PATHS } from "@/data/browse-data";

export function defaultLessons(topic, aspect) {
  return [
    `Why ${topic} Matters More Than It First Appears`,
    `The Vocabulary That Unlocks ${topic}`,
    `The First Mental Model Behind ${topic}`,
    `What Most People Get Wrong About ${topic}`,
    `${aspect || "One Key Angle"}: The Lens That Changes the Decision`,
    `Where Beginners Usually Misread ${topic}`,
    `The Incentives Hidden Inside ${topic}`,
    `A Real Business Decision Where ${topic} Shows Up`,
    `The Mistake That Makes ${topic} Expensive`,
    `How to Explain ${topic} Clearly to Someone Else`,
    `What to Ask Before You Rely on Anything Involving ${topic}`,
    `How ${topic} Connects to the Way You Already Think`,
    `A Practical Checklist for ${topic}`,
    `What You Should Be Able to Decide After Learning ${topic}`
  ];
}

export function durationForDepth(level) {
  return depthOptions.find((option) => option.name === level)?.duration || 14;
}

export function buildCourseLessons(topic, aspect, level, context) {
  const exact = Object.keys(magazineLessons).find((key) => key.toLowerCase() === topic.trim().toLowerCase());
  const base = exact ? magazineLessons[exact] : defaultLessons(topic || "your topic", aspect);
  const duration = durationForDepth(level);

  const extras = [
    `The Question That Makes ${topic} Worth Taking Seriously`,
    `A Map of the Whole Territory Around ${topic}`,
    `The First Misunderstanding Worth Avoiding`,
    `How ${topic} Changes When Seen Through ${aspect || "Your Chosen Angle"}`,
    `The Incentive Hidden Inside ${topic}`,
    `A Case Study That Makes the Trade-Off Concrete`,
    `The Numbers, Signals, and Conversations Around ${topic}`,
    `Where Reasonable People Disagree About ${topic}`,
    `How to Use ${topic} in a Real Business Decision`,
    `The Tension Beneath ${topic} That Most People Miss`,
    `The Pattern That Keeps Reappearing Around ${topic}`,
    `A Deeper Reading List for ${topic}`,
    `How ${topic} Connects to Leverage and Optionality`,
    `The Limits of the Standard Advice`,
    `What You Should Be Able to Explain to Someone Else Now`,
    `The Next Decision to Carry Forward`
  ];

  const personalized = [
    context?.curiosityReason ? `Why ${context.curiosityReason.toLowerCase()} Is a Strong Way Into ${topic}` : null,
    context?.desiredOutcome ? `${context.desiredOutcome}: A Practical Frame for ${topic}` : null,
    context?.learningStyle ? `${context.learningStyle}: Learning ${topic} in Your Preferred Way` : null
  ].filter(Boolean);

  return [...base, ...personalized, ...extras].slice(0, duration);
}

export function getLessonsForSubject(name) {
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

export const COURSE_SUMMARIES = {
  "Business Models": "Two companies can sell the same product and be completely different businesses underneath. This path explains revenue models, margin structure, marketplaces, bundling, and why some business models compound while others plateau.",
  "Unit Economics": "Revenue does not prove a business works. Unit economics show whether each customer eventually produces durable value. This path covers CAC, LTV, gross margin, payback, retention, and the model worth trusting before you scale.",
  "Pricing Psychology": "A price is never just a number — it's a signal. This path explains anchoring, charm pricing, decoys, willingness to pay, and how to design prices people don't argue with.",
  "Behavioral Economics": "Classical economics assumes a rational actor who doesn't exist. This path covers loss aversion, the endowment effect, mental accounting, sunk costs, and the biases that quietly shape every decision.",
  "Negotiation": "Most negotiations are decided by preparation, not performance. This path covers BATNA, anchoring, calibrated questions, leverage, and how to close without either side feeling like they lost.",
  "Marketing Psychology": "Features don't sell — transformations do. This path covers attention, framing, social proof, scarcity, positioning, and why simple messages outperform clever ones.",
  "Customer Psychology": "Nobody buys a product — they hire it to do a job. This path covers Jobs to Be Done, the Mom Test, motivation, friction, and how to turn conversations into evidence you can act on.",
  "Branding & Positioning": "Positioning means owning a space in someone's mind before they ever compare you. This path covers competitive alternatives, differentiation, naming, and why positioning beats a better product more often than founders admit.",
  "Decision-Making & Risk": "Humans handle uncertainty badly and predictably. This path covers fast vs slow thinking, overconfidence, base rates, reversible vs irreversible decisions, and how to decide well under pressure.",
  "Habit Formation": "Some products become daily rituals; most get deleted after a week. This path covers the habit loop, triggers, variable rewards, and the ethics of designing for return visits.",
  "Competitive Strategy": "Strategy is choice, not aspiration. This path covers durable competitive advantage, network effects, switching costs, game theory, and choosing where to compete before choosing how to win.",
  "Leadership Psychology": "Title doesn't make a leader — choosing people does. This path covers psychological safety, radical candour, trust, conflict, and the psychology behind teams that perform under pressure.",
  "Sales Psychology": "People buy on emotion and justify with logic afterward. This path covers objection handling, social proof, buying signals, and how to sell without sounding like you're selling.",
  "Money Psychology": "Financial decisions are rarely rational. This path covers loss aversion, mental accounting, the pain of paying, sunk costs, and building a healthier relationship with risk and spending.",
  "Venture Capital": "Venture capital is not generic startup money. It is a financing model with specific return requirements, fund timelines, partner incentives, and power-law expectations. This path teaches technical first-time founders how VC investors think before, during, and after the first institutional raise.",
  "Term Sheets": "A term sheet is where the investor relationship becomes real. This path explains valuation, option pools, liquidation preferences, pro-rata rights, governance, and negotiation so first-time founders know what they are agreeing to before the legal documents arrive.",
  "SAFE Notes": "SAFEs feel simple until they convert. This path explains post-money math, caps, discounts, MFN clauses, pro-rata rights, stacked SAFEs, and priced-round conversion so founders can understand dilution before it becomes permanent.",
  "Cap Tables": "A cap table is not just a spreadsheet. It is the map of ownership, incentives, dilution, and outcomes across every financing scenario. This path teaches founders how to read and model the table before signing terms that reshape it.",
  "Fundraising": "Fundraising is a sales process with a specific buyer and high stakes. This path covers investor fit, outreach, first meetings, process management, diligence, term sheets, and close mechanics for founders raising without a top-tier accelerator network.",
  "Dilution": "Dilution is the price of financing growth. This path explains how founder ownership changes across SAFEs, priced rounds, option pools, and future scenarios.",
};

export function getCourseSummary(subject) {
  if (COURSE_SUMMARIES[subject.name]) return COURSE_SUMMARIES[subject.name];
  return `${subject.description} This path builds from definitions into real decisions, the incentives underneath them, and the trade-offs that matter once something is actually on the line.`;
}
