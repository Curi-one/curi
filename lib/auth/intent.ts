export type AuthIntent = "signin" | "signup" | "save";

const VALID: AuthIntent[] = ["signin", "signup", "save"];

export function parseAuthIntent(raw: string | null): AuthIntent | null {
  if (raw && VALID.includes(raw as AuthIntent)) {
    return raw as AuthIntent;
  }
  return null;
}

/**
 * Resolve auth copy/intent from URL + guest context (FLOWS F1 vs F5).
 * Explicit intent= always wins. "Save your progress" only for post-quiz / active guest path.
 */
export function resolveAuthIntent(
  search: URLSearchParams,
  options: { fromQuiz: boolean; hasPendingPath: boolean },
): AuthIntent {
  const explicit = parseAuthIntent(search.get("intent"));
  if (explicit) {
    return explicit;
  }
  if (options.fromQuiz) {
    return "save";
  }
  if (options.hasPendingPath && search.get("from") !== "link") {
    return "save";
  }
  return "signin";
}

export function authEmailHeadline(intent: AuthIntent, step: string): string {
  if (step === "link") {
    return "Check your email";
  }
  if (step === "code") {
    return "Enter your code";
  }
  if (step === "name") {
    return "What should we call you?";
  }
  switch (intent) {
    case "signin":
      return "Welcome back";
    case "signup":
      return "Create your account";
    case "save":
      return "Save your progress";
  }
}

export function authEmailSubcopy(
  intent: AuthIntent,
  step: string,
  email: string,
  emailSent: boolean,
): string {
  if (step === "link") {
    return emailSent
      ? `We sent a sign-in link and 6-digit code to ${email}. Open the link on this device, or enter the code in the app.`
      : `Nothing new was sent to ${email}. Use a link or code from an earlier email, or wait about an hour and try again.`;
  }
  if (step === "code") {
    return `If your email includes a 6-digit code, enter it below for ${email}.`;
  }
  if (step === "name") {
    return "Just a first name is fine.";
  }
  switch (intent) {
    case "signin":
      return "Enter your email. We'll send a sign-in link and code — no password.";
    case "signup":
      return "Enter your email to create your account. No password needed.";
    case "save":
      return "Enter your email so we can save this path to your account.";
  }
}

export function sanitizeReturnTo(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/today";
  }
  return raw;
}
