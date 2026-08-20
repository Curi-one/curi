"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/today",
    label: "Today",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
        <path d="M8 3v16.5" />
        <path d="M12 3v16.5a2 2 0 0 0 2 2H20V5a2 2 0 0 0-2-2h-6" />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z" />
      </svg>
    ),
  },
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
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
