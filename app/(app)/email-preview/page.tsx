"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { getEmailPreview } from "@/lib/api/client";

export default function EmailPreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmailPreview()
      .then((res) => {
        setHtml(res.html);
        setSubject(res.subject);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell back={{ href: "/profile?tab=email", label: "Email settings" }}>
        <LoadingState label="Building preview…" />
      </PageShell>
    );
  }

  if (error || !html) {
    return (
      <PageShell back={{ href: "/profile?tab=email", label: "Email settings" }}>
        <p className="mt-6 text-ink-muted">
          {error ?? "Could not load email preview."}
        </p>
        <Link href="/profile?tab=email" className="btn-primary mt-4 inline-block">
          Back to settings
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell back={{ href: "/profile?tab=email", label: "Email settings" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-meta text-[11px] uppercase tracking-wider text-ink-muted">
            Inbox preview
          </p>
          <h1 className="mt-1 text-lg font-medium text-ink">{subject}</h1>
        </div>
      </div>
      <div className="overflow-hidden border border-border bg-[#F0F0F0]">
        <iframe
          title="Daily lesson email preview"
          srcDoc={html}
          className="min-h-[720px] w-full border-0 bg-[#F0F0F0]"
        />
      </div>
    </PageShell>
  );
}
