import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Node 25 exposes a built-in `localStorage` global that shadows the jsdom
 * implementation. It is inert unless the runtime was started with a valid
 * `--localstorage-file`, so `localStorage.clear` is undefined and any test
 * touching storage throws "localStorage.clear is not a function".
 *
 * Install a spec-compliant in-memory Storage on the jsdom window whenever the
 * ambient one is unusable.
 */
function installLocalStorage(): void {
  const usable =
    typeof globalThis.localStorage === "object" &&
    globalThis.localStorage !== null &&
    typeof globalThis.localStorage.clear === "function";

  if (usable) return;

  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(String(key)) ? store.get(String(key))! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => void store.delete(String(key)),
    setItem: (key, value) => void store.set(String(key), String(value)),
  };

  for (const target of [globalThis, globalThis.window].filter(Boolean)) {
    Object.defineProperty(target, "localStorage", {
      configurable: true,
      writable: true,
      value: storage,
    });
  }
}

installLocalStorage();

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
});
