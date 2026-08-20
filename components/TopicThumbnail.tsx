import { topicSwatch } from "@/lib/ui/topic-swatch";

type Props = {
  topic: string;
  size?: number;
};

export function TopicThumbnail({ topic, size = 64 }: Props) {
  const [bg, fg] = topicSwatch(topic);
  const initial = (topic || "?").slice(0, 1).toUpperCase();

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ width: size, height: size, background: bg }}
      aria-hidden
    >
      <div
        className="absolute inset-0 flex select-none items-center justify-center"
        style={{
          color: fg,
          opacity: 0.28,
          fontSize: size * 0.62,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {initial}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(140deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 6px)",
        }}
      />
    </div>
  );
}
