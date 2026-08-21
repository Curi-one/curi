"use client";

import { useState } from "react";
import { BrowseFilterChips } from "@/components/BrowseFilterChips";
import { EmptyState } from "@/components/EmptyState";
import { Heatmap } from "@/components/Heatmap";
import { LessonFeedCard } from "@/components/LessonFeedCard";
import { LibraryPathCard } from "@/components/LibraryPathCard";
import { Loader } from "@/components/Loader";
import { PageShell } from "@/components/PageShell";
import { PathMap } from "@/components/PathMap";
import { PathProgressBar } from "@/components/PathProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { SettingChips } from "@/components/SettingChips";
import { SettingToggle } from "@/components/SettingToggle";
import { StepProgress } from "@/components/StepProgress";
import { TabPills } from "@/components/TabPills";
import { TopicThumbnail } from "@/components/TopicThumbnail";
import { Wordmark } from "@/components/Wordmark";
import type { FeedLessonItem, PathSummary } from "@/lib/api/schemas";

type Props = {
  env: "local" | "staging" | "production";
};

const GREYSCALE = [
  { name: "Ink", token: "--color-ink", tw: "bg-ink", hex: "#0D0D0D" },
  { name: "Ink 2", token: "--color-ink-2", tw: "bg-ink-2", hex: "#1F1F1F" },
  { name: "Ink 3", token: "--color-ink-3", tw: "bg-ink-3", hex: "#2A2A2A" },
  { name: "Mid", token: "--color-mid", tw: "bg-mid", hex: "#666666" },
  {
    name: "Silver",
    token: "--color-silver",
    tw: "bg-silver",
    hex: "#A3A3A3",
  },
  { name: "Light", token: "--color-light", tw: "bg-light", hex: "#E2E2E2" },
  {
    name: "Paper",
    token: "--color-paper-tone",
    tw: "bg-paper-secondary",
    hex: "#FAFAFA",
  },
  {
    name: "White",
    token: "--color-white-tone",
    tw: "bg-paper",
    hex: "#FFFFFF",
  },
] as const;

const SPACES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32] as const;

const FEED_ITEMS: FeedLessonItem[] = [
  {
    id: "avail",
    courseId: "demo-path",
    topic: "Term sheets",
    lessonIndex: 2,
    title: "How a SAFE converts to equity",
    lessonNumber: 3,
    totalLessons: 12,
    daysAgo: 0,
    status: "available",
  },
  {
    id: "done",
    courseId: "demo-path",
    topic: "Term sheets",
    lessonIndex: 1,
    title: "Pre-money vs post-money",
    lessonNumber: 2,
    totalLessons: 12,
    daysAgo: 0,
    status: "completed",
  },
  {
    id: "over",
    courseId: "demo-path",
    topic: "Term sheets",
    lessonIndex: 0,
    title: "The anatomy of a term sheet",
    lessonNumber: 1,
    totalLessons: 12,
    daysAgo: 1,
    status: "overdue",
  },
  {
    id: "lock",
    courseId: "demo-path",
    topic: "Term sheets",
    lessonIndex: 3,
    title: "Priced rounds and pro-rata",
    lessonNumber: 4,
    totalLessons: 12,
    daysAgo: -1,
    status: "locked",
  },
];

const SAMPLE_PATH: PathSummary = {
  id: "demo-path",
  topic: "Startup fundraising",
  progress: 3,
  totalLessons: 12,
  depth: "fluent",
};

const PATH_NODES = [
  { index: 0, title: "Why raise at all", status: "read" as const },
  { index: 1, title: "SAFE basics", status: "read" as const },
  { index: 2, title: "Valuation caps", status: "today" as const },
  { index: 3, title: "Dilution math", status: "locked" as const },
  { index: 4, title: "Board seats", status: "locked" as const },
];

const HEATMAP_DATES = Array.from({ length: 18 }, (_, i) => {
  const d = new Date("2026-08-21T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - i);
  return d.toISOString().slice(0, 10);
});

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-border pt-10">
      <p className="type-kicker-mark">{title}</p>
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-meta mb-3 text-ink">{title}</h3>
      {children}
    </div>
  );
}

