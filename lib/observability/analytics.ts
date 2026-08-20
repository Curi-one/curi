/**
 * Lightweight analytics — no-ops when PostHog is not configured.
 * North-star events: path_created, lesson_completed, auth_completed, upgrade_started.
 */

type CaptureProps = Record<
  string,
  string | number | boolean | null | undefined
>;

const NORTH_STAR = [
  "path_created",
  "lesson_completed",
  "auth_completed",
  "upgrade_started",
  "upgrade_completed",
] as const;

export type NorthStarEvent = (typeof NORTH_STAR)[number];

export function isNorthStarEvent(event: string): event is NorthStarEvent {
  return (NORTH_STAR as readonly string[]).includes(event);
}

export function captureEvent(
  event: NorthStarEvent | string,
  properties?: CaptureProps,
): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event, properties ?? {});
    }
    return;
  }
  // Client PostHog is loaded separately; server-side we log for now.
  // Full posthog-node wiring can attach when key is present in production.
  console.info("[analytics]", event, properties ?? {});
}
