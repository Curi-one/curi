"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Clock3,
  SlidersHorizontal,
} from "lucide-react";
import { LandingHeadline } from "@/components/LandingHeadline";
import { Wordmark } from "@/components/Wordmark";
import { FOUNDER_TOPIC_SUGGESTIONS } from "@/lib/content/founder-catalogue";
import { getMe } from "@/lib/api/client";

const AUTH_TODAY = "/auth?intent=signin&returnTo=%2Ftoday";
const SIGNUP_TODAY = "/auth?intent=signup&returnTo=%2Ftoday";

const QUICK_BATCH = 4;
const QUICK_CYCLE = 4000;
const FADE_DURATION = 280;

const DEPTH_TEASERS = [
  { label: "3 min/day", icon: Clock3 },
  { label: "Any topic", icon: BookOpen },
  { label: "Adaptive depth", icon: SlidersHorizontal },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const topicInputRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickVisible, setQuickVisible] = useState(true);

  const quickBatches = Math.ceil(
    FOUNDER_TOPIC_SUGGESTIONS.length / QUICK_BATCH,
  );
  const quickTopics = FOUNDER_TOPIC_SUGGESTIONS.slice(
    quickIdx * QUICK_BATCH,
    (quickIdx + 1) * QUICK_BATCH,
  );

  useEffect(() => {
    void getMe()
      .then((res) => {
        if (res.session.kind === "member") {
          router.replace("/today");
        }
      })
      .catch(() => {
        // Stay on landing when session lookup fails.
      });
  }, [router]);

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

  function start(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) return;
    router.push(`/clarify?topic=${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    start(topic);
  }

  return (
    <main className="app-shell flex flex-col pb-10 pt-6 animate-fade-in sm:pb-14 sm:pt-10">
      <header className="flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-1" aria-label="Account">
          <Link href={AUTH_TODAY} className="btn-ghost">
            Sign in
          </Link>
          <Link
            href={SIGNUP_TODAY}
            className="btn-secondary inline-flex min-h-11 items-center rounded-full px-4 text-sm"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <div className="mx-auto mt-10 w-full max-w-xl sm:mt-14">
        <p className="mb-4 flex items-center gap-2 font-meta">
          <span
            className="landing-pulse-dot h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden
          />
          Personalized learning paths
        </p>

        <LandingHeadline />

        <p className="mt-6 text-[15px] font-light leading-[1.7] text-ink-muted">
          Type any topic and get a path built for you.
          <br className="hidden sm:block" />
          You choose the depth — one lesson a day. Free to start — no account
          until after your first lesson.
        </p>

        <form onSubmit={onSubmit} className="mb-3 mt-8">
          <div
            className="flex cursor-text items-center gap-3 rounded-2xl border border-transparent px-5 py-[15px] transition-[background-color,border-color,box-shadow] duration-200 hover:border-border/80"
            style={{
              background: inputFocused
                ? "color-mix(in srgb, var(--color-ink) 4.5%, transparent)"
                : "var(--color-bg-secondary)",
              borderColor: inputFocused
                ? "var(--color-border-default)"
                : undefined,
            }}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              topicInputRef.current?.focus();
            }}
          >
            <input
              ref={topicInputRef}
              id="landing-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="What do you want to learn..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[17px] leading-snug text-ink outline-none placeholder:text-ink-muted/40 focus-visible:ring-0"
              autoComplete="off"
              autoFocus
              aria-label="What do you want to explore?"
            />
            <button
              type="submit"
              disabled={!topic.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-all duration-150 hover:scale-[1.07] active:scale-95 disabled:opacity-20"
              aria-label="Start exploring"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-1">
          {DEPTH_TEASERS.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-[12px] text-ink-muted/80"
            >
              <Icon className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8 sm:mt-10">
          <p className="mb-2.5 font-meta opacity-55">Or try</p>
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
                onClick={() => start(suggestion)}
                className="interactive-chip focus-ring min-h-11 shrink-0 rounded-full px-3.5 py-2 text-[13px] text-ink-muted"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-ink) 4%, transparent)",
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
