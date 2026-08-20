"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/client";

const SUGGESTIONS = [
  "Stoicism for modern life",
  "How AI actually works",
  "The science of sleep",
];

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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <p className="font-display text-lg text-ink">
          Cu<em className="italic">ri</em>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={AUTH_TODAY}
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-ink hover:border-ink/30"
          >
            Sign in
          </Link>
          <Link
            href={SIGNUP_TODAY}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-paper hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </header>

      <h1 className="mt-14 font-display text-4xl leading-tight text-ink">
        What are you curious about?
      </h1>
      <p className="mt-3 text-ink-muted">Free to start · No account needed</p>
      <label className="mt-10 block">
        <span className="sr-only">Topic</span>
        <input
          autoFocus
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start(topic)}
          placeholder="e.g. Stoicism, sleep, climate policy…"
          className="w-full rounded-xl border border-border bg-paper-secondary px-4 py-4 text-lg outline-none focus:border-ink"
        />
      </label>
      <button
        type="button"
        onClick={() => start(topic)}
        disabled={!topic.trim()}
        className="btn-primary mt-4 w-full disabled:opacity-40"
      >
        Start
      </button>
      <div className="mt-10">
        <p className="text-sm text-ink-muted">Suggestions</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => start(s)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-ink/30"
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
