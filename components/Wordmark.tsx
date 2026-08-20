import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md";
};

/** Wordmark: Cu*ri* with the single vermilion underline (brand: one accent per screen). */
export function Wordmark({ href = "/", size = "sm" }: Props) {
  const type =
    size === "md"
      ? "text-[22px] tracking-tight"
      : "text-[19px] tracking-tight";

  const mark = (
    <span className="relative inline-block px-0.5 py-0.5 leading-none">
      <span
        className={`font-display font-light leading-none text-ink ${type}`}
        style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
      >
        Cu<em className="italic">ri</em>
      </span>
      <span
        className="absolute inset-x-0.5 bottom-0 h-[2.5px] bg-accent"
        aria-hidden
      />
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link href={href} className="inline-block transition-opacity hover:opacity-80 focus-ring rounded-sm" aria-label="Curi">
      {mark}
    </Link>
  );
}
