"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen, Clock3, SlidersHorizontal } from "lucide-react";
import { LandingHeadline } from "@/components/LandingHeadline";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/Button";
import { getMe } from "@/lib/api/client";

const AUTH_HOME = "/auth?intent=signin&returnTo=%2F";
const SIGNUP_HOME = "/auth?intent=signup&returnTo=%2F";
const TOPIC_PLACEHOLDER = "What are you curious to learn...";

const DEPTH_TEASERS = [
  { label: "3 min/day", icon: Clock3 },
  { label: "Any topic", icon: BookOpen },
  { label: "Adaptive depth", icon: SlidersHorizontal },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const topicInputRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("");

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
        <nav className="flex items-center gap-2" aria-label="Account">
          <Button href={AUTH_HOME} variant="secondary" size="small">
            Sign in
          </Button>
          <Button href={SIGNUP_HOME} variant="primary" size="small">
            Sign up
          </Button>
        </nav>
      </header>

      <div className="mx-auto mt-10 w-full max-w-xl sm:mt-14">
        <p className="landing-kicker">
          <span className="landing-kicker-dot" aria-hidden />
          Personalized learning
        </p>

        <LandingHeadline />

        <p className="landing-lede">
          Any topic, one lesson a day. No account until after your first lesson.
        </p>

        <form onSubmit={onSubmit}>
          <div
            className="landing-topic-wrap cursor-text"
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
              placeholder={TOPIC_PLACEHOLDER}
              className="landing-topic-input focus-visible:ring-0"
              autoComplete="off"
              autoFocus
              aria-label="What are you curious to learn?"
            />
            <button
              type="submit"
              disabled={!topic.trim()}
              className="landing-topic-submit focus-ring"
              aria-label="Start exploring"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        <div className="landing-depth-row">
          {DEPTH_TEASERS.map(({ label, icon: Icon }) => (
            <span key={label} className="landing-depth-item">
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
