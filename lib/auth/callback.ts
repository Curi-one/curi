import type { EmailOtpType } from "@supabase/supabase-js";

const LINK_ERROR_MESSAGE =
  "That email link didn't sign you in. Enter the 6-digit code from the email instead.";

export type AuthLanding =
  | { action: "consume-link"; callbackPath: string }
  | { action: "named-step" }
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
    return { action: "consume-link", callbackPath: `/auth/callback?${qs}` };
  }

  if (search.get("error") === "link" || search.get("error_description")) {
    return { action: "error", message: LINK_ERROR_MESSAGE };
  }

  if (search.get("from") === "link") {
    return { action: "named-step" };
  }

  return { action: "form" };
}

export function successRedirectPath(): string {
  return "/auth?from=link";
}

export function shouldCollectName(session: { name?: string } | undefined): boolean {
  return !session?.name?.trim();
}

export function failureRedirectPath(): string {
  return "/auth?error=link";
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
