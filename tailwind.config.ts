import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        paper: "var(--color-paper)",
        "paper-secondary": "var(--color-paper-secondary)",
        "paper-tertiary": "var(--color-paper-tertiary)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        streak: "var(--color-streak)",
      },
    },
  },
  plugins: [],
};

export default config;
