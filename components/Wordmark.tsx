import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md";
  /**
   * Vermilion underline (BRAND.md §3.2). Present on the primary wordmark;
   * omitted when the wordmark sits in nav chrome (§10.4) so the page keeps
   * its one permitted accent (§4.3).
   */
  underline?: boolean;
};

/** Wordmark: Cu*ri* — roman "Cu", italic "ri", vermilion rule beneath (§3.1–3.2). */
export function Wordmark({ href = "/", size = "sm", underline = true }: Props) {
  const type =
    size === "md"
      ? "text-display-2xs tracking-tight"
      : "text-[19px] tracking-tight";

  const mark = (
    <span className="relative inline-block px-0.5 py-0.5 leading-none">
      <span className={`font-display font-light leading-none text-ink ${type}`}>
        Cu<em className="italic">ri</em>
      </span>
      {underline && (
        <span
          className="absolute inset-x-0.5 bottom-0 h-[2.5px] bg-accent"
          aria-hidden
        />
      )}
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link
      href={href}
      className="inline-block rounded-none transition-opacity hover:opacity-80 focus-ring"
      aria-label="Curi"
    >
      {mark}
    </Link>
  );
}
