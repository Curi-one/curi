import {
  topicAlignClass,
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  size?: number;
};

export function TopicThumbnail({ topic, size = 64 }: Props) {
  const art = topicArt(topic);

  return (
    <div
      className="group/thumb relative shrink-0 overflow-hidden rounded-none"
      style={{ width: size, height: size, background: art.field }}
      aria-hidden
    >
      <div
        className={`absolute inset-0 flex select-none font-display ${topicAlignClass(art.align)}`}
        style={{
          color: art.glyphColor,
          opacity: 0.42,
          fontSize: size * 0.62,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontStyle: "italic",
          padding: art.align === "center" ? 0 : "6%",
        }}
      >
        {art.glyph}
      </div>
      <div
        className="absolute inset-0"
        style={topicPatternStyle(art.pattern)}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#C1121F] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/thumb:scale-x-100" />
    </div>
  );
}
