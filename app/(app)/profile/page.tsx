"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import {
  getLibrary,
  getMe,
  getProgress,
  patchMe,
  postBillingPortal,
  postSignOut,
  type ProgressResponse,
  type UserSession,
} from "@/lib/api/client";

type Theme = "system" | "light" | "dark";
type ProfileTab = "account" | "learning" | "email" | "plan";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("curi-theme", theme);
}

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
 * Learning + Email are “coming later” per FLOWS F7; Account + Plan are live.
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
  const [theme, setTheme] = useState<Theme>("system");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("curi-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  useEffect(() => {
    Promise.all([getMe(), getProgress(), getLibrary()])
      .then(([m, p, lib]) => {
        setSession(m.session);
        if (m.session.name) setName(m.session.name);
        setProgress(p);
        setActivePaths(lib.exploring.length);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

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

  function onThemeChange(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  if (loading) {
    return (
      <PageShell back={{ href: "/today", label: "Today" }} withTabPad={false}>
        <p className="mt-6 text-ink-muted">Loading…</p>
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
        <Link
          href="/auth?intent=signin&returnTo=%2Fprofile"
          className="btn-primary mt-6 inline-block"
        >
          Sign in
        </Link>
      </PageShell>
    );
  }

  const isAcademy = session.plan === "academy";
  const displayName = name.trim() || session.name || "Learner";
  const initial = displayName.slice(0, 1).toUpperCase();
  const streak = progress?.streak ?? 0;

  return (
    <main className="app-shell pb-24 pt-4">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          href="/today"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← Today
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="btn-secondary h-9 px-3 text-sm"
        >
          Sign out
        </button>
      </div>

      <header className="mb-7 flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-paper-secondary text-base font-medium text-ink"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-medium leading-none tracking-tight text-ink">
            {displayName}
          </p>
          <p className="mt-1.5 truncate text-sm text-ink-muted">
            {session.email ?? "—"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-1 rounded-full border border-border p-1">
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
            onClick={() => setTab(id)}
            className={`rounded-full px-1 py-2 text-center text-xs transition-colors sm:text-sm ${
              tab === id
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div className="mt-5 space-y-4">
          <section className="surface-card p-4">
            <h2 className="text-base font-medium text-ink">Account</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Name and email used across Curi.
            </p>
            <label className="mt-4 block">
              <span className="type-kicker">Name</span>
              <div className="mt-2 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field flex-1"
                  autoComplete="name"
                />
                <button
                  type="button"
                  disabled={saving || !name.trim()}
                  onClick={() => void saveName()}
                  className="btn-secondary shrink-0 px-4 disabled:opacity-40"
                >
                  {saving ? "…" : "Save"}
                </button>
              </div>
            </label>
            {saveMessage && (
              <p className="mt-2 text-sm text-ink-muted">{saveMessage}</p>
            )}
            <div className="mt-4">
              <p className="type-kicker">Email</p>
              <p className="mt-1 text-lg text-ink">{session.email ?? "—"}</p>
            </div>
          </section>

          <section className="surface-card p-4">
            <h2 className="text-base font-medium text-ink">Appearance</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Display preference for this device.
            </p>
            <p className="type-kicker mt-4">Theme</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["system", "light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onThemeChange(t)}
                  className={`rounded-full px-4 py-2 text-sm capitalize ${
                    theme === t
                      ? "bg-ink text-paper"
                      : "border border-border text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "learning" && (
        <section className="surface-card mt-5 p-4">
          <h2 className="text-base font-medium text-ink">How you explore</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Learning preferences that shape examples and depth — coming later.
            For now, depth is chosen when you start a path, and lesson feel tunes
            the next lesson.
          </p>
        </section>
      )}

      {tab === "email" && (
        <section className="surface-card mt-5 p-4">
          <h2 className="text-base font-medium text-ink">Daily email</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            One digest covering your active paths — coming later.
          </p>
        </section>
      )}

      {tab === "plan" && (
        <section className="surface-card mt-5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-ink">Your plan</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {isAcademy ? "Curi Academy · renews monthly" : "Free plan"}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-ink">
              {isAcademy ? "Academy" : "Free"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <span>
              <span className="font-medium text-ink">{streak}</span> day streak
            </span>
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
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink/10 text-[10px]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="text-ink">{row}</span>
                  </li>
                );
              }
              return (
                <li key={row.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      row.on ? "bg-ink/10" : "bg-paper-secondary"
                    }`}
                    aria-hidden
                  >
                    {row.on ? "✓" : "–"}
                  </span>
                  <span className={row.on ? "text-ink" : "text-ink-muted"}>
                    {row.label}
                  </span>
                  {"note" in row && row.note && (
                    <span className="ml-auto font-meta text-[10px] uppercase tracking-wider text-ink-muted/60">
                      {row.note}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-border pt-5">
            {!isAcademy ? (
              <Link href="/upgrade" className="btn-primary inline-flex w-full justify-center sm:w-auto">
                Upgrade to Academy
              </Link>
            ) : (
              <button
                type="button"
                disabled={portalLoading}
                onClick={() => void openPortal()}
                className="btn-secondary w-full disabled:opacity-40 sm:w-auto"
              >
                {portalLoading ? "Opening…" : "Billing & invoices"}
              </button>
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
