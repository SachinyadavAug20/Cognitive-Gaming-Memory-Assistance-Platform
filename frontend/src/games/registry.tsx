import type { ComponentType } from "react";
import { JigsawGame } from "./jigsaw/JigsawGame";

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
    id: "jigsaw",
    emoji: "🧩",
    titleKey: "jigsaw.title",
    descKey: "jigsaw.desc",
    accent: "bg-tea",
    recommended: true,
    component: JigsawGame,
  },
];

export const GAME_BY_ID: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
);