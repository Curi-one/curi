"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today", icon: "☀" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/explore", label: "Explore", icon: "◎" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[12px] tracking-wide transition-colors ${
                active ? "font-medium text-ink" : "text-ink-muted"
              }`}
            >
              {active && (
                <span
                  className="absolute inset-x-6 top-0 h-[2px] rounded-full bg-accent"
                  aria-hidden
                />
              )}
              <span aria-hidden className="text-base leading-none">
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
