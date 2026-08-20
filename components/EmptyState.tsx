import Link from "next/link";

type Props = {
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ message, actionHref, actionLabel }: Props) {
  return (
    <div className="surface-card p-8 text-center">
      <p className="text-[15px] font-light leading-relaxed text-ink-muted">
        {message}
      </p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6 inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
