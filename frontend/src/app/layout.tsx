import type { Metadata } from "next";
import { Fraunces, Atkinson_Hyperlegible, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CogniCare — Cognitive Gaming for Elderly",
  description:
    "AI-powered cognitive gaming and memory assistance platform for elderly dementia patients in North East India. Built for SIH 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${atkinson.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-ink paper-texture">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
