import React from "react";
import { topicSwatch } from "@/lib/topic-utils";

export function TopicThumbnail({ topic, size = 64 }) {
  const [bg, fg] = topicSwatch(topic);
  const initial = (topic || "?").slice(0, 1).toUpperCase();
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ width: size, height: size, background: bg }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          color: fg,
          opacity: 0.28,
          fontSize: size * 0.62,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
        aria-hidden
      >
        {initial}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(140deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 6px)",
        }}
        aria-hidden
      />
    </div>
  );
}

export default TopicThumbnail;
