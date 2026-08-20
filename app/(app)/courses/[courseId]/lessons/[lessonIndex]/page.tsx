"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LessonReader } from "@/components/LessonReader";
import { getLesson } from "@/lib/api/client";
import type { LessonResponse } from "@/lib/api/schemas";

function LessonContent() {
  const params = useParams<{ courseId: string; lessonIndex: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = search.get("from");
  const back =
    from === "today"
      ? { href: "/today", label: "Today" }
      : from === "library"
        ? { href: `/library/${params.courseId}`, label: "Path map" }
        : { href: `/library/${params.courseId}`, label: "Path map" };

  useEffect(() => {
    getLesson(params.courseId, Number(params.lessonIndex))
      .then(setLesson)
      .catch(() => setError("Could not load lesson."));
  }, [params.courseId, params.lessonIndex]);

  if (error) {
    return (
      <PageShell back={back} withTabPad={false}>
        <p className="mt-6 text-ink-muted">{error}</p>
        <Link
          href={`/library/${params.courseId}`}
          className="mt-4 inline-block text-sm underline"
        >
          View path map
        </Link>
      </PageShell>
    );
  }

  if (!lesson) {
    return (
      <PageShell back={back} withTabPad={false}>
        <p className="mt-6 text-ink-muted">Loading lesson…</p>
      </PageShell>
    );
  }

  return (
    <PageShell back={back} withTabPad={false} className="pt-4">
      <LessonReader
        lesson={lesson}
        lessonIndex={Number(params.lessonIndex)}
        onStartQuiz={() =>
          router.push(
            `/courses/${params.courseId}/lessons/${params.lessonIndex}/quiz`,
          )
        }
      />
    </PageShell>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <PageShell withTabPad={false}>
          <p className="mt-6 text-ink-muted">Loading lesson…</p>
        </PageShell>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
