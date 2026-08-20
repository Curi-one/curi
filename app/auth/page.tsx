"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { postAuth } from "@/lib/api/client";

type Step = "email" | "code" | "name";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") ?? "/today";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (step === "email") {
        await postAuth({ email });
        setStep("code");
        return;
      }
      if (step === "code") {
        setStep("name");
        return;
      }
      const res = await postAuth({ email, code, name: name || undefined });
      if (res.session.kind === "member") {
        router.push(returnTo);
      }
    } catch {
      setError(
        step === "name"
          ? "Invalid code. Try 123456 in dev."
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <h1 className="font-display text-2xl text-ink">
        {step === "email" && "Save your progress"}
        {step === "code" && "Check your email"}
        {step === "name" && "What should we call you?"}
      </h1>
      <p className="mt-2 text-ink-muted">
        {step === "email" && "Enter your email — no password needed."}
        {step === "code" && `We sent a code to ${email}. Dev code: 123456`}
        {step === "name" && "Just a first name is fine."}
      </p>

      {step === "email" && (
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-8 w-full rounded-xl border border-border bg-paper-secondary px-4 py-4"
          placeholder="you@example.com"
        />
      )}
      {step === "code" && (
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-8 w-full rounded-xl border border-border bg-paper-secondary px-4 py-4 tracking-widest"
          placeholder="123456"
        />
      )}
      {step === "name" && (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-8 w-full rounded-xl border border-border bg-paper-secondary px-4 py-4"
          placeholder="Alex"
        />
      )}

      {error && <p className="mt-4 text-sm text-ink-muted">{error}</p>}

      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit()}
          className="btn-primary w-full disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-10">
      <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
