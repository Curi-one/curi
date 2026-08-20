export const SHARE_SITE_URL = "https://curi.one";

export type ShareTextOptions = {
  fact: string;
  topic?: string;
  lessonTitle?: string;
};

/** Builds the "Today I learned" share copy used across ShareableFact and CompleteSheet. */
export function buildShareText({
  fact,
  topic,
  lessonTitle,
}: ShareTextOptions): string {
  let attribution = "from my Curi lesson.";
  if (lessonTitle && topic) {
    attribution = `from my Curi lesson "${lessonTitle}" on ${topic}.`;
  } else if (lessonTitle) {
    attribution = `from my Curi lesson "${lessonTitle}".`;
  } else if (topic) {
    attribution = `from my ${topic} path on Curi.`;
  }

  return `Today I learned: ${fact} — ${attribution}`;
}

export function twitterIntentUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function linkedinShareUrl(): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    SHARE_SITE_URL,
  )}`;
}

/**
 * LinkedIn's share-offsite endpoint only accepts a URL, not custom text, so we
 * copy the share text to the clipboard first and open the share dialog after.
 */
export async function copyAndOpenLinkedIn(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
  if (typeof window !== "undefined") {
    window.open(linkedinShareUrl(), "_blank", "noopener,noreferrer");
  }
}
