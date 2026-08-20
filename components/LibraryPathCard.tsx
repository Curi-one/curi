import Link from "next/link";
import type { PathSummary } from "@/lib/api/schemas";
import { PathProgressBar } from "@/components/PathProgressBar";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  path: PathSummary;
  tab: "exploring" | "mastered" | "shelved";
};

export function LibraryPathCard({ path, tab }: Props) {
  return (
    <Link
      href={`/library/${path.id}`}
      className="surface-card block px-4 py-4 transition-colors hover:border-accent/30"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[22px] leading-snug text-ink">
          {path.topic}
        </p>
        {tab === "mastered" && (
          <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] uppercase tracking-wide text-paper">
            Mastered
          </span>
        )}
        {tab === "shelved" && (
          <span className="shrink-0 font-meta normal-case">View only</span>
        )}
      </div>
      <p className="mt-2 font-meta">
        {depthLabel(path.depth)} · {path.progress} of {path.totalLessons} lessons
      </p>
      <PathProgressBar progress={path.progress} total={path.totalLessons} />
    </Link>
  );
}
