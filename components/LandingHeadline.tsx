"use client";

import { useEffect, useState } from "react";
import { FOUNDER_HEADLINE_SUBJECTS } from "@/lib/content/founder-catalogue";

export function LandingHeadline() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const target = FOUNDER_HEADLINE_SUBJECTS[index] ?? "";
    if (phase === "typing") {
      if (text.length < target.length) {
        const id = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          58,
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("deleting"), 2400);
      return () => clearTimeout(id);
    }
    if (text.length > 0) {
      const id = setTimeout(() => setText((t) => t.slice(0, -1)), 32);
      return () => clearTimeout(id);
    }
    setIndex((i) => (i + 1) % FOUNDER_HEADLINE_SUBJECTS.length);
    setPhase("typing");
  }, [text, index, phase]);

  return (
    <h1
      className="font-display text-[2.1rem] font-normal tracking-[-0.025em] break-words text-ink sm:text-[3.2rem]"
      style={{
        lineHeight: 1.1,
        fontVariationSettings: "'SOFT' 70, 'WONK' 1",
      }}
    >
      Explore
      <br />
      <em className="italic">
        {text}
        <span
          className="ml-px inline-block w-[2px]"
          style={{
            height: "0.82em",
            background: "var(--color-text-primary)",
            opacity: cursorOn ? 1 : 0,
            transition: "opacity 80ms",
            verticalAlign: "middle",
          }}
          aria-hidden
        />
      </em>
    </h1>
  );
}
