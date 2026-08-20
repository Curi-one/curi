import Link from "next/link";
import { Check, Lock } from "lucide-react";

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
    <ol className="space-y-2">
      {nodes.map((node) => {
        const clickable =
          (node.status === "today" || node.status === "read") && !readOnly;
        const content = (
          <>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                node.status === "read"
                  ? "bg-ink text-paper"
                  : node.status === "today"
                    ? "bg-accent text-paper ring-2 ring-accent/25"
                    : "bg-paper-tertiary text-ink-muted"
              }`}
            >
              {node.status === "read" ? (
                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              ) : node.status === "locked" ? (
                <Lock className="h-3.5 w-3.5" aria-hidden />
              ) : (
                node.index + 1
              )}
            </span>
            <span
              className={`flex-1 py-2 text-[15px] leading-snug ${
                node.status === "locked" ? "text-ink-muted" : "text-ink"
              }`}
            >
              {node.title}
            </span>
            <span
              className={`font-meta normal-case ${
                node.status === "today" ? "text-accent" : ""
              }`}
            >
              {node.status === "today" ? "Today" : node.status}
            </span>
          </>
        );

        if (clickable) {
          return (
            <li key={node.index}>
              <Link
                href={`/courses/${courseId}/lessons/${node.index}?from=library`}
                className="flex items-center gap-3 rounded-xl border border-border bg-paper-secondary px-3 hover:border-ink/20"
              >
                {content}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={node.index}
            className="flex items-center gap-3 rounded-xl border border-border px-3 opacity-90"
          >
            {content}
          </li>
        );
      })}
    </ol>
  );
}
