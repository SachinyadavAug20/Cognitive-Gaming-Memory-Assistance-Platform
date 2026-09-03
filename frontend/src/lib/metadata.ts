import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/** Dot-path resolver against a nested messages object (e.g. "games.drum.title"). */
export function getPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function resolveMessage(messages: unknown, key: string, fallback: string): string {
  const v = getPath(messages, key);
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

interface BuildMetadataArgs {
  locale: string;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

function alternatesFor(subpath: string) {
  const languages: Record<string, string> = {
    "x-default": `${SITE_URL}/en${subpath}`,
  };
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}${subpath}`;
  });
  return languages;
}

/**
 * Shared builder for per-route metadata: canonical, hreflang alternates,
 * OpenGraph and Twitter cards. Titles are expected WITHOUT the site suffix;
 * callers pass the raw title and the layout template appends "| CogniCare CDTx".
 */
export function buildMetadata({
  locale,
  title,
  description,
  path,
  keywords,
}: BuildMetadataArgs): Metadata {
  const canonical = `${SITE_URL}/${locale}${path}`;
  const og = `${SITE_URL}/og-image.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: alternatesFor(path),
    },
    openGraph: {
      type: "website",
      siteName: `${SITE_NAME} Platform`,
      title: title,
      description,
      url: canonical,
      locale,
      images: [
        {
          url: og,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
      creator: "@CogniCareIndia",
    },
    ...(keywords ? { keywords } : {}),
  };
}

/** Default fallback used by pages that otherwise inherit layout metadata. */
export function defaultMetadata(locale: string, path = ""): Metadata {
  return buildMetadata({
    locale,
    title: "CogniCare CDTx",
    description: SITE_NAME + " — AI Memory & Cognitive Therapy for Elderly",
    path,
  });
}