import type { ComponentType } from "react";
import { JigsawGame } from "./jigsaw/JigsawGame";
import { WayfindingGame } from "./wayfinding/WayfindingGame";
import { WeavingGame } from "./weaving/WeavingGame";
import { TeaHarvestGame } from "./tea-harvest/TeaHarvestGame";
import { NostalgiaRadioGame } from "./radio/NostalgiaRadioGame";
import { LotusLakeGame } from "./lotus-lake/LotusLakeGame";
import { HeritageKitchenGame } from "./heritage-kitchen/HeritageKitchenGame";
import { RhythmHillsGame } from "./rhythm-hills/RhythmHillsGame";
import { RootBridgeGame } from "./root-bridge/RootBridgeGame";

export interface GameDef {
  id: string;
  emoji: string;
  titleKey: string;
  descKey: string;
  accent: string;
  domain: string;
  recommended?: boolean;
  component: ComponentType;
}

export const GAMES: GameDef[] = [
  {
    id: "jigsaw",
    emoji: "🧩",
    titleKey: "jigsaw.title",
    descKey: "jigsaw.desc",
    accent: "bg-tea",
    domain: "Visuospatial & Memory",
    recommended: true,
    component: JigsawGame,
  },
  {
    id: "wayfinding",
    emoji: "🗺️",
    titleKey: "wayfinding.title",
    descKey: "wayfinding.desc",
    accent: "bg-emerald-700",
    domain: "Spatial Orientation",
    recommended: true,
    component: WayfindingGame,
  },
  {
    id: "weaving",
    emoji: "🧵",
    titleKey: "weaving.title",
    descKey: "weaving.desc",
    accent: "bg-amber-600",
    domain: "Constructional Praxis",
    recommended: true,
    component: WeavingGame,
  },
  {
    id: "tea-harvest",
    emoji: "🌿",
    titleKey: "teaHarvest.title",
    descKey: "teaHarvest.desc",
    accent: "bg-emerald-600",
    domain: "Selective Attention",
    recommended: true,
    component: TeaHarvestGame,
  },
  {
    id: "radio",
    emoji: "📻",
    titleKey: "radio.title",
    descKey: "radio.desc",
    accent: "bg-amber-800",
    domain: "Auditory Reminiscence",
    recommended: true,
    component: NostalgiaRadioGame,
  },
  {
    id: "lotus-lake",
    emoji: "🌸",
    titleKey: "lotusLake.title",
    descKey: "lotusLake.desc",
    accent: "bg-teal-700",
    domain: "Sensory Calming",
    recommended: false,
    component: LotusLakeGame,
  },
  {
    id: "heritage-kitchen",
    emoji: "🍲",
    titleKey: "kitchen.title",
    descKey: "kitchen.desc",
    accent: "bg-terracotta",
    domain: "IADL Daily Sequencing",
    recommended: false,
    component: HeritageKitchenGame,
  },
  {
    id: "rhythm-hills",
    emoji: "🪕",
    titleKey: "rhythmHills.title",
    descKey: "rhythmHills.desc",
    accent: "bg-marigold",
    domain: "Motor Entrainment",
    recommended: false,
    component: RhythmHillsGame,
  },
  {
    id: "root-bridge",
    emoji: "🌳",
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