"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-ink-muted">{error}</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-ink-muted">Loading lesson…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <LessonReader
        lesson={lesson}
        onStartQuiz={() =>
          router.push(
            `/courses/${params.courseId}/lessons/${params.lessonIndex}/quiz`,
          )
        }
      />
    </main>
  );
}
