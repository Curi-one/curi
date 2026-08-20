"use client";

import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { Wordmark } from "@/components/Wordmark";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getMe, postAuth } from "@/lib/api/client";
import { resolveAuthLanding, shouldCollectName } from "@/lib/auth/callback";
import { loadClarifySession } from "@/lib/clarify-store";

type Step = "email" | "code" | "name";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") ?? "/today";
  const intent = params.get("intent");
  const fromQuiz = params.get("from") === "quiz";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devHint, setDevHint] = useState<string | null>(null);
  const [stagingHint, setStagingHint] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pendingTopic = loadClarifySession()?.topic;

  const lessonBackHref =
    returnTo.startsWith("/courses/") || returnTo === "/today"
      ? returnTo
      : "/today";

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
        if ("stagingOtpHint" in res && typeof res.stagingOtpHint === "string") {
          setStagingHint(res.stagingOtpHint);
        } else {
          setStagingHint(null);
        }
        if ("notice" in res && typeof res.notice === "string") {
          setError(res.notice);
        }
        setEmailSent("emailSent" in res ? res.emailSent !== false : true);
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
    <div className="flex min-h-[70vh] flex-col animate-fade-in">
      <Wordmark />
      {(fromQuiz || pendingTopic) && (
        <div className="mt-8 rounded-xl border border-border bg-paper-secondary px-4 py-3">
          <p className="font-meta">Pending path</p>
          <p className="mt-1 text-sm text-ink">
            {pendingTopic
              ? `We'll attach “${pendingTopic}” to your account after you sign in.`
              : "Your first lesson will attach to your account after you sign in."}
          </p>
        </div>
      )}
      <h1
        className={`font-display text-[2rem] font-light leading-tight tracking-tight text-ink ${
          fromQuiz || pendingTopic ? "mt-8" : "mt-12"
        }`}
        style={{ fontVariationSettings: "'SOFT' 60, 'WONK' 1" }}
      >
        {step === "email" &&
          (intent === "signin"
            ? "Welcome back"
            : intent === "signup"
              ? "Create your account"
              : "Save your progress")}
        {step === "code" && (emailSent ? "Check your email" : "No new email sent")}
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
            : stagingHint
              ? `Enter the staging code ${stagingHint}, or check your inbox for ${email}.`
              : emailSent
                ? `Check your inbox for a 6-digit code sent to ${email}. You can also tap the link in the email.`
                : `Nothing new was sent to ${email}. If you already have a code from an earlier try, enter it below. Otherwise wait about an hour (Supabase free mailer limit) or use the staging code if shown.`)}
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
        {fromQuiz ? (
          <Link
            href={lessonBackHref}
            className="mt-4 block text-center text-sm text-ink-muted hover:text-ink"
          >
            Back to lesson
          </Link>
        ) : (
          (intent === "signin" || intent === "signup") && (
            <Link
              href="/"
              className="mt-4 block text-center text-sm text-ink-muted hover:text-ink"
            >
              Back to start
            </Link>
          )
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="app-shell py-8">
      <Suspense fallback={<LoadingState minHeight="min-h-[50vh]" />}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
