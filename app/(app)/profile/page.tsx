"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { getMe, postSignOut, type UserSession } from "@/lib/api/client";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((m) => setSession(m.session))
      .finally(() => setLoading(false));
  }, []);

  async function signOut() {
    await postSignOut();
    router.push("/");
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

  return (
    <PageShell back={{ href: "/today", label: "Today" }} title="Profile" withTabPad={false}>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="type-kicker">Name</dt>
          <dd className="mt-1 text-lg text-ink">{session.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="type-kicker">Email</dt>
          <dd className="mt-1 text-lg text-ink">{session.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="type-kicker">Plan</dt>
          <dd className="mt-1 flex items-center justify-between">
            <span className="text-lg capitalize text-ink">{session.plan}</span>
            {session.plan === "free" && (
              <Link href="/upgrade" className="text-sm text-accent underline">
                Upgrade
              </Link>
            )}
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
