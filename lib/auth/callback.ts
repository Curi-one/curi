import type { EmailOtpType } from "@supabase/supabase-js";
import { sanitizeReturnTo } from "@/lib/auth/intent";

const LINK_ERROR_MESSAGE =
  "That sign-in link didn't work. Request a new link or enter a code from your email.";

export type AuthLanding =
  | { action: "consume-link"; callbackPath: string }
  | { action: "named-step"; returnTo: string }
  | { action: "error"; message: string }
  | { action: "form" };

export type EmailLinkParams = {
  code?: string | null;
  tokenHash?: string | null;
  type?: string | null;
};

export type EmailLinkAuth = {
  exchangeCodeForSession: (
    code: string,
  ) => Promise<{ error: { message: string } | null }>;
  verifyOtp: (params: {
    token_hash: string;
    type: EmailOtpType;
  }) => Promise<{ error: { message: string } | null }>;
};

export function resolveAuthLanding(search: URLSearchParams): AuthLanding {
  const code = search.get("code");
  const tokenHash = search.get("token_hash");
  const type = search.get("type");

  if (code || tokenHash) {
    const qs = new URLSearchParams();
    if (code) qs.set("code", code);
    if (tokenHash) qs.set("token_hash", tokenHash);
    if (type) qs.set("type", type);
    const next = search.get("next");
    if (next) qs.set("next", next);
    return { action: "consume-link", callbackPath: `/auth/callback?${qs}` };
  }

  if (search.get("error") === "link" || search.get("error_description")) {
    return { action: "error", message: LINK_ERROR_MESSAGE };
  }

  if (search.get("from") === "link") {
    return {
      action: "named-step",
      returnTo: sanitizeReturnTo(search.get("returnTo")),
    };
  }

  return { action: "form" };
}

export function successRedirectPath(returnTo?: string): string {
  const params = new URLSearchParams({ from: "link", intent: "signin" });
  const safe = sanitizeReturnTo(returnTo);
  if (safe !== "/today") {
    params.set("returnTo", safe);
  }
  return `/auth?${params}`;
}

export function postSignInRedirectPath(
  returnTo?: string,
  needsName?: boolean,
): string {
  if (needsName) {
    return successRedirectPath(returnTo);
  }
  return sanitizeReturnTo(returnTo);
}

export function shouldCollectName(
  session: { name?: string } | undefined,
): boolean {
  return !session?.name?.trim();
}

export function failureRedirectPath(returnTo?: string): string {
  const params = new URLSearchParams({ error: "link", intent: "signin" });
  const safe = sanitizeReturnTo(returnTo);
  if (safe !== "/today") {
    params.set("returnTo", safe);
  }
  return `/auth?${params}`;
}

function asOtpType(type: string | null | undefined): EmailOtpType {
  if (
    type === "signup" ||
    type === "invite" ||
    type === "magiclink" ||
    type === "recovery" ||
    type === "email_change" ||
    type === "email"
  ) {
    return type;
  }
  return "email";
}

export async function completeEmailLink(
  params: EmailLinkParams,
  auth: EmailLinkAuth,
): Promise<void> {
  if (params.code) {
    const { error } = await auth.exchangeCodeForSession(params.code);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  if (params.tokenHash) {
    const { error } = await auth.verifyOtp({
      token_hash: params.tokenHash,
      type: asOtpType(params.type),
    });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  throw new Error("Missing auth callback params");
}
