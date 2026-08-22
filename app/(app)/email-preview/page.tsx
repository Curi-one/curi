"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { LoadingState } from "@/components/LoadingState";
import { getEmailPreview } from "@/lib/api/client";
import { Button } from "@/components/Button";

const EMAIL_FORMAT_LABELS: Record<string, string> = {
  Full: "Full lesson",
  Summary: "Summary",
  Headlines: "Headlines",
};

function formatLabel(emailFormat: string | null): string {
  if (!emailFormat) return "";
  return EMAIL_FORMAT_LABELS[emailFormat] ?? emailFormat;
}

export default function EmailPreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [emailFormat, setEmailFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmailPreview()
      .then((res) => {
        setHtml(res.html);
        setSubject(res.subject);
        setEmailFormat(res.emailFormat ?? null);
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
        <Button href="/profile?tab=email" className="mt-4">
          Back to settings
        </Button>
      </PageShell>
    );
  }

  const formatDisplay = formatLabel(emailFormat);

  return (
    <PageShell back={{ href: "/profile?tab=email", label: "Email settings" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
            Inbox preview
          </p>
          {formatDisplay ? (
            <p className="mt-1 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
              Format · {formatDisplay}
            </p>
          ) : null}
          <h1 className="mt-1 text-lg font-medium text-ink">{subject}</h1>
        </div>
      </div>
      <div className="overflow-hidden border border-border bg-paper-tertiary">
        <iframe
          title="Daily lesson email preview"
          srcDoc={html}
          className="min-h-[720px] w-full border-0 bg-paper-tertiary"
        />
      </div>
    </PageShell>
  );
}
