import Link from "next/link";
import type { PathSummary } from "@/lib/api/schemas";
import { PathProgressBar } from "@/components/PathProgressBar";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  path: PathSummary;
  dimmed?: boolean;
};

export function PathRow({ path, dimmed }: Props) {
  const lessonNum = Math.min(path.progress + 1, path.totalLessons);
  const href = `/courses/${path.id}/lessons/${path.progress}?from=today`;

  return (
    <Link
      href={href}
      className={`surface-card block px-4 py-4 transition-opacity ${
        dimmed ? "opacity-55" : "hover:border-accent/30"
      }`}
    >
      <p
        className="font-display text-[22px] font-normal leading-snug text-ink"
        style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 0" }}
      >
        {path.topic}
      </p>
      <p className="mt-2 font-meta">
        {depthLabel(path.depth)} · Lesson {lessonNum} of {path.totalLessons}
      </p>
      <PathProgressBar progress={path.progress} total={path.totalLessons} />
    </Link>
  );
}
