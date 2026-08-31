import type { Metadata } from "next";
import Script from "next/script";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Fraunces, Atkinson_Hyperlegible, JetBrains_Mono } from "next/font/google";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import { StructuredData } from "@/components/seo/StructuredData";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://cognitive-gaming-memory-assistance.vercel.app";

  const languages: Record<string, string> = {
    "x-default": `${baseUrl}/en`,
  };
  routing.locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}`;
  });

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "CogniCare CDTx — AI Memory & Cognitive Therapy for Elderly",
      template: "%s | CogniCare CDTx",
    },
    description:
      "Clinically calibrated Cognitive Digital Therapeutics (CDTx) and memory assistance platform for elderly dementia and MCI patients in North East India. Proposed for MDoNER • Problem Statement SIH26003.",
    keywords: [
      "dementia cognitive therapy",
      "Alzheimer's memory assistance",
      "CDTx serious games",
      "MDoNER North East India",
      "Smart India Hackathon 2026",
      "Brahmaputra healthcare",
      "ABDM ABHA health card",
      "offline clinical AI",
      "elderly healthcare gaming",
      "Assamese Khasi Manipuri digital health",
      "reminiscence therapy",
      "MMSE MoCA calibration",
    ],
    authors: [
      {
        name: "CogniCare CDTx & MDoNER Health Initiative",
        url: baseUrl,
      },
    ],
    creator: "Team CogniCare (Smart India Hackathon 2026)",
    publisher: "Ministry of Development of North Eastern Region (MDoNER)",
    category: "Medical & Health Technology",
    classification: "Digital Therapeutics & Healthcare Software",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: "CogniCare CDTx Platform",
      title: "CogniCare CDTx — AI-Powered Memory Care for North East India",
      description:
        "Clinically validated cognitive gaming platform for elderly dementia care in North East India. Features 18 serious games, local Ollama AI clinical parsing, and 11 regional languages.",
      url: `${baseUrl}/${locale}`,
      locale: locale,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "CogniCare CDTx — AI-Powered Memory Care for North East India",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "CogniCare CDTx — AI-Powered Memory Care",
      description:
        "Clinically validated cognitive gaming platform for elderly dementia patients in North East India.",
      images: [`${baseUrl}/og-image.png`],
      creator: "@CogniCareIndia",
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

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
        <meta name="theme-color" content="#15803D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
        <StructuredData locale={locale} />
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
