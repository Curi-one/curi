type Tab = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
};

export function TabPills({ tabs, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            active === tab.id
              ? "bg-ink text-paper shadow-[inset_0_-2px_0_var(--color-accent)]"
              : "border border-border text-ink-muted hover:border-ink/30 hover:text-ink"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 ? ` · ${tab.count}` : ""}
        </button>
      ))}
    </div>
  );
}
