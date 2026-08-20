import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  curiosityReasons,
  depthOptions,
  learningOutcomes,
  teachingStyles,
} from "@/data/onboarding-data";

function Page({ children, className = "", style }) {
  return (
    <section className={`curi-animate-in flex flex-1 flex-col ${className}`} style={style}>
      {children}
    </section>
  );
}

function levelDescription(option) {
  if (option === "Intro") return "Clean foundations, no assumed vocabulary.";
  if (option === "Standard") return "A quicker pace with richer context.";
  return "Less explanation, more interpretation.";
}

export function Onboarding({
  topic,
  aspect,
  setAspect,
  level,
  setLevel,
  suggestions,
  curiosityReason,
  setCuriosityReason,
  desiredOutcome,
  setDesiredOutcome,
  learningStyle,
  setLearningStyle,
  onGenerate,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const allFilled = Boolean(aspect);

  const steps = [
    {
      key: "why",
      eyebrow: "Your motivation",
      title: "Why are you exploring this?",
      hint: "Helps Curi decide which details to surface first.",
      value: curiosityReason,
      setValue: setCuriosityReason,
      options: curiosityReasons,
    },
    {
      key: "angle",
      eyebrow: "Your angle",
      title: "What angle should Curi take?",
      hint: "Shapes the lens every lesson is written through.",
      value: aspect,
      setValue: setAspect,
      options: suggestions,
    },
    {
      key: "style",
      eyebrow: "How you learn",
      title: "How do ideas click for you?",
      hint: "Affects how concepts are introduced and examples are chosen.",
      value: learningStyle,
      setValue: setLearningStyle,
      options: teachingStyles,
    },
    {
      key: "depth",
      eyebrow: "How deep",
      title: "How far do you want to go?",
      hint: "Pick the length that fits your schedule.",
      isDepth: true,
    },
  ];

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function goTo(i) {
    setAnimKey((k) => k + 1);
    setStepIndex(i);
  }

  function advance(overrideValue) {
    const value = overrideValue ?? step?.value;
    if (!value && !step?.isDepth) return;
    if (!isLastStep) goTo(stepIndex + 1);
  }

  function selectAndAdvance(setValue, value) {
    setValue(value);
    window.setTimeout(() => advance(value), 340);
  }

  return (
    <Page className="onboarding-page relative justify-center overflow-hidden py-10 lg:py-14">
      <div className="dot-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-transparent to-transparent" aria-hidden />

      <div className="mx-auto w-full max-w-lg px-1">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s.key}
                type="button"
                disabled={i >= stepIndex}
                onClick={() => i < stepIndex && goTo(i)}
                aria-label={`Step ${i + 1}: ${s.eyebrow}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-spring ${
                  i === stepIndex
                    ? "w-8 bg-foreground"
                    : i < stepIndex
                      ? "w-3 cursor-pointer bg-foreground/30 hover:bg-foreground/50"
                      : "w-3 cursor-default bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-label font-medium tabular-nums text-muted-foreground">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <p className="mb-2 text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          {topic}
        </p>

        <div key={`step-${animKey}`} className="onboarding-step-enter">
          <p className="mb-1 text-label font-semibold uppercase tracking-[0.2em] text-primary/70">
            {step.eyebrow}
          </p>
          <h2 className="mb-1.5 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.75rem]">
            {step.title}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{step.hint}</p>

          {step.isDepth ? (
            <div className="space-y-3">
              {depthOptions.map((option) => {
                const selected = level === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setLevel(option.name)}
                    className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 ease-out ${
                      selected
                        ? "border-foreground/25 bg-card shadow-md"
                        : "border-border/60 bg-card/50 hover:border-border hover:bg-card hover:shadow-sm"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{option.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    {selected && (
                      <p className="mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                        {levelDescription(option.name)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {step.options.map((option) => {
                const selected = step.value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAndAdvance(step.setValue, option)}
                    className={`relative rounded-2xl border p-4 text-left text-sm font-medium leading-snug transition-all duration-200 ease-out ${
                      selected
                        ? "scale-[1.01] border-foreground/25 bg-card text-foreground shadow-md"
                        : "border-border/60 bg-card/50 text-foreground/80 hover:border-border hover:bg-card hover:text-foreground hover:shadow-sm"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      </span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => goTo(stepIndex - 1)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
            {step.isDepth ? (
              <Button
                type="button"
                onClick={onGenerate}
                disabled={!allFilled}
                className="w-full gap-2 px-8 sm:w-auto sm:min-w-[260px]"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Build my path
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => advance()}
                disabled={!step.value}
                className="gap-1.5 px-6"
              >
                {stepIndex === steps.length - 2 ? "Almost there" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

export default Onboarding;
