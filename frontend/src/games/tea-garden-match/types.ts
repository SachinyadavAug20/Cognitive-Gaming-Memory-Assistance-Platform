import type { SupportedLocale } from "@/lib/gameI18n";

export type TileType = "tea_leaf" | "kopou_orchid" | "cane_basket" | "clay_cup" | "golden_silk";

export interface TileDef {
  type: TileType;
  name: Record<SupportedLocale, string>;
  emoji: string;
  bg: string;
  border: string;
  accentColor: string;
  glowColor: string;
}

export const TILE_DEFS: Record<TileType, TileDef> = {
  tea_leaf: {
    type: "tea_leaf",
    name: {
      en: "Tea Leaf",
      as: "চাহ পাত",
      hi: "चाय पत्ती",
      bn: "চা পাতা",
      mr: "चहाची पाने",
      ne: "चियाको पात",
      mni: "চা মনা",
      brx: "साहा बिलाइ",
      grt: "Cha Bijak",
      kha: "Sla Sha",
      lus: "Thingpui Hnah",
    },
    emoji: "🍃",
    bg: "bg-[#E8F5E9]",
    border: "border-[#2E7D32]",
    accentColor: "text-[#1B5E20]",
    glowColor: "rgba(46, 125, 50, 0.4)",
  },
  kopou_orchid: {
    type: "kopou_orchid",
    name: {
      en: "Kopou Orchid",
      as: "কপৌ ফুল",
      hi: "कपौ फूल",
      bn: "কপৌ ফুল",
      mr: "कपौ फूल",
      ne: "कपौ फूल",
      mni: "কপৌ লৈ",
      brx: "कपौ बिबार",
      grt: "Kopou Bibal",
      kha: "Tiew Kopou",
      lus: "Kopou Pangpar",
    },
    emoji: "🌸",
    bg: "bg-[#FCE4EC]",
    border: "border-[#C2185B]",
    accentColor: "text-[#880E4F]",
    glowColor: "rgba(194, 24, 91, 0.4)",
  },
  cane_basket: {
    type: "cane_basket",
    name: {
      en: "Cane Basket",
      as: "খৰাহী",
      hi: "बांस टोकरी",
      bn: "বাঁশের ঝুড়ি",
      mr: "बांबू टोपली",
      ne: "बाँसको टोकरी",
      mni: "পাচি",
      brx: "खराहि",
      grt: "Khorahi",
      kha: "Ka Shang",
      lus: "Bawm",
    },
    emoji: "🧺",
    bg: "bg-[#FFF3E0]",
    border: "border-[#E65100]",
    accentColor: "text-[#BF360C]",
    glowColor: "rgba(230, 81, 0, 0.4)",
  },
  clay_cup: {
    type: "clay_cup",
    name: {
      en: "Clay Cup",
      as: "মাটিৰ কাপ",
      hi: "मिट्टी कुल्हड़",
      bn: "মাটির ভাঁড়",
      mr: "मातीचा कप",
      ne: "माटोको कप",
      mni: "লৈবাক্কী চফু",
      brx: "हादाबनि कप",
      grt: "A·ani cup",
      kha: "Khop khyndew",
      lus: "Bawmlei No",
    },
    emoji: "🏺",
    bg: "bg-[#EFEBE9]",
    border: "border-[#6D4C41]",
    accentColor: "text-[#3E2723]",
    glowColor: "rgba(109, 76, 65, 0.4)",
  },
  golden_silk: {
    type: "golden_silk",
    name: {
      en: "Muga Silk",
      as: "মুগা সূতা",
      hi: "मूगा रेशम",
      bn: "মুগা রেশম",
      mr: "मुगा रेशीम",
      ne: "मुगा रेशम",
      mni: "মুগা লৈবাক",
      brx: "मुगा रेशम",
      grt: "Muga Silk",
      kha: "Kynphad Muga",
      lus: "Muga Silk",
    },
    emoji: "🧵",
    bg: "bg-[#FFFDE7]",
    border: "border-[#FBC02D]",
    accentColor: "text-[#F57F17]",
    glowColor: "rgba(251, 192, 45, 0.4)",
  },
};

export interface GridCell {
  id: string;
  type: TileType;
}

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface SwapAnimationState {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  phase: "sliding" | "reverting";
}

export interface BustState {
  coords: Set<string>;
  phase: "highlight" | "burst";
}
