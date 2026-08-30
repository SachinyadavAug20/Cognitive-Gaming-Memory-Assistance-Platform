import type { Metadata } from "next";
import Script from "next/script";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import {hasLocale} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {Fraunces, Atkinson_Hyperlegible, JetBrains_Mono} from "next/font/google";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import "../globals.css";

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

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${atkinson.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="cognicare-init-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var s = localStorage.getItem('cognicare_font_size');
                if (s === 'sm') document.documentElement.style.fontSize = '16px';
                else if (s === 'lg') document.documentElement.style.fontSize = '22px';
                else document.documentElement.style.fontSize = '18px';
                if (localStorage.getItem('cognicare_high_contrast') === 'true') {
                  document.documentElement.classList.add('high-contrast-mode');
                }
              } catch(e){}
            })()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink paper-texture">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AccessibilityToolbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
