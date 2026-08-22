"use client";

import { useState } from "react";
import type { ShareableFactPayload } from "@/lib/api/schemas";
import {
  buildShareText,
  copyAndOpenLinkedIn,
  linkedinShareUrl,
  twitterIntentUrl,
} from "@/lib/share/lesson-share";

type Props = {
  /** Broader path topic — anchors the fun fact in context. */
  topic: string;
  title: string;
  /** Lesson API / Perplexity shareable fact — required, no curated fallback. */
  fact: ShareableFactPayload;
};

export function ShareableFact({ topic, title, fact }: Props) {
  const item = fact;
  const contextLabel = topic.trim() || title;
  const shareText = buildShareText({
    fact: item.fact,
    topic: contextLabel,
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
    <aside className="py-10">
      <div className="wall-label mb-5 flex-wrap">
        <span>Fun fact · {contextLabel}</span>
      </div>
      <blockquote className="font-display text-display-2xs font-light italic leading-snug tracking-tight text-ink sm:text-display-xs">
        &ldquo;{item.fact}&rdquo;
      </blockquote>
      <p className="mt-4 max-w-2xl font-ui text-ui-md leading-relaxed text-ink-muted">
        {item.reflection}
      </p>
      <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          href={twitterIntentUrl(shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-none bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-small ease-out hover:bg-ink/85"
        >
          Share on X
        </a>
        <a
          href={linkedinShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-none border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors duration-small ease-out hover:border-ink hover:text-ink"
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
          className="inline-flex min-h-11 items-center justify-center rounded-none border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors duration-small ease-out hover:border-ink hover:text-ink"
        >
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
    </aside>
  );
}
