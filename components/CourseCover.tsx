import {
  buildTrackMark,
  topicArt,
  topicPatternStyle,
  trackMarkTier,
} from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  height: number;
  width?: number;
  className?: string;
  /** Show domain label + call number when space allows (large marks). */
  showMeta?: boolean;
};

/**
 * Large track mark used as a course cover — Ink field, pattern at 16%,
 * oversized italic Fraunces glyph, zero radius. Vermilion reveal line on hover.
 * @see docs/TRACK-MARKS.md
 */
export function CourseCover({
  topic,
  height,
  width,
  className = "",
  showMeta = false,
}: Props) {
  const mark = buildTrackMark(topic);
  const art = topicArt(topic);
  const size = Math.min(height, width ?? height);
  const tier = trackMarkTier(size);
  const showPattern = tier === "large" || tier === "medium";
  const meta =
    showMeta && tier === "large" && height >= 80
      ? { domain: mark.domainName, call: mark.call }
      : null;

  const rounded = width ? "rounded-none" : "w-full";

  return (
    <div
      className={`group/cover relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ height, width: width ?? undefined, background: art.field }}
      aria-hidden
    >
      {showPattern ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={topicPatternStyle(art.pattern)}
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-end justify-end font-display"
        style={{
          color: art.glyphColor,
          opacity: 0.9,
          fontSize: height * 0.38,
          fontWeight: 300,
          lineHeight: 0.78,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
          paddingRight: "6%",
          paddingBottom: "2%",
        }}
      >
        {art.glyph}
      </div>
      {meta ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-between p-[9%]">
          <span className="font-meta text-[length:max(8px,2.6cqw)] uppercase tracking-[0.25em] text-accent">
            {meta.domain}
          </span>
          <span className="font-meta text-[length:max(8px,2.6cqw)] tracking-[0.1em] text-silver">
            {meta.call}
          </span>
        </div>
      ) : null}
      {/* Vermilion reveal — 2px bottom edge on hover only (BRAND §6.4) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#C1121F] transition-transform duration-medium ease-out group-hover/cover:scale-x-100" />
    </div>
  );
}
