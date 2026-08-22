"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, LogOut, Minus } from "lucide-react";
import { LearningProfilePreview } from "@/components/LearningProfilePreview";
import { StreakLabel } from "@/components/StreakIndicator";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { SettingChips } from "@/components/SettingChips";
import { SettingToggle } from "@/components/SettingToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/Button";
import {
  getLibrary,
  getMe,
  getPreferences,
  getProgress,
  patchMe,
  patchPreferences,
  postBillingPortal,
  postSignOut,
  type ProgressResponse,
  type UserSession,
} from "@/lib/api/client";
import {
  DEFAULT_LEARNING_PROFILE,
  DEFAULT_PREFERENCES,
  type ProfilePreferences,
} from "@/lib/profile/preferences";
import {
  ANCHOR_OPTIONS,
  JARGON_OPTIONS,
  LENGTH_OPTIONS,
  RIGOR_OPTIONS,
  SEQ_OPTIONS,
} from "@/lib/profile/preview-samples";

import {
  applyAppTheme,
  readStoredTheme,
  type AppTheme,
} from "@/lib/ui/app-theme";

type ProfileTab = "account" | "learning" | "email" | "plan";

const PLAN_FREE_ROWS = [
  { label: "Up to 2 active paths", on: true },
  { label: "Daily lessons + quizzes", on: true },
  { label: "Lesson feel tuning", on: true },
  { label: "Unlimited active paths", on: false, note: "Academy" },
  { label: "Billing portal", on: false, note: "Academy" },
] as const;

const PLAN_ACADEMY_ROWS = [
  "Unlimited active paths",
  "Daily lessons + quizzes",
  "Lesson feel tuning",
  "Billing & invoices",
] as const;

/**
 * Profile — mirrors prototypes/web Profile (Account / Learning / Email / Plan).
 * Learning profile + email schedule persist via /api/me/preferences.
 */
