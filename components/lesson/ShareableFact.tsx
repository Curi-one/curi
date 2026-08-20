"use client";

import { useState } from "react";
import type { ShareableFactPayload } from "@/lib/api/schemas";
import { getShareableFact } from "@/lib/lessons/shareable-facts";
import {
  buildShareText,
  copyAndOpenLinkedIn,
  linkedinShareUrl,
  twitterIntentUrl,
} from "@/lib/share/lesson-share";

type Props = {
  topic: string;
  title: string;
  /** Prefer Perplexity / API fact when provided. */
  fact?: ShareableFactPayload;
};

export function ShareableFact({ topic, title, fact }: Props) {
  const item = fact ?? getShareableFact(topic);
  const shareText = buildShareText({
    fact: item.fact,
    topic,
    lessonTitle: title,
  });
  const [copied, setCopied] = useState(false);

  function copyShareText() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      });
    }
  }

  function shareToLinkedIn() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    void copyAndOpenLinkedIn(shareText);
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
          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={twitterIntentUrl(shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Share on X
            </a>
            <a
              href={linkedinShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors hover:border-accent/40 hover:text-accent"
              onClick={(e) => {
                e.preventDefault();
                shareToLinkedIn();
              }}
            >
              Share on LinkedIn
            </a>
            <button
              type="button"
              onClick={copyShareText}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors hover:border-accent/40 hover:text-accent"
            >
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
