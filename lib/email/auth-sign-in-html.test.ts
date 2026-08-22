import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  AUTH_SIGN_IN_EMAIL_SUBJECT,
  AUTH_SIGN_IN_PLACEHOLDERS,
  renderAuthSignInEmailTemplate,
} from "@/lib/email/auth-sign-in-html";
import { EMAIL_COLORS } from "@/lib/email/brand-theme";
import { readFileSync } from "node:fs";

const TEMPLATE_PATH = join(process.cwd(), "supabase/templates/magic_link.html");

(process.env.GENERATE_AUTH_EMAIL === "1" ? it : it.skip)(
  "writes supabase magic_link template",
  () => {
    writeFileSync(TEMPLATE_PATH, `${renderAuthSignInEmailTemplate()}\n`, "utf8");
    expect(true).toBe(true);
  },
);

describe("renderAuthSignInEmailTemplate", () => {
  it("uses branded shell with wordmark and vermilion accents", () => {
    const html = renderAuthSignInEmailTemplate();
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain(EMAIL_COLORS.canvas);
    expect(html).toContain(EMAIL_COLORS.accent);
    expect(html).toContain("Cu<em");
    expect(html).toContain("Continue to Curi");
    expect(html).toContain("Secure sign-in");
  });

  it("includes Supabase placeholders for link, code, and recipient", () => {
    const html = renderAuthSignInEmailTemplate();
    expect(html).toContain(AUTH_SIGN_IN_PLACEHOLDERS.confirmationUrl);
    expect(html).toContain(AUTH_SIGN_IN_PLACEHOLDERS.token);
    expect(html).toContain(AUTH_SIGN_IN_PLACEHOLDERS.email);
    expect(html).toContain("Open Curi →");
  });

  it("matches committed Supabase template file", () => {
    const generated = renderAuthSignInEmailTemplate().trim();
    const committed = readFileSync(TEMPLATE_PATH, "utf8").trim();
    expect(committed).toBe(generated);
  });
});

describe("AUTH_SIGN_IN_EMAIL_SUBJECT", () => {
  it("matches supabase config subject", () => {
    expect(AUTH_SIGN_IN_EMAIL_SUBJECT).toBe("Your Curi sign-in link and code");
  });
});
