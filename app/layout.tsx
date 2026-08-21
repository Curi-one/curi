import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { DevPersonaToggle } from "@/components/DevPersonaToggle";
import "./globals.css";

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
    <html lang="en" className={fontVars}>
      <body className="min-h-screen font-ui antialiased">
        <DevPersonaToggle />
        {children}
      </body>
    </html>
  );
}
