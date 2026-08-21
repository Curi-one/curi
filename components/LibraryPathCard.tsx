import Link from "next/link";
import { Award, Trophy } from "lucide-react";
import type { PathSummary } from "@/lib/api/schemas";
import { PathProgressBar } from "@/components/PathProgressBar";
import { depthLabel } from "@/lib/ui/constants";
import { topicSwatch } from "@/lib/ui/topic-swatch";

type Props = {
  path: PathSummary;
  tab: "exploring" | "mastered" | "shelved";
};

export function LibraryPathCard({ path, tab }: Props) {
  if (tab === "mastered") {
    const [bg] = topicSwatch(path.topic);
    return (
      <Link
        href={`/library/${path.id}`}
        className="group focus-ring relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-none p-5 text-left text-paper transition hover:brightness-125 sm:min-h-[220px] sm:p-6"
        style={{ background: bg }}
      >
        <div
          className="pointer-events-none absolute inset-0 flex select-none items-end justify-end overflow-hidden p-2 opacity-[0.12]"
          aria-hidden
        >
          <span className="font-display display-hero text-display-xl leading-none tracking-tighter">
            {path.topic.slice(0, 1).toUpperCase()}
          </span>
        </div>
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/10">
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
      className="surface-card surface-card-interactive interactive-card focus-ring block px-4 py-4 group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-display-2xs leading-snug text-ink transition-colors group-hover:text-ink">
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
    </Link>
  );
}
