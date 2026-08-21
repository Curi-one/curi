import type {
  AnchorStyle,
  JargonHandling,
  LearningProfile,
  LessonLength,
  Rigor,
  SeqOpen,
} from "@/lib/profile/learning-profile";

export type PreviewTopicKey = "fundraising" | "gametheory" | "dyson";

export type PreviewTopic = {
  label: string;
  tag: string;
  title: string;
  hooks: Record<AnchorStyle, string>;
  landscape: string;
  definition: string;
  core: string;
  deeper: string;
  edge: string;
  harder: string;
  glossary: string;
};

export const PREVIEW_TOPICS: Record<PreviewTopicKey, PreviewTopic> = {
  fundraising: {
    label: "Fundraising",
    tag: "Startup finance · SAFEs",
    title: "How a SAFE converts to equity",
    hooks: {
      example:
        "A startup raises $200k on a SAFE with a $5M cap. At the next priced round, that $200k converts into shares as if the company were valued at $5M, not whatever the new round actually prices it at.",
      data: "A $5M cap and a 20% discount sound like the same deal until you run the numbers: at a $10M priced round, the cap wins for the investor by a wide margin, and that gap is the whole mechanism.",
      story:
        "An investor writes a $200k cheque on a napkin-simple contract, months before the company has a valuation at all. A year later, a priced round finally puts a number on the company, and that old cheque has to be translated into real shares.",
      analogy:
        "A SAFE works like a coupon you bank now and redeem later: you don't know today what a share will be worth, but the cap locks in the best price you're guaranteed when the bill finally comes.",
    },
    landscape:
      "Before the mechanics: a SAFE isn't equity yet, it's a promise that becomes equity at the next priced round, and everything else follows from that one fact.",
    definition:
      "A SAFE, a Simple Agreement for Future Equity, is a contract that converts into shares later rather than pricing them today.",
    core: "Two numbers usually govern the conversion: the valuation cap and the discount rate. The cap sets a ceiling on the price used to convert the cheque into shares. The discount gives a flat percentage off whatever the new round prices at. At conversion, the investor gets whichever number is better for them.",
    deeper:
      "Stack several SAFEs from different rounds, and the order they convert in starts to matter for exactly how much of the company gets set aside before the priced round's investors even show up.",
    edge: "Where this gets messy: if a company raises several SAFEs at different caps, the earliest, cheapest cap usually converts most favourably, which can surprise later investors when they see how much of the round the early SAFEs quietly claimed.",
    harder:
      "Two SAFEs, a $4M cap and a $6M cap, and a priced round at $12M. Which SAFE converts into more shares per dollar invested, and why?",
    glossary:
      "Priced round: the round where the company's shares finally get an actual dollar value, unlike a SAFE.",
  },
  gametheory: {
    label: "Game theory",
    tag: "Game theory · Equilibria",
    title: "The Nash equilibrium",
    hooks: {
      example:
        "Two gas stations sit across the street from each other. Each prices low enough to match the other, because raising prices alone just sends every customer across the road. Neither can improve by moving alone, that's the equilibrium.",
      data: "In the classic prisoner's dilemma, both players confessing gets each of them 5 years, worse than the 1 year they'd get by both staying silent, yet confessing is what the numbers say each should individually do.",
      story:
        "John Nash spent barely a page proving something that reshaped economics: that in almost any competitive situation, there's a point where every player is doing the best they can, given what everyone else is doing.",
      analogy:
        "A Nash equilibrium is like a parking lot at rush hour: no single car can find a better spot by moving, even though the whole arrangement is far from anyone's ideal.",
    },
    landscape:
      "Zoom out first: game theory studies situations where your best move depends on someone else's move, and a Nash equilibrium is the point where nobody can do better by switching alone.",
    definition:
      "A Nash equilibrium is a set of choices, one per player, where no one can improve their own outcome by changing their choice alone.",
    core: "The key is that 'no one can improve alone' doesn't mean the outcome is good. Both players in the prisoner's dilemma would prefer mutual silence, but silence isn't stable: each can always do better for themselves by confessing, regardless of the other's move. That instability is exactly what an equilibrium rules out.",
    deeper:
      "Some situations have more than one equilibrium, and which one a group lands on can depend on history or convention, not on the payoffs alone. That's the gap between an equilibrium existing and knowing which one you'll get.",
    edge: "Where intuition breaks: an equilibrium can leave everyone worse off than some other outcome, and still be perfectly stable, because no single player has a unilateral reason to move away from it.",
    harder:
      "If firm A cuts its price and firm B doesn't respond, is that necessarily a Nash equilibrium? What would have to be true about firm B's best response for it to count?",
    glossary:
      "Payoff: the outcome, often a number, a player receives for a given combination of choices.",
  },
  dyson: {
    label: "James Dyson",
    tag: "Biography · James Dyson",
    title: "5,127 prototypes",
    hooks: {
      example:
        "Dyson built 5,126 failed prototypes of a bagless vacuum before the 5,127th one worked, funding the run by selling his house and living off his wife's income as a painting teacher.",
      data: "Fifteen years passed between Dyson's first prototype and the first Dyson vacuum reaching shelves, a gap most founders would read as a case for quitting years earlier.",
      story:
        "James Dyson noticed his own vacuum losing suction as its bag clogged with dust, and instead of buying a new one, spent the next decade and a half trying to build one that didn't need a bag at all.",
      analogy:
        "Dyson's approach reads like debugging taken to an extreme: change one small thing, test, note what broke, change one more thing, five thousand times over.",
    },
    landscape:
      "The broader arc first: Dyson's story is less about a single invention and more about what fifteen years of iteration on one stubborn problem actually looks like from the inside.",
    definition:
      "Cyclonic separation, the idea Dyson chased, spins air fast enough that dust gets flung out by force alone, no bag required.",
    core: "What's easy to miss is that most of those 5,126 attempts weren't wild swings, they were small, deliberate changes to one variable at a time: the angle of a cone, the speed of the spin. Progress looked more like engineering iteration than sudden inspiration.",
    deeper:
      "The eventual licensing deal was almost as unlikely as the invention: rejected by every major manufacturer with a bagged-vacuum business to protect, Dyson ended up building and selling the machine himself.",
    edge: "Where the popular version oversimplifies: it wasn't 5,127 uniform failures in a row. Early prototypes solved the core problem fairly fast, most of the remaining years went into making that solution manufacturable and affordable.",
    harder:
      "If cyclonic separation worked in rough form fairly early on, what does that suggest the remaining thousands of prototypes were actually for?",
    glossary:
      "Cyclonic separation: using spinning air to fling dust out by force, instead of trapping it in a bag.",
  },
};

