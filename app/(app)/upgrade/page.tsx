"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { postCheckout } from "@/lib/api/client";
import { Button } from "@/components/Button";

const FEATURES = [
  {
    label: "Unlimited active learning paths",
    sub: "Free plan caps at 2 — follow more curiosities in parallel",
  },
  {
    label: "Full lesson archive",
    sub: "Return to any completed lesson from any path, any time",
  },
  {
    label: "Full learning analytics",
    sub: "Progress, streak history, and completion across all paths",
  },
  {
    label: "Email preferences",
    sub: "Coming later — control timing and frequency when digests ship",
  },
] as const;

const NOT_CONFIGURED =
  "Billing is not configured on this environment yet.";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await postCheckout();
      if (res.url) {
        router.push(res.url);
        return;
      }
      if (res.code === "not_configured") {
        setMessage(NOT_CONFIGURED);
      } else {
        setMessage(res.message ?? "Checkout could not be started.");
      }
    } catch {
      setMessage(NOT_CONFIGURED);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      back={{ href: "/profile", label: "Profile" }}
      withTabPad={false}
      className="pt-4"
    >
      <p className="font-meta">Curi Academy</p>

      <h1 className="mt-5 font-display display-section text-display-xs leading-tight tracking-tighter text-ink sm:text-display-md">
        Unlimited curiosity. Every path open.
      </h1>
      <p className="mt-4 text-ui-md font-light leading-relaxed text-ink-muted">
        Follow multiple curiosities in parallel. One lesson per path, every day
        — with your full history always accessible.
      </p>

      <div className="mt-10 border-y border-border py-8">
        <div className="flex items-baseline gap-3">
          <span className="font-display display-hero text-display-md leading-none tracking-tighter text-ink sm:text-display-xl">
            $2.50
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium text-ink/70">/ week</span>
            <span className="text-sm text-ink-muted">
              billed as $10 / month
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" aria-hidden />
          <span className="shrink-0 font-meta">Less than a cup of coffee</span>
          <div className="h-px flex-1 bg-border" aria-hidden />
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {FEATURES.map(({ label, sub }) => (
          <li key={label} className="flex items-start gap-3.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-ink/10">
              <Check
                className="h-2.5 w-2.5 text-ink/70"
                strokeWidth={2.5}
                aria-hidden
              />
            </span>
            <span>
              <span className="text-sm font-medium leading-snug text-ink">
                {label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                {sub}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {message && <p className="mt-4 text-sm text-ink-muted">{message}</p>}

      <Button
        loading={loading}
        onClick={() => void checkout()}
        className="mt-10 w-full"
      >
        Start Academy — $2.50 a week
      </Button>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Cancel anytime · No lock-in · Your progress stays
      </p>
      <Button href="/today" variant="secondary" className="mt-4 w-full">
        Back to Today
      </Button>
    </PageShell>
  );
}
