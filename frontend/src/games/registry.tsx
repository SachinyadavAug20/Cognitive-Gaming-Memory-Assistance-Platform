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
  Bell,
  Disc3,
  Footprints,
  Flower,
  Sun,
} from "lucide-react";

import { AlpanaGame } from "./alpana/AlpanaGame";
import { RiverLanternsGame } from "./river-lanterns/RiverLanternsGame";
import { LoomGame } from "./loom/LoomGame";
import { DrumGame } from "./drum/DrumGame";
import { HornbillFlightGame } from "./hornbill-flight/HornbillFlightGame";
import { MajuliPotteryGame } from "./majuli-pottery/MajuliPotteryGame";
import { BambooDanceGame } from "./bamboo-dance/BambooDanceGame";
import { BrahmaputraBoatGame } from "./brahmaputra-boat/BrahmaputraBoatGame";
import { DzukouBotanistGame } from "./dzukou-botanist/DzukouBotanistGame";
import { MemoirScribeGame } from "./memoir-scribe/MemoirScribeGame";
import { GrandchildChatGame } from "./grandchild-chat/GrandchildChatGame";
import { MemoryDetectiveGame } from "./memory-detective/MemoryDetectiveGame";
import { StorybookGame } from "./storybook/StorybookGame";
import { BazaarGame } from "./bazaar/BazaarGame";
import { ProverbGame } from "./proverb/ProverbGame";
import { JigsawGame } from "./jigsaw/JigsawGame";
import { WayfindingGame } from "./wayfinding/WayfindingGame";
import { TeaHarvestGame } from "./tea-harvest/TeaHarvestGame";
import { MonasteryBellGame } from "./monastery-bell/MonasteryBellGame";
import { NostalgiaRadioGame } from "./radio/NostalgiaRadioGame";
import { HeritageKitchenGame } from "./heritage-kitchen/HeritageKitchenGame";
import { RootBridgeGame } from "./root-bridge/RootBridgeGame";
import { DailyCareRoutineGame } from "./daily-routine/DailyCareRoutineGame";
import { LotusLakeGame } from "./lotus-lake/LotusLakeGame";
import { TimelineGame } from "./timeline/TimelineGame";
import { SortingGame } from "./sorting/SortingGame";
import { ArrowEscape } from "@/components/games/ArrowEscape";
import { MajuliWalk3D } from "@/components/games/MajuliWalk3D";
import { TeaHarvestVision } from "@/components/games/TeaHarvestVision";
import { BihuDholBeats } from "@/components/games/BihuDholBeats";
import { VoiceOfBrahmaputra } from "@/components/games/VoiceOfBrahmaputra";
import { DayInMyWorld3D } from "@/components/games/DayInMyWorld3D";
import { BazaarBuddiesGame } from "./bazaar-buddies/BazaarBuddiesGame";
import { MemoryGardenGame } from "./memory-garden/MemoryGardenGame";
import { MemoryRoadGame } from "./memory-road/MemoryRoadGame";
import { TeaGardenCatchGame } from "./tea-garden-catch/TeaGardenCatchGame";
import { ButterflySanctuaryGame } from "./butterfly-sanctuary/ButterflySanctuaryGame";
import { LotusPainterGame } from "./lotus-painter/LotusPainterGame";

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
  // ── DOMAIN 1: 3D COMPUTER VISION & KINESTHETIC PRAXIS (10 Modules) ──
  {
    id: "lotus-painter",
    icon: Waves,
    titleKey: "lotusPainter.title",
    descKey: "lotusPainter.desc",
    accent: "bg-teal-950",
    domain: "OpenCV Optical Air-Canvas & Lotus Bloom",
    category: "vision-3d",
    recommended: true,
    component: LotusPainterGame,
  },
  {
    id: "butterfly-sanctuary",
    icon: Flower2,
    titleKey: "butterflySanctuary.title",
    descKey: "butterflySanctuary.desc",
    accent: "bg-purple-900",
    domain: "OpenCV Optical Hand Perch Stabilization",
    category: "vision-3d",
    recommended: true,
    component: ButterflySanctuaryGame,
  },
  {
    id: "tea-garden-catch",
    icon: Leaf,
    titleKey: "teaGardenCatch.title",
    descKey: "teaGardenCatch.desc",
    accent: "bg-teal-900",
    domain: "OpenCV Dual-Hand Kinesthetic Harvest",
    category: "vision-3d",
    recommended: true,
    component: TeaGardenCatchGame,
  },
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
  {
    id: "hornbill-flight",
    icon: Feather,
    titleKey: "hornbill.title",
    descKey: "hornbill.desc",
    accent: "bg-amber-800",
    domain: "Visuomotor Glider Physics",
    category: "vision-3d",
    recommended: true,
    component: HornbillFlightGame,
  },
  {
    id: "majuli-pottery",
    icon: Disc3,
    titleKey: "pottery.title",
    descKey: "pottery.desc",
    accent: "bg-amber-900",
    domain: "Tactile Motor Praxis",
    category: "vision-3d",
    recommended: true,
    component: MajuliPotteryGame,
  },
  {
    id: "bamboo-dance",
    icon: Footprints,
    titleKey: "bambooDance.title",
    descKey: "bambooDance.desc",
    accent: "bg-emerald-900",
    domain: "Visuomotor Rhythm Step",
    category: "vision-3d",
    recommended: true,
    component: BambooDanceGame,
  },

  // ── DOMAIN 2: AUTOBIOGRAPHICAL REMINISCENCE & MEMORY RETRIEVAL (6 Modules) ──
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
    accent: "bg-amber-800",
    domain: "Face & Clue Spaced Retrieval",
    category: "reminiscence",
    recommended: true,
    component: MemoryDetectiveGame,
  },
  {
    id: "memoir-scribe",
    icon: Feather,
    titleKey: "memoirScribe.title",
    descKey: "memoirScribe.desc",
    accent: "bg-amber-900",
    domain: "AI Spoken Memoirs & Scribe",
    category: "reminiscence",
    recommended: true,
    component: MemoirScribeGame,
  },
  {
    id: "timeline",
    icon: Clock,
    titleKey: "timeline.title",
    descKey: "timeline.desc",
    accent: "bg-tea",
    domain: "Chronological Life Milestones",
    category: "reminiscence",
    recommended: false,
    component: TimelineGame,
  },
  {
    id: "jigsaw",
    icon: Grid3X3,
    titleKey: "jigsaw.title",
    descKey: "jigsaw.desc",
    accent: "bg-tea",
    domain: "Visuospatial Family Puzzles",
    category: "reminiscence",
    recommended: true,
    component: JigsawGame,
  },
  {
    id: "radio",
    icon: Radio,
    titleKey: "radio.title",
    descKey: "radio.desc",
    accent: "bg-amber-900",
    domain: "Auditory Vintage Reminiscence",
    category: "reminiscence",
    recommended: false,
    component: NostalgiaRadioGame,
  },

  // ── DOMAIN 3: ATTENTION, WORKING MEMORY & SPATIAL ORIENTATION (7 Modules) ──
  {
    id: "tea-harvest",
    icon: Leaf,
    titleKey: "teaHarvest.title",
    descKey: "teaHarvest.desc",
    accent: "bg-emerald-800",
    domain: "Selective Attention",
    category: "attention",
    recommended: true,
    component: TeaHarvestGame,
  },
  {
    id: "monastery-bell",
    icon: Bell,
    titleKey: "monasteryBell.title",
    descKey: "monasteryBell.desc",
    accent: "bg-purple-900",
    domain: "Auditory Working Memory Span",
    category: "attention",
    recommended: true,
    component: MonasteryBellGame,
  },
  {
    id: "brahmaputra-boat",
    icon: Compass,
    titleKey: "boat.title",
    descKey: "boat.desc",
    accent: "bg-sky-900",
    domain: "Spatial Navigation & Tracking",
    category: "attention",
    recommended: true,
    component: BrahmaputraBoatGame,
  },
  {
    id: "dzukou-botanist",
    icon: Flower,
    titleKey: "botanist.title",
    descKey: "botanist.desc",
    accent: "bg-emerald-950",
    domain: "Visual Discrimination & Search",
    category: "attention",
    recommended: true,
    component: DzukouBotanistGame,
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

  // ── DOMAIN 4: EXECUTIVE FUNCTION & DAILY LIFE SKILLS (IADL) (5 Modules) ──
  {
    id: "daily-routine",
    icon: Clock,
    titleKey: "dailyRoutine.title",
    descKey: "dailyRoutine.desc",
    accent: "bg-amber-800",
    domain: "Prospective Memory & Routine",
    category: "iadl",
    recommended: true,
    component: DailyCareRoutineGame,
  },
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

  // ── DOMAIN 5: SENSORY CALMING & MINDFULNESS (1 Module) ──
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

  // ── DOMAIN 6: SPATIAL VECTOR RECOGNITION & PLANNING (1 Module) ──
  {
    id: "arrow-escape",
    icon: Compass,
    titleKey: "arrowEscape.title",
    descKey: "arrowEscape.desc",
    accent: "bg-[#5C3D2E]",
    domain: "Spatial Planning & Vector Clearance",
    category: "attention",
    recommended: true,
    component: ArrowEscape,
  },

  // ── DOMAIN 7: ADVANCED SPATIAL 3D & WEBCAM VISION MODULES ──
  {
    id: "majuli-walk",
    icon: Footprints,
    titleKey: "majuliWalk.title",
    descKey: "majuliWalk.desc",
    accent: "bg-[#2D5A27]",
    domain: "3D Spatial Memory Navigation",
    category: "vision-3d",
    recommended: true,
    component: MajuliWalk3D,
  },
  {
    id: "tea-harvest-vision",
    icon: Leaf,
    titleKey: "teaHarvestVision.title",
    descKey: "teaHarvestVision.desc",
    accent: "bg-[#14532D]",
    domain: "OpenCV Motion Tracking Harvest",
    category: "vision-3d",
    recommended: true,
    component: TeaHarvestVision,
  },
  {
    id: "bihu-dhol",
    icon: Music,
    titleKey: "bihuDhol.title",
    descKey: "bihuDhol.desc",
    accent: "bg-[#78350F]",
    domain: "Adaptive Acoustic Drum Rhythm",
    category: "calm",
    recommended: true,
    component: BihuDholBeats,
  },
  {
    id: "brahmaputra-voice",
    icon: Waves,
    titleKey: "brahmaputraVoice.title",
    descKey: "brahmaputraVoice.subtitle",
    accent: "bg-[#0F2B38]",
    domain: "Spoken Proverb Recall & River Glow Canvas",
    category: "reminiscence",
    recommended: true,
    component: VoiceOfBrahmaputra,
  },
  {
    id: "day-in-my-world",
    icon: Sun,
    titleKey: "dayInMyWorld.title",
    descKey: "dayInMyWorld.subtitle",
    accent: "bg-[#D97706]",
    domain: "6-Chapter 3D Story Campaign & Saathi AI",
    category: "reminiscence",
    recommended: true,
    component: DayInMyWorld3D,
  },
  {
    id: "bazaar-buddies",
    icon: Store,
    titleKey: "bazaarBuddies.title",
    descKey: "bazaarBuddies.desc",
    accent: "bg-[#059669]",
    domain: "IADL Budget & Money Management",
    category: "iadl",
    recommended: true,
    component: BazaarBuddiesGame,
  },
  {
    id: "memory-garden",
    icon: Flower,
    titleKey: "memoryGarden.title",
    descKey: "memoryGarden.desc",
    accent: "bg-[#7C3AED]",
    domain: "Multi-Activity Memory Suite",
    category: "attention",
    recommended: true,
    component: MemoryGardenGame,
  },
  {
    id: "memory-road",
    icon: Compass,
    titleKey: "memoryRoad.title",
    descKey: "memoryRoad.desc",
    accent: "bg-[#2563EB]",
    domain: "Road Safety & Visual Search",
    category: "attention",
    recommended: true,
    component: MemoryRoadGame,
  },
];

