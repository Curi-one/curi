"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LessonReader } from "@/components/LessonReader";
import { getLesson } from "@/lib/api/client";
import type { LessonResponse } from "@/lib/api/schemas";

export default function LessonPage() {
  const params = useParams<{ courseId: string; lessonIndex: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLesson(params.courseId, Number(params.lessonIndex))
      .then(setLesson)
      .catch(() => setError("Could not load lesson."));
  }, [params.courseId, params.lessonIndex]);

  if (error) {
    return (
      <PageShell back={{ href: "/today", label: "Today" }} withTabPad={false}>
        <p className="mt-6 text-ink-muted">{error}</p>
        <Link href={`/library/${params.courseId}`} className="mt-4 inline-block text-sm underline">
          View path map
        </Link>
      </PageShell>
    );
  }

  if (!lesson) {
    return (
      <PageShell back={{ href: "/today", label: "Today" }} withTabPad={false}>
        <p className="mt-6 text-ink-muted">Loading lesson…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      back={{ href: `/library/${params.courseId}`, label: "Path map" }}
      withTabPad={false}
      className="pt-4"
    >
      <LessonReader
        lesson={lesson}
        onStartQuiz={() =>
          router.push(
            `/courses/${params.courseId}/lessons/${params.lessonIndex}/quiz`,
          )
        }
      />
    </PageShell>
  );
}
