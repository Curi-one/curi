"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { LandingDepthTeasers } from "@/components/LandingDepthTeasers";
import { LandingTopicForm } from "@/components/LandingTopicForm";
import { getLibrary, getMe } from "@/lib/api/client";

/**
 * Member custom-path entry — same topic form as the home landing page.
 * Topic → /clarify (depth is last clarify step per FLOWS).
 */
export default function NewPathPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [checking, setChecking] = useState(true);
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getLibrary()])
      .then(([me, lib]) => {
        const free = me.session.plan === "free";
        setAtLimit(free && lib.exploring.length >= 2);
      })
      .catch(() => setAtLimit(false))
      .finally(() => setChecking(false));
  }, []);

  function start(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) return;
    if (atLimit) {
      router.push("/upgrade");
      return;
    }
    router.push(`/clarify?topic=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="app-shell flex flex-1 flex-col pb-12 pt-6 animate-fade-in md:pb-12 md:pt-10">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        <p className="landing-kicker">
          <span className="landing-kicker-dot" aria-hidden />
          New path
        </p>

        <h1 className="landing-headline font-display display-section text-display-sm tracking-tight text-ink sm:text-display-lg">
          What do you want
          <br />
          <em className="italic">to learn?</em>
        </h1>

        <p className="landing-lede">
          Type any topic. Curi builds a daily lesson path around it — you pick
          the depth next.
        </p>

        {atLimit && !checking && (
          <p className="mb-5 max-w-xl border border-border bg-paper-secondary px-4 py-3 text-sm text-ink-muted">
            Free plan allows 2 active paths.{" "}
            <Link
              href="/upgrade"
              className="text-ink underline underline-offset-2"
            >
              Upgrade to Academy
            </Link>{" "}
            or shelve one in Library.
          </p>
        )}

        <LandingTopicForm
          value={topic}
          onChange={setTopic}
          onSubmit={start}
          inputId="new-path-topic"
          submitLabel="Create path"
          placeholder="e.g. liquidation preferences, burn rate…"
          disabled={checking}
          autoFocus
        />

        <LandingDepthTeasers />

        <div className="mt-10 border-t border-border pt-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition-opacity hover:text-ink hover:opacity-100"
          >
            <Compass className="h-4 w-4 opacity-60" aria-hidden />
            Prefer a curated path? Browse Explore
          </Link>
        </div>
      </div>
    </main>
  );
}
