import { describe, expect, it } from "vitest";
import {
  authEmailHeadline,
  authEmailKicker,
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

describe("authEmailKicker", () => {
  it("maps steps and intents to mono kickers", () => {
    expect(authEmailKicker("signin", "email")).toBe("Sign in");
    expect(authEmailKicker("signup", "email")).toBe("Create account");
    expect(authEmailKicker("save", "email")).toBe("Save progress");
    expect(authEmailKicker("signin", "link")).toBe("Check email");
    expect(authEmailKicker("signin", "code")).toBe("Enter code");
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

describe("sanitizeReturnTo hardening", () => {
  it("keeps a same-origin path with its query", () => {
    expect(sanitizeReturnTo("/library?tab=shelved")).toBe(
      "/library?tab=shelved",
    );
  });

  const REJECTED: (string | null | undefined)[] = [
    "//evil.example", // protocol-relative
    "/\\evil.example", // backslash protocol-relative
    "https://evil.example",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ];

  it.each(REJECTED)("rejects %s", (input) => {
    expect(sanitizeReturnTo(input)).toBe("/today");
  });

  it("rejects control characters that could split a header", () => {
    expect(sanitizeReturnTo("/today\r\nSet-Cookie: a=b")).toBe("/today");
  });
});
