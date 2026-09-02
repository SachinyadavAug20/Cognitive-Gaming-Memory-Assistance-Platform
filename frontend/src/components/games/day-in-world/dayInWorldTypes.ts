import * as THREE from "three";

export type DayChapter = 1 | 2 | 3 | 4 | 5 | 6;

export interface CollectibleItem {
  id: "key" | "cap" | "bag";
  name: string;
  emoji: string;
  pos: [number, number, number];
  collected: boolean;
  mesh?: THREE.Group;
}

export interface DayChapterInfo {
  chapter: DayChapter;
  titleKey: string;
  fallbackTitle: string;
  badge: string;
}

export const CHAPTER_CONFIG: DayChapterInfo[] = [
  {
    chapter: 1,
    titleKey: "ch1Title",
    fallbackTitle: "The Morning Essentials",
    badge: "🌅 Morning",
  },
  {
    chapter: 2,
    titleKey: "ch2Title",
    fallbackTitle: "The Family Wall",
    badge: "🖼️ Living Room",
  },
  {
    chapter: 3,
    titleKey: "ch3Title",
    fallbackTitle: "The Village Detour",
    badge: "🧭 Outdoor Path",
  },
  {
    chapter: 4,
    titleKey: "ch4Title",
    fallbackTitle: "The Market Mission",
    badge: "☕ Village Bazaar",
  },
  {
    chapter: 5,
    titleKey: "ch5Title",
    fallbackTitle: "The Gentle Decision",
    badge: "🌤️ Afternoon Care",
  },
  {
    chapter: 6,
    titleKey: "ch6Title",
    fallbackTitle: "Reflecting on Today",
    badge: "🌙 Evening Hearth",
  },
];
