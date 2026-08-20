/** Free plan active-path cap (FLOWS / PRD). */
export const FREE_ACTIVE_PATH_LIMIT = 2;

export function isFreePlan(plan: string | null | undefined): boolean {
  return plan !== "academy" && plan !== "paid";
}

/** Normalize DB plan values to app PlanSchema (`free` | `academy`). */
export function normalizePlan(
  plan: string | null | undefined,
): "free" | "academy" {
  if (plan === "paid" || plan === "academy") {
    return "academy";
  }
  return "free";
}
