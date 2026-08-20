import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Compass } from "lucide-react";
import { depthPills } from "@/data/onboarding-data";

function Page({ children, className = "" }) {
  return (
    <section className={`curi-animate-in flex flex-1 flex-col ${className}`}>
      {children}
    </section>
  );
}

export function NewPath({ topic, setTopic, onSubmit, onBrowse }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Page className="justify-center py-10 sm:py-14">
      <div className="mx-auto w-full max-w-xl px-1 sm:px-2">
        <p className="mb-2 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          New path
        </p>
        <h1 className="font-serif text-[2rem] font-normal leading-tight tracking-[-0.025em] text-foreground sm:text-[2.35rem]">
          What do you want to learn?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Type any topic. Curi builds a daily lesson path around it — you pick the depth next.
        </p>

        <form onSubmit={onSubmit} className="mt-8">
          <div
            className="flex cursor-text items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-[15px] shadow-sm transition-colors duration-200"
            style={{
              borderColor: focused ? "hsl(var(--foreground) / 0.18)" : undefined,
              background: focused ? "hsl(var(--foreground) / 0.03)" : undefined,
            }}
            onMouseDown={(e) => {
              if (e.target.closest("button")) return;
              inputRef.current?.focus();
            }}
          >
            <input
              ref={inputRef}
              id="new-path-topic"
              type="search"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. liquidation preferences, burn rate, pricing strategy..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[17px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
              autoComplete="off"
              aria-label="Topic for your new learning path"
            />
            <button
              type="submit"
              disabled={!topic.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all duration-150 hover:scale-[1.07] active:scale-95 disabled:opacity-20"
              aria-label="Create path"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 pl-1">
          {depthPills.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-caption text-muted-foreground/70"
            >
              <Icon className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
              {label}
            </span>
          ))}
        </div>

        {onBrowse && (
          <div className="mt-10 border-t border-border/60 pt-6">
            <button
              type="button"
              onClick={onBrowse}
              className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Compass className="h-4 w-4 opacity-60" aria-hidden />
              Prefer a curated path? Browse the library
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}

export default NewPath;
