"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Heatmap } from "@/components/Heatmap";
import { SettingChips } from "@/components/SettingChips";
import { TabPills } from "@/components/TabPills";
import { BrowseFilterChips } from "@/components/BrowseFilterChips";

type PanelTone = "light" | "muted" | "dark";

function Panel({
  tone,
  eyebrow,
  title,
  children,
}: {
  tone: PanelTone;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`ds-panel-${tone} border-b border-border px-5 py-10 sm:px-8 sm:py-14`}
    >
      <div className="mx-auto max-w-narrow">
        <p className="font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-display-2xs  tracking-tight">
          {title}
        </h2>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </section>
  );
}

function Swatch({
  name,
  token,
  onDark,
}: {
  name: string;
  token: string;
  onDark?: boolean;
}) {
  return (
    <div className="group min-w-0 flex-1 basis-[7.5rem]">
      <div
        className="h-16 border border-border transition-transform duration-small ease-out group-hover:-translate-y-0.5"
        style={{ background: `var(${token})` }}
        title={token}
      />
      <p
        className={`mt-2 font-meta text-mono-xs uppercase tracking-wider ${
          onDark ? "text-ink-muted" : "text-ink-faint"
        }`}
      >
        {name}
      </p>
      <p
        className={`font-meta text-mono-md ${onDark ? "text-ink-faint" : "text-ink-muted"}`}
      >
        {token.replace(/^--/, "")}
      </p>
    </div>
  );
}

function TypeRow({
  label,
  sample,
  className,
  note,
}: {
  label: string;
  sample: string;
  className: string;
  note: string;
}) {
  return (
    <div className="border-b border-border py-5 transition-colors duration-small last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
          {label}
        </p>
        <p className="font-meta text-mono-xs text-ink-faint">{note}</p>
      </div>
      <p className={`mt-2 ${className}`}>{sample}</p>
    </div>
  );
}

function InteractiveDemo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

function demoDates(): string[] {
  const out: string[] = [];
  const today = new Date();
  const pattern = [
    1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0,
    1, 1, 1,
  ];
  for (let i = 0; i < 90; i++) {
    if (pattern[i % pattern.length]) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      out.push(d.toISOString().slice(0, 10));
    }
  }
  return out;
}

