import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  back?: { href: string; label: string };
  title?: string;
  kicker?: string;
  /** Extra bottom padding when tab bar is visible (member app routes). */
  withTabPad?: boolean;
  className?: string;
};

export function PageShell({
  children,
  back,
  title,
  kicker,
  withTabPad = true,
  className = "",
}: Props) {
  return (
    <main
      className={`app-shell py-6 md:py-8 ${withTabPad ? "pb-24 md:pb-12" : "pb-12"} ${className}`}
    >
      {back && (
        <Link
          href={back.href}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {back.label}
        </Link>
      )}
      {kicker && (
        <p className={`type-kicker ${back ? "mt-6" : ""}`}>{kicker}</p>
      )}
      {title && (
        <h1
          className={`font-display text-display-xs font-light leading-tight tracking-tight text-ink ${
            kicker ? "mt-2" : back ? "mt-4" : ""
          }`}
          style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
        >
          {title}
        </h1>
      )}
      {children}
    </main>
  );
}
