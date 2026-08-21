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
    card: "#EDE9E0",
  },
  {
    id: "soft",
    label: "Soft",
    swatch: "#EDE9E0",
    swatchBorder: "#D4D0C8",
    bg: "#EDE9E0",
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
