import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  applyAppTheme,
  prefersDarkScheme,
  readStoredTheme,
  resolveIsDark,
} from "@/lib/ui/app-theme";

describe("app theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forces dark class for dark theme", () => {
    applyAppTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("curi-theme")).toBe("dark");
  });

  it("removes dark class for light theme", () => {
    document.documentElement.classList.add("dark");
    applyAppTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("follows system preference when theme is system", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as MediaQueryList);

    applyAppTheme("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(resolveIsDark("system")).toBe(true);
    expect(prefersDarkScheme()).toBe(true);
  });

  it("reads stored theme", () => {
    localStorage.setItem("curi-theme", "dark");
    expect(readStoredTheme()).toBe("dark");
  });
});
