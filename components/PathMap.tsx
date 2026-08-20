import Link from "next/link";

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
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                node.status === "read"
                  ? "bg-ink text-paper"
                  : node.status === "today"
                    ? "bg-accent text-paper"
                    : "bg-paper-tertiary text-ink-muted"
              }`}
            >
              {node.index + 1}
            </span>
            <span
              className={`flex-1 py-2 ${
                node.status === "locked" ? "text-ink-muted" : "text-ink"
              }`}
            >
              {node.title}
            </span>
            <span className="text-xs uppercase tracking-wide text-ink-muted">
              {node.status}
            </span>
          </>
        );

        if (clickable) {
          return (
            <li key={node.index}>
              <Link
                href={`/courses/${courseId}/lessons/${node.index}`}
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
