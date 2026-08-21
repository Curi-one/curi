import {
  topicAlignClass,
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  height: number;
  width?: number;
  className?: string;
};

/** Greyscale cover field with oversized glyph + pattern (BRAND.md §6.2–6.4). */
export function CourseCover({ topic, height, width, className = "" }: Props) {
  const art = topicArt(topic);
  const rounded = width ? "rounded-none" : "w-full";
  const pad =
    art.align === "center"
      ? undefined
      : art.align.endsWith("r")
        ? { paddingRight: "6%" }
        : { paddingLeft: "6%" };

  return (
    <div
      className={`group/cover relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ height, width: width ?? undefined, background: art.field }}
      aria-hidden
    >
      <div
        className={`pointer-events-none absolute inset-0 flex select-none font-display ${topicAlignClass(art.align)}`}
        style={{
          color: art.glyphColor,
          opacity: 0.4,
          fontSize: height * 1.55,
          fontWeight: 800,
          lineHeight: 0.78,
          fontStyle: "italic",
          letterSpacing: "-0.04em",
          ...pad,
        }}
      >
        {art.glyph}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={topicPatternStyle(art.pattern)}
      />
      {/* Vermilion reveal — 2px bottom edge on hover only (BRAND §6.4) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#C1121F] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cover:scale-x-100"
      />
    </div>
  );
}
