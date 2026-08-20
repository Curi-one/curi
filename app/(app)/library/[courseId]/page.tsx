"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PathMap } from "@/components/PathMap";
import { getCourseMap, type CourseMapResponse } from "@/lib/api/client";
import { depthLabel } from "@/lib/ui/constants";

export default function LibraryCoursePage() {
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseMapResponse | null>(null);

  useEffect(() => {
    getCourseMap(params.courseId).then(setCourse).catch(() => setCourse(null));
  }, [params.courseId]);

  if (!course) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-ink-muted">Loading path…</p>
      </main>
    );
  }

  const todayNode = course.nodes.find((n) => n.status === "today");

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <Link href="/library" className="text-sm text-ink-muted">
        ← Library
      </Link>
      <h1 className="mt-4 font-display text-2xl text-ink">{course.topic}</h1>
      <p className="mt-1 text-sm text-ink-muted">{depthLabel(course.depth)}</p>
      <div className="mt-8">
        <PathMap
          courseId={course.id}
          nodes={course.nodes}
          readOnly={!todayNode}
        />
      </div>
      {todayNode && (
        <div className="mt-8">
          <Link
            href={`/courses/${course.id}/lessons/${todayNode.index}`}
            className="btn-primary block w-full text-center"
          >
            Continue today&apos;s lesson
          </Link>
        </div>
      )}
    </main>
  );
}
