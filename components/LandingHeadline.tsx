"use client";

import { useEffect, useState } from "react";
import { FOUNDER_HEADLINE_SUBJECTS } from "@/lib/content/founder-catalogue";

export function LandingHeadline() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const subject = FOUNDER_HEADLINE_SUBJECTS[index] ?? "";
    const timeout = setTimeout(
      () => {
        if (!deleting && text.length < subject.length) {
          setText(subject.slice(0, text.length + 1));
        } else if (!deleting && text.length === subject.length) {
          setDeleting(true);
        } else if (deleting && text.length > 0) {
          setText(subject.slice(0, text.length - 1));
        } else {
          setDeleting(false);
          setIndex((i) => (i + 1) % FOUNDER_HEADLINE_SUBJECTS.length);
        }
      },
      deleting ? 35 : text.length === subject.length ? 1800 : 55,
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <h1
      className="mt-4 font-display text-[2.35rem] font-light leading-[1.12] tracking-tight text-ink sm:text-[2.75rem]"
      style={{ fontVariationSettings: "'SOFT' 70, 'WONK' 1" }}
    >
      Understand{" "}
      <span className="text-accent underline decoration-accent/40 underline-offset-4">
        {text}
        <span className="animate-pulse">|</span>
      </span>
    </h1>
  );
}
