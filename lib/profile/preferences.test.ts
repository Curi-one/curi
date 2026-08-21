import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type ProfilePreferences,
} from "@/lib/profile/preferences";

describe("profile preferences (local fallback)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns opt-in defaults when nothing is stored", () => {
    expect(loadPreferences("member")).toEqual(DEFAULT_PREFERENCES);
    expect(DEFAULT_PREFERENCES.emailEnabled).toBe(false);
    expect(DEFAULT_PREFERENCES.length).toBe("medium");
    expect(DEFAULT_PREFERENCES.seq).toBe("straight");
    expect(DEFAULT_PREFERENCES.emailTime).toBe("morning");
    expect(DEFAULT_PREFERENCES.emailFormat).toBe("Full");
  });

  it("migrates legacy lessonDepth values to length", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ lessonDepth: "Standard" }),
    );
    expect(loadPreferences("member").length).toBe("medium");

    localStorage.setItem(
      "curi-prefs:a",
      JSON.stringify({ lessonDepth: "Quick" }),
    );
    expect(loadPreferences("a").length).toBe("short");

    localStorage.setItem(
      "curi-prefs:b",
      JSON.stringify({ lessonDepth: "Deep" }),
    );
    expect(loadPreferences("b").length).toBe("long");
  });

  it("persists and reloads under curi-prefs:userKey", () => {
    const prefs: ProfilePreferences = {
      ...DEFAULT_PREFERENCES,
      anchor: "story",
      rigor: "harder",
      emailEnabled: true,
      emailWeekends: true,
    };
    savePreferences("awais@example.com", prefs);

    expect(localStorage.getItem("curi-prefs:awais@example.com")).toBeTruthy();
    expect(loadPreferences("awais@example.com")).toEqual(prefs);
  });

  it("falls back to defaults on corrupt JSON", () => {
    localStorage.setItem("curi-prefs:member", "{not-json");
    expect(loadPreferences("member")).toEqual(DEFAULT_PREFERENCES);
  });

  it("merges partial stored objects with defaults", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ seq: "broad", emailEnabled: true }),
    );
    const loaded = loadPreferences("member");
    expect(loaded.seq).toBe("broad");
    expect(loaded.emailEnabled).toBe(true);
    expect(loaded.length).toBe(DEFAULT_PREFERENCES.length);
    expect(loaded.anchor).toBe(DEFAULT_PREFERENCES.anchor);
  });
});
