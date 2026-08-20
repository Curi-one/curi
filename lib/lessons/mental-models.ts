export type MentalModel = {
  surface: string;
  incentive: string;
  tradeoff: string;
};

const models: Record<string, MentalModel> = {
  "Venture Capital": {
    surface:
      "A pool of LP capital deployed into high-risk, high-return private companies by a fund with a fixed lifespan.",
    incentive:
      "Funds need a handful of category-defining outcomes to return capital — that pressure shapes every term and check size.",
    tradeoff:
      "Faster capital and network access in exchange for board seats, preferences, and pressure toward outlier growth.",
  },
  "Term Sheets": {
    surface:
      "A non-binding summary of the price and rights investors want before the binding legal documents are drafted.",
    incentive:
      "Investors want downside protection and control; founders want speed, valuation, and flexibility for the next round.",
    tradeoff:
      "Agreeing to preferences or control terms now can quietly change who benefits most in a down round or acquisition later.",
  },
  "SAFE Notes": {
    surface:
      "A simple agreement that converts into equity at a future priced round, using a valuation cap and/or discount.",
    incentive:
      "Founders want fast, cheap fundraising without setting a valuation; investors want early access at a discount.",
    tradeoff:
      "Speed and simplicity today in exchange for dilution math that stays uncertain until the priced round lands.",
  },
  "Cap Tables": {
    surface:
      "The spreadsheet of who owns what — founders, employees, investors, and every option or SAFE that could convert.",
    incentive:
      "Everyone on the table wants their slice protected or grown across every future financing event.",
    tradeoff:
      "Raising money or hiring senior talent grows the company but dilutes existing holders unless the pool is planned for.",
  },
  "Business Models": {
    surface:
      "The mechanism by which a company converts a product or service into repeatable, durable revenue.",
    incentive:
      "Investors and operators want a margin structure that gets healthier, not worse, as the company scales.",
    tradeoff:
      "Chasing revenue growth without a durable model can inflate the top line while eroding the business underneath it.",
  },
  "Unit Economics": {
    surface:
      "The revenue, cost, and margin of serving one customer — CAC, LTV, payback period, gross margin.",
    incentive:
      "Investors and operators want proof that growth adds value rather than just adding revenue.",
    tradeoff:
      "Chasing growth without healthy unit economics can look impressive short term while quietly destroying long-term value.",
  },
  "Fundraising": {
    surface:
      "A structured sales process where the buyers are investors and the product is the company's future.",
    incentive:
      "Founders want speed and price; investors want proof, timing, and comparable deal flow before committing.",
    tradeoff:
      "Optimizing for the fastest close can mean less diligence and looser terms than a longer, more competitive process.",
  },
  "Burn Rate": {
    surface:
      "The rate at which a company spends its cash reserves each month, net of revenue.",
    incentive:
      "Founders want enough runway to hit the next milestone; investors want capital spent efficiently toward that milestone.",
    tradeoff:
      "Spending faster can accelerate learning and growth, but it shortens the runway to raise the next round on strong terms.",
  },
  "Founder Equity": {
    surface:
      "The percentage of the company's ownership held by its founders, subject to vesting and future dilution.",
    incentive:
      "Founders want to protect ownership and control; investors and employees want equity that rewards commitment and results.",
    tradeoff:
      "Raising capital or hiring with equity grows the company's potential while shrinking each founder's percentage of it.",
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

const catalogue = Object.entries(models).map(([key, value]) => ({
  key,
  normalized: normalize(key),
  value,
}));

function fallbackModel(topic: string): MentalModel {
  return {
    surface:
      "The acronym, clause, metric, or phrase you need to recognise quickly.",
    incentive: `The investor, founder, employee, or customer motivation that makes ${topic.toLowerCase()} matter.`,
    tradeoff:
      "What you gain and what you give up when this concept shows up in a real company decision.",
  };
}

export function getMentalModel(topic: string): MentalModel {
  const normalizedTopic = normalize(topic);
  if (!normalizedTopic) return fallbackModel(topic);

  const exact = catalogue.find((e) => e.normalized === normalizedTopic);
  if (exact) return exact.value;

  const fuzzy = catalogue.find(
    (e) =>
      normalizedTopic.includes(e.normalized) ||
      e.normalized.includes(normalizedTopic),
  );
  return fuzzy ? fuzzy.value : fallbackModel(topic);
}
