"use client";

import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { Wordmark } from "@/components/Wordmark";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { getMe, postAuth } from "@/lib/api/client";
import {
  clearAuthContext,
  loadAuthContext,
  saveAuthContext,
} from "@/lib/auth/context";
import { resolveAuthLanding, shouldCollectName } from "@/lib/auth/callback";
import {
  authEmailHeadline,
  authEmailKicker,
  authEmailSubcopy,
  resolveAuthIntent,
  sanitizeReturnTo,
} from "@/lib/auth/intent";
import { loadClarifySession } from "@/lib/clarify-store";
import { Button } from "@/components/Button";

type Step = "email" | "link" | "code" | "name";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const fromQuiz = params.get("from") === "quiz";
  const pendingTopic = loadClarifySession()?.topic;
  const storedCtx = loadAuthContext();

  const returnTo = sanitizeReturnTo(
    params.get("returnTo") ?? storedCtx?.returnTo,
  );
  const intent = useMemo(
    () =>
      resolveAuthIntent(params, {
        fromQuiz,
        hasPendingPath: !!pendingTopic,
      }),
    [params, fromQuiz, pendingTopic],
  );

  const showPendingBanner = (fromQuiz || intent === "save") && !!pendingTopic;

  const [step, setStep] = useState<Step>("email");
  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lessonBackHref =
    returnTo.startsWith("/courses/") || returnTo === "/today"
      ? returnTo
      : "/today";

  useEffect(() => {
    saveAuthContext({ returnTo, intent });
  }, [returnTo, intent]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const landing = resolveAuthLanding(params);

      if (landing.action === "consume-link") {
        window.location.replace(landing.callbackPath);
        return;
      }

      if (landing.action === "error") {
        if (!cancelled) {
          setError(landing.message);
          setBooting(false);
        }
        return;
      }

      try {
        const { session } = await getMe();

        if (session.kind === "member") {
          if (session.email) {
            setEmail(session.email);
          }
          if (!shouldCollectName(session)) {
            clearAuthContext();
            router.replace(
              landing.action === "named-step" ? landing.returnTo : returnTo,
            );
            return;
          }
          if (!cancelled) {
            setStep("name");
            setBooting(false);
          }
          return;
        }

        if (landing.action === "named-step") {
          if (!cancelled) {
            setError(
              "That sign-in link didn't work. Request a new link or enter a code from your email.",
            );
            setStep("link");
            setBooting(false);
          }
          return;
        }
      } catch {
        if (landing.action === "named-step" && !cancelled) {
          setError(
            "That sign-in link didn't work. Request a new link or enter a code from your email.",
          );
          setStep("link");
        }
      }

      if (!cancelled) {
        setBooting(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [params, returnTo, router]);

  async function sendLink() {
    setLoading(true);
    setError(null);
    try {
      const res = await postAuth({ email, returnTo });
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
        const res = await postAuth({ email, code, returnTo });
        if (
          "session" in res &&
          res.session?.kind === "member" &&
          !shouldCollectName(res.session)
        ) {
          clearAuthContext();
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
        returnTo,
      });
      if ("session" in res && res.session?.kind === "member") {
        clearAuthContext();
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

  if (booting) {
    return <LoadingState label="Checking session…" minHeight="min-h-[50vh]" />;
  }

  const kicker = authEmailKicker(intent, step);
  const headline = authEmailHeadline(intent, step);
  const subcopy = authEmailSubcopy(intent, step, email, emailSent);

  return (
    <div className="auth-shell animate-fade-in">
      <Wordmark />

      {showPendingBanner && (
        <div className="auth-pending">
          <p className="auth-pending-kicker">Pending path</p>
          <p className="auth-pending-copy">
            {pendingTopic
              ? `We'll attach “${pendingTopic}” to your account after you sign in.`
              : "Your first lesson will attach to your account after you sign in."}
          </p>
        </div>
      )}

      <div key={step} className="auth-panel">
        <p className="auth-kicker">
          <span className="auth-kicker-dot" aria-hidden />
          {kicker}
        </p>
        <h1 className="auth-title">{headline}</h1>
        <p className="auth-lede">{subcopy}</p>

        {step === "email" && (
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field auth-field"
            placeholder="you@example.com"
            autoComplete="email"
          />
        )}

        {step === "link" && (
          <div className="auth-waiting">
            <Mail className="auth-waiting-icon" aria-hidden />
            <p className="auth-waiting-title">Waiting for your tap</p>
            <p className="auth-waiting-copy">
              The link signs you in automatically. Return here if you use a code
              instead.
            </p>
          </div>
        )}

        {step === "code" && (
          <input
            autoFocus
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            className="input-field auth-field auth-code-input"
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
          />
        )}

        {step === "name" && (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field auth-field"
            placeholder="Alex"
            autoComplete="given-name"
          />
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <div className="auth-actions">
          {(step === "email" || step === "code" || step === "name") && (
            <Button
              disabled={
                loading ||
                (step === "email" && !email.trim()) ||
                (step === "code" && (code.length < 6 || code.length === 7)) ||
                (step === "name" && !name.trim())
              }
              onClick={() => void submit()}
              className="w-full"
            >
              {step === "name" ? "Finish" : "Continue"}
            </Button>
          )}

          {step === "link" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    setError(null);
                    setStep("code");
                  }}
                  className="min-h-[44px] flex-1 basis-[8.5rem]"
                >
                  Enter code
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  loading={loading}
                  onClick={() => void submit()}
                  className="min-h-[44px] flex-1 basis-[8.5rem]"
                >
                  Resend link
                </Button>
              </div>
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
            <Link href={lessonBackHref} className="link-subtle mt-4 block text-center">
              Back to lesson
            </Link>
          ) : (
            intent !== "save" &&
            step === "email" && (
              <p className="auth-alt-link">
                <span>
                  {intent === "signup"
                    ? "Already have an account?"
                    : "New here?"}{" "}
                </span>
                <Link
                  href={`/auth?intent=${intent === "signup" ? "signin" : "signup"}&returnTo=${encodeURIComponent(returnTo)}`}
                  className="link-subtle inline"
                >
                  {intent === "signup" ? "Sign in" : "Create an account"}
                </Link>
              </p>
            )
          )}
        </div>
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
