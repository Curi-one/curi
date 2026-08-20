import Link from "next/link";

type Props = {
  message: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function EmptyState({
  message,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: Props) {
  return (
    <div className="surface-card p-8 text-center">
      <p className="text-[15px] font-light leading-relaxed text-ink-muted">
        {message}
      </p>
      {(actionHref && actionLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actionHref && actionLabel && (
            <Link href={actionHref} className="btn-primary inline-block">
              {actionLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="btn-secondary inline-block">
              {secondaryLabel}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
