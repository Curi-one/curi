"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, postSignOut, type UserSession } from "@/lib/api/client";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getMe().then((m) => setSession(m.session));
  }, []);

  async function signOut() {
    await postSignOut();
    router.push("/");
  }

  if (!session || session.kind !== "member") {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-ink-muted">Not signed in.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <h1 className="font-display text-3xl text-ink">Profile</h1>
      <dl className="mt-8 space-y-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Name</dt>
          <dd className="mt-1 text-lg text-ink">{session.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Email</dt>
          <dd className="mt-1 text-lg text-ink">{session.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Plan</dt>
          <dd className="mt-1 flex items-center justify-between">
            <span className="text-lg capitalize text-ink">{session.plan}</span>
            {session.plan === "free" && (
              <button
                type="button"
                onClick={() => router.push("/upgrade")}
                className="text-sm text-accent underline"
              >
                Upgrade
              </button>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-8 text-sm text-ink-muted">Daily email — coming later</p>
      <button type="button" onClick={() => void signOut()} className="btn-secondary mt-10 w-full">
        Sign out
      </button>
    </main>
  );
}
