export type ShareableFact = {
  fact: string;
  reflection: string;
};

const facts: Record<string, ShareableFact> = {
  "Venture Capital": {
    fact: "Most VC fund returns are driven by a small number of outlier companies.",
    reflection:
      "That power-law reality explains why investors push for markets, growth rates, and outcomes that can return the fund.",
  },
  "Term Sheets": {
    fact: "The option pool is often negotiated into the pre-money valuation, which means founders can absorb more dilution than the headline valuation suggests.",
    reflection:
      "The valuation number is only one part of the deal. The option pool, preferences, and control terms determine the real shape of the round.",
  },
  "SAFE Notes": {
    fact: "Post-money SAFEs make it easier to calculate investor ownership at conversion, but they also make founder dilution more explicit.",
    reflection:
      "The simplicity of a SAFE is useful only if you understand the ownership math before the priced round arrives.",
  },
  "Cap Tables": {
    fact: "A cap table records ownership today and predicts how ownership changes under every future financing scenario.",
    reflection:
      "For founders, the cap table is a decision tool. It shows what each financing choice costs before the cost becomes permanent.",
  },
  "Business Models": {
    fact: "Two companies can sell the same product at the same price and be fundamentally different businesses once you look at margin structure.",
    reflection:
      "The business model — not the product — is usually what predicts whether a company compounds or plateaus.",
  },
  "Unit Economics": {
    fact: "A company can grow revenue quickly and still destroy value if each customer costs too much to acquire or serve.",
    reflection:
      "Revenue alone doesn't prove a business works. The unit underneath the revenue determines whether growth deserves more investment.",
  },
  "Fundraising": {
    fact: "Most raises are decided by momentum and social proof long before the first term sheet is drafted.",
    reflection:
      "Treating fundraising as a disciplined sales process — with qualified buyers and visible conversion points — makes the mystery disappear.",
  },
  "Burn Rate": {
    fact: "Runway is not just a cash number — it's the clock that decides how much leverage you have in your next raise.",
    reflection:
      "Every hiring, product, and go-to-market decision quietly moves that clock forward or back.",
  },
  "Founder Equity": {
    fact: "Your ownership percentage means less than the terms — vesting, preferences, control rights — sitting underneath it.",
    reflection:
      "Two founders with the same percentage can end up with very different outcomes once those terms are triggered.",
  },
  "Pricing Psychology": {
    fact: "Prices ending in .99 are processed by the brain as meaningfully cheaper than the round number just one cent above.",
    reflection:
      "A price is never just a number — it's a signal about quality, scarcity, and who the product is for.",
  },
  "Behavioral Economics": {
    fact: "Losses feel roughly twice as painful as equivalent gains feel good — a single asymmetry called loss aversion.",
    reflection:
      "Classical economics assumes a rational actor who weighs every option calmly. Real decisions are made by someone who doesn't.",
  },
  "Negotiation": {
    fact: "Most negotiations are decided by preparation before anyone sits down, not by performance once the talking starts.",
    reflection:
      "Knowing your BATNA — your real alternative — changes the entire shape of a conversation, even if you never mention it.",
  },
  default: {
    fact: "The expensive mistakes in business usually come from misunderstood incentives, not missing definitions.",
    reflection:
      "A good lesson should not just explain a term. It should make the next decision less reactive.",
  },
};

/** Lowercase, strip punctuation, collapse whitespace — for fuzzy topic matching. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const catalogue = Object.entries(facts)
  .filter(([key]) => key !== "default")
  .map(([key, value]) => ({ key, normalized: normalize(key), value }));

export function getShareableFact(topic: string): ShareableFact {
  const normalizedTopic = normalize(topic);
  if (!normalizedTopic) return facts.default;

  const exact = catalogue.find((e) => e.normalized === normalizedTopic);
  if (exact) return exact.value;

  const fuzzy = catalogue.find(
    (e) =>
      normalizedTopic.includes(e.normalized) ||
      e.normalized.includes(normalizedTopic),
  );
  return fuzzy ? fuzzy.value : facts.default;
}
