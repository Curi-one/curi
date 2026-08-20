"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppTopBar } from "@/components/AppTopBar";
import { TabBar } from "@/components/TabBar";
import { getMe, type UserSession } from "@/lib/api/client";

/** Bottom tabs only on primary member destinations (FLOWS + mobile prototype). */
function showMemberTabBar(pathname: string): boolean {
  return (
    pathname === "/today" ||
    pathname === "/library" ||
    pathname === "/explore"
  );
}

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

  return (
    <>
      {isMember && <AppTopBar compact={!showTabBar} />}
      <div
        className={
          showTabBar ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))]" : ""
        }
      >
        {children}
      </div>
      {showTabBar && <TabBar />}
    </>
  );
}
