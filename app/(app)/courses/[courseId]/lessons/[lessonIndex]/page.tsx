"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { LessonReader } from "@/components/LessonReader";
import {
  getCourseMap,
  getLesson,
  getMe,
  type CourseMapResponse,
} from "@/lib/api/client";
import type { LessonResponse } from "@/lib/api/schemas";

function LessonContent() {
  const params = useParams<{ courseId: string; lessonIndex: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | undefined>();
  const [totalLessons, setTotalLessons] = useState<number | undefined>();
  const [isGuest, setIsGuest] = useState(false);

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

  useEffect(() => {
    getCourseMap(params.courseId)
      .then((map: CourseMapResponse) => {
        setTopic(map.topic);
        setTotalLessons(map.nodes.length);
      })
      .catch(() => {
        /* topic / count optional for chrome */
      });
  }, [params.courseId]);

  useEffect(() => {
    getMe()
      .then((me) => setIsGuest(me.session.kind === "guest"))
      .catch(() => setIsGuest(false));
  }, []);

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
        <LoadingState label="Loading lesson…" />
      </PageShell>
    );
  }

  return (
    <PageShell withTabPad={false} className="max-w-[724px] pt-4 md:max-w-[724px]">
      <LessonReader
        lesson={lesson}
        lessonIndex={Number(params.lessonIndex)}
        totalLessons={totalLessons}
        topic={topic}
        back={back}
        isGuest={isGuest}
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
          <LoadingState label="Loading lesson…" />
        </PageShell>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
