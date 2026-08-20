type Props = {
  /** sm = inline/button, md = default, lg = page hero */
  size?: "sm" | "md" | "lg";
  /** Visible label under the spinner. Omit for icon-only (screen reader still announces). */
  label?: string;
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
};

/** Branded accent ring spinner — use for async page and section loads. */
export function Loader({ size = "md", label, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`loader-ring shrink-0 rounded-full ${SIZE[size]}`}
        aria-hidden
      />
      {label ? (
        <p className="text-sm font-light text-ink-muted">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
