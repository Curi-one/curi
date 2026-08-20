type Tab = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  /** Pill chips (default) or marketplace underline tabs. */
  variant?: "pills" | "underline";
};

export function TabPills({ tabs, active, onChange, variant = "pills" }: Props) {
  if (variant === "underline") {
    return (
      <div className="flex border-b border-border" role="tablist">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative mr-5 min-h-11 pb-3 text-sm font-medium transition-colors focus-ring ${
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0
                ? ` · ${tab.count}`
                : ""}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-px bg-ink"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`min-h-11 rounded-none px-4 py-2 text-sm transition-colors focus-ring ${
            active === tab.id
              ? "bg-ink text-paper"
              : "interactive-chip border border-border text-ink-muted hover:border-ink/30"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 ? ` · ${tab.count}` : ""}
        </button>
      ))}
    </div>
  );
}
