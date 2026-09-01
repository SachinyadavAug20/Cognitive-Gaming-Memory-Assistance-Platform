import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const GAME_IDS = [
  "alpana",
  "river-lanterns",
  "loom",
  "drum",
  "hornbill-flight",
  "majuli-pottery",
  "monastery-bell",
  "bamboo-dance",
  "brahmaputra-boat",
  "dzukou-botanist",
  "memoir-scribe",
  "grandchild-chat",
  "memory-detective",
  "storybook",
  "jigsaw",
  "timeline",
  "tea-harvest",
  "radio",
  "root-bridge",
  "daily-routine",
  "heritage-kitchen",
  "bazaar",
  "sorting",
  "proverb",
  "lotus-lake",
  "wayfinding",
];

const CORE_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/kiosk/login", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/command-center", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/patient/games", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/caregiver", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/caregiver/add-patient", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/patient", priority: 0.85, changeFrequency: "daily" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cognitive-gaming-memory-assistance.vercel.app";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Generate alternate language links object for search engines
  const getAlternates = (subpath: string) => {
    const languages: Record<string, string> = {
      "x-default": `${baseUrl}/en${subpath}`,
    };
    routing.locales.forEach((loc) => {
      languages[loc] = `${baseUrl}/${loc}${subpath}`;
    });
    return languages;
  };

  // 1. Core portal pages across all 11 locales
  for (const page of CORE_PAGES) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: getAlternates(page.path),
        },
      });
    }
  }

  // 2. All 18 CDTx Serious Games across all 11 locales
  for (const gameId of GAME_IDS) {
    const gameSubpath = `/patient/games/${gameId}`;
    for (const locale of routing.locales) {
      entries.push({
        url: `${baseUrl}/${locale}${gameSubpath}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: getAlternates(gameSubpath),
        },
      });
    }
  }

  return entries;
}
