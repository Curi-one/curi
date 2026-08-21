import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  back?: { href: string; label: string };
  title?: string;
  kicker?: string;
  /** Metadata hung on the right-hand columns, opposite the title (§10.1). */
  meta?: ReactNode;
  /**
   * Where the body sits on the grid. Defaults to `main`: flush left across
   * the primary columns, with the right-hand columns left empty.
   *
   * The default is deliberately NOT `full`. The canvas now runs to the grid
   * max-width, so a full-bleed body would stretch prose to unreadable line
   * lengths on a wide screen. Pages that genuinely need the width — card
   * grids, the heatmap — opt into `full` explicitly.
   *
   * `measure` caps at 680px for long-form reading.
   */
  content?: "full" | "measure" | "main";
  /** Extra bottom padding when tab bar is visible (member app routes). */
  withTabPad?: boolean;
  className?: string;
};

/**
 * Page frame on the modular grid (BRAND §8.9, §10.1).
 *
 * The masthead is a two-part composition rather than a stacked block: title
 * flush left on the main columns, metadata hung on the right rail, a hairline
 * rule closing the unit, and a `chapter`-sized silence before the body. On a
 * wide canvas the title deliberately stops at column 7 — the empty right-hand
 * columns are the composition, not leftover space.
 */
export function PageShell({
  children,
  back,
  title,
  kicker,
  meta,
  content = "main",
  withTabPad = true,
  className = "",
}: Props) {
  const contentColumn = {
    full: "col-full",
    measure: "col-measure",
    main: "col-main",
  }[content];

  const hasMasthead = Boolean(back || kicker || title || meta);

  return (
    <main
      className={`app-shell grid-canvas py-6 md:py-8 ${
        withTabPad ? "pb-24 md:pb-12" : "pb-12"
      } ${className}`}
    >
      {hasMasthead && (
        <header className="col-full mb-chapter">
          {back && (
            <Link
              href={back.href}
              className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {back.label}
            </Link>
          )}

          {(kicker || title || meta) && (
            <div
              className={`grid-canvas items-end gap-y-cluster ${
                back ? "mt-block" : ""
              }`}
            >
              <div className="col-main">
                {kicker && <p className="type-kicker">{kicker}</p>}
                {title && (
                  <h1
                    className={`font-display text-display-xs font-light leading-tight tracking-tight text-ink ${
                      kicker ? "mt-3" : ""
                    }`}
                  >
                    {title}
                  </h1>
                )}
              </div>

              {meta && (
                <div className="col-aside md:justify-self-end md:text-right">
                  {meta}
                </div>
              )}
            </div>
          )}

          {(kicker || title) && (
            <div className="editorial-rule mt-block" aria-hidden />
          )}
        </header>
      )}

      <div className={contentColumn}>{children}</div>
    </main>
  );
}
