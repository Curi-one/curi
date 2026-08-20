"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowLeft, ChevronDown, Globe2, X } from "lucide-react";
import { IdeaDiagram } from "@/components/lesson/IdeaDiagram";
import { LessonImage } from "@/components/lesson/LessonImage";
import { ShareableFact } from "@/components/lesson/ShareableFact";
import type { LessonResponse } from "@/lib/api/schemas";
import {
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  READER_FONTS,
  READER_SIZES,
  READER_THEMES,
  saveReaderSettings,
  type ReaderSettings,
} from "@/lib/lessons/reader-settings";
import { getLessonTakeaways } from "@/lib/lessons/takeaways";

type Props = {
  lesson: LessonResponse;
  lessonIndex: number;
  totalLessons?: number;
  topic?: string;
  onStartQuiz: () => void;
  back?: { href: string; label: string };
  isGuest?: boolean;
};

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

/** First 2–3 body paragraphs (or leading sentences) as takeaway bullets. */
function extractTakeaways(body: string[]): string[] {
  const out: string[] = [];
  for (const para of body) {
    const clean = stripInlineMarkdown(para);
    if (!clean) continue;
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length === 0) continue;
    if (clean.length <= 180 || sentences.length === 1) {
      out.push(clean);
    } else {
      out.push(sentences[0]);
    }
    if (out.length >= 3) break;
  }
  return out.slice(0, 3);
}

function pickKeyIdea(body: string[]): string | null {
  if (body.length === 0) return null;
  const mid =
    body.length >= 3
      ? body[Math.floor(body.length / 2)]
      : body.length >= 2
        ? body[1]
        : body[0];
  const clean = stripInlineMarkdown(mid);
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 2) {
    return sentences[Math.floor(sentences.length / 2)];
  }
  return clean.length > 40 ? clean : null;
}

function estimateReadMinutes(body: string[]): number {
  const words = body.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function domainInitials(title: string, url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0] || title;
    return label.slice(0, 2).toUpperCase();
  } catch {
    return title.replace(/^(The |A |An )/i, "").slice(0, 2).toUpperCase();
  }
}

function applyBionic(text: string): ReactNode[] {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token) || token.length < 2) {
      return <span key={i}>{token}</span>;
    }
    const cut = Math.ceil(token.length * 0.4);
    return (
      <span key={i}>
        <strong className="font-semibold">{token.slice(0, cut)}</strong>
        {token.slice(cut)}
      </span>
    );
  });
}

const CITATION_REGEX = /(\[\d+\])/g;

/** Splits plain text on `[n]` citation markers and renders each as a tappable button. */
function renderTextWithCitations(
  text: string,
  bionic: boolean,
  onCitationClick?: (sourceIndex: number) => void,
): ReactNode[] {
  const segments = text.split(CITATION_REGEX);
  return segments.map((segment, i) => {
    const match = /^\[(\d+)\]$/.exec(segment);
    if (match) {
      const n = Number(match[1]);
      return (
        <button
          key={`citation-${i}`}
          type="button"
          onClick={() => onCitationClick?.(n - 1)}
          aria-label={`View source ${n}`}
          className="citation-ref relative mx-0.5 inline-flex align-baseline text-[0.7em] font-medium text-accent hover:text-accent/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent before:absolute before:-inset-3 before:content-['']"
        >
          [{n}]
        </button>
      );
    }
    return (
      <span key={i}>{bionic ? applyBionic(segment) : segment}</span>
    );
  });
}

