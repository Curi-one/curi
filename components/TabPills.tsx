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
              className={`relative mr-5 min-h-11 pb-3 font-meta text-ui-3xs transition-colors duration-200 focus-ring ${
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0
                ? ` · ${tab.count}`
                : ""}
              <span
                className={`absolute bottom-0 left-0 right-0 h-px origin-left bg-ink transition-transform duration-300 ease-out ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
                aria-hidden
              />
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
          className={`interactive-chip focus-ring min-h-11 rounded-none border px-4 py-2 font-meta transition-all duration-200 ${
            active === tab.id
              ? "border-ink bg-ink text-paper"
              : "border-border text-ink-muted hover:border-ink/30 hover:text-ink"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 ? ` · ${tab.count}` : ""}
        </button>
      ))}
    </div>
  );
}
