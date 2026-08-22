"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { PathMap } from "@/components/PathMap";
import {
  ApiError,
  getCourseMap,
  patchRestoreCourse,
  patchShelveCourse,
  type CourseMapResponse,
} from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";
import { endowedPct } from "@/lib/ui/topic-swatch";
import { Button } from "@/components/Button";

function statusEyebrow(
  status: CourseMapResponse["status"],
  nodes: CourseMapResponse["nodes"],
): string {
  if (status === "shelved") return "Shelved";
  if (status === "completed") return "Mastered";
  if (nodes.length > 0 && nodes.every((n) => n.status === "read")) {
    return "Mastered";
  }
  return "Exploring";
}

function nextLessonIndex(course: CourseMapResponse): number | null {
  const today = course.nodes.find((n) => n.status === "today");
  if (today) return today.index;
  const firstLocked = course.nodes.find((n) => n.status === "locked");
  if (course.status === "shelved" && firstLocked) return firstLocked.index;
  return null;
}

export default function LibraryCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseMapResponse | null>(null);
  const [error, setError] = useState(false);
  const [shelving, setShelving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getCourseMap(params.courseId)
      .then(setCourse)
      .catch(() => setError(true));
  }, [params.courseId]);

  async function handleShelve() {
    if (!course || shelving) return;
    setShelving(true);
    try {
      await patchShelveCourse(course.id);
      router.push("/library?tab=shelved");
    } catch {
      setError(true);
    } finally {
      setShelving(false);
    }
  }

  async function handleRestoreAndContinue() {
    if (!course || restoring) return;
    setRestoring(true);
    try {
      await patchRestoreCourse(course.id);
      const next = nextLessonIndex(course);
      if (next !== null) {
        router.push(`/courses/${course.id}/lessons/${next}?from=library`);
      } else {
        router.push(`/library/${course.id}`);
        const refreshed = await getCourseMap(course.id);
        setCourse(refreshed);
        setRestoring(false);
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "path_limit") {
        router.push("/upgrade");
        return;
      }
      setError(true);
      setRestoring(false);
    }
  }

  if (error) {
    return (
      <PageShell
        back={{ href: "/library", label: "Library" }}
        withTabPad={false}
      >
        <p className="mt-6 text-ink-muted">Could not load this path.</p>
        <Button href="/library" variant="secondary" className="mt-6">
          Back to Library
        </Button>
      </PageShell>
    );
  }

  if (!course) {
    return (
      <PageShell
        back={{ href: "/library", label: "Library" }}
        withTabPad={false}
      >
        <LoadingState label="Loading path…" />
      </PageShell>
    );
  }

  const todayNode = course.nodes.find((n) => n.status === "today");
  const isShelved = course.status === "shelved";
  const isMastered =
    course.status === "completed" ||
    (course.nodes.length > 0 &&
      course.nodes.every((n) => n.status === "read"));
  const readCount = course.nodes.filter((n) => n.status === "read").length;
  const total = course.nodes.length;
  const doneCount = isMastered ? total : readCount;
  const pct = endowedPct(doneCount, total);
  const eyebrow = statusEyebrow(course.status, course.nodes);
  const continueIndex = nextLessonIndex(course);
  const continueTitle =
    continueIndex !== null
      ? course.nodes.find((n) => n.index === continueIndex)?.title
      : null;

  return (
    <PageShell
      back={{ href: "/library", label: "Library" }}
      withTabPad={false}
      className="pt-4"
    >
      <div className="mx-auto w-full max-w-[640px]">
        <div className="mb-8 border-b border-border pb-8">
          <p className="font-meta text-[10px] uppercase tracking-[0.28em] text-ink-muted">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-display text-display-xs font-light leading-snug text-ink sm:text-3xl">
            {course.topic}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {depthLabel(course.depth)}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="h-[2px] flex-1 bg-border">
              <div
                className="h-full bg-ink transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 font-meta tabular-nums text-ink-muted">
              {doneCount} / {total} lessons
            </span>
          </div>

          {!isMastered && continueIndex !== null && continueTitle && (
            <button
              type="button"
              onClick={() => {
                if (isShelved) {
                  void handleRestoreAndContinue();
                  return;
                }
                router.push(
                  `/courses/${course.id}/lessons/${continueIndex}?from=library`,
                );
              }}
              disabled={restoring}
              className="mt-5 flex w-full items-center justify-between border border-border bg-paper px-5 py-4 text-left transition hover:bg-paper-secondary disabled:opacity-60"
            >
              <div>
                <div className="font-meta text-[10px] uppercase tracking-[0.24em] text-ink-muted">
                  {isShelved
                    ? "Continue path"
                    : doneCount === 0
                      ? "Start here"
                      : "Continue"}
                </div>
                <div className="mt-0.5 font-display text-base text-ink">
                  {continueTitle}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 font-meta text-ink/60">
                Lesson {continueIndex + 1}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </div>
            </button>
          )}
        </div>

        <PathMap
          courseId={course.id}
          nodes={course.nodes}
          readOnly={isShelved}
        />

        {todayNode && !isShelved && (
          <div className="mt-8">
            <Button
              variant="secondary"
              onClick={() => void handleShelve()}
              loading={shelving}
              className="w-full"
            >
              Shelve path
            </Button>
          </div>
        )}

        {isShelved && (
          <div className="mt-8">
            <Button
              onClick={() => void handleRestoreAndContinue()}
              loading={restoring}
              className="w-full"
            >
              Continue path
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
