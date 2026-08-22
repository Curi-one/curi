import {
  buildTrackMark,
  MARK_GLYPH_FONT_SIZE,
  markGlyphOpacity,
  markPatternOpacity,
  topicArt,
  topicPatternStyle,
  trackMarkTier,
  type MarkImageryMode,
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
  const imageryMode: MarkImageryMode = meta ? "withText" : "field";

  const rounded = width ? "rounded-none" : "w-full";

  return (
    <div
      className={`group/cover relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{
        height,
        width: width ?? undefined,
        background: art.field,
        // Enables the cqw/cqh units the glyph is sized in.
        containerType: "size",
      }}
      aria-hidden
    >
      {showPattern ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            ...topicPatternStyle(art.pattern),
            opacity: markPatternOpacity(imageryMode),
          }}
        />
      ) : null}
      {/* Positioned, not padded: the reference mark sets bottom:-6% so the
          glyph is cropped by the field edge. Sizing off the container rather
          than the height prop keeps it proportional on wide covers. */}
      <div
        className="pointer-events-none absolute select-none font-display"
        style={{
          color: art.glyphColor,
          opacity: markGlyphOpacity(imageryMode),
          fontSize: MARK_GLYPH_FONT_SIZE,
          fontWeight: 300,
          lineHeight: 0.78,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
          right: "6%",
          bottom: "-6%",
        }}
      >
        {art.glyph}
      </div>
      {meta ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-between p-[9%]">
          <span className="font-meta text-[length:max(8px,2.6cqw)] uppercase tracking-[0.25em] text-accent">
            {meta.domain}
          </span>
          <span className="font-meta text-[length:max(8px,2.6cqw)] tracking-[0.1em] text-mark-meta">
            {meta.call}
          </span>
        </div>
      ) : null}
      {/* Vermilion reveal — 2px bottom edge on hover only (BRAND §6.4) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-medium ease-out group-hover/cover:scale-x-100" />
    </div>
  );
}
