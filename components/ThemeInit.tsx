"use client";

import { useEffect } from "react";
import { applyAppTheme, readStoredTheme } from "@/lib/ui/app-theme";

/** Keeps html.dark in sync with stored theme + system preference changes. */
export function ThemeInit() {
  useEffect(() => {
    applyAppTheme(readStoredTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStoredTheme() === "system") {
        applyAppTheme("system");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}
