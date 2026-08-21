"use client";

import { useEffect } from "react";
import { ArrowRight, BookOpen, X } from "lucide-react";
import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";
import {
  generateLessonTitles,
  lessonCountForDepth,
} from "@/lib/mock/fixtures";
import { CourseCover } from "@/components/CourseCover";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  item: CataloguePath | CatalogueBook | null;
  itemType: "path" | "book";
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  atLimit?: boolean;
};

function isPath(item: CataloguePath | CatalogueBook): item is CataloguePath {
  return "topic" in item && "depth" in item;
}

export function PreviewSheet({
  item,
  itemType,
  open,
  onClose,
  onStart,
  atLimit,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const title = itemType === "book" ? (item as CatalogueBook).title : (item as CataloguePath).topic;
  const description = item.description;

  let meta = "";
  let outlineTeaser: string[] = [];
  if (itemType === "path" && isPath(item)) {
    const count = lessonCountForDepth(item.topic, item.depth);
    meta = `${depthLabel(item.depth)} · ${count} lessons`;
    outlineTeaser = generateLessonTitles(item.topic, item.depth, count).slice(
      0,
      5,
    );
  } else {
    const book = item as CatalogueBook;
    meta = `${book.author} · ${book.pathCount} paths`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-stretch justify-end sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Path preview: ${title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-paper shadow-2xl animate-slide-up sm:max-h-[88vh] sm:max-w-[540px] sm:rounded-3xl">
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-paper/90 text-ink-muted shadow-sm transition hover:bg-paper-secondary hover:text-ink sm:right-5 sm:top-5"
          aria-label="Close"
        >
          <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CourseCover topic={title} height={140} />
          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pt-5">
            <p className="font-meta">
              {itemType === "book" ? "Book" : "Founder path"}
              {meta ? ` · ${meta}` : ""}
            </p>
            <h2 className="mt-1 font-display text-2xl leading-snug text-ink sm:text-[1.65rem]">
              {title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              {description}
            </p>
          </div>

          {outlineTeaser.length > 0 && (
            <div className="border-t border-border">
              <div className="px-5 pb-1 pt-4 sm:px-6">
                <p className="font-meta">What you&apos;ll cover</p>
              </div>
              <ul>
                {outlineTeaser.map((lesson, i) => (
                  <li
                    key={lesson}
                    className="flex items-start gap-3.5 border-t border-border/60 px-5 py-3.5 first:border-t-0 sm:px-6"
                  >
                    <span className="w-5 shrink-0 pt-[3px] text-right font-meta tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="min-w-0 flex-1 text-sm leading-snug text-ink/85">
                      {lesson}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="h-4" aria-hidden />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-paper-secondary/40 px-5 py-4 sm:px-6 sm:py-5">
          {atLimit ? (
            <>
              <div className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-paper-secondary py-3 text-sm font-medium text-ink-muted">
                <BookOpen className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                2 active paths — at your limit
              </div>
              <p className="mt-2 text-center text-xs text-ink-muted">
                Finish or shelve an active path in Library, or upgrade to start
                another.
              </p>
              <button
                type="button"
                onClick={onStart}
                className="btn-primary mt-4 w-full"
              >
                Upgrade
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStart}
                className="btn-primary flex w-full items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
                Start this path
              </button>
              <p className="mt-2 text-center text-xs text-ink-muted">
                Clarify first · ~5 min per lesson
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
