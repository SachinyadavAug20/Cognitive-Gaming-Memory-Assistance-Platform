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
} from "lucide-react";

import { JigsawGame } from "./jigsaw/JigsawGame";
import { WayfindingGame } from "./wayfinding/WayfindingGame";
import { WeavingGame } from "./weaving/WeavingGame";
import { TeaHarvestGame } from "./tea-harvest/TeaHarvestGame";
import { NostalgiaRadioGame } from "./radio/NostalgiaRadioGame";
import { LotusLakeGame } from "./lotus-lake/LotusLakeGame";
import { HeritageKitchenGame } from "./heritage-kitchen/HeritageKitchenGame";
import { RhythmHillsGame } from "./rhythm-hills/RhythmHillsGame";
import { RootBridgeGame } from "./root-bridge/RootBridgeGame";
import { GrandchildChatGame } from "./grandchild-chat/GrandchildChatGame";
import { MemoryDetectiveGame } from "./memory-detective/MemoryDetectiveGame";
import { StorybookGame } from "./storybook/StorybookGame";
import { BazaarGame } from "./bazaar/BazaarGame";
import { ProverbGame } from "./proverb/ProverbGame";
import { RiverLanternsGame } from "./river-lanterns/RiverLanternsGame";
import { LoomGame } from "./loom/LoomGame";
import { DrumGame } from "./drum/DrumGame";
import { MemoirScribeGame } from "./memoir-scribe/MemoirScribeGame";

export interface GameDef {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  accent: string;
  domain: string;
  recommended?: boolean;
  component: ComponentType;
}

export const GAMES: GameDef[] = [
  {
    id: "river-lanterns",
    icon: Waves,
    titleKey: "riverLanterns.title",
    descKey: "riverLanterns.desc",
    accent: "bg-teal-800",
    domain: "3D Graphics & Optical Vision",
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
    recommended: true,
    component: DrumGame,
  },
  {
    id: "memoir-scribe",
    icon: Feather,
    titleKey: "memoirScribe.title",
    descKey: "memoirScribe.desc",
    accent: "bg-purple-900",
    domain: "AI Narrative Living Memoirs",
    recommended: true,
    component: MemoirScribeGame,
  },
  {
    id: "grandchild-chat",
    icon: Coffee,
    titleKey: "grandchildChat.title",
    descKey: "grandchildChat.desc",
    accent: "bg-tea",
    domain: "AI Conversational Reminiscence",
    recommended: true,
    component: GrandchildChatGame,
  },
  {
    id: "bazaar",
    icon: Store,
    titleKey: "bazaar.title",
    descKey: "bazaar.desc",
    accent: "bg-amber-700",
    domain: "AI Market Barter & IADL",
    recommended: true,
    component: BazaarGame,
  },
  {
    id: "proverb",
    icon: Quote,
    titleKey: "proverb.title",
    descKey: "proverb.desc",
    accent: "bg-tea",
    domain: "AI Cultural Cloze & Wisdom",
    recommended: true,
    component: ProverbGame,
  },
  {
    id: "memory-detective",
    icon: Search,
    titleKey: "memoryDetective.title",
    descKey: "memoryDetective.desc",
    accent: "bg-marigold",
    domain: "AI Clue & Face Recognition",
    recommended: true,
    component: MemoryDetectiveGame,
  },
  {
    id: "storybook",
    icon: BookOpen,
    titleKey: "storybook.title",
    descKey: "storybook.desc",
    accent: "bg-amber-800",
    domain: "AI Branching Life Tales",
    recommended: true,
    component: StorybookGame,
  },
  {
    id: "jigsaw",
    icon: Grid3X3,
    titleKey: "jigsaw.title",
    descKey: "jigsaw.desc",
    accent: "bg-tea",
    domain: "Visuospatial & Memory",
    recommended: true,
    component: JigsawGame,
  },
  {
    id: "wayfinding",
    icon: Compass,
    titleKey: "wayfinding.title",
    descKey: "wayfinding.desc",
    accent: "bg-emerald-700",
    domain: "Spatial Orientation",
    recommended: true,
    component: WayfindingGame,
  },
  {
    id: "weaving",
    icon: Sparkles,
    titleKey: "weaving.title",
    descKey: "weaving.desc",
    accent: "bg-amber-600",
    domain: "Constructional Praxis",
    recommended: false,
    component: WeavingGame,
  },
  {
    id: "tea-harvest",
    icon: Leaf,
    titleKey: "teaHarvest.title",
    descKey: "teaHarvest.desc",
    accent: "bg-emerald-600",
    domain: "Selective Attention",
    recommended: true,
    component: TeaHarvestGame,
  },
  {
    id: "radio",
    icon: Radio,
    titleKey: "radio.title",
    descKey: "radio.desc",
    accent: "bg-amber-800",
    domain: "Auditory Reminiscence",
    recommended: true,
    component: NostalgiaRadioGame,
  },
  {
    id: "lotusLake",
    icon: Flower2,
    titleKey: "lotusLake.title",
    descKey: "lotusLake.desc",
    accent: "bg-teal-700",
    domain: "Sensory Calming",
    recommended: false,
    component: LotusLakeGame,
  },
  {
    id: "heritage-kitchen",
    icon: Utensils,
    titleKey: "kitchen.title",
    descKey: "kitchen.desc",
    accent: "bg-terracotta",
    domain: "IADL Daily Sequencing",
    recommended: false,
    component: HeritageKitchenGame,
  },
  {
    id: "rhythm-hills",
    icon: Music,
    titleKey: "rhythmHills.title",
    descKey: "rhythmHills.desc",
    accent: "bg-marigold",
    domain: "Motor Entrainment",
    recommended: false,
    component: RhythmHillsGame,
  },
  {
    id: "root-bridge",
    icon: GitFork,
    titleKey: "rootBridge.title",
    descKey: "rootBridge.desc",
    accent: "bg-green-800",
    domain: "Spatial Strategy",
    recommended: false,
    component: RootBridgeGame,
  },
];

export const GAME_BY_ID: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
);
