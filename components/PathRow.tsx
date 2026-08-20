import Link from "next/link";
import type { PathSummary } from "@/lib/api/schemas";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  path: PathSummary;
  dimmed?: boolean;
};

export function PathRow({ path, dimmed }: Props) {
  const lessonNum = Math.min(path.progress + 1, path.totalLessons);
  const href = `/courses/${path.id}/lessons/${path.progress}`;

  return (
    <Link
      href={href}
      className={`block rounded-xl border border-border bg-paper-secondary px-4 py-4 transition-opacity ${
        dimmed ? "opacity-50" : "hover:border-ink/20"
      }`}
    >
      <p className="font-display text-lg leading-snug text-ink">{path.topic}</p>
      <p className="mt-1 text-sm text-ink-muted">
        {depthLabel(path.depth)} · Lesson {lessonNum} of {path.totalLessons}
      </p>
    </Link>
  );
}
