"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { Wordmark } from "@/components/Wordmark";
import { getMe } from "@/lib/api/client";

type Props = {
  profileHref?: string;
  /** Stack screens: wordmark + avatar only (mobile prototype). */
  compact?: boolean;
};

/**
 * Mobile-only top chrome — compact app bar (not app-shell / min-h-screen).
 * Matches prototypes/web Header: sticky, wordmark + avatar.
 */
export function AppTopBar({
  profileHref = "/profile",
  compact = false,
}: Props) {
  const [label, setLabel] = useState("?");

  useEffect(() => {
    getMe()
      .then((m) => {
        const name = m.session.name?.trim();
        const email = m.session.email?.trim();
        setLabel(name || email || "?");
      })
      .catch(() => setLabel("?"));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border/70 bg-paper/90 px-4 backdrop-blur-md sm:px-5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
      <Wordmark href="/today" size="sm" underline={false} />
      <nav className="flex items-center gap-1.5" aria-label="Account">
        {!compact && (
          <>
            <Link
              href="/progress"
              className="inline-flex h-9 items-center rounded-none px-2.5 text-xs text-ink-muted transition-colors hover:bg-highlight hover:text-ink focus-ring"
            >
              Progress
            </Link>
            <Link
              href="/new"
              className="inline-flex h-9 items-center rounded-none px-2.5 text-xs text-ink-muted transition-colors hover:bg-highlight hover:text-ink focus-ring"
              aria-label="Create a new path"
            >
              New
            </Link>
          </>
        )}
        <Link
          href={profileHref}
          className="focus-ring rounded-full transition-[opacity] duration-micro ease-out hover:opacity-80"
          aria-label="Open profile"
        >
          <UserAvatar name={label} size={32} variant="paper" />
        </Link>
      </nav>
    </header>
  );
}
