"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Lock, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Wordmark } from "@/components/Wordmark";
import { getMe, postCourse } from "@/lib/api/client";
import { loadClarifySession, saveClarifySession } from "@/lib/clarify-store";
import { loadPreferences } from "@/lib/profile/preferences";
import { Button } from "@/components/Button";

const WARMUP_MSGS = [
  "Analysing your choices…",
  "Mapping the territory…",
  "Choosing your angle…",
  "Sequencing the arc…",
  "Following your curiosity…",
];

function lessonBlurb(
  title: string,
  index: number,
  total: number,
  topic: string,
): string {
  const t = title.toLowerCase();
  const pos = index / Math.max(total - 1, 1);
  const topicLabel = topic.trim() || "this path";

  if (pos === 0) {
    return `The first foothold on ${topicLabel}: the definition, pressure, and founder decision this path is built around.`;
  }
  if (pos >= 0.92) {
    return "The synthesis: what you can now explain before a raise, negotiation, or board-level decision.";
  }
  if (t.includes("why") && pos < 0.25) {
    return "The opening question: why this matters before investor pressure makes it expensive.";
  }
  if (
    t.includes("origin") ||
    t.includes("born") ||
    t.includes("began") ||
    t.includes("history") ||
    t.includes("founding")
  ) {
    return "The roots: the financing pattern, incentive, or market pressure that made this idea necessary.";
  }
  if (
    t.includes("debate") ||
    t.includes("tension") ||
    t.includes("argument") ||
    t.includes("problem")
  ) {
    return "The live tension: where founders and investors can be right for different reasons.";
  }
  if (
    t.includes("tool") ||
    t.includes("practical") ||
    t.includes("apply") ||
    t.includes("decision")
  ) {
    return "The practical form: how this idea changes a real founder decision.";
  }
  if (
    t.includes("mental model") ||
    t.includes("pattern") ||
    t.includes("framework") ||
    t.includes("model")
  ) {
    return "A frame you can carry into investor calls, diligence, and internal decisions.";
  }
  if (pos < 0.25)
    return "The foundations: the concepts that carry the rest of the path.";
  if (pos < 0.5) {
    return "The mechanism: what makes the term, metric, or financing structure move.";
  }
  if (pos < 0.75) {
    return "The deeper layer: where incentives, ownership, and timing start to matter.";
  }
  return "The synthesis: the threads drawn together into a founder decision.";
}

function buildingMessage(pct: number, topic: string): string {
  if (pct < 20) return `Mapping the territory for ${topic}…`;
  if (pct < 45) return "Sequencing the lessons…";
  if (pct < 70) return "Refining the arc…";
  if (pct < 90) return "Almost there…";
  return "Finishing touches…";
}

