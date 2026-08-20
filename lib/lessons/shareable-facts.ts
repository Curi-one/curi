export type ShareableFact = {
  fact: string;
  reflection: string;
};

const facts: Record<string, ShareableFact> = {
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

export function getShareableFact(topic: string): ShareableFact {
  return facts[topic] ?? facts.default;
}
