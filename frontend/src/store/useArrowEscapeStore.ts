"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Direction = "up" | "down" | "left" | "right";
export type ColorTheme = "muga" | "scarlet" | "teal" | "emerald";

export interface ArrowTile {
  id: string;
  row: number; // 0 to gridSize - 1
  col: number; // 0 to gridSize - 1
  direction: Direction;
  colorTheme: ColorTheme;
  isExiting?: boolean;
  exitDir?: Direction;
  isJiggling?: boolean;
  highlighted?: boolean;
}

export interface MoveLog {
  timestamp: number;
  arrowId: string;
  row: number;
  col: number;
  direction: Direction;
  result: "escaped" | "blocked";
  blockedById?: string;
  latencyMs: number;
}

export interface AIRecommendation {
  nextGridSize: number;
  targetDensity: number;
  cognitiveProfile: {
    spatialOrientationScore: number;
    planningAccuracy: number;
    impulsivityIndex: number;
  };
  clinicalObservation: string;
  recommendedPacing: "gentle" | "standard" | "stimulating";
}

export const ARROW_ESCAPE_STORAGE_KEY = "cognicare-arrow-escape-store";

/**
 * Checks if the ray path from the arrow to the grid perimeter in its pointing direction
 * has zero obstacles.
 */
export function isArrowPathClear(
  arrow: ArrowTile,
  allArrows: ArrowTile[],
  _gridSize: number
): boolean {
  const { row, col, direction, id } = arrow;

  if (direction === "up") {
    return !allArrows.some((a) => a.id !== id && !a.isExiting && a.col === col && a.row < row);
  }
  if (direction === "down") {
    return !allArrows.some((a) => a.id !== id && !a.isExiting && a.col === col && a.row > row);
  }
  if (direction === "left") {
    return !allArrows.some((a) => a.id !== id && !a.isExiting && a.row === row && a.col < col);
  }
  if (direction === "right") {
    return !allArrows.some((a) => a.id !== id && !a.isExiting && a.row === row && a.col > col);
  }
  return true;
}

/**
 * Finds the specific arrow that is obstructing the target arrow's path, if any.
 */
export function findBlockingArrow(
  arrow: ArrowTile,
  allArrows: ArrowTile[]
): ArrowTile | undefined {
  const { row, col, direction, id } = arrow;

  const obstacles = allArrows.filter((a) => a.id !== id && !a.isExiting);

  if (direction === "up") {
    const blockers = obstacles
      .filter((a) => a.col === col && a.row < row)
      .sort((a, b) => b.row - a.row); // Closest one to target
    return blockers[0];
  }
  if (direction === "down") {
    const blockers = obstacles
      .filter((a) => a.col === col && a.row > row)
      .sort((a, b) => a.row - b.row);
    return blockers[0];
  }
  if (direction === "left") {
    const blockers = obstacles
      .filter((a) => a.row === row && a.col < col)
      .sort((a, b) => b.col - a.col);
    return blockers[0];
  }
  if (direction === "right") {
    const blockers = obstacles
      .filter((a) => a.row === row && a.col > col)
      .sort((a, b) => a.col - b.col);
    return blockers[0];
  }
  return undefined;
}

/**
 * Validates solvability by simulating unblocking steps until the board is empty.
 */
export function verifySolvability(initialArrows: ArrowTile[], gridSize: number): boolean {
  let remaining = [...initialArrows];
  while (remaining.length > 0) {
    const unblocked = remaining.find((a) => isArrowPathClear(a, remaining, gridSize));
    if (!unblocked) return false;
    remaining = remaining.filter((a) => a.id !== unblocked.id);
  }
  return true;
}

function themeForDirection(dir: Direction): ColorTheme {
  switch (dir) {
    case "up":
      return "muga";
    case "down":
      return "teal";
    case "left":
      return "scarlet";
    case "right":
      return "emerald";
  }
}

/**
 * Handcrafted culturally themed level archetypes for levels 1 to 5.
 */
