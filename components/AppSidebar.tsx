"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/Wordmark";
import { getFeed, getMe, getProgress, type UserSession } from "@/lib/api/client";

type NavIconProps = { active?: boolean };

function IconHome({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} aria-hidden>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
      <path d="M8 3v16.5" />
      <path d="M12 3v16.5a2 2 0 0 0 2 2H20V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

function IconExplore({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z" />
    </svg>
  );
}

function IconLibrary({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} aria-hidden>
      <path d="M4 19a2 2 0 0 0 2 2h12" />
      <path d="M6 3h12v18H6z" />
      <path d="M10 7h4" />
    </svg>
  );
}

function IconProgress({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} aria-hidden>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </svg>
  );
}

function IconNew({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} aria-hidden>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function IconUpgrade() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function IconFlame({ atRisk }: { atRisk?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={atRisk ? 2.2 : 1.8} aria-hidden>
      <path d="M12 3c2 3 1 5-1 7 3 0 6 2 6 6a5 5 0 0 1-10 0c0-3 2-5 3-7-2 1-3 3-3 5 0 4 3 7 7 7s7-3 7-7c0-5-4-8-9-11Z" />
    </svg>
  );
}

function SidebarNavBtn({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 transition-colors ${
        active
          ? "bg-ink/[0.08] text-ink"
          : "text-ink-muted/60 hover:bg-ink/[0.05] hover:text-ink/80"
      }`}
    >
      {icon}
      <span
        className={`text-[10px] font-medium leading-none tracking-wide ${
          active ? "opacity-100" : "opacity-70"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function pathActive(pathname: string, key: string): boolean {
  const groups: Record<string, string[]> = {
    today: ["/today"],
    explore: ["/explore"],
    library: ["/library"],
    progress: ["/progress"],
    create: ["/new", "/clarify", "/generating"],
  };
  const roots = groups[key] ?? [];
  return roots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

/**
 * Desktop rail — mirrors prototypes/web Sidebar (84px icon column).
 * No Review/flashcards (out of v1). Mobile uses TabBar instead.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [streak, setStreak] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    Promise.all([getMe(), getProgress(), getFeed()])
      .then(([me, progress, feed]) => {
        setSession(me.session);
        setStreak(progress.streak);
        setDueCount(feed.due.length);
      })
      .catch(() => {
        setSession(null);
      });
  }, [pathname]);

  const streakAtRisk = streak > 0 && dueCount > 0;
  const isAcademy = session?.plan === "academy";
  const displayName =
    session?.name?.trim() ||
    session?.email?.split("@")[0] ||
    "You";
  const initial = displayName.slice(0, 1).toUpperCase();
  const firstName = displayName.split(/\s+/)[0];

  return (
    <aside
      className="relative hidden h-screen w-[84px] shrink-0 flex-col border-r border-border/70 bg-paper-secondary md:flex"
      aria-label="Primary"
    >
      <div className="flex justify-center px-3 pb-4 pt-5">
        <Wordmark href="/today" size="sm" />
      </div>

      <div className="mx-3 h-px bg-border/60" aria-hidden />

      <nav className="mt-3 flex flex-col gap-1 px-2" aria-label="Main">
        <SidebarNavBtn
          href="/today"
          label="Home"
          active={pathActive(pathname, "today")}
          icon={<IconHome active={pathActive(pathname, "today")} />}
        />
        <SidebarNavBtn
          href="/explore"
          label="Paths"
          active={pathActive(pathname, "explore")}
          icon={<IconExplore active={pathActive(pathname, "explore")} />}
        />
        <SidebarNavBtn
          href="/library"
          label="Library"
          active={pathActive(pathname, "library")}
          icon={<IconLibrary active={pathActive(pathname, "library")} />}
        />
        <SidebarNavBtn
          href="/progress"
          label="Progress"
          active={pathActive(pathname, "progress")}
          icon={<IconProgress active={pathActive(pathname, "progress")} />}
        />
      </nav>

      <div className="mx-3 my-3 h-px bg-border/60" aria-hidden />

      <div className="px-2">
        <SidebarNavBtn
          href="/new"
          label="New"
          active={pathActive(pathname, "create")}
          icon={<IconNew active={pathActive(pathname, "create")} />}
        />
      </div>

      <div className="mt-auto flex flex-col gap-1 px-2 pb-5">
        {streak > 0 && (
          <Link
            href="/today"
            title={
              streakAtRisk
                ? `${streak}-day streak — get curious today to keep it`
                : `${streak}-day streak`
            }
            className={`flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 transition-colors ${
              streakAtRisk
                ? "text-accent hover:bg-accent/10"
                : "text-amber-600 hover:bg-amber-500/10"
            }`}
          >
            <IconFlame atRisk={streakAtRisk} />
            <span className="text-[10px] font-semibold tabular-nums leading-none">
              {streak}
              {streakAtRisk ? "!" : ""}
            </span>
          </Link>
        )}

        {!isAcademy && (
          <Link
            href="/upgrade"
            className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-ink-muted transition hover:bg-ink/[0.05] hover:text-ink"
          >
            <IconUpgrade />
            <span className="text-[10px] font-medium leading-none opacity-80">
              Upgrade
            </span>
          </Link>
        )}

        <Link
          href="/profile"
          aria-label={displayName}
          title={displayName}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 transition hover:bg-ink/[0.05]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
            {initial}
          </div>
          <span className="max-w-full truncate text-[10px] font-medium leading-none text-ink-muted/60">
            {firstName}
          </span>
        </Link>
      </div>
    </aside>
  );
}
