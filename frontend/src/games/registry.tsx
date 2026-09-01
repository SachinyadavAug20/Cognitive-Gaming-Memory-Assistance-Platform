import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Coffee,
  Search,
  BookOpen,
  Grid3X3,
  Compass,
  Sparkles,
  Leaf,
  Radio,
  Flower2,
  Utensils,
  Music,
  GitFork,
  Store,
  Quote,
  Waves,
  Feather,
  Clock,
  Boxes,
} from "lucide-react";

import { AlpanaGame } from "./alpana/AlpanaGame";
import { RiverLanternsGame } from "./river-lanterns/RiverLanternsGame";
import { LoomGame } from "./loom/LoomGame";
import { DrumGame } from "./drum/DrumGame";
import { MemoirScribeGame } from "./memoir-scribe/MemoirScribeGame";
import { GrandchildChatGame } from "./grandchild-chat/GrandchildChatGame";
import { MemoryDetectiveGame } from "./memory-detective/MemoryDetectiveGame";
import { StorybookGame } from "./storybook/StorybookGame";
import { BazaarGame } from "./bazaar/BazaarGame";
import { ProverbGame } from "./proverb/ProverbGame";
import { JigsawGame } from "./jigsaw/JigsawGame";
import { WayfindingGame } from "./wayfinding/WayfindingGame";
import { TeaHarvestGame } from "./tea-harvest/TeaHarvestGame";
import { NostalgiaRadioGame } from "./radio/NostalgiaRadioGame";
import { HeritageKitchenGame } from "./heritage-kitchen/HeritageKitchenGame";
import { RootBridgeGame } from "./root-bridge/RootBridgeGame";
import { LotusLakeGame } from "./lotus-lake/LotusLakeGame";
import { TimelineGame } from "./timeline/TimelineGame";
import { SortingGame } from "./sorting/SortingGame";

export type ClinicalDomain = "reminiscence" | "vision-3d" | "attention" | "iadl" | "calm";

export interface GameDef {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  accent: string;
  domain: string;
  category: ClinicalDomain;
  recommended?: boolean;
  component: ComponentType;
}

