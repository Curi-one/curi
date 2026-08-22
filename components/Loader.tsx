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

const LINE_WIDTH: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-14",
  md: "w-16",
  lg: "w-[4.75rem]",
};

/** Branded loader — clean wordmark with a sweeping vermilion rule beneath. */
export function Loader({ size = "md", label, className = "" }: Props) {
  const statusLabel = label ?? "Loading";

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={statusLabel}
    >
      <Wordmark href={undefined} size={WORDMARK_SIZE[size]} underline={false} />
      <span
        className={`loader-line-track ${LINE_WIDTH[size]}`}
        aria-hidden
      >
        <span className="loader-line-sweep" />
      </span>
    </div>
  );
}