export const PREVIEW_TOPIC_KEYS = Object.keys(
  PREVIEW_TOPICS,
) as PreviewTopicKey[];

export const LENGTH_CAPTION: Record<LessonLength, string> = {
  short: "~2 min",
  medium: "~5 min",
  long: "~10 min",
};

export type PreviewRender = {
  tag: string;
  title: string;
  gloss: string | null;
  glossInline: boolean;
  p1: string;
  p2: string | null;
  p3: string | null;
  extraTag: string | null;
  extraText: string | null;
};

function opening(topic: PreviewTopic, profile: LearningProfile): string {
  const hook = topic.hooks[profile.anchor];
  if (profile.seq === "broad") return `${topic.landscape} ${hook}`;
  if (profile.seq === "definition") return `${topic.definition} ${hook}`;
  return hook;
}

export function renderPreviewLesson(
  topicKey: PreviewTopicKey,
  profile: LearningProfile,
): PreviewRender {
  const topic = PREVIEW_TOPICS[topicKey];
  const gloss =
    profile.jargon === "always"
      ? topic.glossary
      : profile.jargon === "unusual"
        ? `(${topic.glossary.split(":")[0]}, briefly: ${topic.glossary.split(":")[1]?.trim() ?? ""})`
        : null;

  let extraTag: string | null = null;
  let extraText: string | null = null;
  if (profile.rigor === "edges") {
    extraTag = "Where it gets messy";
    extraText = topic.edge;
  } else if (profile.rigor === "harder") {
    extraTag = "Before you go";
    extraText = topic.harder;
  }

  return {
    tag: topic.tag,
    title: topic.title,
    gloss,
    glossInline: profile.jargon === "unusual",
    p1: opening(topic, profile),
    p2: profile.length !== "short" ? topic.core : null,
    p3: profile.length === "long" ? topic.deeper : null,
    extraTag,
    extraText,
  };
}

export const SEQ_OPTIONS: { value: SeqOpen; label: string }[] = [
  { value: "broad", label: "Broad picture first" },
  { value: "definition", label: "Plain definition first" },
  { value: "straight", label: "Straight into the example" },
];

export const ANCHOR_OPTIONS: { value: AnchorStyle; label: string }[] = [
  { value: "example", label: "Real-world examples" },
  { value: "data", label: "Numbers & data" },
  { value: "story", label: "Stories about people" },
  { value: "analogy", label: "Comparisons to what you know" },
];

export const LENGTH_OPTIONS: { value: LessonLength; label: string }[] = [
  { value: "short", label: "Short · ~2 min" },
  { value: "medium", label: "Medium · ~5 min" },
  { value: "long", label: "Long · ~10 min" },
];

export const RIGOR_OPTIONS: { value: Rigor; label: string }[] = [
  { value: "clean", label: "Keep it clean" },
  { value: "edges", label: "Flag edge cases" },
  { value: "harder", label: "Push me harder" },
];

export const JARGON_OPTIONS: { value: JargonHandling; label: string }[] = [
  { value: "always", label: "Always define them" },
  { value: "unusual", label: "Only the unusual ones" },
  { value: "skip", label: "Skip it, I'll look it up" },
];
