import React from "react";
import { getShareableFact } from "@/lib/topic-utils";

export function ShareableFact({ topic }) {
  const item = getShareableFact(topic);
  const shareText = `Today I learned: ${item.fact} — from my Curi lesson on ${topic}.`;
  const encoded = encodeURIComponent(shareText);

  function copyShareText() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  }

  return (
    <aside className="my-12 border-y border-border py-7 font-sans">
      <div className="grid gap-7 lg:grid-cols-[0.34fr_1fr] lg:items-start">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Shareable fact</div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A small founder idea from today's lesson, written to share.</p>
        </div>
        <div>
          <blockquote className="font-serif text-3xl leading-tight tracking-[-0.03em] text-foreground">
            &ldquo;{item.fact}&rdquo;
          </blockquote>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{item.reflection}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90 depth-btn-primary"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground/80 hover:border-brand/40 hover:text-brand depth-btn-light"
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyShareText}
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground/80 hover:border-brand/40 hover:text-brand depth-btn-light"
            >
              Copy text
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ShareableFact;
