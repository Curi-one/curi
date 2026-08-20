"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LandingHeadline } from "@/components/LandingHeadline";
import { Wordmark } from "@/components/Wordmark";
import {
  FOUNDER_LANDING_HOOK,
  FOUNDER_TOPIC_SUGGESTIONS,
} from "@/lib/content/founder-catalogue";
import { getMe } from "@/lib/api/client";

const AUTH_TODAY = "/auth?intent=signin&returnTo=%2Ftoday";
const SIGNUP_TODAY = "/auth?intent=signup&returnTo=%2Ftoday";

export default function LandingPage() {
  const router = useRouter();
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

  return (
    <main className="app-shell flex flex-col pb-16 pt-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-1" aria-label="Account">
          <Link href={AUTH_TODAY} className="btn-ghost">
            Sign in
          </Link>
          <Link
            href={SIGNUP_TODAY}
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-ink"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <p className="type-kicker mt-16">For first-time founders</p>
      <LandingHeadline />
      <p className="mt-4 max-w-sm text-[15px] font-light leading-relaxed text-ink-muted">
        {FOUNDER_LANDING_HOOK} Free to start — no account until after your first
        lesson.
      </p>
      <label className="mt-10 block">
        <span className="sr-only">Topic</span>
        <input
          autoFocus
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start(topic)}
          placeholder="e.g. term sheets, SAFE notes, cap tables…"
          className="input-field"
        />
      </label>
      <button
        type="button"
        onClick={() => start(topic)}
        disabled={!topic.trim()}
        className="btn-primary mt-4 w-full"
      >
        Start
      </button>
      <div className="mt-12">
        <p className="type-kicker">Suggestions</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FOUNDER_TOPIC_SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => start(s)}
                className="rounded-full border border-border bg-paper-secondary px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent/40 hover:bg-paper"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
