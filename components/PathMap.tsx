import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";

type PathMapNode = {
  index: number;
  title: string;
  status: "read" | "today" | "locked";
};

type Props = {
  courseId: string;
  nodes: PathMapNode[];
  readOnly?: boolean;
};

export function PathMap({ courseId, nodes, readOnly }: Props) {
  return (
    <div className="divide-y divide-border">
      {nodes.map((node) => {
        const isToday = node.status === "today";
        const isRead = node.status === "read";
        const isLocked = node.status === "locked";
        const clickable = (isToday || isRead) && !readOnly;

        const inner = (
          <>
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                isRead || isToday ? "text-ink" : "text-ink-muted/40"
              }`}
            >
              {isRead && (
                <div className="flex h-5 w-5 items-center justify-center bg-ink">
                  <Check
                    className="h-3 w-3 text-paper"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </div>
              )}
              {isToday && (
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
              {isLocked && (
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-meta text-[10px] uppercase tracking-[0.2em] text-ink-muted/60">
                Lesson {node.index + 1}
              </div>
              <div
                className={`mt-0.5 text-sm leading-snug ${
                  isRead || isToday ? "text-ink" : "text-ink-muted/50"
                }`}
              >
                {node.title}
              </div>
            </div>

            {isRead && (
              <span className="shrink-0 font-meta text-[10px] uppercase tracking-[0.18em] text-ink-muted/60">
                Review
              </span>
            )}
            {isToday && (
              <span className="shrink-0 font-meta text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Continue
              </span>
            )}
          </>
        );

        if (clickable) {
          return (
            <Link
              key={node.index}
              href={`/courses/${courseId}/lessons/${node.index}?from=library`}
              className="focus-ring flex w-full items-center gap-4 px-1 py-4 text-left transition-colors hover:bg-paper-secondary/60"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div
            key={node.index}
            className={`flex w-full items-center gap-4 px-1 py-4 text-left ${
              isLocked ? "cursor-default opacity-35" : ""
            }`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