export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [activePaths, setActivePaths] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ProfileTab>("account");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("system");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<ProfilePreferences>(DEFAULT_PREFERENCES);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const prefsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefsFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      setTheme(stored);
      applyAppTheme(stored);
    }
  }, []);

  useEffect(() => {
    Promise.all([getMe(), getProgress(), getLibrary()])
      .then(async ([m, p, lib]) => {
        setSession(m.session);
        if (m.session.name) setName(m.session.name);
        if (m.session.kind === "member") {
          try {
            const prefRes = await getPreferences();
            setPrefs(prefRes.preferences);
          } catch {
            setPrefs(DEFAULT_PREFERENCES);
          }
        }
        setProgress(p);
        setActivePaths(lib.exploring.length);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (prefsSaveTimer.current) clearTimeout(prefsSaveTimer.current);
      if (prefsFeedbackTimer.current) clearTimeout(prefsFeedbackTimer.current);
    };
  }, []);

  function persistPrefs(next: ProfilePreferences) {
    if (!session || session.kind !== "member") return;
    setPrefs(next);
    if (prefsSaveTimer.current) clearTimeout(prefsSaveTimer.current);
    prefsSaveTimer.current = setTimeout(() => {
      void patchPreferences(next)
        .then((res) => {
          setPrefs(res.preferences);
          setPrefsSaved(true);
          if (prefsFeedbackTimer.current)
            clearTimeout(prefsFeedbackTimer.current);
          prefsFeedbackTimer.current = setTimeout(
            () => setPrefsSaved(false),
            1500,
          );
        })
        .catch(() => {
          // Keep optimistic UI; user can refresh to reconcile.
        });
    }, 200);
  }

  function resetLearningDefaults() {
    persistPrefs({
      ...prefs,
      ...DEFAULT_LEARNING_PROFILE,
    });
  }

  function patchPrefs<K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) {
    persistPrefs({ ...prefs, [key]: value });
  }

  async function openEmailPreview() {
    if (prefsSaveTimer.current) {
      clearTimeout(prefsSaveTimer.current);
      prefsSaveTimer.current = null;
    }
    if (session?.kind === "member") {
      try {
        const res = await patchPreferences(prefs);
        setPrefs(res.preferences);
      } catch {
        // Navigate anyway; preview uses server prefs (may be slightly stale).
      }
    }
    router.push("/email-preview");
  }

  async function openPortal() {
    setPortalLoading(true);
    setPortalMessage(null);
    try {
      const res = await postBillingPortal();
      if (res.url) {
        router.push(res.url);
        return;
      }
      setPortalMessage(res.message ?? "Billing portal unavailable.");
    } catch {
      setPortalMessage("Billing portal unavailable.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await patchMe({ name: name.trim() });
      setSession(res.session);
      setSaveMessage("Saved");
    } catch {
      setSaveMessage("Could not save name.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await postSignOut();
    router.push("/");
  }

  function onThemeChange(next: AppTheme) {
    setTheme(next);
    applyAppTheme(next);
  }

  if (loading) {
    return (
      <PageShell back={{ href: "/today", label: "Today" }} withTabPad={false}>
        <LoadingState label="Loading profile…" />
      </PageShell>
    );
  }

  if (!session || session.kind !== "member") {
    return (
      <PageShell
        back={{ href: "/today", label: "Today" }}
        title="Profile"
        withTabPad={false}
      >
        <p className="mt-6 text-ink-muted">Sign in to manage your account.</p>
        <Button href="/auth?intent=signin&returnTo=%2Fprofile" className="mt-6">
          Sign in
        </Button>
      </PageShell>
    );
  }

  const isAcademy = session.plan === "academy";
  const displayName = name.trim() || session.name || "Learner";
  const streak = progress?.streak ?? 0;

  return (
    <main className="app-shell profile-shell pb-12 pt-4 md:pb-12">
      <div className="profile-top">
        <Link
          href="/today"
          className="inline-flex min-h-11 items-center gap-1.5 font-meta text-mono-xs uppercase tracking-wider text-ink-muted transition-opacity hover:text-ink hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Today
        </Link>
        <Button
          variant="danger"
          size="small"
          icon={<LogOut className="h-3.5 w-3.5" aria-hidden />}
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </div>

      <header className="profile-identity">
        <UserAvatar name={displayName} size={56} />
        <div className="profile-identity-meta">
          <p className="profile-identity-kicker">Your account</p>
          <p className="profile-identity-name truncate">{displayName}</p>
          <p className="profile-identity-email truncate">
            {session.email ?? "—"}
          </p>
        </div>
      </header>

      <div
        className="profile-tabs"
        role="tablist"
        aria-label="Profile settings"
      >
        {(
          [
            ["account", "Account"],
            ["learning", "Learning"],
            ["email", "Email"],
            ["plan", "Plan"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`profile-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`profile-panel-${id}`}
            onClick={() => setTab(id)}
            className="profile-tab focus-ring min-h-11"
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div
          key="account"
          id="profile-panel-account"
          role="tabpanel"
          aria-labelledby="profile-tab-account"
          className="profile-panel space-y-4"
        >
          <section className="profile-section">
            <h2 className="profile-section-title">Account</h2>
            <p className="profile-section-lede">
              Name and email used across Curi.
            </p>
            <label className="mt-5 block">
              <span className="type-kicker">Name</span>
              <div className="mt-2 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field flex-1"
                  autoComplete="name"
                />
                <Button
                  variant="secondary"
                  size="small"
                  disabled={saving || !name.trim()}
                  loading={saving}
                  onClick={() => void saveName()}
                  className="shrink-0"
                >
                  Save
                </Button>
              </div>
            </label>
            {saveMessage && (
              <p className="mt-2 text-sm text-ink-muted">{saveMessage}</p>
            )}
            <div className="mt-5">
              <p className="type-kicker">Email</p>
              <p className="mt-1 text-lg text-ink">{session.email ?? "—"}</p>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Appearance</h2>
            <p className="profile-section-lede">
              Display preference for this device.
            </p>
            <p className="type-kicker mt-5">Theme</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["system", "light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={theme === t}
                  onClick={() => onThemeChange(t)}
                  className="profile-theme-btn focus-ring min-h-11"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "learning" && (
        <div
          key="learning"
          id="profile-panel-learning"
          role="tabpanel"
          aria-labelledby="profile-tab-learning"
          className="profile-panel"
        >
          <p className="profile-philosophy">
            <span className="profile-philosophy-mark" aria-hidden>
              ×
            </span>
            <span>
              This applies to every course you&apos;re taking. What you&apos;re
              working toward, and where you&apos;re starting, is asked
              separately each time you add a course.
            </span>
          </p>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
            <section className="profile-section p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="profile-section-title">
                    How you like things explained
                  </h2>
                  <p className="profile-section-lede">
                    Not what you&apos;re learning — how Curi should teach it.
                    Set it once; the preview shows it on three unrelated
                    subjects.
                  </p>
                </div>
                {prefsSaved && (
                  <p className="profile-saved" aria-live="polite">
                    Saved
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-8">
                <SettingChips
                  label="How should a new idea open?"
                  hint="The first move Curi makes on any topic."
                  value={prefs.seq}
                  onChange={(v) =>
                    patchPrefs("seq", v as ProfilePreferences["seq"])
                  }
                  options={[...SEQ_OPTIONS]}
                />

                <SettingChips
                  label="What should Curi reach for to explain things?"
                  hint="The kind of illustration your lessons lean on."
                  value={prefs.anchor}
                  onChange={(v) =>
                    patchPrefs("anchor", v as ProfilePreferences["anchor"])
                  }
                  options={[...ANCHOR_OPTIONS]}
                />

                <SettingChips
                  label="How long should each lesson run?"
                  hint="Sets how much ground a single day covers. Medium is the default."
                  value={prefs.length}
                  onChange={(v) =>
                    patchPrefs("length", v as ProfilePreferences["length"])
                  }
                  options={[...LENGTH_OPTIONS]}
                />

                <SettingChips
                  label="How much should Curi challenge you?"
                  hint="Whether lessons stay tidy or push on the messy parts."
                  value={prefs.rigor}
                  onChange={(v) =>
                    patchPrefs("rigor", v as ProfilePreferences["rigor"])
                  }
                  options={[...RIGOR_OPTIONS]}
                />

                <SettingChips
                  label="How should new terms be handled?"
                  hint="What happens when a lesson needs a word you might not know."
                  value={prefs.jargon}
                  onChange={(v) =>
                    patchPrefs("jargon", v as ProfilePreferences["jargon"])
                  }
                  options={[...JARGON_OPTIONS]}
                />
              </div>

              <div className="profile-section-footer">
                <p className="max-w-sm text-sm text-ink-muted">
                  Applies the moment you save it, to every course, current and
                  future.
                </p>
                <button
                  type="button"
                  onClick={resetLearningDefaults}
                  className="border-b border-border-strong pb-0.5 font-meta text-ui-3xs uppercase tracking-wider text-ink transition-opacity hover:opacity-70"
                >
                  Reset to defaults
                </button>
              </div>
            </section>

            <LearningProfilePreview profile={prefs} />
          </div>
        </div>
      )}

      {tab === "email" && (
        <section
          key="email"
          id="profile-panel-email"
          role="tabpanel"
          aria-labelledby="profile-tab-email"
          className="profile-panel profile-section"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="profile-section-title">Daily email</h2>
              <p className="profile-section-lede">
                A short curiosity peek — heading + snapshot that brings you back
                to the app.
              </p>
            </div>
            {prefsSaved && (
              <p className="profile-saved" aria-live="polite">
                Saved
              </p>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <SettingToggle
              label="Send daily email"
              hint="Arrives 7 AM local · heading + peek for each day's lessons."
              checked={prefs.emailEnabled}
              onChange={(v) => patchPrefs("emailEnabled", v)}
            />

            <div className="h-px bg-border" aria-hidden />

            <SettingToggle
              label="Weekly digest"
              hint="A summary of your week's learning, sent every Sunday."
              checked={prefs.emailWeeklyDigest}
              onChange={(v) => patchPrefs("emailWeeklyDigest", v)}
            />

            <div className="h-px bg-border" aria-hidden />

            <button
              type="button"
              onClick={() => void openEmailPreview()}
              className="inline-flex min-h-11 items-center text-sm text-ink underline decoration-border-strong underline-offset-4 hover:decoration-ink"
            >
              Preview today&apos;s email
            </button>

            <p className="text-xs leading-relaxed text-ink-muted">
              Daily emails send once per day at 7 AM in your timezone when you
              have lessons due — including weekends. Manage preferences or
              unsubscribe from any email footer. Weekly digest delivery is
              coming soon.
            </p>
          </div>
        </section>
      )}

      {tab === "plan" && (
        <section
          key="plan"
          id="profile-panel-plan"
          role="tabpanel"
          aria-labelledby="profile-tab-plan"
          className="profile-panel profile-section"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="profile-section-title">Your plan</h2>
              <p className="profile-section-lede">
                {isAcademy ? "Curi Academy · renews monthly" : "Free plan"}
              </p>
            </div>
            <span className="profile-plan-badge">
              {isAcademy ? "Academy" : "Free"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            {streak > 0 ? (
              <StreakLabel streak={streak} className="text-sm" />
            ) : (
              <span>Build your streak on Today</span>
            )}
            <span>
              <span className="font-medium text-ink">{activePaths}</span> active
              path{activePaths === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {(isAcademy ? PLAN_ACADEMY_ROWS : PLAN_FREE_ROWS).map((row) => {
              if (typeof row === "string") {
                return (
                  <li key={row} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-none bg-highlight-strong"
                      aria-hidden
                    >
                      <Check className="h-2.5 w-2.5 stroke-[2.5] text-ink/70" />
                    </span>
                    <span className="text-ink">{row}</span>
                  </li>
                );
              }
              return (
                <li
                  key={row.label}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-none ${
                      row.on ? "bg-highlight-strong" : "bg-paper-secondary"
                    }`}
                    aria-hidden
                  >
                    {row.on ? (
                      <Check className="h-2.5 w-2.5 stroke-[2.5] text-ink/70" />
                    ) : (
                      <Minus className="h-2.5 w-2.5 text-ink-muted/40" />
                    )}
                  </span>
                  <span className={row.on ? "text-ink" : "text-ink-muted"}>
                    {row.label}
                  </span>
                  {"note" in row && row.note && (
                    <span className="ml-auto font-meta text-ui-4xs uppercase tracking-wider text-ink-muted/60">
                      {row.note}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-border pt-5">
            {!isAcademy ? (
              <Button href="/upgrade" className="w-full sm:w-auto">
                Upgrade to Academy
              </Button>
            ) : (
              <Button
                variant="secondary"
                loading={portalLoading}
                onClick={() => void openPortal()}
                className="w-full sm:w-auto"
              >
                Billing &amp; invoices
              </Button>
            )}
            {portalMessage && (
              <p className="mt-2 text-sm text-ink-muted">{portalMessage}</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
