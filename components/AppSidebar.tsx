"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Compass,
  Library,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { StreakIndicator } from "@/components/StreakIndicator";
import { UserAvatar } from "@/components/UserAvatar";
import {
  getFeed,
  getMe,
  getProgress,
  type UserSession,
} from "@/lib/api/client";

type LucideIcon = ComponentType<LucideProps>;

function SidebarNavBtn({
  href,
  label,
  active,
  icon: Icon,
  accent = false,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`app-sidebar-nav-item focus-ring${accent ? " app-sidebar-nav-item--accent" : ""}`}
    >
      <Icon size={18} strokeWidth={active ? 2.1 : 1.6} aria-hidden />
      <span className="app-sidebar-nav-label">{label}</span>
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

  // Load once — api client caches GETs; refetching on every nav was the main lag.
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
  }, []);

  const streakAtRisk = streak > 0 && dueCount > 0;
  const isAcademy = session?.plan === "academy";
  const displayName =
    session?.name?.trim() || session?.email?.split("@")[0] || "You";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <aside
      className="app-sidebar relative hidden h-screen shrink-0 flex-col md:flex"
      aria-label="Primary"
    >
      <div className="app-sidebar-brand">
        <span className="app-sidebar-brand-tag" aria-hidden>
          Daily
        </span>
        <Wordmark href="/today" size="sm" underline={false} />
      </div>

      <div className="app-sidebar-divider" aria-hidden />

      <nav className="app-sidebar-nav" aria-label="Main">
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

      <div
        className="app-sidebar-divider app-sidebar-divider--spaced"
        aria-hidden
      />

      <div className="app-sidebar-section">
        <SidebarNavBtn
          href="/new"
          label="New"
          active={pathActive(pathname, "create")}
          icon={Sparkles}
          accent
        />
      </div>

      <div className="app-sidebar-footer">
        {streak > 0 && (
          <Link
            href="/progress"
            className="app-sidebar-footer-item app-sidebar-footer-item--streak focus-ring"
            aria-label={
              streakAtRisk
                ? `${streak}-day streak — keep it alive today`
                : `${streak}-day streak`
            }
          >
            <StreakIndicator
              streak={streak}
              atRisk={streakAtRisk}
              size="md"
              countClassName="text-mono-sm font-semibold"
            />
          </Link>
        )}

        {!isAcademy && (
          <Link
            href="/upgrade"
            className="app-sidebar-footer-item focus-ring"
            aria-label="Upgrade"
          >
            <ArrowUp size={18} strokeWidth={1.8} aria-hidden />
            <span className="app-sidebar-footer-label">Upgrade</span>
          </Link>
        )}

        <Link
          href="/profile"
          aria-label={displayName}
          title={displayName}
          className="app-sidebar-footer-item focus-ring"
        >
          <span className="app-sidebar-profile-avatar">
            <UserAvatar name={displayName} size={28} />
          </span>
          <span className="app-sidebar-footer-label">{firstName}</span>
        </Link>
      </div>
    </aside>
  );
}
