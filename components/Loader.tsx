import { Wordmark } from "@/components/Wordmark";

type Props = {
  /** sm = inline/button, md = default, lg = page hero */
  size?: "sm" | "md" | "lg";
  /** Visible label under the wordmark. Omit for icon-only (screen reader still announces). */
  label?: string;
  className?: string;
};

const WORDMARK_SIZE: Record<NonNullable<Props["size"]>, "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

/** Branded loader — Curi wordmark with a sweeping vermilion rule beneath. */
export function Loader({ size = "md", label, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative inline-block">
        <Wordmark href={undefined} size={WORDMARK_SIZE[size]} underline={false} />
        <span className="loader-wordmark-track" aria-hidden>
          <span className="loader-wordmark-line" />
        </span>
      </div>
      {label ? (
        <p className="text-sm font-light text-ink-muted">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
