import Link from "next/link";
import { Award, Trophy } from "lucide-react";
import type { PathSummary } from "@/lib/api/schemas";
import { PathProgressBar } from "@/components/PathProgressBar";
import { TopicThumbnail } from "@/components/TopicThumbnail";
import { depthLabel } from "@/lib/ui/constants";
import {
  topicArt,
  topicPatternStyle,
} from "@/lib/ui/topic-swatch";

type Props = {
  path: PathSummary;
  tab: "exploring" | "mastered" | "shelved";
};

export function LibraryPathCard({ path, tab }: Props) {
  if (tab === "mastered") {
    const art = topicArt(path.topic);
    return (
      <Link
        href={`/library/${path.id}`}
        className="group focus-ring relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-none p-5 text-left text-paper transition-[background-color] duration-[300ms] ease-out hover:bg-ink-2 sm:min-h-[220px] sm:p-6"
        style={{ background: art.field }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={topicPatternStyle(art.pattern)}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 flex select-none items-end justify-end overflow-hidden font-display"
          style={{
            color: art.glyphColor,
            opacity: 0.35,
            fontSize: "9rem",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 0.78,
            paddingRight: "4%",
            paddingBottom: "2%",
          }}
          aria-hidden
        >
          {art.glyph}
        </div>
        <div className="relative flex h-7 w-7 items-center justify-center rounded-none bg-white/15 ring-1 ring-white/10">
          <Trophy className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
        </div>
        <div className="relative">
          <p className="font-display text-2xl leading-tight tracking-tight">
            {path.topic}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-ui-4xs uppercase tracking-wider opacity-70">
            <Award className="h-3 w-3" aria-hidden />
            {path.totalLessons} lessons · Mastered
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/library/${path.id}`}
      className="surface-card surface-card-interactive interactive-card focus-ring group block px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <TopicThumbnail topic={path.topic} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-display-2xs leading-snug text-ink">
              {path.topic}
            </p>
            {tab === "shelved" && (
              <span className="shrink-0 font-meta normal-case">View only</span>
            )}
          </div>
          <p className="mt-2 font-meta">
            {depthLabel(path.depth)} · {path.progress} of {path.totalLessons}{" "}
            lessons
          </p>
          <PathProgressBar progress={path.progress} total={path.totalLessons} />
        </div>
      </div>
    </Link>
  );
}
