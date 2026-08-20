import type { AuthIntent } from "@/lib/auth/intent";
import { sanitizeReturnTo } from "@/lib/auth/intent";

const KEY = "curi_auth_ctx";

export type AuthContext = {
  returnTo: string;
  intent: AuthIntent;
};

export function saveAuthContext(ctx: AuthContext): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
}

export function loadAuthContext(): AuthContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthContext;
    if (!parsed || typeof parsed.returnTo !== "string") return null;
    return {
      returnTo: sanitizeReturnTo(parsed.returnTo),
      intent: parsed.intent ?? "signin",
    };
  } catch {
    return null;
  }
}

export function clearAuthContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