function getHandcraftedLevel(level: number): { gridSize: number; arrows: ArrowTile[] } {
  switch (level) {
    case 1: {
      // 3x3 Gentle Sunrise introduction (4 arrows, clear escape routes)
      const gridSize = 3;
      const arrows: ArrowTile[] = [
        { id: "1-1", row: 0, col: 1, direction: "up", colorTheme: "muga" },
        { id: "1-2", row: 1, col: 0, direction: "left", colorTheme: "scarlet" },
        { id: "1-3", row: 1, col: 2, direction: "right", colorTheme: "emerald" },
        { id: "1-4", row: 2, col: 1, direction: "down", colorTheme: "teal" },
      ];
      return { gridSize, arrows };
    }
    case 2: {
      // 4x4 Brahmaputra Crossway (7 arrows, gentle step-by-step dependency)
      const gridSize = 4;
      const arrows: ArrowTile[] = [
        { id: "2-1", row: 0, col: 0, direction: "up", colorTheme: "muga" },
        { id: "2-2", row: 0, col: 2, direction: "up", colorTheme: "muga" },
        { id: "2-3", row: 1, col: 2, direction: "up", colorTheme: "muga" }, // Blocks behind 2-2
        { id: "2-4", row: 2, col: 1, direction: "left", colorTheme: "scarlet" },
        { id: "2-5", row: 2, col: 3, direction: "right", colorTheme: "emerald" },
        { id: "2-6", row: 3, col: 1, direction: "down", colorTheme: "teal" },
        { id: "2-7", row: 3, col: 3, direction: "down", colorTheme: "teal" },
      ];
      return { gridSize, arrows };
    }
    case 3: {
      // 4x4 Khorahi Weave (9 arrows with intentional interlocking paths)
      const gridSize = 4;
      const arrows: ArrowTile[] = [
        { id: "3-1", row: 0, col: 1, direction: "up", colorTheme: "muga" },
        { id: "3-2", row: 1, col: 1, direction: "up", colorTheme: "muga" }, // Behind 3-1
        { id: "3-3", row: 1, col: 3, direction: "right", colorTheme: "emerald" },
        { id: "3-4", row: 2, col: 0, direction: "left", colorTheme: "scarlet" },
        { id: "3-5", row: 2, col: 2, direction: "right", colorTheme: "emerald" },
        { id: "3-6", row: 3, col: 0, direction: "down", colorTheme: "teal" },
        { id: "3-7", row: 3, col: 2, direction: "down", colorTheme: "teal" },
        { id: "3-8", row: 0, col: 3, direction: "up", colorTheme: "muga" },
        { id: "3-9", row: 3, col: 3, direction: "down", colorTheme: "teal" },
      ];
      return { gridSize, arrows };
    }
    case 4: {
      // 5x5 Kaziranga Trail (12 arrows, rich spatial discrimination)
      const gridSize = 5;
      const arrows: ArrowTile[] = [
        { id: "4-1", row: 0, col: 0, direction: "up", colorTheme: "muga" },
        { id: "4-2", row: 0, col: 2, direction: "up", colorTheme: "muga" },
        { id: "4-3", row: 0, col: 4, direction: "up", colorTheme: "muga" },
        { id: "4-4", row: 1, col: 2, direction: "left", colorTheme: "scarlet" },
        { id: "4-5", row: 1, col: 4, direction: "up", colorTheme: "muga" },
        { id: "4-6", row: 2, col: 0, direction: "left", colorTheme: "scarlet" },
        { id: "4-7", row: 2, col: 3, direction: "right", colorTheme: "emerald" },
        { id: "4-8", row: 3, col: 1, direction: "down", colorTheme: "teal" },
        { id: "4-9", row: 3, col: 4, direction: "right", colorTheme: "emerald" },
        { id: "4-10", row: 4, col: 0, direction: "down", colorTheme: "teal" },
        { id: "4-11", row: 4, col: 2, direction: "down", colorTheme: "teal" },
        { id: "4-12", row: 4, col: 4, direction: "down", colorTheme: "teal" },
      ];
      return { gridSize, arrows };
    }
    case 5: {
      // 5x5 Muga Silk Tapestry (14 arrows, master artisan level)
      const gridSize = 5;
      const arrows: ArrowTile[] = [
        { id: "5-1", row: 0, col: 1, direction: "up", colorTheme: "muga" },
        { id: "5-2", row: 0, col: 3, direction: "up", colorTheme: "muga" },
        { id: "5-3", row: 1, col: 0, direction: "left", colorTheme: "scarlet" },
        { id: "5-4", row: 1, col: 1, direction: "up", colorTheme: "muga" },
        { id: "5-5", row: 1, col: 3, direction: "right", colorTheme: "emerald" },
        { id: "5-6", row: 1, col: 4, direction: "right", colorTheme: "emerald" },
        { id: "5-7", row: 2, col: 1, direction: "down", colorTheme: "teal" },
        { id: "5-8", row: 2, col: 3, direction: "up", colorTheme: "muga" },
        { id: "5-9", row: 3, col: 0, direction: "left", colorTheme: "scarlet" },
        { id: "5-10", row: 3, col: 2, direction: "down", colorTheme: "teal" },
        { id: "5-11", row: 3, col: 4, direction: "right", colorTheme: "emerald" },
        { id: "5-12", row: 4, col: 1, direction: "down", colorTheme: "teal" },
        { id: "5-13", row: 4, col: 2, direction: "down", colorTheme: "teal" },
        { id: "5-14", row: 4, col: 3, direction: "down", colorTheme: "teal" },
      ];
      return { gridSize, arrows };
    }
    default: {
      return generateProceduralLevel(level);
    }
  }
}

