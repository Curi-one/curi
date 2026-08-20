"use client";

import { useState } from "react";
import { getShareableFact } from "@/lib/lessons/shareable-facts";

type Props = { topic: string; title: string };

export function ShareableFact({ topic, title }: Props) {
  const item = getShareableFact(topic);
  const shareText = `Today I learned: ${item.fact} — from my Curi lesson "${title}" on ${topic}.`;
  const encoded = encodeURIComponent(shareText);
  const [copied, setCopied] = useState(false);

  function copyShareText() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      });
    }
  }

  return (
    <aside className="my-12 border-y border-border py-7">
      <div className="grid gap-7 lg:grid-cols-[0.34fr_1fr] lg:items-start">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-ink-muted">
            Shareable fact
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            A small founder idea from today&apos;s lesson, written to share.
          </p>
        </div>
        <div>
          <blockquote className="font-display text-2xl font-light leading-tight tracking-[-0.03em] text-ink sm:text-3xl">
            &ldquo;{item.fact}&rdquo;
          </blockquote>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
            {item.reflection}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.one")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors hover:border-accent/40 hover:text-accent"
              onClick={(e) => {
                e.preventDefault();
                copyShareText();
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://curi.one")}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyShareText}
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors hover:border-accent/40 hover:text-accent"
            >
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