export function DesignSystemShowcase() {
  const heatDates = useMemo(() => demoDates(), []);
  const [pace, setPace] = useState("Balanced");
  const [depth, setDepth] = useState("Applied");
  const [tone, setTone] = useState("Curious");
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* Hero — light */}
      <header className="ds-panel-light relative overflow-hidden border-b border-border px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
        />
        <div className="relative mx-auto max-w-narrow">
          <p className="font-meta text-mono-xs uppercase tracking-widest text-ink-faint">
            Internal · stage / local
          </p>
          <p className="mt-5 font-display text-[clamp(2.75rem,12vw,4.5rem)]  leading-none tracking-tighter text-ink">
            Curi
          </p>
          <p className="mt-4 max-w-md font-sans text-ui-md leading-relaxed text-ink-muted">
            Design system — warm greyscale tokens, type rules, and live
            components. Under{" "}
            <span className="font-meta text-mono-md text-accent">18px</span> we
            use sans or mono only. Vermilion once per screen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/today" icon={<BookOpen aria-hidden />}>
              Open Today
            </Button>
            <Button
              variant="secondary"
              href="/"
              iconRight={<ArrowRight aria-hidden />}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              iconOnly
              onClick={() => setLiked((v) => !v)}
              icon={
                <Heart
                  className={`transition-colors duration-small ${
                    liked ? "fill-accent text-accent" : ""
                  }`}
                  aria-hidden
                />
              }
            >
              {liked ? "Unlike" : "Like"}
            </Button>
          </div>
        </div>
      </header>

      {/* Colour — muted */}
      <Panel
        tone="muted"
        eyebrow="01 · Colour"
        title="Warm greyscale + Vermilion"
      >
        <div className="flex flex-wrap gap-4">
          <Swatch name="Ink" token="--color-ink" />
          <Swatch name="Paper" token="--color-paper-tone" />
          <Swatch name="Pale" token="--color-pale" />
          <Swatch name="White" token="--color-white-tone" />
          <Swatch name="Light" token="--color-light" />
          <Swatch name="Mid" token="--color-mid" />
          <Swatch name="Vermilion" token="--color-accent" />
        </div>
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Near-white surfaces (Paper #F4F1E8, White #FAF9F5, Pale #E8E5DC).
          Vermilion is the only chromatic colour — one beat per screen. Hover the
          swatches.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="badge-accent transition-transform duration-small hover:-translate-y-px">
            New path
          </span>
          <span className="inline-flex items-center border border-border px-2.5 py-1 font-meta text-mono-xs uppercase tracking-wider text-ink-muted transition-colors duration-small hover:border-ink hover:text-ink">
            On track
          </span>
          <span className="inline-flex items-center bg-paper-tertiary px-2.5 py-1 font-meta text-mono-xs uppercase tracking-wider text-ink-muted transition-colors duration-small hover:bg-light hover:text-ink">
            Draft
          </span>
        </div>
      </Panel>

      {/* Type — dark */}
      <Panel
        tone="dark"
        eyebrow="02 · Typography"
        title="Three fonts, one rule"
      >
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Fraunces for display (≥18px). Plus Jakarta Sans and JetBrains Mono for
          everything smaller — links, buttons, badges, tabs, chips.
        </p>
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Display type is always Light (300) with the optical axes up. SOFT
          rounds the terminals; WONK lets the genuinely odd forms through. Both
          are set by{" "}
          <span className="font-meta text-mono-md">.font-display</span> — never
          per component. Larger type takes more of each.
        </p>
        <div>
          <TypeRow
            label="Display · Fraunces · SOFT 90"
            sample="Today’s lesson"
            className="font-display text-display-xs tracking-tight"
            note="default"
          />
          <TypeRow
            label="Display · .display-section · SOFT 96"
            sample="What the Stoics knew"
            className="font-display display-section text-display-sm tracking-tight"
            note="section leads"
          />
          <TypeRow
            label="Display · .display-hero · SOFT 100"
            sample="Knowledge that compounds"
            className="font-display display-hero text-display-md tracking-tighter"
            note="hero"
          />
          <TypeRow
            label="Display · .display-plain · WONK 0"
            sample="Knowledge that compounds"
            className="font-display display-hero display-plain text-display-md tracking-tighter"
            note="wonk off — rare"
          />
          <TypeRow
            label="UI · Plus Jakarta Sans"
            sample="Continue where you left off — five minutes is enough."
            className="font-sans text-ui-md leading-relaxed"
            note="Body & UI"
          />
          <TypeRow
            label="Meta · JetBrains Mono"
            sample="DAY 12 · 5 MIN · STREAK 4"
            className="font-meta text-mono-md uppercase tracking-wider"
            note="Labels"
          />
          <TypeRow
            label="Link · sans under 18px"
            sample="Read the full path outline →"
            className="font-sans text-ui-sm text-accent underline-offset-4 transition-[text-decoration] duration-small hover:underline"
            note="14px"
          />
        </div>
      </Panel>

      {/* Buttons — light */}
      <Panel
        tone="light"
        eyebrow="03 · Buttons"
        title="Same type recipe, every size"
      >
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Primary: Ink fill + 2px Vermilion underline. Ghost: Light border → Ink
          / Pale on hover. Danger: Mid text, ghost-like — destruction is
          signalled by words, not colour. Size changes padding and type size
          only.
        </p>

        <InteractiveDemo label="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="large">Large</Button>
            <Button size="default">Default</Button>
            <Button size="small">Small</Button>
            <Button size="compact">Compact</Button>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Variants · library">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setCount((c) => c + 1)}>
              Primary · {count}
            </Button>
            <Button variant="secondary">Ghost outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Cancel subscription</Button>
            <button
              type="button"
              className="font-sans text-[13px] font-normal text-ink underline underline-offset-[3px] transition-colors hover:text-mid"
            >
              Link
            </button>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="With icons">
          <div className="flex flex-wrap items-center gap-3">
            <Button icon={<Plus aria-hidden />}>New path</Button>
            <Button variant="secondary" icon={<Search aria-hidden />}>
              Search
            </Button>
            <Button variant="ghost" iconRight={<ChevronRight aria-hidden />}>
              Continue
            </Button>
            <Button
              variant="secondary"
              icon={<Sparkles aria-hidden />}
              iconRight={<ArrowRight aria-hidden />}
            >
              Generate
            </Button>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Icon only">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="large"
              iconOnly
              icon={<Plus aria-hidden />}
            >
              Add
            </Button>
            <Button variant="secondary" iconOnly icon={<Search aria-hidden />}>
              Search
            </Button>
            <Button
              variant="ghost"
              size="small"
              iconOnly
              icon={<Settings aria-hidden />}
            >
              Settings
            </Button>
            <Button
              variant="danger"
              size="compact"
              iconOnly
              icon={<Heart aria-hidden />}
            >
              Remove
            </Button>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="States">
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled icon={<Check aria-hidden />}>
              Disabled + icon
            </Button>
            <Button loading>Loading</Button>
            <Link
              href="#type"
              className="font-sans text-ui-xs text-ink underline-offset-4 transition-all duration-small hover:underline"
            >
              Text link (sans)
            </Link>
          </div>
        </InteractiveDemo>
      </Panel>

      {/* Patterns — muted */}
      <Panel
        tone="muted"
        eyebrow="03b · Patterns"
        title="Geometric library"
      >
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Greyscale ruled lines, hatch, and blueprint fills. Vermilion appears
          only as the reveal line. Production screens get Vermilion once;
          this catalogue may show several tiles with a reveal for reference.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              ["Ledger", "pattern-ledger bg-paper"],
              ["Hatch", "pattern-hatch bg-paper"],
              ["Cross on ink", "pattern-cross bg-ink"],
              ["Blueprint", "pattern-blueprint bg-paper"],
              ["Reveal", "pattern-reveal bg-paper"],
              ["Columns", "pattern-columns bg-paper"],
            ] as const
          ).map(([name, classes]) => (
            <div key={name} className="min-w-0">
              <div
                className={`relative h-28 border border-border ${classes}`}
                aria-hidden
              >
                {name === "Reveal" ? (
                  <span className="absolute bottom-3 left-3 z-[1] font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
                    Reveal line
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
                {name}
              </p>
            </div>
          ))}
          <div className="min-w-0">
            <div
              className="pattern-vitrine relative h-28 border border-border bg-paper"
              aria-hidden
            >
              <span className="r r1" />
              <span className="r r2" />
              <span className="r r3" />
            </div>
            <p className="mt-2 font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
              Vitrine
            </p>
          </div>
        </div>
      </Panel>

      {/* Chips / tabs — dark */}
      <Panel
        tone="dark"
        eyebrow="04 · Chips & tabs"
        title="Meta type, tactile feedback"
      >
        <InteractiveDemo label="Setting chips · mono labels">
          <div className="space-y-5 border border-border bg-paper p-5 transition-colors duration-medium hover:border-accent/40">
            <SettingChips
              label="Pace"
              options={["Quick", "Balanced", "Deep"]}
              value={pace}
              onChange={setPace}
            />
            <SettingChips
              label="Depth"
              options={["Overview", "Applied", "Expert"]}
              value={depth}
              onChange={setDepth}
            />
            <SettingChips
              label="Tone"
              options={["Curious", "Practical", "Playful"]}
              value={tone}
              onChange={setTone}
            />
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Tab pills">
          <div className="border border-border bg-paper px-4 pt-2">
            <TabPills
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "sources", label: "Sources" },
                { id: "notes", label: "Notes" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <p className="pb-4 pt-3 font-sans text-ui-sm text-ink-muted">
              Active: <span className="text-accent">{tab}</span>
            </p>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Browse filters">
          <BrowseFilterChips
            categories={["Science", "History", "Design"]}
            active={filter}
            onChange={setFilter}
          />
        </InteractiveDemo>
      </Panel>

      {/* Heatmap — muted */}
      <Panel tone="muted" eyebrow="05 · Heatmap" title="Colourful activity">
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Intensity from neighbour density. The ramp moves warm tertiary →
          accent mixes → full Vermilion. Hover a cell for the date label.
        </p>
        <div className="border border-border bg-paper p-5 transition-colors duration-medium hover:border-accent/35">
          <Heatmap dates={heatDates} streak={12} />
        </div>
      </Panel>

      {/* Surfaces — light */}
      <Panel
        tone="light"
        eyebrow="06 · Surfaces"
        title="Light and ink for variety"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="group border border-border bg-paper p-5 transition-transform duration-medium ease-out hover:-translate-y-1">
            <Sun className="size-4 text-accent" aria-hidden />
            <p className="mt-3 font-display text-display-2xs  tracking-tight">
              Paper
            </p>
            <p className="mt-1 font-sans text-ui-xs leading-relaxed text-ink-muted">
              Default reading surface. Soft lift on hover.
            </p>
          </div>
          <div className="group border border-border bg-paper-secondary p-5 transition-transform duration-medium ease-out hover:-translate-y-1">
            <Moon className="size-4 text-ink-muted" aria-hidden />
            <p className="mt-3 font-display text-display-2xs  tracking-tight">
              Fog
            </p>
            <p className="mt-1 font-sans text-ui-xs leading-relaxed text-ink-muted">
              Nested panels and quiet chrome.
            </p>
          </div>
        </div>
        <div className="border border-ink-3 bg-ink p-6 text-inverse transition-colors duration-medium hover:bg-ink-2">
          <p className="font-meta text-mono-xs uppercase tracking-wider text-silver">
            Ink panel
          </p>
          <p className="mt-2 font-display text-display-2xs  tracking-tight">
            Dark for emphasis
          </p>
          <p className="mt-2 max-w-sm font-sans text-ui-sm leading-relaxed text-silver">
            Alternate light and dark sections so the page has rhythm — not a
            flat dashboard.
          </p>
          <div className="mt-5">
            <Button
              variant="secondary"
              className="!border-silver/40 !text-inverse hover:!border-accent hover:!text-inverse"
            >
              On ink
            </Button>
          </div>
        </div>
      </Panel>

      {/* Radius / motion — muted */}
      <Panel
        tone="muted"
        eyebrow="07 · Motion & radius"
        title="Presence, not noise"
      >
        <div className="flex flex-wrap items-end gap-6">
          {(
            [
              ["sm", "2px"],
              ["md", "4px"],
              ["full", "pill"],
            ] as const
          ).map(([name, px]) => (
            <div key={name} className="text-center">
              <div
                className={`mx-auto size-14 border border-border bg-paper transition-transform duration-medium ease-out hover:scale-110 hover:border-accent ${
                  name === "full"
                    ? "rounded-full"
                    : name === "md"
                      ? "rounded-md"
                      : "rounded-sm"
                }`}
              />
              <p className="mt-2 font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
                {name} · {px}
              </p>
            </div>
          ))}
        </div>
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          Transitions use brand easing. Interactive targets lift, scale, or
          shift colour — never decorative bounce.
        </p>
      </Panel>

      {/* Museum devices — light */}
      <Panel
        tone="light"
        eyebrow="08 · Museum devices"
        title="Editorial modernism, four moves"
      >
        <p className="max-w-xl font-sans text-ui-sm leading-relaxed text-ink-muted">
          The register is a gallery, not a dashboard: hairline rules, real air,
          and metadata set like a wall label. Each device encodes something true
          — what the thing is, that it is on display, where it sits in a
          sequence, what the curator says about it. Using more than one on a
          surface makes them compete.
        </p>

        <InteractiveDemo label="Wall label · .wall-label">
          <p className="wall-label">Lesson 07 · Stoicism · 3 min</p>
        </InteractiveDemo>

        <InteractiveDemo label="Vitrine · .vitrine">
          <div className="vitrine">
            <p className="wall-label">Path III</p>
            <h3 className="mt-5 font-display display-section text-display-xs leading-tight tracking-tight text-ink">
              The Stoics didn’t fear death. They used it.
            </h3>
            <p className="caption mt-4">
              An object is never crowded to the walls of its case.
            </p>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Exhibit number · .exhibit-number">
          <div className="vitrine">
            <p className="wall-label">Day 07 of 14</p>
            <h3 className="mt-5 font-display display-section text-display-xs leading-tight tracking-tight text-ink">
              What compounding feels like
            </h3>
            <span className="exhibit-number" aria-hidden>
              07
            </span>
          </div>
        </InteractiveDemo>

        <InteractiveDemo label="Caption · .caption">
          <p className="caption max-w-md">
            Fraunces Light at SOFT 100 — the terminals round, the axis wanders,
            and the page reads as a book rather than an app.
          </p>
        </InteractiveDemo>
      </Panel>

      <footer className="ds-panel-dark border-t border-border px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-narrow flex-wrap items-center justify-between gap-4">
          <p className="font-meta text-mono-xs uppercase tracking-wider text-ink-faint">
            Source · docs/BRAND.md
          </p>
          <Button
            variant="ghost"
            href="/today"
            iconRight={<ArrowRight aria-hidden />}
          >
            Back to app
          </Button>
        </div>
      </footer>
    </div>
  );
}
