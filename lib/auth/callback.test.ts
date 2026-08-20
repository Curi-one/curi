import { describe, expect, it, vi } from "vitest";
import {
  completeEmailLink,
  failureRedirectPath,
  postSignInRedirectPath,
  resolveAuthLanding,
  shouldCollectName,
  successRedirectPath,
} from "@/lib/auth/callback";

describe("resolveAuthLanding", () => {
  it("forwards PKCE code to the callback route instead of the login form", () => {
    const search = new URLSearchParams("code=pkce-code");
    expect(resolveAuthLanding(search)).toEqual({
      action: "consume-link",
      callbackPath: "/auth/callback?code=pkce-code",
    });
  });

  it("forwards token_hash magic links to the callback route", () => {
    const search = new URLSearchParams(
      "token_hash=abc&type=magiclink",
    );
    expect(resolveAuthLanding(search)).toEqual({
      action: "consume-link",
      callbackPath: "/auth/callback?token_hash=abc&type=magiclink",
    });
  });

  it("shows the name step after a successful link exchange", () => {
    expect(resolveAuthLanding(new URLSearchParams("from=link"))).toEqual({
      action: "named-step",
      returnTo: "/today",
    });
  });

  it("preserves returnTo after link exchange", () => {
    expect(
      resolveAuthLanding(
        new URLSearchParams("from=link&returnTo=%2Fprofile"),
      ),
    ).toEqual({
      action: "named-step",
      returnTo: "/profile",
    });
  });

  it("surfaces a link error instead of a blank login form", () => {
    const result = resolveAuthLanding(new URLSearchParams("error=link"));
    expect(result.action).toBe("error");
  });
});

describe("completeEmailLink", () => {
  it("exchanges a PKCE code for a session", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    await completeEmailLink(
      { code: "pkce-code" },
      { exchangeCodeForSession, verifyOtp: vi.fn() },
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
  });

  it("verifies token_hash links without needing the original browser cookies", async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ error: null });
    await completeEmailLink(
      { tokenHash: "hash", type: "email" },
      { exchangeCodeForSession: vi.fn(), verifyOtp },
    );
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash",
      type: "email",
    });
  });

  it("throws when the URL has neither code nor token_hash", async () => {
    await expect(
      completeEmailLink({}, { exchangeCodeForSession: vi.fn(), verifyOtp: vi.fn() }),
    ).rejects.toThrow(/missing/i);
  });
});

describe("redirect paths", () => {
  it("success path includes signin intent for name collection", () => {
    expect(successRedirectPath("/profile")).toContain("intent=signin");
    expect(successRedirectPath("/profile")).toContain("returnTo=%2Fprofile");
  });

  it("postSignIn sends returning users straight to destination", () => {
    expect(postSignInRedirectPath("/profile", false)).toBe("/profile");
  });

  it("failure path preserves returnTo", () => {
    expect(failureRedirectPath("/library")).toContain("returnTo=%2Flibrary");
  });
});

describe("shouldCollectName", () => {
  it("skips the name step when the member already has a name", () => {
    expect(shouldCollectName({ name: "Alex" })).toBe(false);
    expect(shouldCollectName({ name: undefined })).toBe(true);
  });
});
