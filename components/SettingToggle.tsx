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
        className="focus-ring flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-none"
      >
        <span
          className={`setting-toggle-track ${checked ? "is-checked" : ""}`}
          aria-hidden
        >
          <span className="setting-toggle-thumb" />
        </span>
      </button>
    </div>
  );
}
