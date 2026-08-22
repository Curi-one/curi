import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { DevPersonaToggle } from "@/components/DevPersonaToggle";
import { ScrollDamping } from "@/components/ScrollDamping";
import { ThemeInit } from "@/components/ThemeInit";
import { APP_THEME_BOOT_SCRIPT } from "@/lib/ui/app-theme";
import "./globals.css";
/** KaTeX styles for lesson math — must load globally; client-only imports were dropped from the CSS bundle. */
import "katex/dist/katex.min.css";

/** Brand trio only (docs/BRAND.md §5): Fraunces · Plus Jakarta Sans · JetBrains Mono. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Curi",
  description: "Daily micro-learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // next/font CSS variables MUST live on <html> (:root). Stacks in globals.css
  // reference var(--font-display|ui|mono); if those are only on <body>, the
  // stacks invalidate on :root and every face falls back to Times/system.
  const fontVars = `${fraunces.variable} ${plusJakarta.variable} ${jetbrains.variable}`;

  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APP_THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen font-ui antialiased">
        <ThemeInit />
        <ScrollDamping />
        <DevPersonaToggle />
        {children}
      </body>
    </html>
  );
}
