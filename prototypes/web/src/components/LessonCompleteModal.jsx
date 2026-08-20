import React, { useMemo, useState } from "react";
import { ArrowRight, Flame, Lock } from "lucide-react";

// ── Insight pool ──────────────────────────────────────────────────────────────
const insightPool = {
  "Business Models": [
    {
      fact: "Two companies can sell the exact same product and be fundamentally different businesses underneath.",
      reflection: "The business model — how money actually moves, not what's being sold — is what determines whether a company compounds or plateaus.",
    },
    {
      fact: "The freemium model only works if free users either convert or make the paying users' experience better.",
      reflection: "Otherwise free users are just a cost centre wearing a growth metric's clothing.",
    },
    {
      fact: "Marketplaces live or die on take rate — charge too much and supply leaves, too little and the business can't sustain itself.",
      reflection: "Getting take rate right usually matters more than getting growth right in the first year.",
    },
  ],
  "Behavioral Economics": [
    {
      fact: "Classical economics assumes people make rational, self-interested decisions every time. They don't.",
      reflection: "The gap between that assumption and how people actually behave is where most of the useful business insight lives.",
    },
    {
      fact: "Losses feel roughly twice as painful as equivalent gains feel good.",
      reflection: "That single asymmetry — loss aversion — quietly shapes pricing, negotiation, and almost every decision involving risk.",
    },
    {
      fact: "People will work harder to avoid losing something they already have than to gain something equally valuable.",
      reflection: "The endowment effect explains why free trials, deposits, and 'already in your cart' work as well as they do.",
    },
  ],
  "Pricing Psychology": [
    {
      fact: "A price is never just a number — it's a signal about quality, scarcity, and who the product is for.",
      reflection: "Pricing too low doesn't just leave money on the table. It can make people trust the product less.",
    },
    {
      fact: "The first number someone sees in a negotiation or a price list anchors every number that follows.",
      reflection: "Whoever sets the anchor usually shapes the outcome, even when the anchor itself is arbitrary.",
    },
    {
      fact: "A three-tier pricing page often exists mainly to make the middle tier look like the obvious choice.",
      reflection: "Decoy options change what people choose without changing what's actually being offered.",
    },
  ],
  "Negotiation": [
    {
      fact: "Most negotiations are decided by preparation, not performance.",
      reflection: "Knowing your walk-away point — your BATNA — before you sit down matters more than anything said in the room.",
    },
    {
      fact: "Calibrated, open-ended questions get the other side to solve your problem for you.",
      reflection: "Asking 'how am I supposed to do that?' often works better than any counter-argument.",
    },
    {
      fact: "Naming an emotion out loud — 'it seems like this feels unfair' — tends to defuse it.",
      reflection: "Labelling tension directly is one of the simplest, most underused negotiation moves there is.",
    },
  ],
  default: [
    {
      fact: "The expensive business mistakes usually come from misunderstood incentives, not missing definitions.",
      reflection: "A good concept shouldn't just explain a term. It should change the decision you make the next time that term shows up in a real situation.",
    },
    {
      fact: "Most people are far more predictable than they think — biases and incentives explain more than personality does.",
      reflection: "The advantage of knowing this material early isn't sounding smart. It's recognising the pattern before it costs you a decision.",
    },
    {
      fact: "Knowledge that stays abstract rarely changes behaviour. Knowledge tied to a real decision usually does.",
      reflection: "The test of whether a lesson landed isn't whether you can define it — it's whether you'd decide differently next time.",
    },
  ],
};

function pickInsight(topic) {
  const pool = insightPool[topic] || insightPool.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────────────────────────────────────

export function LessonCompleteModal({ data, onClose }) {
  const { lessonTitle, courseTopic, lessonNumber, totalLessons, nextLessonTitle, newStreak, cardsSaved } = data;
  const [copied, setCopied] = useState(false);

  // Pick once per modal mount — new pick each completion
  const insight = useMemo(() => pickInsight(courseTopic), [courseTopic]);

  const shareText = `Today I learned:\n\n"${insight.fact}"\n\n— from my ${courseTopic} path on Curi.\n\ncuri.app`;
  const tweetUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const liUrl     = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.app")}`;

  function copyText() {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(13,13,13,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="lesson-complete-modal w-full max-w-[480px] bg-card sm:mx-4" style={{ borderTop: "4px solid #C1121F" }}>

        {/* Header */}
        <div className="px-7 pb-6 pt-7">
          <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {courseTopic} · Lesson {lessonNumber} of {totalLessons}
          </div>
          <h2
            className="font-serif text-[2rem] leading-tight text-foreground"
            style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1", fontWeight: 300 }}
          >
            Lesson {lessonNumber} complete.
          </h2>
          <p
            className="mt-2 font-serif text-lg italic leading-snug text-foreground/55"
            style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}
          >
            {lessonTitle}
          </p>
          {newStreak > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <Flame className="h-4 w-4" aria-hidden />
              {newStreak}-day streak
            </div>
          )}
          {cardsSaved > 0 && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {cardsSaved} review card{cardsSaved !== 1 ? "s" : ""} saved for tomorrow — they&apos;ll show up in Review after today&apos;s lesson.
            </p>
          )}
        </div>

        <div className="mx-7 h-px bg-border" />

        {/* Variable insight */}
        <div className="px-7 py-5">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Today's insight
          </div>
          <blockquote
            className="font-serif text-xl leading-snug tracking-[-0.02em] text-foreground"
            style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1", fontWeight: 300 }}
          >
            "{insight.fact}"
          </blockquote>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {insight.reflection}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border bg-foreground px-4 py-2.5 text-xs font-medium text-background transition hover:bg-foreground/85 depth-btn-primary"
            >
              Share on X
            </a>
            <a
              href={liUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground depth-btn-light"
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyText}
              className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground depth-btn-light"
            >
              {copied ? "Copied!" : "Copy text"}
            </button>
          </div>
        </div>

        {/* Tomorrow teaser */}
        {nextLessonTitle && (
          <>
            <div className="mx-7 h-px bg-border" />
            <div className="px-7 py-5">
              <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Up next · Tomorrow</div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-serif text-base leading-snug text-foreground/50">
                    {nextLessonTitle}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/50">
                    Lesson {lessonNumber + 1} of {totalLessons} · ~5 min · unlocks tomorrow
                  </p>
                </div>
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
              </div>
            </div>
          </>
        )}

        {/* Close */}
        <div className="flex items-center justify-end border-t border-border px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-foreground transition hover:opacity-70"
          >
            Done
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

      </div>
    </div>
  );
}

export default LessonCompleteModal;