/**
 * Procedurally generates a verified-solvable puzzle for higher levels.
 */
function generateProceduralLevel(level: number, customGridSize?: number): { gridSize: number; arrows: ArrowTile[] } {
  const gridSize = customGridSize || (level <= 6 ? 4 : 5);
  const targetCount = Math.min(gridSize * gridSize - 4, Math.max(6, 6 + level));
  const DIRS: Direction[] = ["up", "down", "left", "right"];

  for (let attempt = 0; attempt < 50; attempt++) {
    const occupied = new Set<string>();
    const arrows: ArrowTile[] = [];

    // Select random unique coordinates
    while (arrows.length < targetCount) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      const key = `${r}-${c}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        arrows.push({
          id: `p-${level}-${arrows.length + 1}`,
          row: r,
          col: c,
          direction: dir,
          colorTheme: themeForDirection(dir),
        });
      }
    }

    if (verifySolvability(arrows, gridSize)) {
      return { gridSize, arrows };
    }
  }

  // Fallback to level 3 if procedural attempts don't converge
  return getHandcraftedLevel(3);
}

export interface ArrowEscapeState {
  level: number;
  gridSize: number;
  arrows: ArrowTile[];
  totalArrowsInLevel: number;
  escapedCount: number;
  successfulMoves: number;
  blockedMoves: number;
  moveHistory: MoveLog[];
  status: "idle" | "playing" | "level_cleared" | "game_completed";
  score: number;
  streak: number;
  bestStreak: number;
  hintActive: boolean;
  hintedArrowId: string | null;
  lastMoveTimestamp: number;
  aiRecommendation: AIRecommendation | null;
  isAiEvaluating: boolean;

  // Actions
  initLevel: (targetLevel?: number, customGridSize?: number) => void;
  tapArrow: (arrowId: string) => { success: boolean; blocker?: ArrowTile };
  clearExitedArrow: (arrowId: string) => void;
  clearJiggle: (arrowId: string) => void;
  toggleHint: () => void;
  resetLevel: () => void;
  nextLevel: () => void;
  evaluatePerformance: () => Promise<AIRecommendation>;
  resetAllProgress: () => void;
}

export const useArrowEscapeStore = create<ArrowEscapeState>()(
  persist(
    (set, get) => ({
      level: 1,
      gridSize: 3,
      arrows: [],
      totalArrowsInLevel: 0,
      escapedCount: 0,
      successfulMoves: 0,
      blockedMoves: 0,
      moveHistory: [],
      status: "idle",
      score: 0,
      streak: 0,
      bestStreak: 0,
      hintActive: false,
      hintedArrowId: null,
      lastMoveTimestamp: Date.now(),
      aiRecommendation: null,
      isAiEvaluating: false,

      initLevel: (targetLevel, customGridSize) => {
        const lvl = targetLevel ?? get().level;
        const { gridSize, arrows } =
          lvl <= 5 && !customGridSize
            ? getHandcraftedLevel(lvl)
            : generateProceduralLevel(lvl, customGridSize);

        set({
          level: lvl,
          gridSize,
          arrows,
          totalArrowsInLevel: arrows.length,
          escapedCount: 0,
          status: "playing",
          hintActive: false,
          hintedArrowId: null,
          lastMoveTimestamp: Date.now(),
        });
      },

      tapArrow: (arrowId: string) => {
        const state = get();
        if (state.status !== "playing") return { success: false };

        const target = state.arrows.find((a) => a.id === arrowId);
        if (!target || target.isExiting) return { success: false };

        const now = Date.now();
        const latencyMs = Math.max(0, now - state.lastMoveTimestamp);
        const isClear = isArrowPathClear(target, state.arrows, state.gridSize);

        if (isClear) {
          // Success: Slide off the board
          const newStreak = state.streak + 1;
          const bestStreak = Math.max(state.bestStreak, newStreak);
          const pointsGained = 20 + newStreak * 5;

          const moveLog: MoveLog = {
            timestamp: now,
            arrowId,
            row: target.row,
            col: target.col,
            direction: target.direction,
            result: "escaped",
            latencyMs,
          };

          const updatedArrows = state.arrows.map((a) =>
            a.id === arrowId
              ? { ...a, isExiting: true, exitDir: a.direction, highlighted: false }
              : a
          );

          const newEscapedCount = state.escapedCount + 1;
          const isLevelCleared = newEscapedCount >= state.totalArrowsInLevel;

          set({
            arrows: updatedArrows,
            escapedCount: newEscapedCount,
            successfulMoves: state.successfulMoves + 1,
            moveHistory: [...state.moveHistory.slice(-100), moveLog],
            score: state.score + pointsGained,
            streak: newStreak,
            bestStreak,
            hintActive: false,
            hintedArrowId: null,
            lastMoveTimestamp: now,
            status: isLevelCleared ? "level_cleared" : "playing",
          });

          return { success: true };
        } else {
          // Blocked: Gentle jiggle, no severe penalty
          const blocker = findBlockingArrow(target, state.arrows);

          const moveLog: MoveLog = {
            timestamp: now,
            arrowId,
            row: target.row,
            col: target.col,
            direction: target.direction,
            result: "blocked",
            blockedById: blocker?.id,
            latencyMs,
          };

          const updatedArrows = state.arrows.map((a) =>
            a.id === arrowId ? { ...a, isJiggling: true } : a
          );

          set({
            arrows: updatedArrows,
            blockedMoves: state.blockedMoves + 1,
            streak: 0,
            moveHistory: [...state.moveHistory.slice(-100), moveLog],
            lastMoveTimestamp: now,
          });

          return { success: false, blocker };
        }
      },

      clearExitedArrow: (arrowId: string) => {
        set((state) => ({
          arrows: state.arrows.filter((a) => a.id !== arrowId),
        }));
      },

      clearJiggle: (arrowId: string) => {
        set((state) => ({
          arrows: state.arrows.map((a) =>
            a.id === arrowId ? { ...a, isJiggling: false } : a
          ),
        }));
      },

      toggleHint: () => {
        const state = get();
        if (state.hintActive) {
          set({ hintActive: false, hintedArrowId: null });
          return;
        }

        // Find an unblocked arrow
        const unblocked = state.arrows.find(
          (a) => !a.isExiting && isArrowPathClear(a, state.arrows, state.gridSize)
        );

        if (unblocked) {
          set({
            hintActive: true,
            hintedArrowId: unblocked.id,
            arrows: state.arrows.map((a) =>
              a.id === unblocked.id ? { ...a, highlighted: true } : { ...a, highlighted: false }
            ),
          });
        }
      },

      resetLevel: () => {
        get().initLevel(get().level);
      },

      nextLevel: () => {
        const nextLvl = get().level + 1;
        get().initLevel(nextLvl);
      },

      /**
       * Evaluates user moves and calls Ollama / local heuristic AI to adapt
       * next level's difficulty, grid dimension, and clinical metrics.
       */
      evaluatePerformance: async (): Promise<AIRecommendation> => {
        set({ isAiEvaluating: true });
        const state = get();

        const totalMoves = state.successfulMoves + state.blockedMoves;
        const accuracyPct = totalMoves > 0 ? (state.successfulMoves / totalMoves) * 100 : 100;
        const avgLatency =
          state.moveHistory.length > 0
            ? state.moveHistory.reduce((acc, m) => acc + m.latencyMs, 0) /
              state.moveHistory.length
            : 1800;

        // Offline cognitive scoring
        const spatialScore = Math.min(100, Math.round(accuracyPct * 0.7 + (state.streak / 5) * 30));
        const planningScore = Math.min(100, Math.round(100 - state.blockedMoves * 8));
        const impulsivityIndex = Math.max(
          0,
          Math.min(10, Math.round((state.blockedMoves / Math.max(1, totalMoves)) * 10))
        );

        let nextGridSize = state.gridSize;
        let targetDensity = 0.55;
        let pacing: "gentle" | "standard" | "stimulating" = "standard";
        let clinicalObservation = "Steady spatial orientation and calm systematic visual search.";

        if (accuracyPct >= 85 && state.level < 5) {
          nextGridSize = Math.min(5, state.gridSize + (state.level % 2 === 0 ? 1 : 0));
          targetDensity = 0.65;
          pacing = "stimulating";
          clinicalObservation =
            "High prospective planning with rapid spatial vector recognition. Ready for higher grid dimensions.";
        } else if (accuracyPct < 60) {
          nextGridSize = Math.max(3, state.gridSize - 1);
          targetDensity = 0.4;
          pacing = "gentle";
          clinicalObservation =
            "Observed minor spatial interference. Adaptive scaffolding enabled with simplified path clearing.";
        }

        const recommendation: AIRecommendation = {
          nextGridSize,
          targetDensity,
          cognitiveProfile: {
            spatialOrientationScore: spatialScore,
            planningAccuracy: planningScore,
            impulsivityIndex,
          },
          clinicalObservation,
          recommendedPacing: pacing,
        };

        try {
          // Attempt call to CogniCare Ollama / AI endpoint if reachable
          const res = await fetch("/api/ai/adapt-level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameId: "arrow-escape",
              level: state.level,
              accuracyPct,
              avgLatency,
              blockedMoves: state.blockedMoves,
              successfulMoves: state.successfulMoves,
              moveHistory: state.moveHistory.slice(-20),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.recommendation) {
              set({ aiRecommendation: data.recommendation, isAiEvaluating: false });
              return data.recommendation;
            }
          }
        } catch {
          // Fallback to offline heuristic analysis (guaranteed zero downtime in rural clinics)
        }

        set({ aiRecommendation: recommendation, isAiEvaluating: false });
        return recommendation;
      },

      resetAllProgress: () => {
        set({
          level: 1,
          score: 0,
          streak: 0,
          bestStreak: 0,
          successfulMoves: 0,
          blockedMoves: 0,
          moveHistory: [],
          status: "idle",
        });
      },
    }),
    {
      name: ARROW_ESCAPE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        level: state.level,
        score: state.score,
        bestStreak: state.bestStreak,
        successfulMoves: state.successfulMoves,
        blockedMoves: state.blockedMoves,
        aiRecommendation: state.aiRecommendation,
      }),
    }
  )
);
