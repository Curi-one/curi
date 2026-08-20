"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today" },
  { href: "/library", label: "Library" },
  { href: "/explore", label: "Explore" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-paper/95 backdrop-blur"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex min-h-[56px] flex-1 items-center justify-center text-[13px] tracking-wide transition-colors ${
                active ? "text-ink" : "text-ink-muted"
              }`}
            >
              {active && (
                <span
                  className="absolute inset-x-8 top-0 h-[2px] bg-accent"
                  aria-hidden
                />
              )}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
