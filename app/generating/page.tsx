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
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = loadClarifySession();
    if (!session?.topic || !session.depth) {
      router.replace("/");
      return;
    }
    setTopic(session.topic);

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
    const t = setTimeout(() => setVisible((v) => v + 1), 320);
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

  const ready = visible >= outline.length && courseId && outline.length > 0;
  const loading = outline.length === 0 && !error;

  return (
    <PageShell withTabPad={false} className="flex min-h-[80vh] flex-col pt-6">
      <Wordmark href="/" />
      <p className="type-kicker mt-10">Your path</p>
      <h1
        className="mt-2 font-display text-[1.75rem] font-light leading-snug text-ink"
        style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
      >
        {loading ? "Building your path…" : topic}
      </h1>
      <p className="mt-2 text-[15px] font-light text-ink-muted">
        {loading
          ? "Pulling outline from cache or generating lessons."
          : ready
            ? `${outline.length} lessons ready`
            : "Streaming lesson titles…"}
      </p>
      {loading && (
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-paper-tertiary"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}
      <ol className="mt-8 space-y-2">
        {outline.slice(0, visible).map((item) => (
          <li
            key={item.index}
            className="surface-card px-4 py-3 animate-fade-in"
          >
            <span className="font-meta">Lesson {item.index + 1}</span>
            <p className="mt-1 text-[15px] text-ink">{item.title}</p>
          </li>
        ))}
      </ol>
      {ready && (
        <div className="mt-auto pt-8 pb-[env(safe-area-inset-bottom)]">
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
