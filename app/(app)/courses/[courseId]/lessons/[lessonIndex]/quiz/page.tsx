"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompleteSheet } from "@/components/CompleteSheet";
import { LessonFeel, LessonFeelDock } from "@/components/LessonFeel";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { QuizFlow } from "@/components/QuizFlow";
import { StreakMoment } from "@/components/StreakMoment";
import {
  getCourseMap,
  getLesson,
  getMe,
  getProgress,
  getQuiz,
  postQuiz,
} from "@/lib/api/client";
import type { LessonFeel as LessonFeelType } from "@/lib/api/schemas";

type Phase = "quiz" | "feel" | "done";

type SheetState = {
  open: boolean;
  allDone: boolean;
  pathMastered: boolean;
  streak?: number;
  lessonTitle?: string;
  courseTopic?: string;
  lessonNumber?: number;
  totalLessons?: number;
  nextLessonTitle?: string;
};

export default function QuizPage() {
  const params = useParams<{ courseId: string; lessonIndex: string }>();
  const router = useRouter();
  const lessonIndex = Number(params.lessonIndex);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [questions, setQuestions] = useState<
    Awaited<ReturnType<typeof getQuiz>>["questions"] | null
  >(null);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedIndex: number }[]
  >([]);
  const [feel, setFeel] = useState<LessonFeelType | undefined>();
  const [sheet, setSheet] = useState<SheetState>({
    open: false,
    allDone: false,
    pathMastered: false,
  });
  const [courseMeta, setCourseMeta] = useState<{
    topic?: string;
    lessonTitle?: string;
    totalLessons?: number;
    nextLessonTitle?: string;
  }>({});
  const [toastStreak, setToastStreak] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuiz(params.courseId, lessonIndex)
      .then((q) => setQuestions(q.questions))
      .catch(() => setError("Could not load quiz."));
  }, [params.courseId, lessonIndex]);

  useEffect(() => {
    Promise.all([
      getCourseMap(params.courseId),
      getLesson(params.courseId, lessonIndex).catch(() => null),
    ])
      .then(([map, lesson]) => {
        const node = map.nodes.find((n) => n.index === lessonIndex);
        const next = map.nodes.find((n) => n.index === lessonIndex + 1);
        setCourseMeta({
          topic: map.topic,
          lessonTitle: node?.title ?? lesson?.title,
          totalLessons: map.nodes.length,
          nextLessonTitle: next?.title,
        });
      })
      .catch(() => {
        /* meta is optional — CompleteSheet has graceful defaults */
      });
  }, [params.courseId, lessonIndex]);

  async function completeLesson(selectedFeel: LessonFeelType) {
    setSubmitting(true);
    try {
      const result = await postQuiz(params.courseId, lessonIndex, {
        answers,
        lessonFeel: selectedFeel,
      });
      const me = await getMe();
      if (me.session.kind === "guest") {
        router.push(`/auth?returnTo=${encodeURIComponent("/today")}&from=quiz`);
        return;
      }

      let streak = result.streak;
      if (streak == null) {
        try {
          const progress = await getProgress();
          streak = progress.streak;
        } catch {
          /* streak optional */
        }
      }

      if (streak != null && streak > 0) {
        setToastStreak(streak);
        window.setTimeout(() => setToastStreak(null), 2800);
      }

      setSheet({
        open: true,
        allDone: (result.pathsStillDue ?? 0) === 0,
        pathMastered: result.pathMastered === true,
        streak,
        lessonTitle: courseMeta.lessonTitle,
        courseTopic: courseMeta.topic,
        lessonNumber: Number.isFinite(lessonIndex)
          ? lessonIndex + 1
          : undefined,
        totalLessons: courseMeta.totalLessons,
        nextLessonTitle:
          result.pathMastered === true ? undefined : courseMeta.nextLessonTitle,
      });
      setPhase("done");
    } catch {
      setError("Could not save progress.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <PageShell
        back={{
          href: `/courses/${params.courseId}/lessons/${params.lessonIndex}`,
          label: "Lesson",
        }}
        withTabPad={false}
      >
        <p className="mt-6 text-ink-muted">{error}</p>
      </PageShell>
    );
  }

  if (!questions) {
    return (
      <PageShell
        back={{
          href: `/courses/${params.courseId}/lessons/${params.lessonIndex}`,
          label: "Lesson",
        }}
        withTabPad={false}
      >
        <LoadingState label="Loading quiz…" />
      </PageShell>
    );
  }

  return (
    <PageShell
      back={{
        href: `/courses/${params.courseId}/lessons/${params.lessonIndex}`,
        label: "Lesson",
      }}
      withTabPad={false}
      className="pt-4"
    >
      {phase === "quiz" && (
        <QuizFlow
          questions={questions}
          onComplete={(a) => {
            setAnswers(a);
            setPhase("feel");
          }}
        />
      )}
      {phase === "feel" && (
        <>
          <LessonFeel selected={feel} onSelect={setFeel} />
          <LessonFeelDock
            disabled={!feel || submitting}
            onContinue={() => feel && void completeLesson(feel)}
          />
        </>
      )}
      {phase === "done" && !sheet.open && (
        <p className="mt-6 text-ink-muted">
          Lesson complete.{""}
          <Link href="/today" className="underline hover:text-ink">
            Back to Today
          </Link>
        </p>
      )}
      {toastStreak != null && <StreakMoment streak={toastStreak} />}
      <CompleteSheet
        open={sheet.open}
        allPathsDoneToday={sheet.allDone}
        pathMastered={sheet.pathMastered}
        streak={sheet.streak}
        lessonTitle={sheet.lessonTitle}
        courseTopic={sheet.courseTopic}
        lessonNumber={sheet.lessonNumber}
        totalLessons={sheet.totalLessons}
        nextLessonTitle={sheet.nextLessonTitle}
        onClose={() =>
          setSheet({ open: false, allDone: false, pathMastered: false })
        }
      />
    </PageShell>
  );
}
