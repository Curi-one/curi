import { describe, expect, it } from "vitest";
import {
  authEmailHeadline,
  resolveAuthIntent,
  sanitizeReturnTo,
} from "@/lib/auth/intent";

describe("resolveAuthIntent", () => {
  it("honours explicit intent query param", () => {
    expect(
      resolveAuthIntent(new URLSearchParams("intent=signin"), {
        fromQuiz: false,
        hasPendingPath: true,
      }),
    ).toBe("signin");
  });

  it("uses save for post-quiz guest auth", () => {
    expect(
      resolveAuthIntent(new URLSearchParams("from=quiz"), {
        fromQuiz: true,
        hasPendingPath: false,
      }),
    ).toBe("save");
  });

  it("defaults to signin for returning users without guest context", () => {
    expect(
      resolveAuthIntent(new URLSearchParams(), {
        fromQuiz: false,
        hasPendingPath: false,
      }),
    ).toBe("signin");
  });

  it("uses save when guest has pending path and no explicit intent", () => {
    expect(
      resolveAuthIntent(new URLSearchParams(), {
        fromQuiz: false,
        hasPendingPath: true,
      }),
    ).toBe("save");
  });

  it("uses signin after magic link even with stale pending path", () => {
    expect(
      resolveAuthIntent(new URLSearchParams("from=link"), {
        fromQuiz: false,
        hasPendingPath: true,
      }),
    ).toBe("signin");
  });
});

describe("authEmailHeadline", () => {
  it("shows Welcome back for signin", () => {
    expect(authEmailHeadline("signin", "email")).toBe("Welcome back");
  });

  it("shows Save your progress only for save intent", () => {
    expect(authEmailHeadline("save", "email")).toBe("Save your progress");
  });
});

describe("sanitizeReturnTo", () => {
  it("rejects open redirects", () => {
    expect(sanitizeReturnTo("//evil.com")).toBe("/today");
    expect(sanitizeReturnTo(null)).toBe("/today");
  });

  it("keeps safe internal paths", () => {
    expect(sanitizeReturnTo("/profile")).toBe("/profile");
  });
});