export const GAME_BY_ID: Record<string, GameDef> = {
  ...Object.fromEntries(GAMES.map((g) => [g.id, g])),
  pathways: {
    id: "pathways",
    icon: Compass,
    titleKey: "arrowEscape.title",
    descKey: "arrowEscape.desc",
    accent: "bg-[#5C3D2E]",
    domain: "Spatial Planning & Vector Clearance",
    category: "attention",
    recommended: true,
    component: ArrowEscape,
  },
  "majuli-walk": {
    id: "majuli-walk",
    icon: Footprints,
    titleKey: "majuliWalk.title",
    descKey: "majuliWalk.desc",
    accent: "bg-[#2D5A27]",
    domain: "3D Spatial Memory Navigation",
    category: "vision-3d",
    recommended: true,
    component: MajuliWalk3D,
  },
  "tea-harvest-vision": {
    id: "tea-harvest-vision",
    icon: Leaf,
    titleKey: "teaHarvestVision.title",
    descKey: "teaHarvestVision.desc",
    accent: "bg-[#14532D]",
    domain: "OpenCV Motion Tracking Harvest",
    category: "vision-3d",
    recommended: true,
    component: TeaHarvestVision,
  },
  "bihu-dhol": {
    id: "bihu-dhol",
    icon: Music,
    titleKey: "bihuDhol.title",
    descKey: "bihuDhol.desc",
    accent: "bg-[#78350F]",
    domain: "Adaptive Acoustic Drum Rhythm",
    category: "calm",
    recommended: true,
    component: BihuDholBeats,
  },
  "brahmaputra-voice": {
    id: "brahmaputra-voice",
    icon: Waves,
    titleKey: "brahmaputraVoice.title",
    descKey: "brahmaputraVoice.subtitle",
    accent: "bg-[#0F2B38]",
    domain: "Spoken Proverb Recall & River Glow Canvas",
    category: "reminiscence",
    recommended: true,
    component: VoiceOfBrahmaputra,
  },
  "day-in-my-world": {
    id: "day-in-my-world",
    icon: Sun,
    titleKey: "dayInMyWorld.title",
    descKey: "dayInMyWorld.subtitle",
    accent: "bg-[#D97706]",
    domain: "6-Chapter 3D Story Campaign & Saathi AI",
    category: "reminiscence",
    recommended: true,
    component: DayInMyWorld3D,
  },
  "bazaar-buddies": {
    id: "bazaar-buddies",
    icon: Store,
    titleKey: "bazaarBuddies.title",
    descKey: "bazaarBuddies.desc",
    accent: "bg-[#059669]",
    domain: "IADL Budget & Money Management",
    category: "iadl",
    recommended: true,
    component: BazaarBuddiesGame,
  },
  "memory-garden": {
    id: "memory-garden",
    icon: Flower,
    titleKey: "memoryGarden.title",
    descKey: "memoryGarden.desc",
    accent: "bg-[#7C3AED]",
    domain: "Multi-Activity Memory Suite",
    category: "attention",
    recommended: true,
    component: MemoryGardenGame,
  },
  "memory-road": {
    id: "memory-road",
    icon: Compass,
    titleKey: "memoryRoad.title",
    descKey: "memoryRoad.desc",
    accent: "bg-[#2563EB]",
    domain: "Road Safety & Visual Search",
    category: "attention",
    recommended: true,
    component: MemoryRoadGame,
  },
};
