"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Compass,
  Flame,
  Library,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { getFeed, getMe, getProgress, type UserSession } from "@/lib/api/client";

type LucideIcon = ComponentType<LucideProps>;

function SidebarNavBtn({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`focus-ring flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 transition-colors ${
        active
          ? "bg-ink/[0.08] text-ink"
          : "text-ink-muted/60 hover:bg-ink/[0.05] hover:text-ink/80"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.1 : 1.6} aria-hidden />
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
    // Lesson + quiz keep Home highlighted (prototype Sidebar today group)
    today: ["/today", "/courses"],
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
 * Desktop rail — mirrors prototypes/web Sidebar (84px icon column, Lucide).
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
          icon={BookOpen}
        />
        <SidebarNavBtn
          href="/explore"
          label="Paths"
          active={pathActive(pathname, "explore")}
          icon={Compass}
        />
        <SidebarNavBtn
          href="/library"
          label="Library"
          active={pathActive(pathname, "library")}
          icon={Library}
        />
        <SidebarNavBtn
          href="/progress"
          label="Progress"
          active={pathActive(pathname, "progress")}
          icon={BarChart3}
        />
      </nav>

      <div className="mx-3 my-3 h-px bg-border/60" aria-hidden />

      <div className="px-2">
        <SidebarNavBtn
          href="/new"
          label="New"
          active={pathActive(pathname, "create")}
          icon={Sparkles}
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
            <Flame
              size={18}
              strokeWidth={streakAtRisk ? 2.2 : 1.8}
              aria-hidden
            />
            <span className="text-[10px] font-semibold tabular-nums leading-none">
              {streak}
              {streakAtRisk ? "!" : ""}
            </span>
          </Link>
        )}

        {!isAcademy && (
          <Link
            href="/upgrade"
            className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-violet-500/70 transition hover:bg-violet-500/10 hover:text-violet-600"
          >
            <ArrowUp size={18} strokeWidth={1.8} aria-hidden />
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
