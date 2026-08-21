import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildChapters } from "@/lib/ui/topic-swatch";

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
  const chapters = buildChapters(nodes.length);

  return (
    <div className="space-y-6">
      {chapters.map((chapter, ci) => {
        const chapterNodes = nodes.slice(chapter.start, chapter.end);
        return (
          <div key={ci}>
            {chapter.label && (
              <div className="mb-2 flex items-center gap-3">
                <span className="font-meta">{chapter.label}</span>
                <div className="h-px flex-1 bg-border/60" aria-hidden />
              </div>
            )}

            <div className="relative">
              <div
                className="absolute bottom-5 left-[21px] top-5 w-px bg-border/50"
                aria-hidden
              />

              <ol className="space-y-px">
                {chapterNodes.map((node) => {
                  const clickable =
                    (node.status === "today" || node.status === "read") &&
                    !readOnly;
                  const isToday = node.status === "today";
                  const isRead = node.status === "read";
                  const isLocked = node.status === "locked";

                  const inner = (
                    <div className="flex items-start gap-3.5">
                      <div className="relative z-[1] mt-[3px] shrink-0">
                        {isRead ? (
                          <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink/65">
                            <Check
                              className="h-2 w-2 text-paper"
                              strokeWidth={3}
                              aria-hidden
                            />
                          </div>
                        ) : isToday ? (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-paper/80 bg-paper/90 ring-2 ring-accent/40" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border bg-paper-tertiary/40" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {isToday && (
                          <p className="mb-0.5 font-meta text-paper/55">
                            Up next
                          </p>
                        )}
                        <p
                          className={`text-sm leading-snug ${
                            isToday
                              ? "font-medium text-paper"
                              : isRead
                                ? "text-ink"
                                : "text-ink-muted/50"
                          }`}
                        >
                          {node.title}
                        </p>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-1.5 ${
                          isToday ? "text-paper/50" : "text-ink-muted/30"
                        }`}
                      >
                        {(isRead || isToday) && (
                          <ArrowRight
                            className={`h-3.5 w-3.5 transition-all ${
                              isToday
                                ? "opacity-60"
                                : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-60"
                            }`}
                            aria-hidden
                          />
                        )}
                        <span className="w-7 text-right font-meta tabular-nums">
                          {String(node.index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  );

                  if (clickable) {
                    return (
                      <li key={node.index}>
                        <Link
                          href={`/courses/${courseId}/lessons/${node.index}?from=library`}
                          className={`group relative block w-full rounded-xl px-4 py-3 text-left transition-all duration-150 ${
                            isToday
                              ? "bg-ink text-paper"
                              : "hover:bg-paper-secondary/80"
                          }`}
                        >
                          {inner}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={node.index}
                      className={`relative rounded-xl px-4 py-3 ${
                        isLocked ? "cursor-default" : ""
                      }`}
                    >
                      {inner}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
