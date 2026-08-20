import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { DevPersonaToggle } from "@/components/DevPersonaToggle";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
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
  return (
    <html lang="en">
      <body className={`${fraunces.variable} min-h-screen antialiased`}>
        <DevPersonaToggle />
        {children}
      </body>
    </html>
  );
}
