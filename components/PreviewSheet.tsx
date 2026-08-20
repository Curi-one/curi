"use client";

import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";

type Props = {
  item: CataloguePath | CatalogueBook | null;
  itemType: "path" | "book";
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  atLimit?: boolean;
};

export function PreviewSheet({
  item,
  itemType,
  open,
  onClose,
  onStart,
  atLimit,
}: Props) {
  if (!open || !item) return null;

  const title =
    itemType === "book"
      ? (item as CatalogueBook).title
      : (item as CataloguePath).topic;
  const description = item.description;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative w-full rounded-t-2xl border border-border bg-paper p-6 pb-8 animate-slide-up shadow-lg">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
        <p className="font-meta">{itemType === "book" ? "Book path" : "Path"}</p>
        <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {description}
        </p>
        {atLimit && (
          <p className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
            Free plan includes 2 active paths. Shelve one or upgrade to start
            another.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
          <button type="button" onClick={onStart} className="btn-primary flex-1">
            {atLimit ? "Upgrade" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
