"use client";

import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { Wordmark } from "@/components/Wordmark";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { getMe, postAuth } from "@/lib/api/client";
import { resolveAuthLanding, shouldCollectName } from "@/lib/auth/callback";
import { loadClarifySession } from "@/lib/clarify-store";

type Step = "email" | "link" | "code" | "name";

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
              "That sign-in link didn't work. Request a new link or enter a code from your email.",
            );
            setStep("link");
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
            "That sign-in link didn't work. Request a new link or enter a code from your email.",
          );
          setStep("link");
        }
      })();
    }
  }, [params, returnTo, router]);

  async function sendLink() {
    setLoading(true);
    setError(null);
    try {
      const res = await postAuth({ email });
      if ("notice" in res && typeof res.notice === "string") {
        setError(res.notice);
      }
      setEmailSent("emailSent" in res ? res.emailSent !== false : true);
      setStep("link");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (step === "email") {
        await sendLink();
        return;
      }
      if (step === "link") {
        await sendLink();
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
        className={`type-display text-[2rem] sm:text-[2.25rem] text-ink ${
          fromQuiz || pendingTopic ? "mt-8" : "mt-12"
        }`}
      >
        {step === "email" &&
          (intent === "signin"
            ? "Welcome back"
            : intent === "signup"
              ? "Create your account"
              : "Save your progress")}
        {step === "link" && (emailSent ? "Check your email" : "No new email sent")}
        {step === "code" && "Enter your code"}
        {step === "name" && "What should we call you?"}
      </h1>
      <p className="type-lede mt-4 max-w-md">
        {step === "email" &&
          (intent === "signin"
            ? "Enter your email. We'll send a sign-in link, no password."
            : "Enter your email. No password needed.")}
        {step === "link" &&
          (emailSent
            ? `Open the sign-in link we sent to ${email}. It works on this device.`
            : `Nothing new was sent to ${email}. Use a link from an earlier email, or wait about an hour and try again.`)}
        {step === "code" &&
          `If your email includes a 6-digit code, enter it below for ${email}.`}
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

      {step === "link" && (
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-paper-secondary px-5 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Waiting for your tap</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              The link signs you in automatically. You can close this tab after
              you open it.
            </p>
          </div>
        </div>
      )}

      {step === "code" && (
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-field mt-8 tracking-[0.35em]"
          placeholder="000000"
          inputMode="numeric"
          autoComplete="one-time-code"
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
        {(step === "email" || step === "code" || step === "name") && (
          <button
            type="button"
            disabled={loading || (step === "email" && !email.trim())}
            onClick={() => void submit()}
            className="btn-primary w-full disabled:opacity-40"
          >
            Continue
          </button>
        )}

        {step === "link" && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void submit()}
              className="btn-secondary w-full disabled:opacity-40"
            >
              {loading ? "Sending…" : "Resend sign-in link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("code");
              }}
              className="btn-ghost w-full justify-center text-sm"
            >
              Enter a code instead
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("email");
              }}
              className="link-subtle mx-auto block"
            >
              Use a different email
            </button>
          </div>
        )}

        {step === "code" && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep("link");
            }}
            className="link-subtle mt-4 block w-full text-center"
          >
            Back to email link
          </button>
        )}

        {fromQuiz ? (
          <Link
            href={lessonBackHref}
            className="link-subtle mt-4 block text-center"
          >
            Back to lesson
          </Link>
        ) : (
          (intent === "signin" || intent === "signup") &&
          step !== "link" && (
            <Link href="/" className="link-subtle mt-4 block text-center">
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
