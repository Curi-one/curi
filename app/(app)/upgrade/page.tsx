"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postCheckout } from "@/lib/api/client";

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
      setMessage("Checkout unavailable in mock mode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-24">
      <h1 className="font-display text-3xl text-ink">Academy</h1>
      <p className="mt-4 text-ink-muted">
        Same lesson quality. More active paths — $10/month when billing ships.
      </p>
      <ul className="mt-8 space-y-2 text-ink/90">
        <li>Unlimited active paths</li>
        <li>Same daily lesson experience</li>
        <li>No ads, no upsells on lesson body</li>
      </ul>
      {message && <p className="mt-4 text-sm text-ink-muted">{message}</p>}
      <div className="mt-10">
        <button
          type="button"
          disabled={loading}
          onClick={() => void checkout()}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? "Starting checkout…" : "Subscribe — $10/mo"}
        </button>
      </div>
    </main>
  );
}
