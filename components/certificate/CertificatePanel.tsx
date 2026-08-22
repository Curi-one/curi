"use client";

import { useState } from "react";
import { TrackCertificate } from "@/components/certificate/TrackCertificate";
import { Button } from "@/components/Button";
import { certificateFilename } from "@/lib/certificates/format";
import {
  buildCertificateShareText,
  certificateLinkedInUrl,
  certificateTwitterUrl,
  copyCertificateShareText,
} from "@/lib/certificates/share";
import type { TrackCertificate as TrackCertificateData } from "@/lib/certificates/types";

type Props = {
  certificate: TrackCertificateData;
  courseId: string;
  animate?: boolean;
  compact?: boolean;
};

export function CertificatePanel({
  certificate,
  courseId,
  animate = false,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/certificate/image`, {
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = certificateFilename(certificate.topic);
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function shareLinkedIn() {
    await copyCertificateShareText(certificate);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    window.open(certificateLinkedInUrl(), "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={compact ? "space-y-4" : "space-y-5"}
      data-testid="certificate-panel"
    >
      {!compact && (
        <p className="text-center text-ui-sm leading-relaxed text-ink-muted">
          Your certificate is ready. Share the work — it reads well on LinkedIn.
        </p>
      )}

      <div className="track-cert-wrap">
        <TrackCertificate certificate={certificate} animate={animate} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={certificateTwitterUrl(certificate)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-none bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-small ease-out hover:bg-ink/85 sm:flex-[1_1_12rem]"
        >
          Share on X
        </a>
        <button
          type="button"
          onClick={() => void shareLinkedIn()}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-none border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors duration-small ease-out hover:border-ink hover:text-ink sm:flex-[1_1_12rem]"
        >
          Share on LinkedIn
        </button>
        <Button
          type="button"
          variant="secondary"
          loading={downloading}
          onClick={() => void handleDownload()}
          className="min-h-11 flex-1 sm:flex-[1_1_12rem]"
        >
          Download PNG
        </Button>
        <button
          type="button"
          onClick={() => {
            void copyCertificateShareText(certificate).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-none border border-border px-5 py-3 text-sm font-medium text-ink/80 transition-colors duration-small ease-out hover:border-ink hover:text-ink sm:flex-[1_1_12rem]"
        >
          {copied ? "Copied" : "Copy share text"}
        </button>
      </div>

      {!compact && (
        <p className="text-center font-meta text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {buildCertificateShareText(certificate).slice(0, 72)}…
        </p>
      )}
    </div>
  );
}
