"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { postCheckout } from "@/lib/api/client";

const FEATURES = [
  { label: "Active paths", free: "2", academy: "Unlimited" },
  { label: "Daily lessons", free: "✓", academy: "✓" },
  { label: "Lesson feel tuning", free: "✓", academy: "✓" },
  { label: "Shelve & restore", free: "Shelve only", academy: "Full" },
];

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    try {
      const res = await postCheckout();
      setMessage(res.message);
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
      title="Academy"
      kicker="Upgrade"
      withTabPad={false}
      className="pt-4"
    >
      <p className="mt-4 text-[15px] font-light leading-relaxed text-ink-muted">
        Same calm daily lessons. More room for parallel paths — $10/month when
        billing ships.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-paper-secondary">
              <th className="px-4 py-3 text-left font-normal text-ink-muted" />
              <th className="px-4 py-3 text-left font-meta normal-case">Free</th>
              <th className="px-4 py-3 text-left font-meta normal-case text-accent">
                Academy
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{row.label}</td>
                <td className="px-4 py-3 text-ink-muted">{row.free}</td>
                <td className="px-4 py-3 text-ink">{row.academy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <p className="mt-4 text-sm text-ink-muted">{message}</p>}
      <div className="mt-10 space-y-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void checkout()}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? "Starting checkout…" : "Subscribe — $10/mo"}
        </button>
        <Link href="/today" className="btn-secondary block w-full text-center">
          Back to Today
        </Link>
      </div>
    </PageShell>
  );
}
