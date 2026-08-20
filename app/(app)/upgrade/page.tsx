"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { postCheckout } from "@/lib/api/client";

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

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    try {
      const res = await postCheckout();
      setMessage(res.message ?? null);
      if (res.url) router.push(res.url);
    } catch {
      setMessage("Checkout unavailable until Stripe is wired.");
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

      <h1
        className="mt-5 font-display text-[2.1rem] font-light leading-[1.08] tracking-[-0.04em] text-ink sm:text-5xl"
        style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
      >
        Unlimited curiosity. Every path open.
      </h1>
      <p className="mt-4 text-[15px] font-light leading-relaxed text-ink-muted">
        Follow multiple curiosities in parallel. One lesson per path, every day
        — with your full history always accessible.
      </p>

      <div className="mt-10 border-y border-border py-8">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display text-[3.5rem] leading-[0.9] tracking-[-0.05em] text-ink sm:text-[5.5rem]"
            style={{ fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}
          >
            $2.50
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium text-ink/70">/ week</span>
            <span className="text-sm text-ink-muted">billed as $10 / month</span>
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

      <button
        type="button"
        disabled={loading}
        onClick={() => void checkout()}
        className="btn-primary mt-10 w-full disabled:opacity-40"
      >
        {loading ? "Starting checkout…" : "Start Academy — $2.50 a week"}
      </button>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Cancel anytime · No lock-in · Your progress stays
      </p>
      <Link href="/today" className="btn-secondary mt-4 block w-full text-center">
        Back to Today
      </Link>
    </PageShell>
  );
}
