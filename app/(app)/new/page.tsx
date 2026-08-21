"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Clock3,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { getLibrary, getMe } from "@/lib/api/client";

const DEPTH_TEASERS = [
  { label: "3 min/day", icon: Clock3 },
  { label: "Any topic", icon: BookOpen },
  { label: "Adaptive depth", icon: SlidersHorizontal },
] as const;

/**
 * Member custom-path entry — mirrors prototypes/web NewPath.jsx.
 * Topic → /clarify (depth is last clarify step per FLOWS).
 */
export default function NewPathPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("");
  const [focused, setFocused] = useState(false);
  const [checking, setChecking] = useState(true);
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    Promise.all([getMe(), getLibrary()])
      .then(([me, lib]) => {
        const free = me.session.plan === "free";
        setAtLimit(free && lib.exploring.length >= 2);
      })
      .catch(() => {
        setAtLimit(false);
      })
      .finally(() => setChecking(false));
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;
    if (atLimit) {
      router.push("/upgrade");
      return;
    }
    router.push(`/clarify?topic=${encodeURIComponent(trimmed)}`);
  }

  return (
    <PageShell
      back={{ href: "/today", label: "Today" }}
      withTabPad={false}
      className="pt-4"
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
        <p className="type-kicker">New path</p>
        <h1
          className="mt-2 font-display text-display-xs font-light leading-tight tracking-tight text-ink sm:text-display-sm"
          style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
        >
          What do you want to learn?
        </h1>
        <p className="mt-3 text-ui-md font-light leading-relaxed text-ink-muted">
          Type any topic. Curi builds a daily lesson path around it — you pick
          the depth next.
        </p>

        {atLimit && !checking && (
          <p className="mt-4 rounded-none border border-border bg-paper-secondary px-4 py-3 text-sm text-ink-muted">
            Free plan allows 2 active paths.{""}
            <Link
              href="/upgrade"
              className="text-ink underline underline-offset-2"
            >
              Upgrade to Academy
            </Link>
            {""}
            or shelve one in Library.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-8">
          <div
            className={`flex cursor-text items-center gap-3 rounded-none border bg-paper px-5 py-[15px] transition-colors ${
              focused ? "border-ink/20 bg-ink/[0.03]" : "border-border"
            }`}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              inputRef.current?.focus();
            }}
          >
            <input
              ref={inputRef}
              id="new-path-topic"
              type="search"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. liquidation preferences, burn rate…"
              className="min-w-0 flex-1 border-0 bg-transparent text-ui-xl leading-snug text-ink outline-none placeholder:text-ink-muted/40"
              autoComplete="off"
              aria-label="Topic for your new learning path"
            />
            <button
              type="submit"
              disabled={!topic.trim() || checking}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-ink text-paper transition-opacity disabled:opacity-20"
              aria-label="Create path"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 pl-1">
          {DEPTH_TEASERS.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-ui-2xs text-ink-muted/80"
            >
              <Icon className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-ink"
          >
            <Compass className="h-4 w-4 opacity-60" aria-hidden />
            Prefer a curated path? Browse Explore
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