const NAV = [
  { href: "#colours", label: "Colours" },
  { href: "#typography", label: "Type" },
  { href: "#space", label: "Space" },
  { href: "#buttons", label: "Buttons" },
  { href: "#forms", label: "Forms" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#components", label: "Components" },
  { href: "#feed", label: "Feed" },
  { href: "#motion", label: "Motion" },
] as const;

export function DesignSystemShowcase({ env }: Props) {
  const [toggleOn, setToggleOn] = useState(true);
  const [chip, setChip] = useState("morning");
  const [tabPills, setTabPills] = useState("exploring");
  const [tabUnderline, setTabUnderline] = useState("paths");
  const [browse, setBrowse] = useState<string | null>(null);
  const [optionSel, setOptionSel] = useState("b");

  return (
    <PageShell
      withTabPad={false}
      kicker={`Design system · ${env}`}
      title="Curi design system"
      className="max-w-3xl"
    >
      <p className="type-lede mt-3 max-w-xl">
        Tokens and components from{" "}
        <code className="font-meta normal-case tracking-normal text-ink">
          docs/BRAND.md
        </code>
        . Staging and local only — hidden in production.
      </p>

      <nav
        aria-label="Design system sections"
        className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="interactive-chip focus-ring rounded-none border border-border px-3 py-2 text-xs font-medium text-ink-muted hover:border-ink/40 hover:text-ink"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14 pb-16">
        {/* ── Colours ─────────────────────────────────────────────── */}
        <Section id="colours" title="Colour tokens">
          <Sub title="Greyscale · eight tones">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GREYSCALE.map((c) => (
                <div key={c.token} className="space-y-2">
                  <div
                    className={`h-16 border border-border ${c.tw}`}
                    style={
                      c.name === "White"
                        ? { boxShadow: "inset 0 0 0 1px #E2E2E2" }
                        : undefined
                    }
                  />
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="font-meta normal-case tracking-normal">{c.hex}</p>
                  <p className="font-meta text-[9px] normal-case tracking-normal opacity-70">
                    {c.token}
                  </p>
                </div>
              ))}
            </div>
          </Sub>

          <Sub title="Accent · one use per screen">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <div className="h-16 w-28 bg-accent" />
                <p className="text-sm font-medium">Vermilion</p>
                <p className="font-meta normal-case tracking-normal">#C1121F</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-28 bg-accent-dark" />
                <p className="text-sm font-medium">Vermilion dark</p>
                <p className="font-meta normal-case tracking-normal">#A30F1B</p>
              </div>
              <div className="flex max-w-xs items-end border-l-2 border-accent pl-4">
                <p className="font-display text-lg font-light italic leading-snug text-ink">
                  Pull-quote rule uses Vermilion once.
                </p>
              </div>
            </div>
          </Sub>

          <Sub title="Semantic">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm">
                <span className="h-4 w-4 bg-ink" /> Correct = Ink
              </span>
              <span className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm text-silver">
                Error text = Silver
              </span>
              <span className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm text-streak">
                Streak = Ink (never Vermilion)
              </span>
            </div>
          </Sub>

          <Sub title="Background & text roles">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="border border-border bg-paper p-4 text-sm text-ink">
                bg-paper · text-ink
              </div>
              <div className="border border-border bg-paper-secondary p-4 text-sm text-ink-muted">
                bg-paper-secondary · muted
              </div>
              <div className="bg-ink p-4 text-sm text-paper">
                bg-ink · text-paper
              </div>
            </div>
          </Sub>
        </Section>

        {/* ── Typography ──────────────────────────────────────────── */}
        <Section id="typography" title="Typography">
          <Sub title="Families · three only">
            <div className="space-y-4">
              <p
                className="font-display text-3xl font-light tracking-tight"
                style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
              >
                Fraunces — display
              </p>
              <p className="font-ui text-base font-light text-ink-muted">
                Plus Jakarta Sans — UI & body
              </p>
              <p className="font-meta">JetBrains Mono — metadata</p>
            </div>
          </Sub>

          <Sub title="Display scale">
            <div className="space-y-3">
              <p className="type-display text-display-sm">type-display · 38px</p>
              <p
                className="font-display text-display-xs font-light"
                style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
              >
                display-xs · 28px
              </p>
              <p
                className="font-display text-display-2xs font-normal"
                style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 0" }}
              >
                display-2xs · 22px
              </p>
              <p className="type-lede">
                type-lede — supporting copy at UI md, light weight.
              </p>
            </div>
          </Sub>

          <Sub title="Wordmark">
            <div className="flex flex-wrap items-end gap-8">
              <Wordmark size="sm" href="" />
              <Wordmark size="md" href="" />
              <Wordmark size="sm" underline={false} href="" />
            </div>
          </Sub>

          <Sub title="Kickers & labels">
            <p className="type-kicker">type-kicker</p>
            <p className="type-kicker-mark mt-4">type-kicker-mark</p>
            <label className="type-label mt-4">type-label · form</label>
          </Sub>
        </Section>

        {/* ── Space / radius ──────────────────────────────────────── */}
        <Section id="space" title="Space, radius, borders">
          <Sub title="Spacing scale">
            <div className="flex flex-wrap items-end gap-3">
              {SPACES.map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-ink"
                    style={{ width: `var(--space-${n})`, height: 24 }}
                  />
                  <span className="font-meta normal-case tracking-normal text-[9px]">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </Sub>

          <Sub title="Radius · sharp by default">
            <div className="flex flex-wrap gap-3">
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-paper-secondary text-xs">
                none
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-paper-secondary text-xs">
                sm
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-paper-secondary text-xs">
                md
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-paper-secondary text-xs">
                full
              </div>
            </div>
          </Sub>

          <Sub title="Borders">
            <div className="space-y-2">
              <div className="border border-border p-3 text-sm">border</div>
              <div className="border border-border-default p-3 text-sm">
                border-default
              </div>
              <div className="border border-border-strong p-3 text-sm">
                border-strong
              </div>
              <div className="editorial-rule" />
              <div className="editorial-rule-bold" />
            </div>
          </Sub>
        </Section>

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <Section id="buttons" title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary">
              Primary
            </button>
            <button type="button" className="btn-secondary">
              Secondary
            </button>
            <button type="button" className="btn-ghost">
              Ghost
            </button>
            <button type="button" className="btn-danger">
              Danger
            </button>
            <button type="button" className="btn-primary" disabled>
              Disabled
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Primary uses Vermilion bottom border — the one accent on this
            section.
          </p>
        </Section>

        {/* ── Forms ───────────────────────────────────────────────── */}
        <Section id="forms" title="Forms & controls">
          <Sub title="Inputs">
            <div className="max-w-md space-y-4">
              <div>
                <label className="type-label" htmlFor="ds-input">
                  Email
                </label>
                <input
                  id="ds-input"
                  className="input-field"
                  placeholder="you@example.com"
                  defaultValue=""
                />
              </div>
              <div>
                <label className="type-label" htmlFor="ds-input-err">
                  With error
                </label>
                <input
                  id="ds-input-err"
                  className="input-field input-error"
                  defaultValue="bad"
                />
                <p className="mt-1 text-xs text-silver">Enter a valid email.</p>
              </div>
            </div>
          </Sub>

          <Sub title="SettingToggle">
            <div className="max-w-md surface-card p-4">
              <SettingToggle
                label="Send daily email"
                hint="Morning delivery in your timezone"
                checked={toggleOn}
                onChange={setToggleOn}
              />
            </div>
          </Sub>

          <Sub title="SettingChips">
            <div className="max-w-md surface-card p-4">
              <SettingChips
                label="Delivery time"
                value={chip}
                onChange={setChip}
                options={[
                  { value: "early-morning", label: "Early morning" },
                  { value: "morning", label: "Morning" },
                  { value: "evening", label: "Evening" },
                ]}
              />
            </div>
          </Sub>

          <Sub title="Quiz / clarify options">
            <ul className="max-w-md space-y-2">
              {[
                { id: "a", label: "Too easy — I already knew this" },
                { id: "b", label: "Just right" },
                { id: "c", label: "Too hard — slow down", dimmed: true },
              ].map((opt, i) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => setOptionSel(opt.id)}
                    className={`option-card focus-ring flex w-full items-center gap-3 text-left text-[15px] ${
                      optionSel === opt.id ? "option-card-selected" : ""
                    } ${opt.dimmed && optionSel !== opt.id ? "option-card-dimmed" : ""}`}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </Sub>
        </Section>

        {/* ── Surfaces ────────────────────────────────────────────── */}
        <Section id="surfaces" title="Surfaces & badges">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card p-4 text-sm">surface-card</div>
            <div className="surface-card surface-card-interactive interactive-card cursor-pointer p-4 text-sm">
              surface-card-interactive
            </div>
            <div className="surface-card-dark p-4 text-sm text-paper">
              surface-card-dark
            </div>
            <div className="flex flex-wrap items-center gap-2 p-4">
              <span className="badge">Badge</span>
              <span className="badge-mono">Badge mono</span>
              <span className="interactive-chip border border-border px-3 py-1.5 text-xs">
                interactive-chip
              </span>
            </div>
          </div>
          <blockquote className="pull-quote mt-4">
            Pull quote — Fraunces italic with Vermilion rule.
          </blockquote>
          <div className="mt-4 flex gap-3">
            <span className="takeaway-number">01</span>
            <span className="text-sm">Takeaway number (Vermilion mono)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="streak-number">8</span>
            <span className="streak-label">day streak</span>
          </div>
        </Section>

        {/* ── Components ──────────────────────────────────────────── */}
        <Section id="components" title="Components">
          <Sub title="TabPills · pills">
            <TabPills
              tabs={[
                { id: "exploring", label: "Exploring", count: 2 },
                { id: "mastered", label: "Mastered", count: 1 },
                { id: "shelved", label: "Shelved" },
              ]}
              active={tabPills}
              onChange={setTabPills}
            />
          </Sub>

          <Sub title="TabPills · underline">
            <TabPills
              variant="underline"
              tabs={[
                { id: "paths", label: "Paths" },
                { id: "books", label: "Books" },
              ]}
              active={tabUnderline}
              onChange={setTabUnderline}
            />
          </Sub>

          <Sub title="BrowseFilterChips">
            <BrowseFilterChips
              categories={["Fundraising", "Product", "Growth"]}
              active={browse}
              onChange={setBrowse}
            />
          </Sub>

          <Sub title="StepProgress">
            <StepProgress step={2} totalSteps={4} label="Clarify" />
          </Sub>

          <Sub title="Loader">
            <div className="flex flex-wrap items-end gap-8">
              <Loader size="sm" label="sm" />
              <Loader size="md" label="md" />
              <Loader size="lg" label="lg" />
            </div>
          </Sub>

          <Sub title="Progress">
            <div className="flex flex-wrap items-center gap-8">
              <ProgressRing percent={42} />
              <div className="w-48 space-y-2">
                  <PathProgressBar progress={3} total={12} />
                <p className="font-meta">3 / 12</p>
              </div>
            </div>
          </Sub>

          <Sub title="TopicThumbnail">
            <div className="flex gap-3">
              <TopicThumbnail topic="Term sheets" />
              <TopicThumbnail topic="Macroeconomics" size={48} />
              <TopicThumbnail topic="Cryptography" size={32} />
            </div>
          </Sub>

          <Sub title="Heatmap">
            <Heatmap dates={HEATMAP_DATES} streak={8} />
            <div className="mt-6">
              <Heatmap dates={HEATMAP_DATES.slice(0, 3)} streak={3} atRisk />
            </div>
          </Sub>

          <Sub title="EmptyState">
            <EmptyState
              message="Nothing due today. Explore a new path or revisit Library."
              actionHref="/explore"
              actionLabel="Explore"
              secondaryHref="/library"
              secondaryLabel="Library"
            />
          </Sub>

          <Sub title="LibraryPathCard">
            <div className="grid gap-3 sm:grid-cols-2">
              <LibraryPathCard path={SAMPLE_PATH} tab="exploring" />
              <LibraryPathCard
                path={{ ...SAMPLE_PATH, progress: 12, topic: "Game theory" }}
                tab="mastered"
              />
            </div>
          </Sub>

          <Sub title="PathMap">
            <PathMap courseId="demo-path" nodes={PATH_NODES} readOnly />
          </Sub>
        </Section>

        {/* ── Feed cards ──────────────────────────────────────────── */}
        <Section id="feed" title="Lesson feed cards">
          <div className="space-y-3">
            {FEED_ITEMS.map((item) => (
              <LessonFeedCard key={item.id} item={item} />
            ))}
          </div>
        </Section>

        {/* ── Motion ──────────────────────────────────────────────── */}
        <Section id="motion" title="Motion">
          <div className="flex flex-wrap gap-4">
            <div className="animate-fade-in surface-card px-4 py-3 text-sm">
              animate-fade-in
            </div>
            <div className="animate-slide-up surface-card px-4 py-3 text-sm">
              animate-slide-up
            </div>
            <div className="flex items-center gap-2 surface-card px-4 py-3 text-sm">
              <span className="landing-pulse-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
              landing-pulse-dot
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Durations: micro → xl. Easing settles (no spring/bounce). Respects
            prefers-reduced-motion.
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
