"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { getMe, patchMe, postSignOut, type UserSession } from "@/lib/api/client";

type Theme = "system" | "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("curi-theme", theme);
}

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("curi-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  useEffect(() => {
    getMe()
      .then((m) => {
        setSession(m.session);
        if (m.session.name) setName(m.session.name);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await patchMe({ name: name.trim() });
      setSession(res.session);
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
      <PageShell back={{ href: "/today", label: "Today" }} title="Profile" withTabPad={false}>
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

  return (
    <PageShell back={{ href: "/today", label: "Today" }} title="Profile" withTabPad={false} className="pt-4">
      <section className="mt-6 surface-card p-4">
        <p className="font-meta">Plan</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg text-ink">
            {isAcademy ? "Academy" : "Free"}
          </span>
          {!isAcademy && (
            <Link href="/upgrade" className="text-sm text-accent underline">
              Upgrade
            </Link>
          )}
        </div>
      </section>

      <dl className="mt-8 space-y-6">
        <div>
          <dt className="type-kicker">Name</dt>
          <dd className="mt-2 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field flex-1"
            />
            <button
              type="button"
              disabled={saving || !name.trim()}
              onClick={() => void saveName()}
              className="btn-secondary shrink-0 px-4"
            >
              Save
            </button>
          </dd>
        </div>
        <div>
          <dt className="type-kicker">Email</dt>
          <dd className="mt-1 text-lg text-ink">{session.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="type-kicker">Theme</dt>
          <dd className="mt-2 flex gap-2">
            {(["system", "light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onThemeChange(t)}
                className={`rounded-full px-4 py-2 text-sm capitalize ${
                  theme === t ? "bg-ink text-paper" : "border border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </dd>
        </div>
      </dl>
      <p className="mt-8 text-sm text-ink-muted">Daily email — coming later</p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="btn-secondary mt-10 w-full"
      >
        Sign out
      </button>
    </PageShell>
  );
}
