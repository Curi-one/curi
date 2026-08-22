import { describe, expect, it } from "vitest";
import {
  buildTrackInfoLine,
  estimateStudyMinutes,
  formatCertificateId,
} from "./format";
import { issueTrackCertificate } from "./issue";
import { buildCertificateShareText } from "./share";

describe("track certificate helpers", () => {
  it("estimates study minutes from lesson count", () => {
    expect(estimateStudyMinutes(14)).toBe(42);
  });

  it("builds a stable certificate id", () => {
    const id = formatCertificateId(new Date("2025-08-22T00:00:00.000Z"), "c1");
    expect(id).toMatch(/^CUR-2025-\d{4}$/);
  });

  it("issues certificate payload on completion", () => {
    const cert = issueTrackCertificate({
      courseId: "path-stoicism",
      recipientName: "Awais Hussain",
      topic: "Stoic Philosophy",
      lessonCount: 14,
      streakAtCompletion: 14,
      completedAt: new Date("2025-08-22T12:00:00.000Z"),
    });

    expect(cert.recipientName).toBe("Awais Hussain");
    expect(cert.lessonCount).toBe(14);
    expect(cert.studyMinutes).toBe(42);
    expect(cert.streakAtCompletion).toBe(14);
  });

  it("builds social share copy", () => {
    const cert = issueTrackCertificate({
      courseId: "path-stoicism",
      recipientName: "Awais",
      topic: "Stoic Philosophy",
      lessonCount: 14,
      streakAtCompletion: 14,
    });

    expect(buildCertificateShareText(cert)).toContain("Stoic Philosophy");
    expect(buildCertificateShareText(cert)).toContain("14-lesson track");
  });

  it("formats track info line for the certificate body", () => {
    expect(buildTrackInfoLine(14, 42)).toContain("14 lessons");
    expect(buildTrackInfoLine(14, 42)).toContain("Active recall verified");
  });
});
