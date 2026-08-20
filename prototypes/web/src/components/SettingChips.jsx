import React from "react";

export function SettingChips({ label, hint, value, onChange, options }) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const v = typeof opt === "string" ? opt : opt.value;
          const l = typeof opt === "string" ? opt : opt.label;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium leading-none transition-all duration-150 ${
                value === v
                  ? "border-foreground bg-foreground text-background depth-btn-primary"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground depth-btn-light"
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

export default SettingChips;
