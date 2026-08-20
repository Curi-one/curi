type SettingToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingToggle({
  label,
  hint,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none text-ink">{label}</p>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors active:scale-[0.93] ${
            checked ? "bg-ink" : "bg-ink-muted/25 hover:bg-ink-muted/35"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-paper transition-transform duration-200 ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
            style={{
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.12)",
            }}
          />
        </span>
      </button>
    </div>
  );
}
