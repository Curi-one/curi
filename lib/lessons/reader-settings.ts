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
      family: "var(--font-ui), system-ui, sans-serif",
    },
    {
      id: "serif",
      label: "Serif",
      family: "var(--font-display), Georgia, serif",
    },
    {
      id: "mono",
      label: "Mono",
      family: "var(--font-mono), ui-monospace, monospace",
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
  // Reader themes are a neutral tonal ladder: white, off-white, grey, ink.
  // No warm, sepia, or tinted surfaces (BRAND.md §4.2, §16.1).
  {
    id: "light",
    label: "Light",
    swatch: "#FFFFFF",
    swatchBorder: "#E2E2E2",
    bg: "#FFFFFF",
    fg: "#0D0D0D",
    muted: "#666666",
    border: "#E2E2E2",
    card: "#FAFAFA",
  },
  {
    id: "paper",
    label: "Paper",
    swatch: "#FAFAFA",
    swatchBorder: "#DCDCDC",
    bg: "#FAFAFA",
    fg: "#0D0D0D",
    muted: "#666666",
    border: "#DCDCDC",
    card: "#F2F2F2",
  },
  {
    id: "soft",
    label: "Soft",
    swatch: "#F2F2F2",
    swatchBorder: "#D0D0D0",
    bg: "#F2F2F2",
    fg: "#2A2A2A",
    muted: "#5C5C5C",
    border: "#D0D0D0",
    card: "#EAEAEA",
  },
  {
    id: "dark",
    label: "Dark",
    swatch: "#0D0D0D",
    swatchBorder: "#2A2A2A",
    bg: "#0D0D0D",
    fg: "#FAFAFA",
    muted: "#A3A3A3",
    border: "#2A2A2A",
    card: "#1F1F1F",
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
