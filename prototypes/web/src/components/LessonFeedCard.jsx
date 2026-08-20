import React from "react";
import { Headphones, Lock, Pause } from "lucide-react";
import { lessonBlurb } from "@/lib/feed-utils";
import { TopicThumbnail } from "@/components/TopicThumbnail";

export function LessonFeedCard({ item, onClick, onListen, nowPlaying }) {
  const blurb = lessonBlurb(item.title, item.lessonIndex, item.totalLessons, item.topic);
  const isActive  = nowPlaying?.id === item.id;
  const isPlaying = isActive && nowPlaying?.state === "playing";
  const isPaused  = isActive && nowPlaying?.state === "paused";

  if (item.isLocked) {
    return (
      <div className="flex w-full gap-3.5 rounded-lg border border-border/50 bg-card p-4 sm:gap-4 sm:p-5">
        <div className="opacity-40">
          <TopicThumbnail topic={item.topic} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-foreground/50 sm:text-[15px]">
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground/60 sm:text-ui">
            {blurb}
          </p>
          <div className="mt-3 h-px bg-border/40" aria-hidden />
          <div className="mt-2 flex items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 text-label text-muted-foreground/40">
              <Lock className="h-3 w-3" aria-hidden />
              Explore today to unlock
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex w-full gap-3.5 rounded-lg border border-border/50 bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-border/80 depth-surface sm:gap-4 sm:p-5">
      {/* Thumbnail — clicking it opens the lesson */}
      <button type="button" onClick={onClick} className="shrink-0 focus:outline-none" tabIndex={-1} aria-hidden>
        <TopicThumbnail topic={item.topic} />
      </button>

      <div className="min-w-0 flex-1">
        {/* Title + blurb — clicking opens the lesson */}
        <button
          type="button"
          onClick={onClick}
          className="block w-full text-left focus:outline-none"
        >
          <h3
            className={`text-[14px] font-semibold leading-snug tracking-tight sm:text-[15px] ${
              item.isRead ? "text-foreground/55" : "text-foreground"
            }`}
          >
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground sm:text-ui">
            {blurb}
          </p>
        </button>

        <div className="mt-3 h-px bg-border/55" aria-hidden />

        <div className="mt-2 flex items-center justify-end gap-3">
          {/* ── Listen / audio button ── */}
          <button
            type="button"
            onClick={() => onListen?.(item)}
            className={`flex items-center gap-1.5 text-label font-semibold uppercase tracking-wider transition-colors duration-150 ${
              isPlaying
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            }`}
            aria-label={isPlaying ? "Pause audio" : isPaused ? "Resume audio" : "Listen to lesson"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3" aria-hidden />
                <span className="flex items-end gap-px h-3" aria-hidden>
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_infinite]" style={{ height: "35%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.18s_infinite]" style={{ height: "100%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.36s_infinite]" style={{ height: "55%" }} />
                  <span className="w-[2px] rounded-full bg-current animate-[audioBar_0.7s_ease-in-out_0.12s_infinite]" style={{ height: "80%" }} />
                </span>
              </>
            ) : (
              <>
                <Headphones className="h-3 w-3" aria-hidden />
                {isPaused ? "Resume" : "Listen"}
              </>
            )}
          </button>

          {/* ── Read now / Read ── */}
          <button
            type="button"
            onClick={onClick}
            className={`text-label font-semibold uppercase tracking-wider transition-colors duration-150 ${
              item.isRead
                ? "text-muted-foreground/45"
                : "text-primary hover:text-primary/80"
            }`}
          >
            {item.isRead ? "Read" : "Read now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonFeedCard;
