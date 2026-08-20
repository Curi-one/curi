import React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAndDownload } from "@/lib/certificate";

function Page({ children, className = "" }) {
  return (
    <section className={`curi-animate-in flex flex-1 flex-col overflow-y-auto ${className}`}>
      {children}
    </section>
  );
}

export function CourseLessonList({ course, user, onBack, onOpenLesson }) {
  const isCompleted = course.type === "completed";
  const isPaused    = course.type === "abandoned";
  const lessons     = course.lessons || [];
  const total       = lessons.length;
  const progress    = isCompleted ? total : (course.progress || 0);
  const nextIndex   = Math.min(progress, total - 1);
  const pct         = total > 0 ? Math.round((progress / total) * 100) : 0;

  const statusLabel = isCompleted ? "Mastered" : isPaused ? "Shelved" : "Exploring";

  return (
    <Page className="items-center py-8">
      <div className="w-full max-w-[640px] px-4 sm:px-6">

        {/* Nav */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 px-0 text-muted-foreground hover:text-foreground" onClick={onBack} type="button">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Library
          </Button>
        </div>

        {/* Course header */}
        <div className="mb-8 border-b border-border pb-8">
          <div className="mb-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">{statusLabel}</div>
          <h1 className="font-serif text-3xl leading-snug text-foreground">{course.topic}</h1>
          {course.aspect && (
            <p className="mt-1 text-sm text-muted-foreground">{course.aspect}</p>
          )}

          {/* Progress bar + fraction */}
          <div className="mt-5 flex items-center gap-4">
            <div className="h-[2px] flex-1 bg-border">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {progress} / {total} lessons
            </span>
          </div>

          {/* Continue CTA */}
          {!isCompleted && progress < total && (
            <button
              type="button"
              onClick={() => onOpenLesson(nextIndex)}
              className="mt-5 flex w-full items-center justify-between border border-border bg-card px-5 py-4 text-left transition hover:bg-muted/40"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  {progress === 0 ? "Start here" : "Continue"}
                </div>
                <div className="mt-0.5 font-serif text-base text-foreground">
                  {lessons[nextIndex]}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-foreground/60">
                Lesson {nextIndex + 1}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </div>
            </button>
          )}
        </div>

        {/* Certificate & badge — completed courses only */}
        {isCompleted && (
          <div className="mb-8 border border-border bg-card">
            <div style={{ height: "4px", background: "#C1121F" }} />

            {/* Preview */}
            <div className="px-6 py-7 text-center">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-serif text-base leading-none text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}>
                  Cu<em className="italic">ri</em>
                  <span className="block" style={{ height: "2px", width: "28px", background: "#C1121F", marginTop: "2px" }} />
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="mt-4 mb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Certificate of Completion</div>
              <div className="mx-auto mb-3 h-px w-16 bg-border" />
              {user?.name && (
                <p className="mb-1 text-sm text-muted-foreground">This certifies that</p>
              )}
              {user?.name && (
                <p className="font-serif text-xl leading-snug text-foreground" style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
                  {user.name}
                </p>
              )}
              <p className={`text-sm text-muted-foreground ${user?.name ? "mt-1" : ""}`}>
                {user?.name ? (course.bookAuthor ? "has read" : "has completed the path") : (course.bookAuthor ? "Book path complete" : "Path completed")}
              </p>
              <h2
                className="mt-2 font-serif leading-tight text-foreground"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 400, fontVariationSettings: "'SOFT' 50, 'WONK' 1", fontStyle: course.bookAuthor ? "italic" : "normal" }}
              >
                {course.topic}
              </h2>
              {course.bookAuthor && (
                <p className="mt-1 text-sm text-muted-foreground">by {course.bookAuthor}</p>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">{total} lessons · curi.app</p>
            </div>

            {/* Download row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
              <p className="text-[11px] text-muted-foreground">Download and add to LinkedIn or your portfolio.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateAndDownload("certificate", { userName: user?.name || "", topic: course.topic, bookAuthor: course.bookAuthor, lessonCount: total })}
                  className="inline-flex items-center gap-1.5 border border-border bg-foreground px-3.5 py-2 text-[11px] font-medium text-background transition hover:bg-foreground/85"
                >
                  <ArrowDown className="h-3 w-3" aria-hidden />
                  Certificate
                </button>
                <button
                  type="button"
                  onClick={() => generateAndDownload("badge", { userName: user?.name || "", topic: course.topic, bookAuthor: course.bookAuthor, lessonCount: total })}
                  className="inline-flex items-center gap-1.5 border border-border px-3.5 py-2 text-[11px] font-medium text-foreground/65 transition hover:border-foreground/25 hover:text-foreground"
                >
                  <ArrowDown className="h-3 w-3" aria-hidden />
                  Badge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson list */}
        <div className="divide-y divide-border">
          {lessons.map((lessonTitle, i) => {
            const done    = i < progress || isCompleted;
            const current = i === progress && !isCompleted;
            const locked  = i > progress && !isCompleted;

            return (
              <button
                key={i}
                type="button"
                onClick={() => !locked && onOpenLesson(i)}
                disabled={locked}
                className={`flex w-full items-center gap-4 px-1 py-4 text-left transition-colors ${
                  locked
                    ? "cursor-default opacity-35"
                    : "hover:bg-muted/30"
                }`}
              >
                {/* Status icon */}
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                  done ? "text-foreground" : current ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {done && (
                    <div className="flex h-5 w-5 items-center justify-center bg-foreground">
                      <Check className="h-3 w-3 text-background" strokeWidth={2.5} aria-hidden />
                    </div>
                  )}
                  {current && <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />}
                  {locked && <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
                </div>

                {/* Lesson number + title */}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    Lesson {i + 1}
                  </div>
                  <div className={`mt-0.5 text-sm leading-snug ${done || current ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {lessonTitle}
                  </div>
                </div>

                {/* Action label */}
                {done && (
                  <span className="shrink-0 text-[11px] text-muted-foreground/60">Review</span>
                )}
                {current && (
                  <span className="shrink-0 text-[11px] font-medium text-foreground">Continue</span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </Page>
  );
}

export default CourseLessonList;
