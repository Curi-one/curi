/**
 * Lightweight client GET cache for apiFetch.
 * Memory + sessionStorage so Soft navigations and remounts reuse fresh data.
 * Mutations should call invalidateClientCache().
 */

const STORAGE_KEY = "curi:api-cache:v1";

/** Default TTL for cached GETs (45s — short enough for Today freshness). */
export const DEFAULT_CACHE_TTL_MS = 45_000;

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function readStorage(): Record<string, CacheEntry> {
  if (!canUseStorage()) return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

function writeStorage(map: Record<string, CacheEntry>): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota / private mode — memory cache still works.
  }
}

function persistEntry(key: string, entry: CacheEntry): void {
  const all = readStorage();
  all[key] = entry;
  writeStorage(all);
}

function removeStorageKeys(predicate: (key: string) => boolean): void {
  if (!canUseStorage()) return;
  const all = readStorage();
  let changed = false;
  for (const key of Object.keys(all)) {
    if (predicate(key)) {
      delete all[key];
      changed = true;
    }
  }
  if (changed) writeStorage(all);
}

export function cacheKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function getCached<T = unknown>(
  key: string,
  now = Date.now(),
): T | null {
  const mem = memory.get(key);
  if (mem) {
    if (mem.expiresAt > now) return mem.data as T;
    memory.delete(key);
  }

  const stored = readStorage()[key];
  if (!stored) return null;
  if (stored.expiresAt <= now) {
    removeStorageKeys((k) => k === key);
    return null;
  }
  memory.set(key, stored);
  return stored.data as T;
}

export function setCached(
  key: string,
  data: unknown,
  ttlMs = DEFAULT_CACHE_TTL_MS,
  now = Date.now(),
): void {
  const entry: CacheEntry = { data, expiresAt: now + ttlMs };
  memory.set(key, entry);
  persistEntry(key, entry);
}

export function clearClientCache(opts?: { memoryOnly?: boolean }): void {
  memory.clear();
  inflight.clear();
  if (!opts?.memoryOnly && canUseStorage()) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Clear all cached GETs, or only keys whose path starts with any prefix.
 * Keys look like `GET:/api/feed`.
 */
export function invalidateClientCache(pathPrefixes?: string[]): void {
  if (!pathPrefixes || pathPrefixes.length === 0) {
    clearClientCache();
    return;
  }

  const matches = (key: string) => {
    const path = key.includes(":") ? key.slice(key.indexOf(":") + 1) : key;
    return pathPrefixes.some(
      (prefix) =>
        path === prefix ||
        path.startsWith(`${prefix}/`) ||
        path.startsWith(`${prefix}?`),
    );
  };

  for (const key of [...memory.keys()]) {
    if (matches(key)) memory.delete(key);
  }
  for (const key of [...inflight.keys()]) {
    if (matches(key)) inflight.delete(key);
  }
  removeStorageKeys(matches);
}

export type ReadThroughOptions = {
  ttlMs?: number;
  skipCache?: boolean;
};

/**
 * Return cached value or run fetcher once (dedupes concurrent callers).
 */
export async function readThroughCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: ReadThroughOptions,
): Promise<T> {
  if (!options?.skipCache) {
    const hit = getCached<T>(key);
    if (hit !== null) return hit;
  }

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing && !options?.skipCache) {
    return existing;
  }

  const pending = (async () => {
    try {
      const data = await fetcher();
      setCached(key, data, options?.ttlMs ?? DEFAULT_CACHE_TTL_MS);
      return data;
    } finally {
      inflight.delete(key);
    }
  })();

  if (!options?.skipCache) {
    inflight.set(key, pending);
  }
  return pending;
}

/** Longer TTL for relatively static catalogue / session identity. */
export function ttlForPath(path: string): number {
  if (path.startsWith("/api/me") || path === "/api/explore") {
    return 120_000;
  }
  if (
    path.startsWith("/api/courses/") &&
    (path.includes("/lessons/") || path.match(/^\/api\/courses\/[^/]+$/))
  ) {
    return 90_000;
  }
  return DEFAULT_CACHE_TTL_MS;
}
