/**
 * Error reporting — no-ops when SENTRY_DSN is unset.
 * Avoids hard dependency on @sentry/nextjs until DSN is provisioned.
 */

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    if (process.env.NODE_ENV === "development") {
      console.error("[sentry:noop]", error, context ?? {});
    }
    return;
  }
  console.error("[sentry]", error, context ?? {});
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }
  console[level === "error" ? "error" : "info"](`[sentry:${level}]`, message);
}