export const GAMES: GameDef[] = [
  // ── DOMAIN 1: 3D COMPUTER VISION & KINESTHETIC PRAXIS ──
  {
    id: "alpana",
    icon: Sparkles,
    titleKey: "alpana.title",
    descKey: "alpana.desc",
    accent: "bg-purple-900",
    domain: "Computer Vision Air-Canvas",
    category: "vision-3d",
    recommended: true,
    component: AlpanaGame,
  },
  {
    id: "river-lanterns",
    icon: Waves,
    titleKey: "riverLanterns.title",
    descKey: "riverLanterns.desc",
    accent: "bg-teal-800",
    domain: "3D Graphics & Optical Vision",
    category: "vision-3d",
    recommended: true,
    component: RiverLanternsGame,
  },
  {
    id: "loom",
    icon: Sparkles,
    titleKey: "loom.title",
    descKey: "loom.desc",
    accent: "bg-amber-800",
    domain: "3D Constructional Praxis",
    category: "vision-3d",
    recommended: true,
    component: LoomGame,
  },
  {
    id: "drum",
    icon: Music,
    titleKey: "drum.title",
    descKey: "drum.desc",
    accent: "bg-marigold",
    domain: "3D Auditory-Motor Entrainment",
    category: "vision-3d",
    recommended: true,
    component: DrumGame,
  },

  // ── DOMAIN 2: AUTOBIOGRAPHICAL REMINISCENCE & MEMORY RETRIEVAL ──
  {
    id: "grandchild-chat",
    icon: Coffee,
    titleKey: "grandchildChat.title",
    descKey: "grandchildChat.desc",
    accent: "bg-tea",
    domain: "AI Conversational Reminiscence",
    category: "reminiscence",
    recommended: true,
    component: GrandchildChatGame,
  },
  {
    id: "memory-detective",
    icon: Search,
    titleKey: "memoryDetective.title",
    descKey: "memoryDetective.desc",
    accent: "bg-marigold",
    domain: "AI Clue & Face Recognition",
    category: "reminiscence",
    recommended: true,
    component: MemoryDetectiveGame,
  },
  {
    id: "memoir-scribe",
    icon: Feather,
    titleKey: "memoirScribe.title",
    descKey: "memoirScribe.desc",
    accent: "bg-purple-900",
    domain: "AI Narrative Living Memoirs",
    category: "reminiscence",
    recommended: true,
    component: MemoirScribeGame,
  },
  {
    id: "jigsaw",
    icon: Grid3X3,
    titleKey: "jigsaw.title",
    descKey: "jigsaw.desc",
    accent: "bg-tea",
    domain: "Visuospatial & Memory",
    category: "reminiscence",
    recommended: true,
    component: JigsawGame,
  },
  {
    id: "timeline",
    icon: Clock,
    titleKey: "timeline.title",
    descKey: "timeline.desc",
    accent: "bg-tea",
    domain: "Spaced Autobiographical Recall",
    category: "reminiscence",
    recommended: true,
    component: TimelineGame,
  },
  {
    id: "radio",
    icon: Radio,
    titleKey: "radio.title",
    descKey: "radio.desc",
    accent: "bg-amber-800",
    domain: "Auditory Reminiscence",
    category: "reminiscence",
    recommended: true,
    component: NostalgiaRadioGame,
  },

  // ── DOMAIN 3: ATTENTION & VISUOSPATIAL ORIENTATION ──
  {
    id: "tea-harvest",
    icon: Leaf,
    titleKey: "teaHarvest.title",
    descKey: "teaHarvest.desc",
    accent: "bg-emerald-600",
    domain: "Selective Attention",
    category: "attention",
    recommended: true,
    component: TeaHarvestGame,
  },
  {
    id: "wayfinding",
    icon: Compass,
    titleKey: "wayfinding.title",
    descKey: "wayfinding.desc",
    accent: "bg-emerald-700",
    domain: "Spatial Orientation",
    category: "attention",
    recommended: true,
    component: WayfindingGame,
  },
  {
    id: "root-bridge",
    icon: GitFork,
    titleKey: "rootBridge.title",
    descKey: "rootBridge.desc",
    accent: "bg-green-800",
    domain: "Spatial Strategy",
    category: "attention",
    recommended: false,
    component: RootBridgeGame,
  },
  {
    id: "storybook",
    icon: BookOpen,
    titleKey: "storybook.title",
    descKey: "storybook.desc",
    accent: "bg-amber-800",
    domain: "AI Branching Life Tales",
    category: "attention",
    recommended: true,
    component: StorybookGame,
  },

  // ── DOMAIN 4: EXECUTIVE FUNCTION & DAILY LIFE SKILLS (IADL) ──
  {
    id: "heritage-kitchen",
    icon: Utensils,
    titleKey: "kitchen.title",
    descKey: "kitchen.desc",
    accent: "bg-terracotta",
    domain: "IADL Recipe Sequencing",
    category: "iadl",
    recommended: true,
    component: HeritageKitchenGame,
  },
  {
    id: "bazaar",
    icon: Store,
    titleKey: "bazaar.title",
    descKey: "bazaar.desc",
    accent: "bg-amber-700",
    domain: "AI Market Barter & IADL",
    category: "iadl",
    recommended: true,
    component: BazaarGame,
  },
  {
    id: "sorting",
    icon: Boxes,
    titleKey: "sorting.title",
    descKey: "sorting.desc",
    accent: "bg-tea",
    domain: "Executive Categorisation",
    category: "iadl",
    recommended: false,
    component: SortingGame,
  },
  {
    id: "proverb",
    icon: Quote,
    titleKey: "proverb.title",
    descKey: "proverb.desc",
    accent: "bg-tea",
    domain: "AI Cultural Cloze & Wisdom",
    category: "iadl",
    recommended: true,
    component: ProverbGame,
  },

  // ── DOMAIN 5: SENSORY CALMING & MINDFULNESS ──
  {
    id: "lotus-lake",
    icon: Flower2,
    titleKey: "lotusLake.title",
    descKey: "lotusLake.desc",
    accent: "bg-teal-700",
    domain: "Sensory Calming",
    category: "calm",
    recommended: false,
    component: LotusLakeGame,
  },
];

export const GAME_BY_ID: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
);
