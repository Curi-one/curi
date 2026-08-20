"use client";

import { useEffect, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { getMe, type UserSession } from "@/lib/api/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getMe()
      .then((res) => setSession(res.session))
      .catch(() => setSession(null));
  }, []);

  const showTabs = session?.kind === "member";

  return (
    <>
      <div className={showTabs ? "pb-20" : ""}>{children}</div>
      {showTabs && <TabBar />}
    </>
  );
}
