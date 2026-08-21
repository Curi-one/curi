import {
  topicArt,
  topicPatternStyle,
  trackMarkTier,
} from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  size?: number;
  /** Selected/active row may use Vermilion on the glyph (list accent rule). */
  accent?: boolean;
};

/**
 * Size-aware track mark thumbnail.
 * Large/Medium: pattern + glyph · Small: glyph only · Micro: flat ink.
 * @see docs/TRACK-MARKS.md
 */
export function TopicThumbnail({
  topic,
  size = 64,
  accent = false,
}: Props) {
  const art = topicArt(topic);
  const tier = trackMarkTier(size);
  const showPattern = tier === "large" || tier === "medium";
  const showGlyph = tier !== "micro";

  let glyphColor = art.glyphColor;
  if (accent) {
    glyphColor = "var(--color-accent)";
  } else if (tier === "small") {
    glyphColor = "var(--color-silver)";
  }

  return (
    <div
      className="group/thumb relative shrink-0 overflow-hidden rounded-none"
      style={{ width: size, height: size, background: art.field }}
      aria-hidden
    >
      {showPattern ? (
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={topicPatternStyle(art.pattern)}
        />
      ) : null}
      {showGlyph ? (
        <div
          className="absolute inset-0 flex select-none items-center justify-center font-display"
          style={{
            color: glyphColor,
            opacity: accent || tier === "small" ? 1 : 0.9,
            fontSize: size * (tier === "small" ? 0.48 : 0.42),
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontStyle: "italic",
          }}
        >
          {art.glyph}
        </div>
      ) : null}
      {showPattern ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#C1121F] transition-transform duration-medium ease-out group-hover/thumb:scale-x-100" />
      ) : null}
    </div>
  );
}
