"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompleteSheet } from "@/components/CompleteSheet";
import { LessonFeel, LessonFeelDock } from "@/components/LessonFeel";
import { PageShell } from "@/components/PageShell";
import { QuizFlow } from "@/components/QuizFlow";
import type { LessonFeel as LessonFeelType } from "@/lib/api/schemas";
import { getMe, getQuiz, postQuiz } from "@/lib/api/client";

type Phase = "quiz" | "feel" | "done";

export default function QuizPage() {
  const params = useParams<{ courseId: string; lessonIndex: string }>();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [questions, setQuestions] = useState<
    Awaited<ReturnType<typeof getQuiz>>["questions"] | null
  >(null);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedIndex: number }[]
  >([]);
  const [feel, setFeel] = useState<LessonFeelType | undefined>();
  const [sheet, setSheet] = useState({ open: false, allDone: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuiz(params.courseId, Number(params.lessonIndex))
      .then((q) => setQuestions(q.questions))
      .catch(() => setError("Could not load quiz."));
  }, [params.courseId, params.lessonIndex]);

  async function completeLesson(selectedFeel: LessonFeelType) {
    setSubmitting(true);
    try {
      const result = await postQuiz(params.courseId, Number(params.lessonIndex), {
        answers,
        lessonFeel: selectedFeel,
      });
      const me = await getMe();
      if (me.session.kind === "guest") {
        router.push(`/auth?returnTo=${encodeURIComponent("/today")}`);
        return;
      }
      setSheet({
        open: true,
        allDone: (result.pathsStillDue ?? 0) === 0,
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
        <p className="mt-6 text-ink-muted">Loading quiz…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      back={{
        href: `/courses/${params.courseId}/lessons/${params.lessonIndex}`,
        label: "Lesson",
      }}
      title={phase === "feel" ? "How did that land?" : undefined}
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
      {phase === "done" && (
        <p className="mt-6 text-ink-muted">
          Lesson complete.{" "}
          <Link href="/today" className="underline hover:text-ink">
            Back to Today
          </Link>
        </p>
      )}
      <CompleteSheet
        open={sheet.open}
        allPathsDoneToday={sheet.allDone}
        onClose={() => setSheet({ open: false, allDone: false })}
      />
    </PageShell>
  );
}
