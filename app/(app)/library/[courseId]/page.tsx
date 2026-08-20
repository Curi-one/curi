"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { PathMap } from "@/components/PathMap";
import { PathProgressBar } from "@/components/PathProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getCourseMap,
  patchShelveCourse,
  type CourseMapResponse,
} from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";
import { endowedPct } from "@/lib/ui/topic-swatch";

function pathEyebrow(nodes: CourseMapResponse["nodes"]): string {
  if (nodes.length === 0) return "Exploring";
  const allRead = nodes.every((n) => n.status === "read");
  if (allRead) return "Mastered";
  const hasToday = nodes.some((n) => n.status === "today");
  if (hasToday) return "Exploring";
  return "Shelved";
}

export default function LibraryCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseMapResponse | null>(null);
  const [error, setError] = useState(false);
  const [shelving, setShelving] = useState(false);

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

  if (error) {
    return (
      <PageShell back={{ href: "/library", label: "Library" }} withTabPad={false}>
        <p className="mt-6 text-ink-muted">Could not load this path.</p>
        <Link href="/library" className="btn-secondary mt-6 inline-block">
          Back to Library
        </Link>
      </PageShell>
    );
  }

  if (!course) {
    return (
      <PageShell back={{ href: "/library", label: "Library" }} withTabPad={false}>
        <LoadingState label="Loading path…" />
      </PageShell>
    );
  }

  const todayNode = course.nodes.find((n) => n.status === "today");
  const canShelve = !!todayNode;
  const readCount = course.nodes.filter((n) => n.status === "read").length;
  const total = course.nodes.length;
  const doneCount = pathEyebrow(course.nodes) === "Mastered" ? total : readCount;
  const pct = endowedPct(doneCount, total);
  const eyebrow = pathEyebrow(course.nodes);

  return (
    <PageShell back={{ href: "/library", label: "Library" }} withTabPad={false} className="pt-4">
      <div className="mt-4 flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <p className="font-meta">{eyebrow}</p>
          <h1
            className="mt-1 font-display text-[1.75rem] font-light leading-tight text-ink sm:text-4xl"
            style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
          >
            {course.topic}
          </h1>
          <p className="mt-1.5 font-meta">{depthLabel(course.depth)}</p>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>
                {doneCount} of {total} lessons complete
              </span>
              <span className="font-medium tabular-nums text-ink">{pct}%</span>
            </div>
            <PathProgressBar
              progress={doneCount}
              total={total}
              className="mt-0"
            />
          </div>
        </div>
        <ProgressRing percent={pct} />
      </div>

      <div className="mt-8">
        <PathMap
          courseId={course.id}
          nodes={course.nodes}
          readOnly={!todayNode}
        />
      </div>
      {todayNode ? (
        <div className="mt-8 space-y-3">
          <Link
            href={`/courses/${course.id}/lessons/${todayNode.index}?from=library`}
            className="btn-primary block w-full text-center"
          >
            Continue today&apos;s lesson
          </Link>
          {canShelve && (
            <button
              type="button"
              onClick={() => void handleShelve()}
              disabled={shelving}
              className="btn-secondary block w-full text-center"
            >
              {shelving ? "Shelving…" : "Shelve path"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-muted">
          No lesson due today on this path.{" "}
          <Link href="/today" className="underline hover:text-ink">
            Back to Today
          </Link>
        </p>
      )}
    </PageShell>
  );
}
