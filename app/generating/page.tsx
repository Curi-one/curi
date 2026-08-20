"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Wordmark } from "@/components/Wordmark";
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
      <PageShell withTabPad={false}>
        <Wordmark href="/" />
        <p className="mt-8 text-ink-muted">{error}</p>
        <Link href="/clarify" className="btn-primary mt-4 inline-block">
          Back to clarify
        </Link>
      </PageShell>
    );
  }

  const ready = visible >= outline.length && courseId;

  return (
    <PageShell withTabPad={false} className="flex min-h-[80vh] flex-col pt-6">
      <Wordmark href="/" />
      <h1
        className="mt-10 font-display text-[1.75rem] font-light text-ink"
        style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
      >
        Building your path
      </h1>
      <p className="mt-2 text-ink-muted">Streaming lesson titles…</p>
      <ol className="mt-8 space-y-2">
        {outline.slice(0, visible).map((item) => (
          <li
            key={item.index}
            className="surface-card px-4 py-3 animate-fade-in"
          >
            <span className="font-meta">Lesson {item.index + 1}</span>
            <p className="mt-1 text-ink">{item.title}</p>
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
    </PageShell>
  );
}
