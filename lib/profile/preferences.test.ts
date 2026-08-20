import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type ProfilePreferences,
} from "@/lib/profile/preferences";

describe("profile preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns opt-in defaults when nothing is stored", () => {
    expect(loadPreferences("member")).toEqual(DEFAULT_PREFERENCES);
    expect(DEFAULT_PREFERENCES.emailEnabled).toBe(false);
    expect(DEFAULT_PREFERENCES.lessonDepth).toBe("Medium");
    expect(DEFAULT_PREFERENCES.emailTime).toBe("morning");
    expect(DEFAULT_PREFERENCES.emailFormat).toBe("Full");
  });

  it("migrates legacy lessonDepth values to the new Short/Medium/Long scale", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ lessonDepth: "Standard" }),
    );
    expect(loadPreferences("member").lessonDepth).toBe("Medium");

    localStorage.setItem(
      "curi-prefs:a",
      JSON.stringify({ lessonDepth: "Quick" }),
    );
    expect(loadPreferences("a").lessonDepth).toBe("Short");

    localStorage.setItem(
      "curi-prefs:b",
      JSON.stringify({ lessonDepth: "Deep" }),
    );
    expect(loadPreferences("b").lessonDepth).toBe("Long");
  });

  it("keeps a valid current lessonDepth value as-is", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ lessonDepth: "Long" }),
    );
    expect(loadPreferences("member").lessonDepth).toBe("Long");
  });

  it("falls back to default lessonDepth for unrecognised values", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ lessonDepth: "Nonsense" }),
    );
    expect(loadPreferences("member").lessonDepth).toBe(
      DEFAULT_PREFERENCES.lessonDepth,
    );
  });

  it("persists and reloads under curi-prefs:userKey", () => {
    const prefs: ProfilePreferences = {
      ...DEFAULT_PREFERENCES,
      goal: "Raise a seed round",
      curiosityContext: "Building something",
      emailEnabled: true,
      emailWeekends: true,
    };
    savePreferences("awais@example.com", prefs);

    expect(localStorage.getItem("curi-prefs:awais@example.com")).toBeTruthy();
    expect(loadPreferences("awais@example.com")).toEqual(prefs);
  });

  it("scopes storage by userKey", () => {
    savePreferences("a@x.com", {
      ...DEFAULT_PREFERENCES,
      goal: "For A",
    });
    savePreferences("b@x.com", {
      ...DEFAULT_PREFERENCES,
      goal: "For B",
    });

    expect(loadPreferences("a@x.com").goal).toBe("For A");
    expect(loadPreferences("b@x.com").goal).toBe("For B");
    expect(loadPreferences("member").goal).toBe(DEFAULT_PREFERENCES.goal);
  });

  it("falls back to defaults on corrupt JSON", () => {
    localStorage.setItem("curi-prefs:member", "{not-json");
    expect(loadPreferences("member")).toEqual(DEFAULT_PREFERENCES);
  });

  it("merges partial stored objects with defaults", () => {
    localStorage.setItem(
      "curi-prefs:member",
      JSON.stringify({ goal: "Only goal", emailEnabled: true }),
    );
    const loaded = loadPreferences("member");
    expect(loaded.goal).toBe("Only goal");
    expect(loaded.emailEnabled).toBe(true);
    expect(loaded.lessonDepth).toBe(DEFAULT_PREFERENCES.lessonDepth);
    expect(loaded.learningStyle).toBe(DEFAULT_PREFERENCES.learningStyle);
  });
});
