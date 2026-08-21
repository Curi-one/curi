import { describe, expect, it } from "vitest";
import {
  canRestoreClarifySession,
  shouldFetchClarifyQuestions,
} from "@/lib/clarify/session";
import type { ClarifySession } from "@/lib/clarify-store";

const SOC2_SESSION: ClarifySession = {
  topic: "SOC2 compliance",
  questions: [
    {
      id: "focus",
      prompt: "Which SOC2 framework area matters most?",
      options: ["Security", "Availability"],
    },
  ],
  answers: [{ questionId: "focus", answer: "Security" }],
};

describe("clarify session topic matching", () => {
  it("restores when URL topic matches stored session", () => {
    expect(canRestoreClarifySession(SOC2_SESSION, "SOC2 compliance")).toBe(
      true,
    );
    expect(
      shouldFetchClarifyQuestions(SOC2_SESSION, "SOC2 compliance"),
    ).toBe(false);
  });

  it("refetches when user changes topic mid-clarify", () => {
    expect(canRestoreClarifySession(SOC2_SESSION, "cryptography")).toBe(false);
    expect(shouldFetchClarifyQuestions(SOC2_SESSION, "cryptography")).toBe(
      true,
    );
  });

  it("fetches when there are no stored questions yet", () => {
    expect(
      shouldFetchClarifyQuestions(
        { topic: "cryptography", questions: [], answers: [] },
        "cryptography",
      ),
    ).toBe(true);
  });

  it("matches topics case-insensitively", () => {
    expect(canRestoreClarifySession(SOC2_SESSION, "soc2 compliance")).toBe(
      true,
    );
  });
});