export default function GeneratingPage() {
  const router = useRouter();
  const [outline, setOutline] = useState<{ index: number; title: string }[]>(
    [],
  );
  const [visible, setVisible] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [warmupIdx, setWarmupIdx] = useState(0);

  useEffect(() => {
    void getMe()
      .then((me) => setSignedIn(me.session.kind === "member"))
      .catch(() => setSignedIn(false));
  }, []);

  useEffect(() => {
    const session = loadClarifySession();
    if (!session?.topic || !session.depth) {
      router.replace("/");
      return;
    }
    setTopic(session.topic);

    const localPrefs = loadPreferences("guest");
    postCourse({
      topic: session.topic,
      depth: session.depth,
      clarifications: session.answers,
      ...(session.details ? { details: session.details } : {}),
      learningProfile: {
        seq: localPrefs.seq,
        anchor: localPrefs.anchor,
        length: localPrefs.length,
        rigor: localPrefs.rigor,
        jargon: localPrefs.jargon,
      },
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

  const isWarmup = outline.length === 0 && !error;
  const complete =
    outline.length > 0 && visible >= outline.length && Boolean(courseId);
  const totalLessons = outline.length;
  const streamed = outline.slice(0, visible);
  const pct =
    totalLessons > 0 ? Math.round((streamed.length / totalLessons) * 100) : 0;

  useEffect(() => {
    if (!isWarmup) return;
    const id = window.setInterval(
      () => setWarmupIdx((i) => (i + 1) % WARMUP_MSGS.length),
      650,
    );
    return () => window.clearInterval(id);
  }, [isWarmup]);

  if (error) {
    return (
      <PageShell withTabPad={false}>
        <Wordmark href="/" underline={false} />
        <p className="mt-8 text-ink-muted">{error}</p>
        <Button href="/clarify" className="mt-4">
          Back to clarify
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell
      withTabPad={false}
      className="flex min-h-[80vh] flex-col justify-center py-10 sm:py-14"
    >
      <div className="mx-auto w-full max-w-2xl">
        {isWarmup ? (
          <div className="flex flex-col items-center gap-8 py-12 text-center sm:py-20">
            <div className="relative">
              <div className="generating-pulse h-24 w-24 rounded-none border border-border bg-paper-secondary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles
                  className="generating-sparkle h-9 w-9 text-ink"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            </div>
            <div className="space-y-2">
              <p
                key={warmupIdx}
                className="generating-msg text-lg font-medium text-ink sm:text-xl"
              >
                {WARMUP_MSGS[warmupIdx]}
              </p>
              <p className="text-sm text-ink-muted">{topic}</p>
            </div>
            <div
              className="w-40 overflow-hidden rounded-none bg-paper-tertiary"
              style={{ height: "3px" }}
            >
              <div className="generating-bar-breathe h-full rounded-none bg-accent" />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-none border border-border bg-paper">
            <div className="border-b border-border px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-meta text-ink-muted">
                    {totalLessons}-lesson founder path
                  </p>
                  <h1 className="mt-2 font-display text-3xl font-light tracking-tight text-ink sm:text-4xl">
                    {topic}
                  </h1>
                </div>
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-none border ${
                    complete
                      ? "border-ink/20 bg-ink/5 text-ink/70"
                      : "border-border bg-paper-secondary text-ink-muted"
                  }`}
                >
                  {complete ? (
                    <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-ink-muted">
                  <span>
                    {complete
                      ? "All lessons written"
                      : buildingMessage(pct, topic)}
                  </span>
                  <span className="tabular-nums font-medium text-ink">
                    {streamed.length} / {totalLessons}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-none bg-paper-tertiary">
                  <div
                    className="h-full rounded-none bg-ink/55 transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[min(58vh,34rem)] overflow-y-auto">
              {Array.from({ length: totalLessons }, (_, index) => {
                const lesson = streamed[index];
                const isLive =
                  Boolean(lesson) && index === streamed.length - 1 && !complete;
                const num = String(index + 1).padStart(2, "0");

                if (complete && lesson) {
                  if (index === 0) {
                    return (
                      <button
                        key={`lesson-${index}`}
                        type="button"
                        onClick={() =>
                          router.push(`/courses/${courseId}/lessons/0`)
                        }
                        className="group w-full border-b border-border/60 px-6 py-4 text-left transition-colors hover:bg-paper-secondary sm:px-8 sm:py-5"
                      >
                        <div className="lesson-reveal flex items-start gap-4 sm:gap-5">
                          <span className="w-7 shrink-0 select-none pt-px font-meta text-mono-sm tabular-nums text-ink-muted">
                            {num}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-ui-lg font-light leading-snug text-ink">
                              {lesson.title}
                            </p>
                            <p className="lesson-blurb mt-1.5 text-sm leading-relaxed text-ink-muted">
                              {lessonBlurb(
                                lesson.title,
                                index,
                                totalLessons,
                                topic,
                              )}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 pt-1 text-xs text-ink-muted transition-colors group-hover:text-ink">
                            {signedIn ? "Start" : "Read free"}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <div
                      key={`lesson-${index}`}
                      className="border-b border-border/60 px-6 py-4 opacity-30 last:border-b-0 sm:px-8 sm:py-5"
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span className="w-7 shrink-0 select-none pt-px font-meta text-mono-sm tabular-nums text-ink-muted">
                          {num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-ui-lg font-light leading-snug text-ink">
                            {lesson.title}
                          </p>
                          <p className="lesson-blurb mt-1.5 text-sm leading-relaxed text-ink-muted">
                            {lessonBlurb(
                              lesson.title,
                              index,
                              totalLessons,
                              topic,
                            )}
                          </p>
                        </div>
                        <Lock
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-muted/40"
                          aria-hidden
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`lesson-${index}`}
                    className={`border-b border-border/60 px-6 py-4 last:border-b-0 sm:px-8 sm:py-5 ${
                      isLive ? "lesson-row-live" : ""
                    }`}
                  >
                    {lesson ? (
                      <div className="lesson-reveal flex gap-4 sm:gap-5">
                        <span className="w-7 shrink-0 select-none pt-px font-meta text-mono-sm tabular-nums text-ink-muted">
                          {num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-ui-lg font-light leading-snug text-ink">
                            {lesson.title}
                          </p>
                          <p className="lesson-blurb mt-1.5 text-sm leading-relaxed text-ink-muted">
                            {lessonBlurb(
                              lesson.title,
                              index,
                              totalLessons,
                              topic,
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 sm:gap-5" aria-hidden>
                        <span className="w-7 shrink-0 select-none pt-px font-meta text-mono-sm tabular-nums text-ink-faint">
                          {num}
                        </span>
                        <div className="flex-1 space-y-2.5 pt-1">
                          <div className="h-5 w-5/6 animate-pulse rounded bg-paper-tertiary" />
                          <div className="h-3.5 w-1/2 animate-pulse rounded bg-paper-tertiary" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
