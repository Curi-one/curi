import React from "react";

export function SettingToggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.93] depth-track ${
          checked
            ? "bg-foreground"
            : "bg-muted-foreground/25 hover:bg-muted-foreground/35"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.12)" }}
        />
      </button>
    </div>
  );
}

export default SettingToggle;
