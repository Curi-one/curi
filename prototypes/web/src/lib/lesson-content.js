import { defaultLessons } from "@/lib/lesson-utils";

export function getLessonTakeaways(topic) {
  return [
    `Every founder concept has a definition on the surface and an incentive, cost, or control trade-off underneath.`,
    `${topic} becomes useful when it changes what you notice before you sign, spend, hire, or pitch.`,
    `Ask not only "what does this mean?" but "what decision does this change, and who benefits if I misunderstand it?"`,
  ];
}

export function getLessonCards(topic) {
  return [
    { front: "Definition", back: "The literal meaning of the term — useful, but not enough to make a good founder decision." },
    { front: "Incentive", back: `The investor, employee, customer, or founder motivation that makes ${topic} matter in practice.` },
    { front: "Trade-off", back: "The thing you gain and the thing you give up when this concept shows up in a real company decision." },
    { front: "Cost of confusion", back: "The equity, runway, leverage, or control you can lose when you understand the word but miss the economics." },
    { front: "Network gap", back: "What top accelerator founders often learn through their network, and what Curi makes explicit." },
    { front: "The better question", back: `Not "what is ${topic}?" but "what decision does ${topic} change, and who benefits if I get it wrong?"` },
  ];
}

export function getSocraticPrompt(topic, index) {
  const prompts = [
    `Where could misunderstanding ${topic} cost you equity, runway, or leverage?`,
    `What would you ask an investor or lawyer after today's lesson on ${topic}?`,
    `Which part of ${topic} would you need to explain clearly in a partner meeting?`,
    `What decision in your company would change if you understood ${topic} better?`,
    `What assumption about ${topic} do first-time technical founders usually make too quickly?`,
  ];
  return prompts[index % prompts.length];
}

export function getSuggestedPaths(topic) {
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

export function getLessonSources(topic) {
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
