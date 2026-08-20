import { topicSwatch } from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  height: number;
  width?: number;
  className?: string;
};

/** Greyscale cover field with an oversized initial (BRAND.md §6.2). */
export function CourseCover({ topic, height, width, className = "" }: Props) {
  const [bg, fg] = topicSwatch(topic);
  const initial = (topic || "?")[0]?.toUpperCase() ?? "?";
  const rounded = width ? "rounded-none" : "w-full";

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ height, width: width ?? undefined, background: bg }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-end justify-end"
        style={{
          color: fg,
          opacity: 0.4,
          fontSize: height * 1.55,
          fontWeight: 800,
          lineHeight: 0.78,
          paddingRight: "6%",
        }}
      >
        {initial}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(138deg, transparent, transparent 5px, rgba(255,255,255,0.045) 5px, rgba(255,255,255,0.045) 6px)",
        }}
      />
    </div>
  );
}
