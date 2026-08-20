"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = [
  "Stoicism for modern life",
  "How AI actually works",
  "The science of sleep",
];

export default function LandingPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  function start(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) return;
    router.push(`/clarify?topic=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 pb-12 pt-16">
      <h1 className="font-display text-4xl leading-tight text-ink">
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
