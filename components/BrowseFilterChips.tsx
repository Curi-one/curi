type Props = {
  categories: string[];
  /** null ="All" selected. */
  active: string | null;
  onChange: (category: string | null) => void;
};

/** Category filter row for Explore (F3) — All + one chip per catalogue category. */
export function BrowseFilterChips({ categories, active, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className={`inline-flex min-h-11 shrink-0 items-center rounded-none border px-3.5 py-2 text-xs font-medium leading-none transition-colors focus-ring ${
          active === null
            ? "border-ink bg-ink text-paper"
            : "interactive-chip border-border bg-paper text-ink-muted hover:border-ink/40"
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const selected = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={selected}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-none border px-3.5 py-2 text-xs font-medium leading-none transition-colors focus-ring ${
              selected
                ? "border-ink bg-ink text-paper"
                : "interactive-chip border-border bg-paper text-ink-muted hover:border-ink/40"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