function renderParagraph(
  text: string,
  bionic: boolean,
  onCitationClick?: (sourceIndex: number) => void,
) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-medium text-ink">
          {renderTextWithCitations(inner, bionic, onCitationClick)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      const inner = part.slice(1, -1);
      return (
        <em key={i} className="italic text-ink/90">
          {renderTextWithCitations(inner, bionic, onCitationClick)}
        </em>
      );
    }
    return (
      <span key={i}>{renderTextWithCitations(part, bionic, onCitationClick)}</span>
    );
  });
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
  const takeaways =
    topicLabel.length > 0
      ? getLessonTakeaways(topicLabel)
      : extractTakeaways(lesson.body);
  const keyIdea = pickKeyIdea(lesson.body);
  const readMins = estimateReadMinutes(lesson.body);
  const total = totalLessons ?? Math.max(lessonIndex + 1, 1);
  const showEditorial = lesson.body.length >= 3;

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
    if (!showSources) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSources();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSources]);

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

  const bodyParas = lesson.body;
  const soWhatPara =
    bodyParas.length >= 3
      ? bodyParas[bodyParas.length - 1]
      : bodyParas.length >= 2
        ? bodyParas[bodyParas.length - 1]
        : null;
  const mainParas =
    soWhatPara && bodyParas.length >= 2
      ? bodyParas.slice(0, -1)
      : bodyParas;

  /** Insert LessonImage after first para; IdeaDiagram mid; ShareableFact near end. */
  function renderBody() {
    if (mainParas.length === 0) return null;

    const nodes: ReactNode[] = [];
    const imageAfter = showEditorial ? 0 : -1;
    const diagramAfter =
      showEditorial && mainParas.length >= 2
        ? Math.min(Math.floor(mainParas.length * 0.55), mainParas.length - 1)
        : -1;
    const shareAfter =
      showEditorial && mainParas.length >= 2
        ? mainParas.length - 1
        : -1;
    const keyIdeaAfter =
      keyIdea && mainParas.length >= 2
        ? Math.min(1, mainParas.length - 1)
        : keyIdea
          ? 0
          : -1;

    mainParas.forEach((para, i) => {
      const clean = stripInlineMarkdown(para);
      const firstLetter = clean.charAt(0);
      const rest = clean.slice(1);
      const isFirst = i === 0;

      nodes.push(
        <p key={`p-${i}`}>
          {isFirst && firstLetter ? (
            <>
              <span
                className="float-left mr-3 mt-1 font-display text-5xl font-light leading-[0.78] text-ink sm:text-7xl"
                style={{ fontVariationSettings: "'SOFT' 55, 'WONK' 1" }}
                aria-hidden
              >
                {firstLetter}
              </span>
              {settings.bionic
                ? renderTextWithCitations(rest, true, handleCitationClick)
                : renderParagraph(
                    para.startsWith(firstLetter)
                      ? para.slice(firstLetter.length)
                      : rest,
                    false,
                    handleCitationClick,
                  )}
            </>
          ) : (
            renderParagraph(para, settings.bionic, handleCitationClick)
          )}
        </p>,
      );

      if (i === imageAfter && topicLabel) {
        nodes.push(<LessonImage key="lesson-image" topic={topicLabel} />);
      }
      if (i === keyIdeaAfter && keyIdea) {
        nodes.push(
          <div
            key="key-idea"
            className="border-l-2 border-accent bg-paper-secondary/60 px-6 py-5 text-base leading-7 text-ink/80"
          >
            <div className="mb-2 text-xs uppercase tracking-[0.24em] text-ink-muted">
              Key idea
            </div>
            {settings.bionic ? applyBionic(keyIdea) : keyIdea}
          </div>,
        );
      }
      if (i === diagramAfter && topicLabel) {
        nodes.push(<IdeaDiagram key="idea-diagram" topic={topicLabel} />);
      }
      if (i === shareAfter && topicLabel) {
        nodes.push(
          <ShareableFact
            key="shareable"
            topic={topicLabel}
            title={lesson.title}
          />,
        );
      }
    });

    return nodes;
  }

  const articleStyle: CSSProperties =
    settings.theme === "light"
      ? {}
      : {
          background: theme.bg,
          color: theme.fg,
          // Local token remap — keeps app chrome untouched
          ["--color-ink" as string]: theme.fg,
          ["--color-ink-muted" as string]: theme.muted,
          ["--color-border" as string]: theme.border,
          ["--color-paper" as string]: theme.bg,
          ["--color-paper-secondary" as string]: theme.card,
          ["--color-paper-tertiary" as string]: theme.border,
          ["--color-bg-primary" as string]: theme.bg,
          ["--color-bg-secondary" as string]: theme.card,
          ["--color-text-primary" as string]: theme.fg,
          ["--color-text-secondary" as string]: theme.muted,
          ["--color-border-subtle" as string]: theme.border,
        };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-0.5 md:left-[84px]"
      >
        <div
          className="h-full bg-ink/30 transition-[width] duration-200 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      <div
        ref={wrapperRef}
        className="mx-auto w-full max-w-[724px] animate-fade-in"
        style={articleStyle}
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
              className={`flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors ${
                showReaderSettings
                  ? "border-ink/30 bg-ink text-paper"
                  : "border-border text-ink-muted hover:border-ink/25 hover:text-ink"
              }`}
            >
              <span className="font-display text-[13px] font-light">A</span>
              <span className="text-[10px] font-semibold">a</span>
            </button>

            {showReaderSettings && (
              <div
                ref={settingsPanelRef}
                className="fixed left-1/2 top-auto z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] max-h-[70dvh] -translate-x-1/2 overflow-y-auto rounded-2xl border border-border bg-paper shadow-xl sm:absolute sm:left-auto sm:right-0 sm:w-72 sm:translate-x-0"
                style={
                  settings.theme !== "light"
                    ? { background: theme.card, borderColor: theme.border }
                    : undefined
                }
              >
                <div className="px-4 pb-3 pt-4">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
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
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-ink-muted transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
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
                          className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
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
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-ink-muted transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Increase font size"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                <div className="px-4 py-3">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                    Font
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {READER_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateSettings({ font: f.id })}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
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
                        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70">
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 h-px bg-border" />

                <div className="px-4 py-3">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
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
                          className="flex h-10 w-10 items-center justify-center rounded-full"
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
                                background:
                                  t.id === "dark" ? "#E2DDD8" : "#0D0D0D",
                              }}
                            />
                          )}
                        </span>
                        <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-muted">
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                        Bionic reading
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-ink-muted/70">
                        Bold fixation points guide the eye
                      </p>
                    </div>
                    <span
                      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
                      style={{
                        background: settings.bionic
                          ? "var(--color-ink)"
                          : "var(--color-border)",
                      }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full bg-paper shadow transition-transform duration-200"
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

          <span className="text-xs uppercase tracking-[0.28em] text-ink-muted">
            {lessonIndex + 1} / {total}
          </span>
        </div>

        {isGuest && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-paper-secondary/60">
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
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      step.done
                        ? "bg-ink text-paper"
                        : "border border-border"
                    }`}
                  >
                    {step.done ? "✓" : step.n}
                  </span>
                  <span className="text-[11px] leading-snug sm:hidden">
                    {step.short}
                  </span>
                  <span className="hidden text-[11px] leading-snug sm:inline">
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
          <div className="mb-6 flex flex-wrap items-center gap-2.5 text-xs uppercase tracking-[0.3em] text-ink-muted">
            <span>
              Lesson {lessonIndex + 1}
              {topicLabel ? ` · ${topicLabel}` : ""}
            </span>
            <span className="border border-border px-3 py-1 tracking-[0.18em] text-ink/70">
              Today
            </span>
          </div>

          <h1
            className="font-display text-4xl font-light leading-[0.97] tracking-[-0.045em] text-ink sm:text-5xl sm:text-[3.6rem]"
            style={{ fontVariationSettings: "'SOFT' 55, 'WONK' 1" }}
          >
            {lesson.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-ink-muted">{readMins} min read</span>
            <div className="mx-1 h-3 w-px bg-border" />
            <button
              type="button"
              onClick={() => setShowSources(true)}
              className="flex items-center gap-2 border border-border bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
            >
              <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Sources
            </button>
          </div>

          {takeaways.length > 0 && (
            <div className="mt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setTakeawaysOpen((o) => !o)}
                className="flex w-full items-center justify-between py-3.5 text-left"
                aria-expanded={takeawaysOpen}
              >
                <span className="text-xs uppercase tracking-[0.24em] text-ink-muted">
                  {takeaways.length} things from this lesson
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-muted/60 transition-transform duration-200 ${
                    takeawaysOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              {takeawaysOpen && (
                <ul className="space-y-4 pb-5">
                  {takeaways.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-sm leading-[1.7] text-ink/80"
                    >
                      <span className="mt-[-2px] shrink-0 font-display text-xl leading-none text-accent">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mb-8 h-px bg-border" />

          <div
            className="space-y-8 text-ink"
            style={{
              fontFamily: fontCfg.family,
              fontSize: sizeCfg.size,
              lineHeight: sizeCfg.leading,
            }}
          >
            {renderBody()}

            {soWhatPara && (
              <div>
                <h3 className="mb-3 text-sm uppercase tracking-[0.28em] text-ink-muted">
                  So what?
                </h3>
                <p>
                  {renderParagraph(
                    soWhatPara,
                    settings.bionic,
                    handleCitationClick,
                  )}
                </p>
              </div>
            )}
          </div>
        </article>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:left-[84px]">
          <div className="mx-auto w-full max-w-[724px]">
            <button
              type="button"
              onClick={onStartQuiz}
              className="btn-primary w-full"
            >
              Take the quiz
            </button>
          </div>
        </div>
      </div>

      {showSources && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/10 backdrop-blur-[1px]"
            onClick={closeSources}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Sources"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col border-l border-border bg-paper shadow-xl"
          >
            <div className="flex shrink-0 items-start justify-between border-b border-border px-6 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-ink-muted">
                  Sources
                </div>
                <div className="mt-1 font-display text-lg font-light leading-snug text-ink">
                  {topicLabel || lesson.title}
                </div>
              </div>
              <button
                type="button"
                onClick={closeSources}
                className="mt-0.5 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-muted transition hover:bg-paper-secondary hover:text-ink"
                aria-label="Close sources"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="shrink-0 border-b border-border bg-paper-secondary/60 px-6 py-3">
              <p className="text-[11px] leading-relaxed text-ink-muted">
                These references informed the lesson content. Curi synthesises
                ideas across sources — always read the originals for full
                context.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {lesson.sources.length === 0 ? (
                <p className="px-2 py-6 text-sm text-ink-muted">
                  No sources listed for this lesson yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {lesson.sources.map((source, i) => {
                    let host = source.url;
                    try {
                      host = new URL(source.url).hostname.replace(/^www\./, "");
                    } catch {
                      /* keep url */
                    }
                    const isActive = activeSourceIndex === i;
                    return (
                      <a
                        key={source.url}
                        ref={(el) => {
                          sourceRowRefs.current[i] = el;
                        }}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                          isActive
                            ? "border-accent bg-accent/5"
                            : "border-border bg-paper-secondary/40 hover:border-ink/20 hover:bg-paper"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-tertiary text-[10px] font-semibold text-ink-muted">
                          {domainInitials(source.title, source.url)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-ink group-hover:underline">
                            {source.title}
                          </span>
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-muted/50">
                            <Globe2 className="h-2.5 w-2.5 shrink-0" aria-hidden />
                            <span className="truncate">{host}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
