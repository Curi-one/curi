"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getMe, postAuth } from "@/lib/api/client";
import { resolveAuthLanding, shouldCollectName } from "@/lib/auth/callback";

type Step = "email" | "code" | "name";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") ?? "/today";
  const intent = params.get("intent");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devHint, setDevHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const landing = resolveAuthLanding(params);
    if (landing.action === "consume-link") {
      window.location.replace(landing.callbackPath);
      return;
    }
    if (landing.action === "error") {
      setError(landing.message);
      return;
    }
    if (landing.action === "named-step") {
      void (async () => {
        try {
          const { session } = await getMe();
          if (session.kind !== "member") {
            setError(
              "That email link didn't sign you in. Enter the 6-digit code from the email instead.",
            );
            return;
          }
          if (session.email) {
            setEmail(session.email);
          }
          if (session.name) {
            router.replace(returnTo);
            return;
          }
          setStep("name");
        } catch {
          setError(
            "That email link didn't sign you in. Enter the 6-digit code from the email instead.",
          );
        }
      })();
    }
  }, [params, returnTo, router]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (step === "email") {
        const res = await postAuth({ email });
        if ("devHint" in res && typeof res.devHint === "string") {
          setDevHint(res.devHint);
        } else {
          setDevHint(null);
        }
        if ("notice" in res && typeof res.notice === "string") {
          setError(res.notice);
        }
        setStep("code");
        return;
      }
      if (step === "code") {
        const res = await postAuth({ email, code });
        if (
          "session" in res &&
          res.session?.kind === "member" &&
          !shouldCollectName(res.session)
        ) {
          router.push(returnTo);
          return;
        }
        setStep("name");
        return;
      }
      const res = await postAuth({
        email,
        ...(code ? { code } : {}),
        name: name || undefined,
      });
      if ("session" in res && res.session?.kind === "member") {
        router.push(returnTo);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message ||
          (step === "code" || step === "name"
            ? "Invalid code. Check your email and try again."
            : "Something went wrong."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <Wordmark />
      <h1
        className="mt-12 font-display text-[2rem] font-light leading-tight tracking-tight text-ink"
        style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
      >
        {step === "email" &&
          (intent === "signin"
            ? "Welcome back"
            : intent === "signup"
              ? "Create your account"
              : "Save your progress")}
        {step === "code" && "Check your email"}
        {step === "name" && "What should we call you?"}
      </h1>
      <p className="mt-3 text-[15px] font-light leading-relaxed text-ink-muted">
        {step === "email" &&
          (intent === "signin"
            ? "Enter your email. We'll send a code, no password."
            : "Enter your email. No password needed.")}
        {step === "code" &&
          (devHint
            ? `We sent a code to ${email}. Dev code: ${devHint}`
            : `Check your inbox for a 6-digit code sent to ${email}. You can also tap the link in the email.`)}
        {step === "name" && "Just a first name is fine."}
      </p>

      {step === "email" && (
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-8"
          placeholder="you@example.com"
        />
      )}
      {step === "code" && (
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-field mt-8 tracking-[0.35em]"
          placeholder="000000"
        />
      )}
      {step === "name" && (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field mt-8"
          placeholder="Alex"
        />
      )}

      {error && (
        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">{error}</p>
      )}

      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit()}
          className="btn-primary w-full disabled:opacity-40"
        >
          Continue
        </button>
        {(intent === "signin" || intent === "signup") && (
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-ink-muted hover:text-ink"
          >
            Back to start
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="app-shell py-8">
      <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
