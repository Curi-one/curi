"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { TabBar } from "@/components/TabBar";
import { getMe, type UserSession } from "@/lib/api/client";

/** Bottom tabs only on primary member destinations (mobile). */
function showMemberTabBar(pathname: string): boolean {
  return (
    pathname === "/today" ||
    pathname === "/library" ||
    pathname === "/explore"
  );
}

/**
 * Member chrome:
 * - md+: web prototype sidebar + wide scrollable pane
 * - <md: mobile top bar + bottom tabs
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getMe()
      .then((res) => setSession(res.session))
      .catch(() => setSession(null));
  }, []);

  const isMember = session?.kind === "member";
  const showTabBar = isMember && showMemberTabBar(pathname);

  if (!isMember) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-paper">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="md:hidden">
          {/* Compact only: Progress/New live in sidebar (md+) and tabs/routes. */}
          <AppTopBar compact />
        </div>
        <div
          className={
            showTabBar
              ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
              : ""
          }
        >
          {children}
        </div>
        <div className="md:hidden">{showTabBar ? <TabBar /> : null}</div>
      </div>
    </div>
  );
}
