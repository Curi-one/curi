"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { PathMap } from "@/components/PathMap";
import { getCourseMap, type CourseMapResponse } from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";

export default function LibraryCoursePage() {
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseMapResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCourseMap(params.courseId)
      .then(setCourse)
      .catch(() => setError(true));
  }, [params.courseId]);

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
        <p className="mt-6 text-ink-muted">Loading path…</p>
      </PageShell>
    );
  }

  const todayNode = course.nodes.find((n) => n.status === "today");

  return (
    <PageShell back={{ href: "/library", label: "Library" }} withTabPad={false} className="pt-4">
      <h1
        className="mt-4 font-display text-[1.75rem] font-light leading-tight text-ink"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        {course.topic}
      </h1>
      <p className="mt-1 font-meta">{depthLabel(course.depth)}</p>
      <div className="mt-8">
        <PathMap
          courseId={course.id}
          nodes={course.nodes}
          readOnly={!todayNode}
        />
      </div>
      {todayNode ? (
        <div className="mt-8">
          <Link
            href={`/courses/${course.id}/lessons/${todayNode.index}`}
            className="btn-primary block w-full text-center"
          >
            Continue today&apos;s lesson
          </Link>
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
