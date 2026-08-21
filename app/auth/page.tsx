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

  const headline = authEmailHeadline(intent, step);
  const subcopy = authEmailSubcopy(intent, step, email, emailSent);

  return (
    <div className="flex min-h-[70vh] flex-col animate-fade-in">
      <Wordmark />
      {showPendingBanner && (
        <div className="mt-8 rounded-none border border-border bg-paper-secondary px-4 py-3">
          <p className="font-meta">Pending path</p>
          <p className="mt-1 text-sm text-ink">
            {pendingTopic
              ? `We'll attach “${pendingTopic}” to your account after you sign in.`
              : "Your first lesson will attach to your account after you sign in."}
          </p>
        </div>
      )}
      <h1
        className={`type-display text-display-xs sm:text-display-sm text-ink ${
          showPendingBanner ? "mt-8" : "mt-12"
        }`}
      >
        {headline}
      </h1>
      <p className="type-lede mt-4 max-w-md">{subcopy}</p>

      {step === "email" && (
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-8"
          placeholder="you@example.com"
          autoComplete="email"
        />
      )}

      {step === "link" && (
        <div className="mt-8 flex items-center gap-4 rounded-none border border-border bg-paper-secondary px-5 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-paper-secondary text-ink">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Waiting for your tap</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              The link signs you in automatically. Return here if you use a code
              instead.
            </p>
          </div>
        </div>
      )}

      {step === "code" && (
        <input
          autoFocus
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
          }
          className="input-field mt-8 tracking-ultra"
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
          className="input-field mt-8"
          placeholder="Alex"
          autoComplete="given-name"
        />
      )}

      {error && (
        <p
          className="mt-4 text-ui-xs leading-relaxed text-ink-faint"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-auto pt-8">
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
            <Button
              variant="secondary"
              loading={loading}
              onClick={() => void submit()}
              className="w-full"
            >
              Resend sign-in link
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setError(null);
                setStep("code");
              }}
              className="w-full justify-center"
            >
              Enter a code instead
            </Button>
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
          intent !== "save" &&
          step === "email" && (
            <p className="mt-4 text-center text-sm text-ink-muted">
              {intent === "signup" ? (
                <>
                  Already have an account?{""}
                  <Link
                    href={`/auth?intent=signin&returnTo=${encodeURIComponent(returnTo)}`}
                    className="link-subtle inline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{""}
                  <Link
                    href={`/auth?intent=signup&returnTo=${encodeURIComponent(returnTo)}`}
                    className="link-subtle inline"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          )
        )}

        {(intent === "signin" || intent === "signup") &&
          step !== "link" &&
          !fromQuiz && (
            <Link href="/" className="link-subtle mt-4 block text-center">
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
      <Suspense fallback={<LoadingState minHeight="min-h-[50vh]" />}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
