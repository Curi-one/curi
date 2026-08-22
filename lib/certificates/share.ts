import { linkedinShareUrl, twitterIntentUrl } from "@/lib/share/lesson-share";
import type { TrackCertificate } from "@/lib/certificates/types";

export function buildCertificateShareText(cert: TrackCertificate): string {
  const streakLine =
    cert.streakAtCompletion > 0
      ? `${cert.streakAtCompletion}-day streak at completion. `
      : "";

  return `I completed a ${cert.lessonCount}-lesson track in ${cert.topic} on Curi — ${streakLine}${cert.studyMinutes} minutes of daily learning, verified with active recall.`;
}

export function certificateTwitterUrl(cert: TrackCertificate): string {
  return twitterIntentUrl(buildCertificateShareText(cert));
}

export function certificateLinkedInUrl(): string {
  return linkedinShareUrl();
}

export async function copyCertificateShareText(
  cert: TrackCertificate,
): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(buildCertificateShareText(cert));
  }
}
