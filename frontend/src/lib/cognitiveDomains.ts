import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Sparkles,
  CalendarCheck,
  Grid3X3,
  Compass,
  Flower2,
  Layers,
} from "lucide-react";

export type CognitiveDomainKey =
  | "all"
  | "memory"
  | "attention"
  | "routine"
  | "patterns"
  | "movement"
  | "calm";

export interface CognitiveDomainInfo {
  key: CognitiveDomainKey;
  label: string;
  tagline: string;
  simpleDescription: string;
  clinicalDomain: string;
  icon: LucideIcon;
  badgeBg: string;
  gameIds: string[];
  spokenIntro: string;
}

export const COGNITIVE_DOMAINS: CognitiveDomainInfo[] = [
  {
    key: "all",
    label: "All Activities",
    tagline: "Complete Brain Therapy Library",
    simpleDescription: "Browse all 40 therapeutic games and activities at your own pace.",
    clinicalDomain: "Comprehensive Neuro-Therapeutics",
    icon: Layers,
    badgeBg: "bg-tea",
    gameIds: [], // Matches all games
    spokenIntro: "Showing all 40 therapeutic activities for daily brain care.",
  },
  {
    key: "memory",
    label: "Memory & Recall",
    tagline: "Family, Life Stories & Recall",
    simpleDescription: "Remember loved ones, ancestral herbs, old stories, and familiar places.",
    clinicalDomain: "Episodic Memory & Social Cognition (MoCA / DSM-5)",
    icon: Brain,
    badgeBg: "bg-[#E05316]",
    gameIds: [
      "family-emotions",
      "memory-detective",
      "memory-garden",
      "memory-road",
      "timeline",
      "grandchild-chat",
      "day-in-my-world",
      "storybook",
      "ancestral-herbalist",
    ],
    spokenIntro: "Showing 9 Memory and Social activities. Reconnect with family memories, emotions, life stories, and cherished photographs.",
  },
  {
    key: "attention",
    label: "Attention & Focus",
    tagline: "Leaf Picking, Vigilance & Reaction",
    simpleDescription: "Practice visual focus, picking tea leaves, and following moving objects.",
    clinicalDomain: "Sustained Attention & Processing Speed (ACTIVE Model)",
    icon: Sparkles,
    badgeBg: "bg-[#15803D]",
    gameIds: [
      "tea-harvest",
      "tea-garden-catch",
      "tea-harvest-vision",
      "butterfly-sanctuary",
      "dzukou-botanist",
      "brahmaputra-boat",
      "arrow-escape",
      "pathways",
    ],
    spokenIntro: "Showing 8 Attention activities. Gentle observation drills to practice concentration and steady eyes.",
  },
  {
    key: "routine",
    label: "Daily Routine",
    tagline: "Making Tea, Market & Chores",
    simpleDescription: "Practice everyday morning routines, making red tea, and market math.",
    clinicalDomain: "Executive Function & Instrumental ADL (IADL)",
    icon: CalendarCheck,
    badgeBg: "bg-[#D97706]",
    gameIds: [
      "daily-tasks",
      "daily-routine",
      "bazaar-buddies",
      "heritage-kitchen",
      "sorting",
    ],
    spokenIntro: "Showing 5 Daily Routine activities. Practice making morning tea, visiting the market, and everyday household tasks.",
  },
  {
    key: "patterns",
    label: "Patterns & Art",
    tagline: "Rangoli Art, Puzzles & Weaving",
    simpleDescription: "Trace colorful rangoli patterns, assemble picture puzzles, and weave motifs.",
    clinicalDomain: "Visuospatial Construction & Abstraction",
    icon: Grid3X3,
    badgeBg: "bg-[#9D246C]",
    gameIds: [
      "alpana",
      "jigsaw",
      "loom",
      "weaving",
      "majuli-pottery",
    ],
    spokenIntro: "Showing 5 Pattern activities. Beautiful Rangoli designs, silk weaving, and picture puzzles.",
  },
  {
    key: "movement",
    label: "Hands & Movement",
    tagline: "Air-Painting, Walks & Gestures",
    simpleDescription: "Paint lotus flowers, float river lanterns, and walk through scenic village trails.",
    clinicalDomain: "Visuomotor Kinesthetic Praxis & 3D Wayfinding",
    icon: Compass,
    badgeBg: "bg-[#16803D]",
    gameIds: [
      "lotus-painter",
      "river-lanterns",
      "majuli-walk",
      "wayfinding",
      "root-bridge",
      "hornbill-flight",
    ],
    spokenIntro: "Showing 6 Movement activities. Gentle hand painting, 3D village paths, and floating river lanterns.",
  },
  {
    key: "calm",
    label: "Calm & Music",
    tagline: "Temple Bells, Radio & Rhythm",
    simpleDescription: "Listen to nostalgic radio broadcasts, ring soothing bells, and play gentle drums.",
    clinicalDomain: "Sensory Calming, Anxiety Modulation & Music Therapy",
    icon: Flower2,
    badgeBg: "bg-[#BE123C]",
    gameIds: [
      "radio",
      "monastery-bell",
      "bihu-dhol",
      "rhythm-hills",
      "drum",
      "tuned-drum",
      "companion",
    ],
    spokenIntro: "Showing 7 Calming activities. Peaceful temple bells, vintage radio tunes, and gentle rhythm for relaxation.",
  },
];

export function getDomainForGame(gameId: string): CognitiveDomainInfo {
  for (const domain of COGNITIVE_DOMAINS) {
    if (domain.key !== "all" && domain.gameIds.includes(gameId)) {
      return domain;
    }
  }
  return COGNITIVE_DOMAINS[1]; // fallback to memory
}
