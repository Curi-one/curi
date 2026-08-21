import { Button } from "@/components/Button";

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
      <p className="text-ui-md font-light leading-relaxed text-ink-muted">
        {message}
      </p>
      {(actionHref && actionLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actionHref && actionLabel && (
            <Button href={actionHref}>{actionLabel}</Button>
          )}
          {secondaryHref && secondaryLabel && (
            <Button href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
