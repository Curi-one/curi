import { BRAND_PALETTE } from "@/lib/brand/palette";

/**
 * Curi email brand shell — BRAND.md §12, WEBSITE-DESIGN-RULES.md §1.
 * Table-based HTML for client compatibility; inline styles on components.
 */

export const EMAIL_COLORS = {
  ink: BRAND_PALETTE.ink,
  mid: BRAND_PALETTE.mid,
  silver: BRAND_PALETTE.silver,
  light: BRAND_PALETTE.light,
  paper: BRAND_PALETTE.paper,
  white: BRAND_PALETTE.white,
  canvas: BRAND_PALETTE.canvas,
  accent: BRAND_PALETTE.accent,
} as const;
