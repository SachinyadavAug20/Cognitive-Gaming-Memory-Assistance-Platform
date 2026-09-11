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
  Waves,
  Feather,
  Clock,
  Boxes,
  Bell,
  Disc3,
  Footprints,
  Flower,
  Sun,
  Brain,
  Wand2,
  Users,
} from "lucide-react";

import dynamic from "next/dynamic";

function GameLoaderFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      <p className="text-base font-semibold text-ink-secondary">Loading activity...</p>
    </div>
  );
}

const AlpanaGame = dynamic(() => import("./alpana/AlpanaGame").then((m) => m.AlpanaGame), { loading: () => <GameLoaderFallback />, ssr: false });
const RiverLanternsGame = dynamic(() => import("./river-lanterns/RiverLanternsGame").then((m) => m.RiverLanternsGame), { loading: () => <GameLoaderFallback />, ssr: false });
const LoomGame = dynamic(() => import("./loom/LoomGame").then((m) => m.LoomGame), { loading: () => <GameLoaderFallback />, ssr: false });
const DrumGame = dynamic(() => import("./drum/DrumGame").then((m) => m.DrumGame), { loading: () => <GameLoaderFallback />, ssr: false });
const TunedDrumGame = dynamic(() => import("./tuned-drum/TunedDrumGame").then((m) => m.TunedDrumGame), { loading: () => <GameLoaderFallback />, ssr: false });
const HornbillFlightGame = dynamic(() => import("./hornbill-flight/HornbillFlightGame").then((m) => m.HornbillFlightGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MajuliPotteryGame = dynamic(() => import("./majuli-pottery/MajuliPotteryGame").then((m) => m.MajuliPotteryGame), { loading: () => <GameLoaderFallback />, ssr: false });
const BrahmaputraBoatGame = dynamic(() => import("./brahmaputra-boat/BrahmaputraBoatGame").then((m) => m.BrahmaputraBoatGame), { loading: () => <GameLoaderFallback />, ssr: false });
const DzukouBotanistGame = dynamic(() => import("./dzukou-botanist/DzukouBotanistGame").then((m) => m.DzukouBotanistGame), { loading: () => <GameLoaderFallback />, ssr: false });
const GrandchildChatGame = dynamic(() => import("./grandchild-chat/GrandchildChatGame").then((m) => m.GrandchildChatGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MemoryDetectiveGame = dynamic(() => import("./memory-detective/MemoryDetectiveGame").then((m) => m.MemoryDetectiveGame), { loading: () => <GameLoaderFallback />, ssr: false });
const StorybookGame = dynamic(() => import("./storybook/StorybookGame").then((m) => m.StorybookGame), { loading: () => <GameLoaderFallback />, ssr: false });
const JigsawGame = dynamic(() => import("./jigsaw/JigsawGame").then((m) => m.JigsawGame), { loading: () => <GameLoaderFallback />, ssr: false });
const WayfindingGame = dynamic(() => import("./wayfinding/WayfindingGame").then((m) => m.WayfindingGame), { loading: () => <GameLoaderFallback />, ssr: false });
const TeaHarvestGame = dynamic(() => import("./tea-harvest/TeaHarvestGame").then((m) => m.TeaHarvestGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MonasteryBellGame = dynamic(() => import("./monastery-bell/MonasteryBellGame").then((m) => m.MonasteryBellGame), { loading: () => <GameLoaderFallback />, ssr: false });
const NostalgiaRadioGame = dynamic(() => import("./radio/NostalgiaRadioGame").then((m) => m.NostalgiaRadioGame), { loading: () => <GameLoaderFallback />, ssr: false });
const HeritageKitchenGame = dynamic(() => import("./heritage-kitchen/HeritageKitchenGame").then((m) => m.HeritageKitchenGame), { loading: () => <GameLoaderFallback />, ssr: false });
const RootBridgeGame = dynamic(() => import("./root-bridge/RootBridgeGame").then((m) => m.RootBridgeGame), { loading: () => <GameLoaderFallback />, ssr: false });
const DailyCareRoutineGame = dynamic(() => import("./daily-routine/DailyCareRoutineGame").then((m) => m.DailyCareRoutineGame), { loading: () => <GameLoaderFallback />, ssr: false });
const TimelineGame = dynamic(() => import("./timeline/TimelineGame").then((m) => m.TimelineGame), { loading: () => <GameLoaderFallback />, ssr: false });
const SortingGame = dynamic(() => import("./sorting/SortingGame").then((m) => m.SortingGame), { loading: () => <GameLoaderFallback />, ssr: false });
const ArrowEscape = dynamic(() => import("@/components/games/ArrowEscape").then((m) => m.ArrowEscape), { loading: () => <GameLoaderFallback />, ssr: false });
const MajuliWalk3D = dynamic(() => import("@/components/games/MajuliWalk3D").then((m) => m.MajuliWalk3D), { loading: () => <GameLoaderFallback />, ssr: false });
const TeaHarvestVision = dynamic(() => import("@/components/games/TeaHarvestVision").then((m) => m.TeaHarvestVision), { loading: () => <GameLoaderFallback />, ssr: false });
const BihuDholBeats = dynamic(() => import("@/components/games/BihuDholBeats").then((m) => m.BihuDholBeats), { loading: () => <GameLoaderFallback />, ssr: false });
const DayInMyWorld3D = dynamic(() => import("@/components/games/DayInMyWorld3D").then((m) => m.DayInMyWorld3D), { loading: () => <GameLoaderFallback />, ssr: false });
const BazaarBuddiesGame = dynamic(() => import("./bazaar-buddies/BazaarBuddiesGame").then((m) => m.BazaarBuddiesGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MemoryGardenGame = dynamic(() => import("./memory-garden/MemoryGardenGame").then((m) => m.MemoryGardenGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MemoryRoadGame = dynamic(() => import("./memory-road/MemoryRoadGame").then((m) => m.MemoryRoadGame), { loading: () => <GameLoaderFallback />, ssr: false });
const TeaGardenCatchGame = dynamic(() => import("./tea-garden-catch/TeaGardenCatchGame").then((m) => m.TeaGardenCatchGame), { loading: () => <GameLoaderFallback />, ssr: false });
const ButterflySanctuaryGame = dynamic(() => import("./butterfly-sanctuary/ButterflySanctuaryGame").then((m) => m.ButterflySanctuaryGame), { loading: () => <GameLoaderFallback />, ssr: false });
const LotusPainterGame = dynamic(() => import("./lotus-painter/LotusPainterGame").then((m) => m.LotusPainterGame), { loading: () => <GameLoaderFallback />, ssr: false });
const MakeMyTeaGame = dynamic(() => import("./daily-tasks/MakeMyTeaGame").then((m) => m.MakeMyTeaGame), { loading: () => <GameLoaderFallback />, ssr: false });
const CompanionGame = dynamic(() => import("./companion/CompanionGame").then((m) => m.CompanionGame), { loading: () => <GameLoaderFallback />, ssr: false });
const RhythmHillsGame = dynamic(() => import("./rhythm-hills/RhythmHillsGame").then((m) => m.RhythmHillsGame), { loading: () => <GameLoaderFallback />, ssr: false });
const WeavingGame = dynamic(() => import("./weaving/WeavingGame").then((m) => m.WeavingGame), { loading: () => <GameLoaderFallback />, ssr: false });

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
    accent: "bg-emerald-950",
    domain: "Painting Lotus Flowers",
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
    domain: "Butterflies in the Garden",
    category: "vision-3d",
    recommended: true,
    component: ButterflySanctuaryGame,
  },
  {
    id: "tea-garden-catch",
    icon: Leaf,
    titleKey: "teaGardenCatch.title",
    descKey: "teaGardenCatch.desc",
    accent: "bg-emerald-900",
    domain: "Picking Tea Leaves",
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
    domain: "Drawing Rangoli Patterns",
    category: "vision-3d",
    recommended: true,
    component: AlpanaGame,
  },
  {
    id: "river-lanterns",
    icon: Waves,
    titleKey: "riverLanterns.title",
    descKey: "riverLanterns.desc",
    accent: "bg-emerald-800",
    domain: "Floating River Lanterns",
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
    domain: "Weaving on the Loom",
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
    domain: "Playing the Drum",
    category: "vision-3d",
    recommended: true,
    component: DrumGame,
  },
  {
    id: "tuned-drum",
    icon: Wand2,
    titleKey: "tunedDrum.title",
    descKey: "tunedDrum.desc",
    accent: "bg-amber-800",
    domain: "Music Drum Circle",
    category: "vision-3d",
    recommended: true,
    component: TunedDrumGame,
  },
  {
    id: "hornbill-flight",
    icon: Feather,
    titleKey: "hornbill.title",
    descKey: "hornbill.desc",
    accent: "bg-amber-800",
    domain: "Bird Flying in the Hills",
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
    domain: "Making Clay Pots",
    category: "vision-3d",
    recommended: true,
    component: MajuliPotteryGame,
  },

  // ── DOMAIN 2: AUTOBIOGRAPHICAL REMINISCENCE & MEMORY RETRIEVAL (6 Modules) ──
  {
    id: "grandchild-chat",
    icon: Coffee,
    titleKey: "grandchildChat.title",
    descKey: "grandchildChat.desc",
    accent: "bg-tea",
    domain: "Morning Tea with Grandchild",
    category: "reminiscence",
    recommended: true,
    component: GrandchildChatGame,
  },
  {
    id: "memory-detective",
    icon: Users,
    titleKey: "memoryDetective.title",
    descKey: "memoryDetective.desc",
    accent: "bg-amber-800",
    domain: "Remembering Family & Friends",
    category: "reminiscence",
    recommended: true,
    component: MemoryDetectiveGame,
  },
  {
    id: "timeline",
    icon: Clock,
    titleKey: "timeline.title",
    descKey: "timeline.desc",
    accent: "bg-tea",
    domain: "My Life Story",
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
    domain: "Picture Puzzle",
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
    domain: "Listening to the Radio",
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
    domain: "Picking Tea Leaves",
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
    domain: "Temple Bell Sounds",
    category: "attention",
    recommended: true,
    component: MonasteryBellGame,
  },
  {
    id: "brahmaputra-boat",
    icon: Compass,
    titleKey: "boat.title",
    descKey: "boat.desc",
    accent: "bg-emerald-900",
    domain: "River Boat Ride",
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
    domain: "Finding Valley Flowers",
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
    domain: "Finding the Way Home",
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
    domain: "Crossing the Root Bridge",
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
    domain: "Grandmother's Storybook",
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
    domain: "My Daily Routine",
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
    domain: "Cooking in the Kitchen",
    category: "iadl",
    recommended: true,
    component: HeritageKitchenGame,
  },
  {
    id: "sorting",
    icon: Boxes,
    titleKey: "sorting.title",
    descKey: "sorting.desc",
    accent: "bg-tea",
    domain: "Sorting Household Items",
    category: "iadl",
    recommended: false,
    component: SortingGame,
  },

  // ── DOMAIN 5: SENSORY CALMING & MINDFULNESS (1 Module) ──

  // ── DOMAIN 6: SPATIAL VECTOR RECOGNITION & PLANNING (1 Module) ──
  {
    id: "arrow-escape",
    icon: Compass,
    titleKey: "arrowEscape.title",
    descKey: "arrowEscape.desc",
    accent: "bg-[#5C3D2E]",
    domain: "Follow the Arrows",
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
    domain: "Walking Through the Village",
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
    domain: "Picking Tea Leaves with Hands",
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
    domain: "Bihu Drum Beats",
    category: "calm",
    recommended: true,
    component: BihuDholBeats,
  },

  {
    id: "day-in-my-world",
    icon: Sun,
    titleKey: "dayInMyWorld.title",
    descKey: "dayInMyWorld.subtitle",
    accent: "bg-[#D97706]",
    domain: "A Day in My Village",
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
    domain: "Going to the Market",
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
    domain: "Flower Garden Memories",
    category: "attention",
    recommended: true,
    component: MemoryGardenGame,
  },
  {
    id: "memory-road",
    icon: Compass,
    titleKey: "memoryRoad.title",
    descKey: "memoryRoad.desc",
    accent: "bg-[#C2410C]",
    domain: "Finding Signs on the Road",
    category: "attention",
    recommended: true,
    component: MemoryRoadGame,
  },
  {
    id: "daily-tasks",
    icon: Coffee,
    titleKey: "dailyTasks.title",
    descKey: "dailyTasks.desc",
    accent: "bg-[#C2410C]",
    domain: "Making Warm Red Tea",
    category: "iadl",
    recommended: true,
    component: MakeMyTeaGame,
  },
  {
    id: "companion",
    icon: Brain,
    titleKey: "companion.title",
    descKey: "companion.desc",
    accent: "bg-[#4C1D95]",
    domain: "Friendly Chat with Saathi",
    category: "reminiscence",
    recommended: true,
    component: CompanionGame,
  },
  {
    id: "rhythm-hills",
    icon: Music,
    titleKey: "rhythmHills.title",
    descKey: "rhythmHills.desc",
    accent: "bg-[#B45309]",
    domain: "Gentle Drum Songs",
    category: "calm",
    recommended: true,
    component: RhythmHillsGame,
  },
  {
    id: "weaving",
    icon: Grid3X3,
    titleKey: "weaving.title",
    descKey: "weaving.desc",
    accent: "bg-[#5C3D2E]",
    domain: "Weaving Flower Patterns",
    category: "attention",
    recommended: true,
    component: WeavingGame,
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
    domain: "Follow the Arrows",
    category: "attention",
    recommended: true,
    component: ArrowEscape,
  },
};
