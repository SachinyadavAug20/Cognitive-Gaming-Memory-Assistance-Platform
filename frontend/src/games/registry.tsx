import type { ComponentType } from "react";
import { MemoryMatchGame } from "./memory/MemoryMatchGame";
import { WayfindingGame } from "./wayfinding/WayfindingGame";
import { MakeMyTeaGame } from "./daily-tasks/MakeMyTeaGame";
import { SortingGame } from "./sorting/SortingGame";
import { CompanionGame } from "./companion/CompanionGame";

export interface GameDef {
  id: string;
  emoji: string;
  titleKey: string;
  descKey: string;
  accent: string;
  recommended?: boolean;
  component: ComponentType;
}

export const GAMES: GameDef[] = [
  {
    id: "memory",
    emoji: "🧩",
    titleKey: "memory.title",
    descKey: "memory.desc",
    accent: "bg-tea",
    recommended: true,
    component: MemoryMatchGame,
  },
  {
    id: "wayfinding",
    emoji: "🗺️",
    titleKey: "wayfinding.title",
    descKey: "wayfinding.desc",
    accent: "bg-tea",
    recommended: true,
    component: WayfindingGame,
  },
  {
    id: "daily-tasks",
    emoji: "🍵",
    titleKey: "dailyTasks.title",
    descKey: "dailyTasks.desc",
    accent: "bg-marigold",
    recommended: true,
    component: MakeMyTeaGame,
  },
  {
    id: "sorting",
    emoji: "🧺",
    titleKey: "sorting.title",
    descKey: "sorting.desc",
    accent: "bg-marigold",
    component: SortingGame,
  },
  {
    id: "companion",
    emoji: "🧓",
    titleKey: "companion.title",
    descKey: "companion.desc",
    accent: "bg-terracotta",
    component: CompanionGame,
  },
];

export const GAME_BY_ID: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
);