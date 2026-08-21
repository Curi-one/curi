export type ReaderSize = "s" | "m" | "l" | "xl";
export type ReaderFont = "sans" | "serif" | "mono";
export type ReaderTheme = "light" | "paper" | "soft" | "dark";

export type ReaderSettings = {
  size: ReaderSize;
  font: ReaderFont;
  theme: ReaderTheme;
  bionic: boolean;
};

export const READER_SETTINGS_KEY = "curi-reader-settings";

export const READER_SIZES: {
  id: ReaderSize;
  size: string;
  leading: string;
}[] = [
  { id: "s", size: "1.0rem", leading: "1.82" },
  { id: "m", size: "1.22rem", leading: "1.84" },
  { id: "l", size: "1.44rem", leading: "1.8" },
  { id: "xl", size: "1.64rem", leading: "1.76" },
];

export const READER_FONTS: { id: ReaderFont; label: string; family: string }[] =
  [
    {
      id: "sans",
      label: "Sans",
      family: "var(--font-ui-stack)",
    },
    {
      id: "serif",
      label: "Serif",
      family: "var(--font-display-stack)",
    },
    {
      id: "mono",
      label: "Mono",
      family: "var(--font-mono-stack)",
    },
  ];

export const READER_THEMES: {
  id: ReaderTheme;
  label: string;
  swatch: string;
  swatchBorder: string;
  bg: string;
  fg: string;
  muted: string;
  border: string;
  card: string;
}[] = [
  // Reader themes — warm tonal ladder matching globals.css tokens.
  // Never pure black or white; Vermilion is not used in reader chrome.
  {
    id: "light",
    label: "Light",
    swatch: "#FAF9F5",
    swatchBorder: "#D4D0C8",
    bg: "#FAF9F5",
    fg: "#0A0908",
    muted: "#6B6760",
    border: "#D4D0C8",
    card: "#F4F1E8",
  },
  {
    id: "paper",
    label: "Paper",
    swatch: "#F4F1E8",
    swatchBorder: "#D4D0C8",
    bg: "#F4F1E8",
    fg: "#0A0908",
    muted: "#6B6760",
    border: "#D4D0C8",
    card: "#E8E5DC",
  },
  {
    id: "soft",
    label: "Soft",
    swatch: "#E8E5DC",
    swatchBorder: "#D4D0C8",
    bg: "#E8E5DC",
    fg: "#2E2C28",
    muted: "#6B6760",
    border: "#D4D0C8",
    card: "#D4D0C8",
  },
  {
    id: "dark",
    label: "Dark",
    swatch: "#0A0908",
    swatchBorder: "#2E2C28",
    bg: "#0A0908",
    fg: "#FAF9F5",
    muted: "#9E9B94",
    border: "#2E2C28",
    card: "#1C1A18",
  },
];
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  size: "m",
  font: "sans",
  theme: "light",
  bionic: false,
};

export function loadReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_READER_SETTINGS;
  try {
    const raw = localStorage.getItem(READER_SETTINGS_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      size: READER_SIZES.some((s) => s.id === parsed.size)
        ? (parsed.size as ReaderSize)
        : DEFAULT_READER_SETTINGS.size,
      font: READER_FONTS.some((f) => f.id === parsed.font)
        ? (parsed.font as ReaderFont)
        : DEFAULT_READER_SETTINGS.font,
      theme: READER_THEMES.some((t) => t.id === parsed.theme)
        ? (parsed.theme as ReaderTheme)
        : DEFAULT_READER_SETTINGS.theme,
      bionic: Boolean(parsed.bionic),
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota */
  }
}

export type ReaderThemeTokens = (typeof READER_THEMES)[number];

const THEME_CSS_VAR_KEYS = [
  "--color-ink",
  "--color-ink-muted",
  "--color-border",
  "--color-paper",
  "--color-paper-secondary",
  "--color-paper-tertiary",
  "--color-bg-primary",
  "--color-bg-secondary",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-border-subtle",
] as const;

type ThemeCssVarKey = (typeof THEME_CSS_VAR_KEYS)[number];

export function resolveReaderTheme(
  theme: ReaderTheme | ReaderThemeTokens,
): ReaderThemeTokens {
  if (typeof theme === "string") {
    return READER_THEMES.find((t) => t.id === theme) ?? READER_THEMES[0];
  }
  return theme;
}

/** Map a reader theme to CSS custom properties for the document / reader chrome. */
export function themeToCssVars(
  theme: ReaderTheme | ReaderThemeTokens,
): Record<ThemeCssVarKey, string> {
  const t = resolveReaderTheme(theme);
  return {
    "--color-ink": t.fg,
    "--color-ink-muted": t.muted,
    "--color-border": t.border,
    "--color-paper": t.bg,
    "--color-paper-secondary": t.card,
    "--color-paper-tertiary": t.border,
    "--color-bg-primary": t.bg,
    "--color-bg-secondary": t.card,
    "--color-text-primary": t.fg,
    "--color-text-secondary": t.muted,
    "--color-border-subtle": t.border,
  };
}

type SavedThemeStyles = {
  vars: Partial<Record<ThemeCssVarKey, string>>;
  rootBackground: string;
  bodyBackground: string;
};

let savedThemeStyles: SavedThemeStyles | null = null;

/** Apply reader theme tokens to `document.documentElement` (and body background). */
export function applyReaderThemeToDocument(
  theme: ReaderTheme | ReaderThemeTokens,
): void {
  if (typeof document === "undefined") return;
  const t = resolveReaderTheme(theme);
  const vars = themeToCssVars(t);
  const root = document.documentElement;

  if (!savedThemeStyles) {
    const prevVars: Partial<Record<ThemeCssVarKey, string>> = {};
    for (const key of THEME_CSS_VAR_KEYS) {
      prevVars[key] = root.style.getPropertyValue(key);
    }
    savedThemeStyles = {
      vars: prevVars,
      rootBackground: root.style.backgroundColor,
      bodyBackground: document.body.style.backgroundColor,
    };
  }

  for (const key of THEME_CSS_VAR_KEYS) {
    root.style.setProperty(key, vars[key]);
  }
  root.style.backgroundColor = t.bg;
  document.body.style.backgroundColor = t.bg;
}

/** Restore document styles saved before the first `applyReaderThemeToDocument`. */
export function clearReaderThemeFromDocument(): void {
  if (typeof document === "undefined") return;
  if (!savedThemeStyles) return;

  const root = document.documentElement;
  for (const key of THEME_CSS_VAR_KEYS) {
    const prev = savedThemeStyles.vars[key];
    if (prev) {
      root.style.setProperty(key, prev);
    } else {
      root.style.removeProperty(key);
    }
  }
  root.style.backgroundColor = savedThemeStyles.rootBackground;
  document.body.style.backgroundColor = savedThemeStyles.bodyBackground;
  savedThemeStyles = null;
}
