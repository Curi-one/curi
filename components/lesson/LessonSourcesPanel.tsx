"use client";

import { useEffect, type MutableRefObject } from "react";
import { ArrowUpRight, Globe2, X } from "lucide-react";
import type { LessonResponse } from "@/lib/api/schemas";

type Props = {
  open: boolean;
  lesson: LessonResponse;
  topicLabel: string;
  activeSourceIndex: number | null;
  onClose: () => void;
  sourceRowRefs: MutableRefObject<(HTMLAnchorElement | null)[]>;
};

function domainInitials(title: string, url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0] || title;
    return label.slice(0, 2).toUpperCase();
  } catch {
    return title
      .replace(/^(The |A |An )/i, "")
      .slice(0, 2)
      .toUpperCase();
  }
}

function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Branded slide-over sources list — mirrors lesson reader typography. */
export function LessonSourcesPanel({
  open,
  lesson,
  topicLabel,
  activeSourceIndex,
  onClose,
  sourceRowRefs,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const heading = topicLabel || lesson.title;

  return (
    <>
      <div
        className="sources-panel-backdrop fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] md:left-[var(--sidebar-width)]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-sources-title"
        className="sources-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col border-l-2 border-ink bg-paper md:top-0"
      >
        <div className="shrink-0 border-b border-border px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="wall-label mb-4 flex-wrap">
                <span>
                  Sources
                  {lesson.sources.length > 0
                    ? ` · ${lesson.sources.length} references`
                    : ""}
                </span>
              </div>
              <h2
                id="lesson-sources-title"
                className="font-display text-display-2xs font-light leading-tight tracking-tight text-ink"
              >
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center border border-border text-ink-muted transition-colors duration-small ease-out hover:border-ink/25 hover:text-ink"
              aria-label="Close sources"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-border bg-paper-secondary px-6 py-4">
          <p className="font-ui text-ui-3xs leading-relaxed text-ink-muted">
            These references informed the lesson content. Curi synthesises ideas
            across sources — always read the originals for full context.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {lesson.sources.length === 0 ? (
            <p className="px-2 py-6 font-ui text-ui-sm text-ink-muted">
              No sources listed for this lesson yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {lesson.sources.map((source, i) => {
                const isActive = activeSourceIndex === i;
                return (
                  <li key={source.url}>
                    <a
                      ref={(el) => {
                        sourceRowRefs.current[i] = el;
                      }}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`lesson-source-${i + 1}`}
                      className={`group flex items-start gap-3.5 border bg-paper-secondary p-4 transition-colors duration-small ease-out hover:bg-paper ${
                        isActive
                          ? "border-ink border-l-[3px] border-l-accent bg-paper-tertiary"
                          : "border-border hover:border-ink/25"
                      }`}
                    >
                      <span className="takeaway-number pt-0.5 tabular-nums">
                        {i + 1}
                      </span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink font-meta text-[10px] font-semibold uppercase tracking-wider text-paper">
                        {domainInitials(source.title, source.url)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-ui text-ui-sm font-medium leading-snug text-ink group-hover:underline">
                          {source.title}
                        </span>
                        <div className="mt-2 flex items-center gap-1.5 font-meta text-[10px] tracking-[0.08em] text-ink-muted">
                          <Globe2
                            className="h-2.5 w-2.5 shrink-0 opacity-60"
                            aria-hidden
                          />
                          <span className="truncate">{sourceHost(source.url)}</span>
                        </div>
                      </div>
                      <ArrowUpRight
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted/40 transition-colors duration-small ease-out group-hover:text-ink-muted"
                        aria-hidden
                      />
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
