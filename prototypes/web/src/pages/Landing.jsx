import React, { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  depthPills,
  HEADLINE_TOPICS,
  TOPIC_SUGGESTIONS,
} from "@/data/onboarding-data";

const QUICK_BATCH = 4;
const QUICK_CYCLE = 4000;
const FADE_DURATION = 280;

function Page({ children, className = "", style }) {
  return (
    <section className={`curi-animate-in flex flex-1 flex-col ${className}`} style={style}>
      {children}
    </section>
  );
}

export function Landing({ topic, setTopic, onSubmit, onTopicSelect }) {
  const topicInputRef = useRef(null);
  const [headlineText, setHeadlineText] = useState("");
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [typePhase, setTypePhase] = useState("typing");
  const [cursorOn, setCursorOn] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickVisible, setQuickVisible] = useState(true);

  const quickBatches = Math.ceil(TOPIC_SUGGESTIONS.length / QUICK_BATCH);
  const quickTopics = TOPIC_SUGGESTIONS.slice(
    quickIdx * QUICK_BATCH,
    (quickIdx + 1) * QUICK_BATCH
  );

  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const target = HEADLINE_TOPICS[headlineIdx];
    if (typePhase === "typing") {
      if (headlineText.length < target.length) {
        const id = setTimeout(
          () => setHeadlineText(target.slice(0, headlineText.length + 1)),
          58
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setTypePhase("deleting"), 2400);
      return () => clearTimeout(id);
    }
    if (headlineText.length > 0) {
      const id = setTimeout(() => setHeadlineText((t) => t.slice(0, -1)), 32);
      return () => clearTimeout(id);
    }
    setHeadlineIdx((i) => (i + 1) % HEADLINE_TOPICS.length);
    setTypePhase("typing");
  }, [headlineText, headlineIdx, typePhase]);

  useEffect(() => {
    if (quickBatches <= 1) return;
    const id = setInterval(() => {
      setQuickVisible(false);
      setTimeout(() => {
        setQuickIdx((b) => (b + 1) % quickBatches);
        setQuickVisible(true);
      }, FADE_DURATION);
    }, QUICK_CYCLE);
    return () => clearInterval(id);
  }, [quickBatches]);

  return (
    <Page className="landing-page pt-10 pb-10 sm:pt-16 sm:pb-14">
      <div className="mx-auto w-full max-w-xl px-5 sm:px-6">
        <div className="landing-stack">
          <div className="mb-9 sm:mb-11">
            <p
              className="mb-4 flex items-center gap-2 text-label font-semibold uppercase tracking-[0.09em]"
              style={{ color: "var(--c-ink-4)" }}
            >
              <span className="landing-pulse-dot h-1.5 w-1.5 rounded-full bg-[#C1121F]" aria-hidden />
              Personalized learning paths
            </p>

            <h1
              className="font-serif text-[2.6rem] font-normal tracking-[-0.025em] text-foreground sm:text-[3.2rem]"
              style={{ lineHeight: 1.1 }}
            >
              Explore
              <br />
              <em className="italic">
                {headlineText}
                <span
                  className="ml-px inline-block w-[2px]"
                  style={{
                    height: "0.82em",
                    background: "#C1121F",
                    opacity: cursorOn ? 1 : 0,
                    transition: "opacity 80ms",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                  aria-hidden
                />
              </em>
            </h1>

            <p
              className="mt-6 text-[15px] leading-[1.7]"
              style={{ color: "var(--c-ink-3)" }}
            >
              Type any topic and get a path built for you.
              <br className="hidden sm:block" />
              You choose the depth — one lesson a day.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mb-3">
            <div
              className="flex cursor-text items-center gap-3 rounded-2xl px-5 py-[15px] transition-colors duration-200"
              style={{
                background: inputFocused
                  ? "hsl(var(--foreground) / 0.045)"
                  : "var(--c-surface)",
              }}
              onMouseDown={(e) => {
                if (e.target.closest("button")) return;
                topicInputRef.current?.focus();
              }}
            >
              <input
                ref={topicInputRef}
                id="landing-topic"
                type="text"
                data-slot="input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="What do you want to learn..."
                className="landing-topic-input min-w-0 flex-1 border-0 bg-transparent text-[17px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
                autoComplete="off"
                autoFocus
                aria-label="What do you want to explore?"
              />
              <button
                type="submit"
                disabled={!topic.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all duration-150 hover:scale-[1.07] active:scale-95 disabled:opacity-20"
                aria-label="Start exploring"
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>

          <div className="landing-trust flex flex-wrap items-center gap-x-4 gap-y-1 pl-1">
            {depthPills.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-caption"
                style={{ color: "var(--c-ink-4)" }}
              >
                <Icon className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <p
              className="mb-2.5 text-label font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--c-ink-4)", opacity: 0.55 }}
            >
              Or try
            </p>
            <div
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                opacity: quickVisible ? 1 : 0,
                transition: `opacity ${FADE_DURATION}ms ease`,
              }}
            >
              {quickTopics.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onTopicSelect(suggestion)}
                  className="landing-chip-suggest shrink-0 rounded-full px-3.5 py-2 text-ui transition-colors active:scale-[0.97]"
                  style={{
                    color: "var(--c-ink-3)",
                    background: "hsl(var(--foreground) / 0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--c-ink)";
                    e.currentTarget.style.background = "hsl(var(--foreground) / 0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--c-ink-3)";
                    e.currentTarget.style.background = "hsl(var(--foreground) / 0.04)";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default Landing;
