"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postCourse } from "@/lib/api/client";
import { loadClarifySession, saveClarifySession } from "@/lib/clarify-store";

export default function GeneratingPage() {
  const router = useRouter();
  const [outline, setOutline] = useState<{ index: number; title: string }[]>(
    [],
  );
  const [visible, setVisible] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = loadClarifySession();
    if (!session?.topic || !session.depth) {
      router.replace("/");
      return;
    }

    postCourse({
      topic: session.topic,
      depth: session.depth,
      clarifications: session.answers,
    })
      .then((res) => {
        setCourseId(res.courseId);
        setOutline(res.outline);
        saveClarifySession({ ...session, courseId: res.courseId });
      })
      .catch(() => setError("Could not generate path. Try again."));
  }, [router]);

  useEffect(() => {
    if (visible >= outline.length || outline.length === 0) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 400);
    return () => clearTimeout(t);
  }, [visible, outline.length]);

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-ink-muted">{error}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => router.push("/clarify")}
        >
          Back to clarify
        </button>
      </main>
    );
  }

  const ready = visible >= outline.length && courseId;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Building your path</h1>
      <p className="mt-2 text-ink-muted">Streaming lesson titles…</p>
      <ol className="mt-8 space-y-2">
        {outline.slice(0, visible).map((item) => (
          <li
            key={item.index}
            className="rounded-lg border border-border bg-paper-secondary px-4 py-3 text-ink animate-fade-in"
          >
            <span className="text-xs text-ink-muted">Lesson {item.index + 1}</span>
            <p className="mt-1">{item.title}</p>
          </li>
        ))}
      </ol>
      {ready && (
        <div className="mt-auto pt-8">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => router.push(`/courses/${courseId}/lessons/0`)}
          >
            Read lesson 1
          </button>
        </div>
      )}
    </main>
  );
}
