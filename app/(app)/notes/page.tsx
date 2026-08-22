"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import { NotesView } from "@/components/notes/NotesView";
import { PageShell } from "@/components/PageShell";
import { getMe, getNotes } from "@/lib/api/client";
import type { NotesResponse } from "@/lib/notes/types";
import { memberSignInPath } from "@/lib/auth/member-gate";

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoReview = searchParams.get("review") === "1";
  const [data, setData] = useState<NotesResponse | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const res = await getNotes();
    setData(res);
    return res;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (me.session.kind !== "member") {
          router.replace(memberSignInPath("/notes"));
          return;
        }
        const notes = await load();
        if (cancelled) return;
        setData(notes);
        setReady(true);
      } catch {
        if (cancelled) return;
        router.replace(memberSignInPath("/notes"));
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, load]);

  if (!ready || !data) {
    return <LoadingState label="Loading notes" />;
  }

  return (
    <NotesView
      initial={data}
      autoReview={autoReview}
      onRefresh={load}
    />
  );
}

export default function NotesPage() {
  return (
    <PageShell withTabPad={false} className="pt-4">
      <Suspense fallback={<LoadingState label="Loading notes" />}>
        <NotesContent />
      </Suspense>
    </PageShell>
  );
}
