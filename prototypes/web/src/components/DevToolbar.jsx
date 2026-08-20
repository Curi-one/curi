import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { DEV_MODES } from "@/lib/dev-utils";

export function DevToolbar({ devMode, onSetMode }) {
  const [open, setOpen] = useState(false);
  const active = devMode !== "off";
  return (
    <div className="fixed bottom-4 left-4 z-[9999]" style={{ fontFamily: "Inter, sans-serif" }}>
      {open ? (
        <div
          className="mb-2 flex w-52 flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-xl"
          style={{ fontSize: 12 }}
        >
          <div className="mb-0.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dev states</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground/60 transition hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => { onSetMode("off"); setOpen(false); }}
            className={`rounded-lg px-3 py-1.5 text-left transition ${devMode === "off" ? "bg-foreground text-background" : "text-foreground hover:bg-muted"}`}
          >
            <div className="font-semibold" style={{ fontSize: 11.5 }}>Reset</div>
            <div className="opacity-50" style={{ fontSize: 10 }}>Restore default state</div>
          </button>
          {DEV_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onSetMode(m.id); setOpen(false); }}
              className={`rounded-lg px-3 py-1.5 text-left transition ${devMode === m.id ? "bg-foreground text-background" : "text-foreground hover:bg-muted"}`}
            >
              <div className="font-semibold" style={{ fontSize: 11.5 }}>{m.label}</div>
              <div className={devMode === m.id ? "opacity-60" : "text-muted-foreground"} style={{ fontSize: 10 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm transition-all ${
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border/60 bg-card/90 text-muted-foreground hover:text-foreground backdrop-blur"
        }`}
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
        aria-label="Toggle dev state panel"
      >
        <SlidersHorizontal className="h-2.5 w-2.5" aria-hidden />
        {active ? DEV_MODES.find((m) => m.id === devMode)?.label ?? "Dev" : "Dev"}
      </button>
    </div>
  );
}

export default DevToolbar;
