export function topicSwatch(topic) {
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

/** Deterministic warm cover color from topic string */
export function topicCoverColor(topic) {
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
export function topicInitials(topic) {
  const words = topic.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return topic.slice(0, 2).toUpperCase();
}

export const lessonVisuals = {
  "Venture Capital": {
    imageTitle: "A fund as a pressure system",
    imageCaption: "LP money, fund timelines, power-law outcomes, and partner incentives all shape the conversation before you enter the room.",
    equation: "VC Fit = Scale × Speed × Outcome Size",
    formulaNote: "Venture capital works only when the company can plausibly return a fund. That incentive explains far more investor behaviour than taste or optimism."
  },
  "Term Sheets": {
    imageTitle: "The deal before the documents",
    imageCaption: "Valuation, option pool, preferences, control rights, and pro-rata provisions are different levers on the same future company.",
    equation: "Deal Quality = Economics + Control + Future Flexibility",
    formulaNote: "A high valuation can still be an expensive deal if the control terms, option pool, or liquidation stack quietly shift the outcome."
  },
  "Unit Economics": {
    imageTitle: "The business inside each customer",
    imageCaption: "CAC, payback, gross margin, churn, and expansion decide whether growth creates value or only consumes capital.",
    equation: "Healthy Growth = Margin × Retention ÷ CAC",
    formulaNote: "Revenue is only impressive when the unit underneath it can eventually pay for acquisition, service, and expansion."
  },
  "SAFE Notes": {
    imageTitle: "Simple paper, delayed ownership",
    imageCaption: "Caps, discounts, MFN clauses, and post-money math become real when the priced round converts them into equity.",
    equation: "SAFE Impact = Cap + Discount + Round Price",
    formulaNote: "A SAFE postpones valuation, but it does not postpone dilution. The ownership trade is already being made."
  },
  "Cap Tables": {
    imageTitle: "The ownership map of the company",
    imageCaption: "Founders, employees, investors, SAFEs, options, and future rounds all sit on one table that determines incentives and outcomes.",
    equation: "Ownership Today + Financing Tomorrow = Control Later",
    formulaNote: "The cap table is not accounting trivia. It is the operating system for incentives, dilution, and who gets paid."
  },
  "Fundraising": {
    imageTitle: "A sales process with one buyer type",
    imageCaption: "Investor fit, timing, scarcity, proof, diligence, and close mechanics decide whether a raise becomes a round.",
    equation: "Round Momentum = Fit × Proof × Process",
    formulaNote: "Fundraising feels mysterious until you treat it as a disciplined process with qualified buyers and visible conversion points."
  },
  "Burn Rate": {
    imageTitle: "Runway as strategic oxygen",
    imageCaption: "Every hiring, product, and GTM decision changes the clock behind the company and the leverage in your next raise.",
    equation: "Runway = Cash ÷ Net Burn",
    formulaNote: "Burn rate is not just spend. It is the rate at which your company converts cash into learning, growth, and optionality."
  },
  "Founder Equity": {
    imageTitle: "The ownership you trade for speed",
    imageCaption: "Splits, vesting, option pools, dilution, preferences, and control rights decide what founder ownership actually means.",
    equation: "Founder Outcome = Ownership × Terms × Exit Value",
    formulaNote: "Your percentage matters, but the terms around that percentage often decide the real economic result."
  },
  default: {
    imageTitle: "A founder decision map",
    imageCaption: "Every startup concept has a definition on the surface and a decision, incentive, or trade-off underneath.",
    equation: "Founder Judgment = Concept × Context × Consequence",
    formulaNote: "A term becomes useful when you can use it to make a better decision under pressure."
  }
};

export function getLessonVisual(topic) {
  return lessonVisuals[topic] || lessonVisuals.default;
}

export const shareableFacts = {
  "Venture Capital": {
    fact: "Most VC fund returns are driven by a small number of outlier companies.",
    reflection: "That power-law reality explains why investors push for markets, growth rates, and outcomes that can return the fund.",
    tag: "venture-capital"
  },
  "Term Sheets": {
    fact: "The option pool is often negotiated into the pre-money valuation, which means founders can absorb more dilution than the headline valuation suggests.",
    reflection: "The valuation number is only one part of the deal. The option pool, preferences, and control terms determine the real shape of the round.",
    tag: "term-sheets"
  },
  "Unit Economics": {
    fact: "A company can grow revenue quickly and still destroy value if each customer costs too much to acquire or serve.",
    reflection: "Investors look beneath revenue because the unit underneath the revenue determines whether growth deserves more capital.",
    tag: "unit-economics"
  },
  "SAFE Notes": {
    fact: "Post-money SAFEs make it easier to calculate investor ownership at conversion, but they also make founder dilution more explicit.",
    reflection: "The simplicity of a SAFE is useful only if you understand the ownership math before the priced round arrives.",
    tag: "safe-notes"
  },
  "Cap Tables": {
    fact: "A cap table records ownership today and predicts how ownership changes under every future financing scenario.",
    reflection: "For founders, the cap table is a decision tool. It shows what each financing choice costs before the cost becomes permanent.",
    tag: "cap-tables"
  },
  default: {
    fact: "The expensive startup mistakes usually come from misunderstood incentives, not missing definitions.",
    reflection: "A good founder lesson should not just explain a term. It should make the next decision less reactive.",
    tag: "founder-knowledge"
  }
};

export function getShareableFact(topic) {
  return shareableFacts[topic] || shareableFacts.default;
}
