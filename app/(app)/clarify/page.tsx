"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClarifyStep } from "@/components/ClarifyStep";
import { DepthPicker } from "@/components/DepthPicker";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { Wordmark } from "@/components/Wordmark";
import type { DepthOption, DepthSlug } from "@/lib/api/schemas";
import { postClarify } from "@/lib/api/client";
import { DETAILS_MAX_CHARS } from "@/lib/clarify/details";
import {
  loadClarifySession,
  saveClarifySession,
  startClarifySession,
  type ClarifyAnswer,
} from "@/lib/clarify-store";
import { Button } from "@/components/Button";
import {
  canRestoreClarifySession,
  shouldFetchClarifyQuestions,
} from "@/lib/clarify/session";

function ClarifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const topicParam = params.get("topic") ?? "";
  const [questions, setQuestions] = useState<
    Awaited<ReturnType<typeof postClarify>>["questions"]
  >([]);
  const [answers, setAnswers] = useState<ClarifyAnswer[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [depth, setDepth] = useState<DepthSlug | undefined>();
  const [details, setDetails] = useState("");
  const [depthOptions, setDepthOptions] = useState<DepthOption[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = questions.length + 1;
  const onDepthStep = stepIndex >= questions.length;
  const currentStep = stepIndex + 1;

  const loadQuestions = useCallback(async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postClarify({ topic });
      setQuestions(res.questions);
      setDepthOptions(res.depthOptions);
      saveClarifySession({
        topic,
        questions: res.questions,
        answers: [],
        depthOptions: res.depthOptions,
      });
    } catch {
      setError("Could not load questions. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!topicParam) {
      router.replace("/");
      return;
    }

    const existing = loadClarifySession();

    if (canRestoreClarifySession(existing, topicParam)) {
      setQuestions(existing!.questions);
      setAnswers(existing!.answers);
      setDepth(existing!.depth);
      setDetails(existing!.details ?? "");
      setDepthOptions(existing!.depthOptions);
      setStepIndex(
        existing!.answers.length >= existing!.questions.length
          ? existing!.questions.length
          : existing!.answers.length,
      );
      setLoading(false);
      return;
    }

    if (shouldFetchClarifyQuestions(existing, topicParam)) {
      startClarifySession(topicParam);
      setQuestions([]);
      setAnswers([]);
      setStepIndex(0);
      setDepth(undefined);
      void loadQuestions(topicParam);
    }
  }, [topicParam, router, loadQuestions]);

  function persist(patch: {
    nextAnswers?: ClarifyAnswer[];
    nextDepth?: DepthSlug;
    nextDetails?: string;
    nextDepthOptions?: DepthOption[];
  }) {
    const session = loadClarifySession();
    if (!session) return;
    saveClarifySession({
      ...session,
      answers: patch.nextAnswers ?? session.answers,
      depth: patch.nextDepth ?? session.depth,
      details:
        patch.nextDetails !== undefined ? patch.nextDetails : session.details,
      depthOptions: patch.nextDepthOptions ?? session.depthOptions,
    });
  }

  function selectOption(answer: string) {
    const q = questions[stepIndex];
    const next = [
      ...answers.filter((a) => a.questionId !== q.id),
      { questionId: q.id, answer },
    ];
    setAnswers(next);
    persist({ nextAnswers: next });
    if (stepIndex + 1 < questions.length) {
      setStepIndex((i) => i + 1);
    } else {
      setStepIndex(questions.length);
    }
  }

  function selectDepth(d: DepthSlug) {
    setDepth(d);
    persist({ nextAnswers: answers, nextDepth: d, nextDetails: details });
    router.push("/generating");
  }

  function handleDetailsChange(value: string) {
    const next = value.slice(0, DETAILS_MAX_CHARS);
    setDetails(next);
    persist({ nextDetails: next });
  }

  function goBack() {
    if (stepIndex === 0) {
      router.push("/");
      return;
    }
    setStepIndex((i) => i - 1);
  }

  if (loading) {
    return <LoadingState label="Loading questions…" minHeight="min-h-[50vh]" />;
  }

  if (error) {
    return (
      <div>
        <p className="text-ink-muted">{error}</p>
        <Button onClick={() => void loadQuestions(topicParam)} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (onDepthStep) {
    return (
      <DepthPicker
        selected={depth}
        onSelect={selectDepth}
        step={currentStep}
        totalSteps={totalSteps}
        onBack={goBack}
        options={depthOptions}
        details={details}
        onDetailsChange={handleDetailsChange}
        detailsMax={DETAILS_MAX_CHARS}
      />
    );
  }

  const q = questions[stepIndex];
  const selected = answers.find((a) => a.questionId === q.id)?.answer;

  return (
    <ClarifyStep
      question={q}
      step={currentStep}
      totalSteps={totalSteps}
      selectedAnswer={selected}
      onSelect={selectOption}
      onBack={goBack}
      topic={topicParam || loadClarifySession()?.topic}
    />
  );
}

export default function ClarifyPage() {
  return (
    <PageShell withTabPad={false} className="pt-6">
      <Wordmark href="/" />
      <div className="mt-8">
        <Suspense fallback={<LoadingState minHeight="min-h-[50vh]" />}>
          <ClarifyContent />
        </Suspense>
      </div>
    </PageShell>
  );
}
