import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, type LucideProps } from "lucide-react";

type LucideIcon = ComponentType<LucideProps>;

type Props = {
  href: string;
  wallLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Primary empty-state CTA — gets the screen's Vermilion hover reveal. */
  primary?: boolean;
};

export function TodayEmptyActionCard({
  href,
  wallLabel,
  title,
  description,
  icon: Icon,
  primary = false,
}: Props) {
  return (
    <Link
      href={href}
      className={`today-action-card group focus-ring ${primary ? "today-action-card-primary" : ""}`}
    >
      <span className="today-action-edge" aria-hidden />
      {primary ? (
        <span className="reveal-line absolute inset-x-0 bottom-0" aria-hidden />
      ) : null}
      <div className="today-action-inner">
        <p className="wall-label mb-4">{wallLabel}</p>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <span className="today-action-icon" aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-display-2xs font-light leading-snug text-ink">
                  {title}
                </p>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink-muted">
                  {description}
                </p>
              </div>
            </div>
          </div>
          <span className="today-action-arrow" aria-hidden>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </Link>
  );
}
