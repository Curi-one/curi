export type LessonVisual = {
  imageTitle: string;
  imageCaption: string;
  equation?: string;
  formulaNote?: string;
};

const visuals: Record<string, LessonVisual> = {
  "Unit Economics": {
    imageTitle: "Contribution before scale",
    imageCaption:
      "Revenue growth without unit contribution is just a more expensive way to fail. The unit is the real story.",
    equation: "Healthy Growth = Margin × Retention ÷ CAC",
    formulaNote:
      "Revenue is only impressive when the unit underneath it can eventually pay for acquisition, service, and expansion.",
  },
  "Venture Capital": {
    imageTitle: "Power law in one glance",
    imageCaption:
      "Most returns come from a handful of outcomes. That pressure shapes every term you will see.",
    equation: "VC Fit = Scale × Speed × Outcome Size",
    formulaNote:
      "Venture capital works only when the company can plausibly return a fund. That incentive explains far more investor behaviour than taste or optimism.",
  },
  "Term Sheets": {
    imageTitle: "Clauses as incentives",
    imageCaption:
      "Every clause looks standard until you map who gains if the company underperforms.",
    equation: "Deal Quality = Economics + Control + Future Flexibility",
    formulaNote:
      "A high valuation can still be an expensive deal if the control terms, option pool, or liquidation stack quietly shift the outcome.",
  },
  "SAFE Notes": {
    imageTitle: "Simple paper, delayed ownership",
    imageCaption:
      "Caps, discounts, MFN clauses, and post-money math become real when the priced round converts them into equity.",
    equation: "SAFE Impact = Cap + Discount + Round Price",
    formulaNote:
      "A SAFE postpones valuation, but it does not postpone dilution. The ownership trade is already being made.",
  },
  "Cap Tables": {
    imageTitle: "The ownership map of the company",
    imageCaption:
      "Founders, employees, investors, SAFEs, options, and future rounds all sit on one table that determines incentives and outcomes.",
    equation: "Ownership Today + Financing Tomorrow = Control Later",
    formulaNote:
      "The cap table is not accounting trivia. It is the operating system for incentives, dilution, and who gets paid.",
  },
  "Fundraising": {
    imageTitle: "A sales process with one buyer type",
    imageCaption:
      "Investor fit, timing, scarcity, proof, diligence, and close mechanics decide whether a raise becomes a round.",
    equation: "Round Momentum = Fit × Proof × Process",
    formulaNote:
      "Fundraising feels mysterious until you treat it as a disciplined process with qualified buyers and visible conversion points.",
  },
  "Burn Rate": {
    imageTitle: "Runway as strategic oxygen",
    imageCaption:
      "Every hiring, product, and GTM decision changes the clock behind the company and the leverage in your next raise.",
    equation: "Runway = Cash ÷ Net Burn",
    formulaNote:
      "Burn rate is not just spend. It is the rate at which your company converts cash into learning, growth, and optionality.",
  },
  "Founder Equity": {
    imageTitle: "The ownership you trade for speed",
    imageCaption:
      "Splits, vesting, option pools, dilution, preferences, and control rights decide what founder ownership actually means.",
    equation: "Founder Outcome = Ownership × Terms × Exit Value",
    formulaNote:
      "Your percentage matters, but the terms around that percentage often decide the real economic result.",
  },
};

const DEFAULT_VISUAL: LessonVisual = {
  imageTitle: "A decision map for the concept",
  imageCaption:
    "Every business concept has a definition on the surface and a decision, incentive, or trade-off underneath.",
};

/** Lowercase, strip punctuation, collapse whitespace — for fuzzy topic matching. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const catalogue = Object.entries(visuals).map(([key, value]) => ({
  key,
  normalized: normalize(key),
  value,
}));

function findVisual(topic: string): LessonVisual | null {
  const normalizedTopic = normalize(topic);
  if (!normalizedTopic) return null;

  const exact = catalogue.find((e) => e.normalized === normalizedTopic);
  if (exact) return exact.value;

  const fuzzy = catalogue.find(
    (e) =>
      normalizedTopic.includes(e.normalized) ||
      e.normalized.includes(normalizedTopic),
  );
  return fuzzy?.value ?? null;
}

export function getLessonVisual(topic: string): LessonVisual {
  return findVisual(topic) ?? DEFAULT_VISUAL;
}

/** True only for topics with a curated visual — never for the generic default. */
export function hasLessonVisual(topic: string): boolean {
  return findVisual(topic) !== null;
}
