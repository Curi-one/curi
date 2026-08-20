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
    <div className="fixed inset-0 z-50 flex items-end bg-ink/30">
      <div className="w-full rounded-t-2xl border border-border bg-paper p-6 animate-slide-up">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {itemType === "book" ? "Book path" : "Path"}
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
        <p className="mt-3 text-ink-muted">{description}</p>
        {atLimit && (
          <p className="mt-4 text-sm text-streak">
            Free plan includes 2 active paths. Upgrade to start another.
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
