export type ReaderSize = "s" | "m" | "l" | "xl";
export type ReaderFont = "sans" | "serif" | "mono";
export type ReaderTheme = "light" | "sepia" | "dark" | "paper";

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
  {
    id: "light",
    label: "Light",
    swatch: "#FAFAFA",
    swatchBorder: "#D0D0D0",
    bg: "#FAFAFA",
    fg: "#0D0D0D",
    muted: "#595959",
    border: "#C7C7C7",
    card: "#F7F7F7",
  },
  {
    id: "sepia",
    label: "Sepia",
    swatch: "#F4EFE0",
    swatchBorder: "#C8BEA8",
    bg: "#F4EFE0",
    fg: "#3B2A1A",
    muted: "#6B5848",
    border: "#C8BEA8",
    card: "#EBE4D1",
  },
  {
    id: "dark",
    label: "Dark",
    swatch: "#18171A",
    swatchBorder: "#3A3840",
    bg: "#18171A",
    fg: "#E2DDD8",
    muted: "#8A8680",
    border: "#2E2C30",
    card: "#221F25",
  },
  {
    id: "paper",
    label: "Paper",
    swatch: "#FFFEF9",
    swatchBorder: "#E0DDD6",
    bg: "#FFFEF9",
    fg: "#111111",
    muted: "#6B6B66",
    border: "#E0DDD6",
    card: "#F2EFE8",
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
