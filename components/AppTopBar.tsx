"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { getMe } from "@/lib/api/client";

type Props = {
  profileHref?: string;
  /** Stack screens: wordmark + avatar only (mobile prototype). */
  compact?: boolean;
};

export function AppTopBar({
  profileHref = "/profile",
  compact = false,
}: Props) {
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    getMe()
      .then((m) => {
        const name = m.session.name?.trim();
        const email = m.session.email?.trim();
        const source = name || email || "?";
        setInitial(source.slice(0, 1).toUpperCase());
      })
      .catch(() => setInitial("?"));
  }, []);

  return (
    <header className="app-shell flex items-center justify-between border-b border-border py-3">
      <Wordmark href="/today" />
      <nav className="flex items-center gap-2" aria-label="Account">
        {!compact && (
          <>
            <Link
              href="/progress"
              className="btn-ghost min-h-11 px-3 text-xs"
            >
              Progress
            </Link>
            <Link
              href="/new"
              className="btn-ghost min-h-11 px-3 text-xs"
              aria-label="Create a new path"
            >
              New
            </Link>
          </>
        )}
        <Link
          href={profileHref}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-paper-secondary text-sm font-medium text-ink"
          aria-label="Open profile"
        >
          {initial}
        </Link>
      </nav>
    </header>
  );
}
