import {
  estimateStudyMinutes,
  formatCertificateId,
} from "@/lib/certificates/format";
import type { TrackCertificate } from "@/lib/certificates/types";

type IssueInput = {
  courseId: string;
  recipientName: string;
  topic: string;
  lessonCount: number;
  streakAtCompletion: number;
  completedAt?: Date;
};

export function issueTrackCertificate(input: IssueInput): TrackCertificate {
  const completedAt = input.completedAt ?? new Date();
  const lessonCount = Math.max(1, input.lessonCount);

  return {
    courseId: input.courseId,
    recipientName: input.recipientName.trim() || "Learner",
    topic: input.topic.trim(),
    lessonCount,
    studyMinutes: estimateStudyMinutes(lessonCount),
    streakAtCompletion: Math.max(0, input.streakAtCompletion),
    completedAt: completedAt.toISOString(),
    certificateId: formatCertificateId(completedAt, input.courseId),
  };
}
