import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackCertificate } from "./TrackCertificate";
import { issueTrackCertificate } from "@/lib/certificates/issue";

describe("TrackCertificate", () => {
  const certificate = issueTrackCertificate({
    courseId: "mock-path-mastered",
    recipientName: "Awais Hussain",
    topic: "Stoic Philosophy",
    lessonCount: 14,
    streakAtCompletion: 14,
    completedAt: new Date("2025-08-22T12:00:00.000Z"),
  });

  it("renders branded certificate fields from the design spec", () => {
    render(<TrackCertificate certificate={certificate} />);

    expect(screen.getByText("This certifies that")).toBeInTheDocument();
    expect(screen.getByText("Awais Hussain")).toBeInTheDocument();
    expect(screen.getByText("Stoic Philosophy")).toBeInTheDocument();
    expect(screen.getByText(/14 lessons/)).toBeInTheDocument();
    expect(screen.getByText("14 days")).toBeInTheDocument();
    expect(screen.getByText(certificate.certificateId)).toBeInTheDocument();
    expect(screen.getByText("curi.one/verify")).toBeInTheDocument();
  });
});
