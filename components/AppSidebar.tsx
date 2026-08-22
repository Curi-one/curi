"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  Compass,
  Library,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { UserAvatar } from "@/components/UserAvatar";
import { getMe, type UserSession } from "@/lib/api/client";

type LucideIcon = ComponentType<LucideProps>;

const NAV_ITEMS: {
  href: string;
  label: string;
  key: string;
  icon: LucideIcon;
}[] = [
  { href: "/today", label: "Home", key: "today", icon: BookOpen },
  { href: "/explore", label: "Paths", key: "explore", icon: Compass },
  { href: "/library", label: "Library", key: "library", icon: Library },
  { href: "/progress", label: "Progress", key: "progress", icon: BarChart3 },
  { href: "/new", label: "New", key: "create", icon: Sparkles },
];

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
      className="app-sidebar-nav-item focus-ring"
    >
      <Icon size={20} strokeWidth={active ? 2.1 : 1.5} aria-hidden />
      <span className="app-sidebar-tip" aria-hidden>
        {label}
      </span>
    </Link>
  );
}

function pathActive(pathname: string, key: string): boolean {
  const groups: Record<string, string[]> = {
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
 * Desktop rail — 64px icon column. Labels appear on hover/focus only.
 * Mobile uses TabBar instead.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getMe()
      .then((me) => setSession(me.session))
      .catch(() => setSession(null));
  }, []);

  const displayName =
    session?.name?.trim() || session?.email?.split("@")[0] || "You";

  return (
    <aside
      className="app-sidebar relative hidden h-screen shrink-0 flex-col md:flex"
      aria-label="Primary"
    >
      <div className="app-sidebar-brand">
        <Wordmark href="/today" size="sm" underline={false} />
      </div>

      <nav className="app-sidebar-nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <SidebarNavBtn
            key={item.key}
            href={item.href}
            label={item.label}
            active={pathActive(pathname, item.key)}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="app-sidebar-footer">
        <Link
          href="/profile"
          aria-label={displayName}
          title={displayName}
          className="app-sidebar-profile focus-ring"
        >
          <UserAvatar name={displayName} size={28} />
        </Link>
      </div>
    </aside>
  );
}
