import React from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { TopicThumbnail } from "@/components/TopicThumbnail";

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// 16 bars with varied heights for a natural waveform look
const BAR_HEIGHTS = [40, 75, 55, 90, 45, 100, 60, 80, 35, 95, 50, 70, 42, 88, 58, 65];

export function AudioPlayer({ nowPlaying, playbackRate, onToggle, onStop, onRestart, onSpeedChange }) {
  if (!nowPlaying) return null;

  const isPlaying = nowPlaying.state === "playing";

  function cycleSpeed() {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    onSpeedChange(next);
  }

  const speedLabel = playbackRate === 1 ? "1×" : `${playbackRate}×`;

  return (
    <div
      className="audio-player fixed bottom-5 right-5 z-50 w-[300px] overflow-hidden rounded-2xl border border-border/70 bg-background"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
      role="region"
      aria-label="Audio player"
    >
      {/* Header: thumbnail + title + close */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <TopicThumbnail topic={nowPlaying.topic} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/55">
            {nowPlaying.topic}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
            {nowPlaying.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onStop}
          aria-label="Close player"
          className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/40 transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {/* Waveform visualiser */}
      <div className="flex items-end justify-center gap-[2.5px] px-4 pb-3" style={{ height: 28 }} aria-hidden>
        {BAR_HEIGHTS.map((h, i) =>
          isPlaying ? (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-foreground/35 animate-[audioBar_0.7s_ease-in-out_infinite]"
              style={{ height: `${h}%`, animationDelay: `${((i * 0.09) % 0.7).toFixed(2)}s` }}
            />
          ) : (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-border/80"
              style={{ height: `${Math.round(h * 0.25)}%` }}
            />
          )
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/50" aria-hidden />

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart from beginning"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/50 transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>

        {/* Play / Pause — primary */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? "Pause" : "Resume"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition hover:opacity-75 active:scale-95"
        >
          {isPlaying
            ? <Pause className="h-4 w-4" aria-hidden />
            : <Play  className="h-4 w-4 translate-x-px" aria-hidden />}
        </button>

        {/* Speed cycle */}
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${speedLabel}. Click to change.`}
          className="flex h-8 min-w-[44px] items-center justify-center rounded-full border border-border/60 bg-muted/40 px-2.5 text-[11px] font-semibold text-muted-foreground transition hover:border-border hover:text-foreground"
        >
          {speedLabel}
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;
