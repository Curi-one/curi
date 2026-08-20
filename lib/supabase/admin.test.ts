import { afterEach, describe, expect, it, vi } from "vitest";

describe("createAdminClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("throws a clear error when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { createAdminClient } = await import("./admin");

    expect(() => createAdminClient()).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY is required/i,
    );
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");

    const { createAdminClient } = await import("./admin");

    expect(() => createAdminClient()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL is required/i,
    );
  });
});
