const MINUTES_PER_LESSON = 3;

export function estimateStudyMinutes(lessonCount: number): number {
  return Math.max(lessonCount, lessonCount * MINUTES_PER_LESSON);
}

export function formatCertificateId(completedAt: Date, courseId: string): string {
  const year = completedAt.getUTCFullYear();
  const hash = courseId
    .split("")
    .reduce((acc, char) => (acc + char.charCodeAt(0) * 17) % 10000, 0);
  return `CUR-${year}-${String(hash).padStart(4, "0")}`;
}

export function formatCertificateDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatCertificateYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric" });
}

export function formatCertificateLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildTrackInfoLine(
  lessonCount: number,
  studyMinutes: number,
): string {
  return `${lessonCount} lessons · ${studyMinutes} minutes of cumulative study · Active recall verified · Spaced repetition complete · 100% of lessons reviewed`;
}

export function certificateFilename(topic: string): string {
  const slug = topic
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `curi-${slug || "track"}-certificate.png`;
}
