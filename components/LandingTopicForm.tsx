"use client";

import { FormEvent, useRef } from "react";
import { ArrowUp } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  inputId?: string;
  submitLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

/** Landing topic field — shared by home and /new (curi-v3 reference). */
export function LandingTopicForm({
  value,
  onChange,
  onSubmit,
  placeholder = "What are you curious to learn...",
  inputId = "landing-topic",
  submitLabel = "Start exploring",
  disabled = false,
  autoFocus = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="landing-topic-wrap cursor-text"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="landing-topic-input focus-visible:ring-0"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label={placeholder}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="landing-topic-submit focus-ring"
          aria-label={submitLabel}
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
