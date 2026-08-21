type Props = {
  /** Display name or email — initials derived from first letters. */
  name: string;
  size?: number;
  /** Ink field + paper initials (default) or paper field + ink initials. */
  variant?: "ink" | "paper";
  className?: string;
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const s = parts[0]!;
    return s.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

/**
 * Circular user avatar — Fraunces italic initials.
 * Square = subject (track mark); circle = person only.
 * @see docs/TRACK-MARKS.md
 */
export function UserAvatar({
  name,
  size = 40,
  variant = "ink",
  className = "",
}: Props) {
  const initials = initialsFrom(name);
  const ink = variant === "ink";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display italic ${
        ink
          ? "bg-ink text-paper"
          : "border border-border bg-paper text-ink"
      } ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        fontWeight: 400,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
