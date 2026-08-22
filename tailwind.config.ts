import type { Config } from "tailwindcss";

/**
 * Tailwind maps onto the Curi design tokens in `app/globals.css`.
 * Tokens are the source of truth — see `docs/BRAND.md` §8.
 * Anything not expressible here belongs in a token, not a utility class.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Sharp corners are the brand (§8.4). `rounded-*` beyond these does not exist.
    borderRadius: {
      none: "var(--radius-none)",
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      full: "var(--radius-full)",
      DEFAULT: "var(--radius-none)",
    },
    // Curi uses no box shadows (§8.5, §16.3).
    boxShadow: {
      none: "none",
    },
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Greyscale — eight tones (§4.2)
        // `ink` is the PRIMARY-TEXT ROLE, not the raw #0A0908 tone. It has to
        // flip with the theme: bound to the tone, `text-ink` rendered
        // Ink-on-Ink in dark mode and every heading on every screen vanished.
        // Because --color-text-primary and --color-bg-inverse resolve to the
        // same value in both themes, `bg-ink` keeps working as the inverse
        // fill (dark chip on light, light chip on dark).
        // Need the literal dark tone on a surface that never flips? Use the
        // `mark-*` colours below.
        ink: "var(--color-text-primary)",
        "ink-2": "var(--color-ink-2)",
        "ink-3": "var(--color-ink-3)",
        "ink-muted": "var(--color-ink-muted)",
        "ink-faint": "var(--color-ink-faint)",
        // Track marks — theme-independent, never remapped by html.dark.
        "mark-field": "var(--mark-field)",
        "mark-fg": "var(--mark-fg)",
        "mark-meta": "var(--mark-meta)",
        mid: "var(--color-mid)",
        silver: "var(--color-silver)",
        light: "var(--color-light)",
        paper: "var(--color-paper)",
        "paper-secondary": "var(--color-paper-secondary)",
        "paper-tertiary": "var(--color-paper-tertiary)",
        inverse: "var(--color-text-inverse)",
        border: "var(--color-border)",
        "border-default": "var(--color-border-default)",
        "border-strong": "var(--color-border-strong)",
        // One accent, once per screen (§4.3)
        accent: "var(--color-accent)",
        "accent-dark": "var(--color-accent-dark)",
        // Streak is Ink, never Vermilion (§11.3)
        streak: "var(--color-streak)",
      },
      fontFamily: {
        // Brand trio only (§5) — override Tailwind defaults so `font-sans` /
        // `font-serif` / `font-mono` never pull Inter / ui-sans / system stacks.
        sans: ["var(--font-ui-stack)"],
        serif: ["var(--font-display-stack)"],
        mono: ["var(--font-mono-stack)"],
        display: ["var(--font-display-stack)"],
        ui: ["var(--font-ui-stack)"],
        meta: ["var(--font-mono-stack)"],
      },
      fontSize: {
        // Display — Fraunces (§5.5). Never below 18px.
        "display-2xl": "var(--text-display-2xl)",
        "display-xl": "var(--text-display-xl)",
        "display-lg": "var(--text-display-lg)",
        "display-md": "var(--text-display-md)",
        "display-sm": "var(--text-display-sm)",
        "display-xs": "var(--text-display-xs)",
        "display-2xs": "var(--text-display-2xs)",
        // UI — Plus Jakarta Sans
        "ui-xl": "var(--text-ui-xl)",
        "ui-lg": "var(--text-ui-lg)",
        "ui-md": "var(--text-ui-md)",
        "ui-sm": "var(--text-ui-sm)",
        "ui-xs": "var(--text-ui-xs)",
        "ui-2xs": "var(--text-ui-2xs)",
        "ui-3xs": "var(--text-ui-3xs)",
        "ui-4xs": "var(--text-ui-4xs)",
        // Metadata — JetBrains Mono
        "mono-md": "var(--text-mono-md)",
        "mono-sm": "var(--text-mono-sm)",
        "mono-xs": "var(--text-mono-xs)",
        "mono-2xs": "var(--text-mono-2xs)",
      },
      fontWeight: {
        light: "var(--weight-light)",
        normal: "var(--weight-regular)",
        medium: "var(--weight-medium)",
        semibold: "var(--weight-semibold)",
      },
      lineHeight: {
        none: "var(--leading-none)",
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
        loose: "var(--leading-loose)",
      },
      letterSpacing: {
        tighter: "var(--tracking-tighter)",
        tight: "var(--tracking-tight)",
        normal: "var(--tracking-normal)",
        wide: "var(--tracking-wide)",
        wider: "var(--tracking-wider)",
        widest: "var(--tracking-widest)",
        ultra: "var(--tracking-ultra)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        14: "var(--space-14)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
        32: "var(--space-32)",
      },
      maxWidth: {
        grid: "var(--grid-max-width)",
        content: "var(--content-max-width)",
        narrow: "var(--narrow-max-width)",
      },
      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        cursor: "var(--z-cursor)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        standard: "var(--ease-standard)",
      },
      transitionDuration: {
        micro: "var(--duration-micro)",
        small: "var(--duration-small)",
        medium: "var(--duration-medium)",
        large: "var(--duration-large)",
        xl: "var(--duration-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
