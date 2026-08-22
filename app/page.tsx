"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LandingDepthTeasers } from "@/components/LandingDepthTeasers";
import { LandingHeadline } from "@/components/LandingHeadline";
import { LandingTopicForm } from "@/components/LandingTopicForm";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/Button";
import { getMe } from "@/lib/api/client";

const AUTH_HOME = "/auth?intent=signin&returnTo=%2F";
const SIGNUP_HOME = "/auth?intent=signup&returnTo=%2F";

export default function LandingPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  useEffect(() => {
    void getMe()
      .then((res) => {
        if (res.session.kind === "member") {
          router.replace("/today");
        }
      })
      .catch(() => {
        // Stay on landing when session lookup fails.
      });
  }, [router]);

  function start(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) return;
    router.push(`/clarify?topic=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="app-shell flex flex-col pb-10 pt-6 animate-fade-in sm:pb-14 sm:pt-10">
      <header className="flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-2" aria-label="Account">
          <Button href={AUTH_HOME} variant="secondary" size="small">
            Sign in
          </Button>
          <Button href={SIGNUP_HOME} variant="primary" size="small">
            Sign up
          </Button>
        </nav>
      </header>

      <div className="mx-auto mt-10 w-full max-w-xl sm:mt-14">
        <p className="landing-kicker">
          <span className="landing-kicker-dot" aria-hidden />
          Personalized learning
        </p>

        <LandingHeadline />

        <p className="landing-lede">
          Any topic, one lesson a day. No account until after your first lesson.
        </p>

        <LandingTopicForm
          value={topic}
          onChange={setTopic}
          onSubmit={start}
          autoFocus
        />

        <LandingDepthTeasers />
      </div>
    </main>
  );
}
