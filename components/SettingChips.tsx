type ChipOption = string | { value: string; label: string };

type SettingChipsProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: ChipOption[];
};

function optionValue(opt: ChipOption): string {
  return typeof opt === "string" ? opt : opt.value;
}

function optionLabel(opt: ChipOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

export function SettingChips({
  label,
  hint,
  value,
  onChange,
  options,
}: SettingChipsProps) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-medium leading-none text-ink">{label}</p>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const v = optionValue(opt);
          const l = optionLabel(opt);
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium leading-none transition-colors ${
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper text-ink-muted hover:border-ink/40 hover:text-ink"
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
