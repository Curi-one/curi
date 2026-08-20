"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BookOpen,
  Compass,
  Library,
  type LucideProps,
} from "lucide-react";

type LucideIcon = ComponentType<LucideProps>;

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/today", label: "Today", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
  { href: "/explore", label: "Explore", icon: Compass },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg md:max-w-none">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
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
              <Icon size={20} strokeWidth={active ? 2.1 : 1.75} aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
