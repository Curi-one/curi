"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ChevronDown, Globe2 } from "lucide-react";
import { Button } from "@/components/Button";
import { EquationBlock } from "@/components/lesson/EquationBlock";
import { LessonImage } from "@/components/lesson/LessonImage";
import { LessonMarkdown } from "@/components/lesson/LessonMarkdown";
import { LessonSourcesPanel } from "@/components/lesson/LessonSourcesPanel";
import { ShareableFact } from "@/components/lesson/ShareableFact";
import type { LessonResponse } from "@/lib/api/schemas";
import {
  applyReaderThemeToDocument,
  clearReaderThemeFromDocument,
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  READER_FONTS,
  READER_SIZES,
  READER_THEMES,
  saveReaderSettings,
  type ReaderSettings,
} from "@/lib/lessons/reader-settings";
import { quizCtaCopy } from "@/lib/lessons/quiz-cta";

type Props = {
  lesson: LessonResponse;
  lessonIndex: number;
  totalLessons?: number;
  topic?: string;
  onStartQuiz: () => void;
  back?: { href: string; label: string };
  isGuest?: boolean;
};

function estimateReadMinutes(body: string[]): number {
  const words = body.join("").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function LessonReader({
  lesson,
  lessonIndex,
  totalLessons,
  topic,
  onStartQuiz,
  back,
  isGuest = false,
}: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  const [readProgress, setReadProgress] = useState(0);
  const [takeawaysOpen, setTakeawaysOpen] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(
    null,
  );
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(
    DEFAULT_READER_SETTINGS,
  );
  const sourceRowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const topicLabel = topic?.trim() || "";
  const takeaways = lesson.takeaways ?? [];
  const readMins = estimateReadMinutes(lesson.body);
  const total = totalLessons ?? Math.max(lessonIndex + 1, 1);
  const apiVisuals = lesson.visuals ?? [];
  const useApiVisuals = apiVisuals.length > 0;
  const shareable = lesson.shareableFact;
  const bodyMarkdown = lesson.body.join("\n\n");
  const quizCta = quizCtaCopy(
    lesson.title,
    topicLabel || lesson.title,
    lessonIndex,
  );

  const theme =
    READER_THEMES.find((t) => t.id === settings.theme) ?? READER_THEMES[0];
  const fontCfg =
    READER_FONTS.find((f) => f.id === settings.font) ?? READER_FONTS[0];
  const sizeCfg =
    READER_SIZES.find((s) => s.id === settings.size) ?? READER_SIZES[1];
  const sizeIdx = READER_SIZES.findIndex((s) => s.id === settings.size);

  useEffect(() => {
    setSettings(loadReaderSettings());
  }, []);

  useEffect(() => {
    saveReaderSettings(settings);
  }, [settings]);

  useEffect(() => {
    applyReaderThemeToDocument(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    return () => {
      clearReaderThemeFromDocument();
    };
  }, []);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const container = findScrollParent(wrapperRef.current);

    function update() {
      const el = articleRef.current;
      if (!el) return;
      if (container) {
        const cRect = container.getBoundingClientRect();
        const aRect = el.getBoundingClientRect();
        const scrolledPast = cRect.top - aRect.top + container.clientHeight;
        setReadProgress(
          Math.min(1, Math.max(0, scrolledPast / Math.max(aRect.height, 1))),
        );
        return;
      }
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrolledPast = viewport - rect.top;
      setReadProgress(
        Math.min(1, Math.max(0, scrolledPast / Math.max(rect.height, 1))),
      );
    }

    const target: HTMLElement | Window = container ?? window;
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [lesson.title, lesson.body.length]);

  useEffect(() => {
    if (!showReaderSettings) return;
    function onOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (settingsBtnRef.current?.contains(t)) return;
      if (settingsPanelRef.current?.contains(t)) return;
      setShowReaderSettings(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showReaderSettings]);

  useEffect(() => {
    if (!showSources || activeSourceIndex == null) return;
    const row = sourceRowRefs.current[activeSourceIndex];
    row?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [showSources, activeSourceIndex]);

  function updateSettings(patch: Partial<ReaderSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function closeSources() {
    setShowSources(false);
    setActiveSourceIndex(null);
  }

  function handleCitationClick(sourceIndex: number) {
    setActiveSourceIndex(sourceIndex);
    setShowSources(true);
  }

  function renderVisualsAndShareable(): ReactNode[] {
    const nodes: ReactNode[] = [];
    if (useApiVisuals) {
      apiVisuals.forEach((visual, vi) => {
        const hasImage =
          typeof visual.imageUrl === "string" && visual.imageUrl.length > 0;
        const hasEquation =
          typeof visual.equation === "string" && visual.equation.length > 0;
        // Skip caption-only visuals (no image, no equation) — empty "visual notes".
        if (!hasImage && !hasEquation) return;
        if (hasImage) {
          nodes.push(
            <LessonImage key={`lesson-image-${vi}`} visual={visual} />,
          );
        }
        if (hasEquation) {
          nodes.push(
            <EquationBlock key={`equation-block-${vi}`} visual={visual} />,
          );
        }
      });
    }
    if (shareable) {
      nodes.push(
        <ShareableFact
          key="shareable"
          topic={topicLabel || lesson.title}
          title={lesson.title}
          fact={shareable}
        />,
      );
    }
    return nodes;
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className="lesson-reader-root mx-auto w-full max-w-content animate-fade-in"
      >
        {/* Top nav: back (optional) · Aa settings · counter */}
        <div className="mb-8 flex items-center justify-between gap-3">
          {back ? (
            <Link
              href={back.href}
              className="inline-flex min-h-11 min-w-0 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate max-w-[40vw] sm:max-w-none">
                {back.label}
              </span>
            </Link>
          ) : (
            <span />
          )}

          <div className="relative" ref={settingsBtnRef}>
            <button
              type="button"
              onClick={() => setShowReaderSettings((v) => !v)}
              aria-label="Reader display settings"
              className={`flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-none border px-3 text-xs font-medium transition-colors ${
                showReaderSettings
                  ? "border-ink/30 bg-ink text-paper"
                  : "border-border text-ink-muted hover:border-ink/25 hover:text-ink"
              }`}
            >
              <span className="font-ui text-ui-xs font-light">A</span>
              <span className="text-ui-4xs font-semibold">a</span>
            </button>

            {showReaderSettings && (
              <div
                ref={settingsPanelRef}
                className="fixed left-1/2 top-auto z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] max-h-[70dvh] -translate-x-1/2 overflow-y-auto rounded-none border border-border bg-paper sm:absolute sm:left-auto sm:right-0 sm:w-72 sm:translate-x-0"
                style={
                  settings.theme !== "light"
                    ? { background: theme.card, borderColor: theme.border }
                    : undefined
                }
              >
                <div className="px-4 pb-3 pt-4">
                  <p className="mb-2.5 text-ui-4xs font-semibold uppercase tracking-widest text-ink-muted">
                    Size
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          size: READER_SIZES[Math.max(0, sizeIdx - 1)].id,
                        })
                      }
                      disabled={sizeIdx <= 0}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-none border border-border text-ink-muted transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Decrease font size"
                    >
                      −
                    </button>
                    <div className="flex flex-1 items-end justify-around gap-1">
                      {READER_SIZES.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateSettings({ size: s.id })}
                          aria-label={`Font size ${s.id}`}
                          className={`flex flex-col items-center gap-1 rounded-none px-2 py-1.5 transition-colors ${
                            settings.size === s.id
                              ? "bg-ink text-paper"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <span
                            style={{
                              fontSize: 10 + i * 4,
                              lineHeight: 1,
                              fontFamily: fontCfg.family,
                              fontWeight: settings.size === s.id ? 600 : 400,
                            }}
                          >
                            A
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          size: READER_SIZES[
                            Math.min(READER_SIZES.length - 1, sizeIdx + 1)
                          ].id,
                        })
                      }
                      disabled={sizeIdx >= READER_SIZES.length - 1}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-none border border-border text-ink-muted transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Increase font size"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                <div className="px-4 py-3">
                  <p className="mb-2.5 text-ui-4xs font-semibold uppercase tracking-widest text-ink-muted">
                    Font
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {READER_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateSettings({ font: f.id })}
                        className={`flex flex-col items-center gap-1.5 rounded-none border py-3 transition-colors ${
                          settings.font === f.id
                            ? "border-ink bg-ink text-paper"
                            : "border-border text-ink-muted hover:border-ink/25 hover:text-ink"
                        }`}
                      >
                        <span
                          style={{
                            fontFamily: f.family,
                            fontSize: 20,
                            lineHeight: 1,
                            fontWeight: f.id === "serif" ? 300 : 400,
                          }}
                        >
                          Aa
                        </span>
                        <span className="text-mono-xs font-semibold uppercase tracking-wider opacity-70">
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                <div className="px-4 py-3">
                  <p className="mb-2.5 text-ui-4xs font-semibold uppercase tracking-widest text-ink-muted">
                    Theme
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {READER_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateSettings({ theme: t.id })}
                        className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                        aria-label={t.label}
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-none"
                          style={{
                            background: t.swatch,
                            border:
                              settings.theme === t.id
                                ? "2.5px solid currentColor"
                                : `1.5px solid ${t.swatchBorder}`,
                            boxShadow:
                              settings.theme === t.id
                                ? "0 0 0 2px var(--color-paper), 0 0 0 4px currentColor"
                                : "none",
                          }}
                        >
                          {settings.theme === t.id && (
                            <span
                              className="h-2 w-2 rounded-full opacity-50"
                              style={{
                                background: t.fg,
                              }}
                            />
                          )}
                        </span>
                        <span className="text-mono-xs font-medium uppercase tracking-wider text-ink-muted">
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                <div className="px-4 py-3 pb-4">
                  <button
                    type="button"
                    onClick={() => updateSettings({ bionic: !settings.bionic })}
                    className="flex w-full items-center justify-between gap-3"
                    aria-pressed={settings.bionic}
                  >
                    <div className="text-left">
                      <p className="text-ui-4xs font-semibold uppercase tracking-widest text-ink-muted">
                        Bionic reading
                      </p>
                      <p className="mt-0.5 text-ui-4xs leading-snug text-ink-muted/70">
                        Bold fixation points guide the eye
                      </p>
                    </div>
                    <span
                      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-none transition-colors duration-200"
                      style={{
                        background: settings.bionic
                          ? "var(--color-ink)"
                          : "var(--color-border)",
                      }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full bg-paper transition-transform duration-200"
                        style={{
                          transform: settings.bionic
                            ? "translateX(18px)"
                            : "translateX(3px)",
                        }}
                      />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-xs uppercase tracking-ultra text-ink-muted">
            {lessonIndex + 1} / {total}
          </span>
        </div>

        {isGuest && (
          <div className="mb-8 overflow-hidden rounded-none border border-border bg-paper-secondary">
            <div className="flex items-center gap-0 divide-x divide-border">
              {[
                {
                  n: "1",
                  short: "Read",
                  label: "Read lesson",
                  done: true,
                },
                {
                  n: "2",
                  short: "Quiz",
                  label: "Complete the quiz",
                  done: false,
                },
                {
                  n: "3",
                  short: "Save",
                  label: "Save & unlock lesson 2",
                  done: false,
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className={`flex flex-1 items-center gap-2.5 px-3 py-3 sm:px-4 ${
                    step.done ? "text-ink" : "text-ink-muted/60"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ui-4xs font-semibold ${
                      step.done ? "bg-ink text-paper" : "border border-border"
                    }`}
                  >
                    {step.done ? "✓" : step.n}
                  </span>
                  <span className="text-ui-3xs leading-snug sm:hidden">
                    {step.short}
                  </span>
                  <span className="hidden text-ui-3xs leading-snug sm:inline">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <article
          ref={articleRef}
          className="pb-[calc(8rem+env(safe-area-inset-bottom))]"
        >
          <header
            className="lesson-title-sticky"
            data-testid="lesson-title-sticky"
          >
            <div className="wall-label mb-6 flex-wrap">
              <span>
                Lesson {lessonIndex + 1}
                {topicLabel ? ` · ${topicLabel}` : ""}
              </span>
              <span className="border border-border px-3 py-1 tracking-widest text-ink/70">
                Today
              </span>
            </div>

            <h1 className="font-display display-section text-display-sm leading-tight tracking-tighter text-ink sm:text-display-md">
              {lesson.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="text-xs text-ink-muted">{readMins} min read</span>
              <div className="mx-1 h-3 w-px bg-border" />
              <button
                type="button"
                onClick={() => setShowSources(true)}
                className="flex items-center gap-2 border border-border bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors duration-small ease-out hover:border-ink/30 hover:text-ink"
              >
                <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Sources
                {lesson.sources.length > 0 ? (
                  <span className="font-meta text-[10px] tabular-nums tracking-wider text-ink-muted">
                    · {lesson.sources.length}
                  </span>
                ) : null}
              </button>
            </div>
          </header>

          {takeaways.length > 0 && (
            <div className="mt-6">
              <button
                id="lesson-takeaways-trigger"
                type="button"
                onClick={() => setTakeawaysOpen((o) => !o)}
                className="flex w-full items-center justify-between py-3.5 text-left text-ink-muted transition-colors duration-small ease-out hover:text-ink"
                aria-expanded={takeawaysOpen}
                aria-controls="lesson-takeaways-panel"
              >
                <span className="text-xs uppercase tracking-widest">
                  {takeaways.length} things from this lesson
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 opacity-60 transition-transform duration-small ease-standard ${
                    takeawaysOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                id="lesson-takeaways-panel"
                role="region"
                aria-labelledby="lesson-takeaways-trigger"
                className={`lesson-accordion${takeawaysOpen ? " is-open" : ""}`}
                data-testid="lesson-takeaways-accordion"
              >
                <div className="lesson-accordion-panel">
                  <ul className="lesson-accordion-content space-y-4 pb-5">
                    {takeaways.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 text-sm leading-loose text-ink/80"
                      >
                        <span className="takeaway-number">{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div
            className="pt-8 text-ink"
            style={{
              fontFamily: fontCfg.family,
              fontSize: sizeCfg.size,
              lineHeight: sizeCfg.leading,
            }}
          >
            {bodyMarkdown ? (
              <LessonMarkdown
                markdown={bodyMarkdown}
                bionic={settings.bionic}
                onCitationClick={handleCitationClick}
              />
            ) : null}
            {(useApiVisuals || shareable) && (
              <div
                className={`divide-y divide-border ${bodyMarkdown ? "mt-10 border-t border-border pt-10" : ""}`}
              >
                {renderVisualsAndShareable()}
              </div>
            )}
          </div>
        </article>
      </div>

      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readProgress * 100)}
        className="lesson-read-progress"
        data-testid="lesson-read-progress"
      >
        <div
          className="h-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>
      <div className="lesson-quiz-dock border-t border-border bg-paper/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto w-full max-w-content">
          <p className="mb-2.5 text-center font-ui text-ui-3xs leading-snug text-ink-muted">
            {quizCta.hint}
          </p>
          <Button onClick={onStartQuiz} className="w-full">
            {quizCta.label}
          </Button>
        </div>
      </div>

      <LessonSourcesPanel
        open={showSources}
        lesson={lesson}
        topicLabel={topicLabel}
        activeSourceIndex={activeSourceIndex}
        onClose={closeSources}
        sourceRowRefs={sourceRowRefs}
      />
    </>
  );
}
