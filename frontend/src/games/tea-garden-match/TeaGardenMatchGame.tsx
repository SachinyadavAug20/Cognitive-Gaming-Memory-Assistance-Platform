"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  Volume2,
  CheckCircle2,
  Droplets,
  Heart,
  Award,
  Zap,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { CaregiverCoPlayPrompt } from "@/components/ui/CaregiverCoPlayPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playEncourage,
  playLeafPluck,
  playChimeTone,
  playWaterRipple,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { SupportedLocale } from "@/lib/gameI18n";

export type TileType = "tea_leaf" | "kopou_orchid" | "cane_basket" | "clay_cup" | "golden_silk";

interface TileDef {
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

interface GridCell {
  id: string;
  type: TileType;
}

interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface SwapAnimationState {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  phase: "sliding" | "reverting";
}

interface BustState {
  coords: Set<string>; // "r,c"
  phase: "highlight" | "burst";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomTileType(pool: TileType[]): TileType {
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function checkMatches(board: GridCell[][], rows: number, cols: number): Set<string> {
  const matchedCoords = new Set<string>();

  // Horizontal matches
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const t = board[r][c].type;
      if (t === board[r][c + 1].type && t === board[r][c + 2].type) {
        matchedCoords.add(`${r},${c}`);
        matchedCoords.add(`${r},${c + 1}`);
        matchedCoords.add(`${r},${c + 2}`);
        let k = c + 3;
        while (k < cols && board[r][k].type === t) {
          matchedCoords.add(`${r},${k}`);
          k++;
        }
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const t = board[r][c].type;
      if (t === board[r + 1][c].type && t === board[r + 2][c].type) {
        matchedCoords.add(`${r},${c}`);
        matchedCoords.add(`${r + 1},${c}`);
        matchedCoords.add(`${r + 2},${c}`);
        let k = r + 3;
        while (k < rows && board[k][c].type === t) {
          matchedCoords.add(`${k},${c}`);
          k++;
        }
      }
    }
  }

  return matchedCoords;
}

function findValidMove(board: GridCell[][], rows: number, cols: number): [[number, number], [number, number]] | null {
  const directions = [
    [0, 1],
    [1, 0],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < rows && nc < cols) {
          // Test swap
          const tempBoard = board.map((row) => row.map((cell) => ({ ...cell })));
          const tmp = tempBoard[r][c];
          tempBoard[r][c] = tempBoard[nr][nc];
          tempBoard[nr][nc] = tmp;

          const matches = checkMatches(tempBoard, rows, cols);
          if (matches.size > 0) {
            return [
              [r, c],
              [nr, nc],
            ];
          }
        }
      }
    }
  }
  return null;
}

function createInitialBoard(rows: number, cols: number, pool: TileType[]): GridCell[][] {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const board: GridCell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < cols; c++) {
        const disallowed = new Set<TileType>();
        if (c >= 2 && row[c - 1].type === row[c - 2].type) {
          disallowed.add(row[c - 1].type);
        }
        if (r >= 2 && board[r - 1][c].type === board[r - 2][c].type) {
          disallowed.add(board[r - 1][c].type);
        }
        const allowed = pool.filter((t) => !disallowed.has(t));
        const chosen = allowed.length > 0 ? getRandomTileType(allowed) : getRandomTileType(pool);
        row.push({
          id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
          type: chosen,
        });
      }
      board.push(row);
    }

    // Ensure at least one valid move exists
    const validMove = findValidMove(board, rows, cols);
    if (validMove) {
      return board;
    }
  }

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
      type: pool[(r + c) % pool.length],
    }))
  );
}

export function TeaGardenMatchGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;

  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const level = resolveAdaptiveLevel(patientId, "teaGardenMatch", startLevel(detail));
  const rate = speechRate(detail);

  // Configuration based on clinical level
  const { rows, cols, pool, goalMatches } = useMemo(() => {
    if (level <= 1) {
      return {
        rows: 4,
        cols: 4,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket"] as TileType[],
        goalMatches: 10,
      };
    } else if (level === 2) {
      return {
        rows: 4,
        cols: 4,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket", "clay_cup"] as TileType[],
        goalMatches: 12,
      };
    } else {
      return {
        rows: 5,
        cols: 5,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket", "clay_cup", "golden_silk"] as TileType[],
        goalMatches: 15,
      };
    }
  }, [level]);

  // Game Board State
  const [board, setBoard] = useState<GridCell[][]>(() => createInitialBoard(rows, cols, pool));
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [matchesCount, setMatchesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation States
  const [swapAnim, setSwapAnim] = useState<SwapAnimationState | null>(null);
  const [bustState, setBustState] = useState<BustState | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [comboBanner, setComboBanner] = useState<string | null>(null);

  // Telemetry & Errorless Hinting
  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [taps, setTaps] = useState(0);
  const [hintCoords, setHintCoords] = useState<[[number, number], [number, number]] | null>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch Swipe tracking
  const touchStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

  // Reset dwell timer
  const resetDwellTimer = useCallback(() => {
    setHintCoords(null);
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
    }
    dwellTimerRef.current = setTimeout(() => {
      setBoard((currentBoard) => {
        const move = findValidMove(currentBoard, rows, cols);
        if (move) {
          setHintCoords(move);
        }
        return currentBoard;
      });
    }, 6000);
  }, [rows, cols]);

  useEffect(() => {
    resetDwellTimer();
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [resetDwellTimer]);

  // Voice greeting on start
  useEffect(() => {
    if (phase === "playing") {
      speak(
        locale === "as"
          ? "চাহ বাগিচা খেললৈ স্বাগতম। একে ধৰণৰ তিনিটা বস্তু মিলাই ব্ৰেষ্ট কৰক।"
          : locale === "hi"
          ? "चाय बागान में स्वागत है। एक जैसे तीन फल या पत्तियां मिलाकर मैच करें।"
          : "Welcome to the Tea Garden. Swap adjacent tiles to match 3 in a row.",
        locale,
        rate
      );
    }
  }, [phase, locale, rate]);

  // Helper to spawn floating score text
  const spawnFloatingScore = useCallback((text: string, r: number, c: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingScores((prev) => [...prev, { id, text, x: c, y: r }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  }, []);

  // -------------------------------------------------------------
  // ANIMATED SWAP & BUST CASCADE PIPELINE
  // -------------------------------------------------------------
  const executeAnimatedSwap = useCallback(
    async (r1: number, c1: number, r2: number, c2: number) => {
      setIsProcessing(true);
      setSelectedCoord(null);
      setHintCoords(null);

      // 1. SLIDING PHASE (Move tiles towards each other)
      setSwapAnim({ r1, c1, r2, c2, phase: "sliding" });
      playPress();
      await sleep(220); // wait for CSS slide transition

      // Check if this swap creates matches
      const testBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      const tmp = testBoard[r1][c1];
      testBoard[r1][c1] = testBoard[r2][c2];
      testBoard[r2][c2] = tmp;

      const matched = checkMatches(testBoard, rows, cols);

      if (matched.size === 0) {
        // INVALID MOVE: Revert slide back smoothly
        setSwapAnim({ r1, c1, r2, c2, phase: "reverting" });
        playEncourage();
        await sleep(200);
        setSwapAnim(null);
        setIsProcessing(false);
        resetDwellTimer();
        return;
      }

      // VALID MOVE: Commit the swapped positions
      setBoard(testBoard);
      setSwapAnim(null);
      playWaterRipple();

      // 2. BUSTING & CASCADE LOOP
      let currentBoard = testBoard;
      let cascadeMatches = matched;
      let comboCount = 0;
      let totalNewMatches = 0;

      while (cascadeMatches.size > 0) {
        comboCount++;
        const matchesInStep = Math.floor(cascadeMatches.size / 3);
        totalNewMatches += matchesInStep;

        // Visual pattern feedback: Highlight the matched line/pattern
        setBustState({ coords: cascadeMatches, phase: "highlight" });
        playLeafPluck();

        // Calculate center of matched tiles for floating score
        let sumR = 0;
        let sumC = 0;
        cascadeMatches.forEach((coordStr) => {
          const [mr, mc] = coordStr.split(",").map(Number);
          sumR += mr;
          sumC += mc;
        });
        const centerR = sumR / cascadeMatches.size;
        const centerC = sumC / cascadeMatches.size;

        if (comboCount > 1) {
          playChimeTone(550 + comboCount * 60);
          setComboBanner(
            locale === "as"
              ? `✨ সুন্দৰ কম্বো! x${comboCount}`
              : locale === "hi"
              ? `✨ शानदार कॉम्बो! x${comboCount}`
              : `✨ Splendid Combo! x${comboCount}`
          );
          spawnFloatingScore(`Combo x${comboCount} (+${matchesInStep * 40})`, centerR, centerC);
        } else {
          spawnFloatingScore(`+${matchesInStep * 30} 🍃`, centerR, centerC);
        }

        await sleep(280); // let the player see the matched pattern clearly

        // Burst / pop tiles into nothingness
        setBustState({ coords: cascadeMatches, phase: "burst" });
        await sleep(200); // let burst animation complete

        // Clear matched tiles from board
        const clearedBoard = currentBoard.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (cascadeMatches.has(`${rowIdx},${colIdx}`)) {
              return { id: "", type: "tea_leaf" as TileType };
            }
            return cell;
          })
        );

        // GRAVITY: drop remaining tiles down into empty spaces
        for (let colIdx = 0; colIdx < cols; colIdx++) {
          const colTiles: GridCell[] = [];
          for (let rowIdx = rows - 1; rowIdx >= 0; rowIdx--) {
            if (clearedBoard[rowIdx][colIdx].id !== "") {
              colTiles.push(clearedBoard[rowIdx][colIdx]);
            }
          }
          for (let rowIdx = rows - 1; rowIdx >= 0; rowIdx--) {
            const existing = colTiles[rows - 1 - rowIdx];
            if (existing) {
              clearedBoard[rowIdx][colIdx] = existing;
            } else {
              clearedBoard[rowIdx][colIdx] = {
                id: `${rowIdx}-${colIdx}-${Math.random().toString(36).substring(2, 7)}`,
                type: getRandomTileType(pool),
              };
            }
          }
        }

        currentBoard = clearedBoard;
        setBoard(currentBoard);
        setBustState(null);
        await sleep(220); // wait for gravity drop to settle

        // Check if new cascade matches formed
        cascadeMatches = checkMatches(currentBoard, rows, cols);
      }

      setComboBanner(null);

      // Update match tally & score
      const updatedMatchesCount = matchesCount + totalNewMatches;
      setMatchesCount(updatedMatchesCount);
      setScore((s) => s + totalNewMatches * 30 + (comboCount > 1 ? comboCount * 20 : 0));

      // Check win condition
      if (updatedMatchesCount >= goalMatches) {
        playComplete();
        setPhase("done");
        recordGameSession(patientId, {
          gameId: "teaGardenMatch",
          level,
          outcome: "completed",
          score: 100,
          startedAt,
          taps: taps + 1,
          errorCount: 0,
        });
        speak(
          locale === "as"
            ? "বৰ ধুনীয়া! চাহৰ পাচি ভৰি পৰিল।"
            : locale === "hi"
            ? "बहुत खूब! चाय की टोकरी भर गई।"
            : "Splendid harvest! Your tea basket is full.",
          locale,
          rate
        );
      } else {
        // Ensure the settled board still has a valid move
        const nextMove = findValidMove(currentBoard, rows, cols);
        if (!nextMove) {
          const fresh = createInitialBoard(rows, cols, pool);
          setBoard(fresh);
          playChimeTone();
        }
      }

      setIsProcessing(false);
      resetDwellTimer();
    },
    [
      board,
      rows,
      cols,
      pool,
      matchesCount,
      goalMatches,
      patientId,
      level,
      startedAt,
      taps,
      locale,
      rate,
      resetDwellTimer,
      spawnFloatingScore,
    ]
  );

  // Handle Tile Click (Tap-and-Tap alternative to dragging)
  const handleTileClick = useCallback(
    (r: number, c: number) => {
      if (isProcessing || phase === "done") return;
      playPress();
      setTaps((t) => t + 1);
      resetDwellTimer();

      if (!selectedCoord) {
        setSelectedCoord([r, c]);
        return;
      }

      const [sr, sc] = selectedCoord;

      if (sr === r && sc === c) {
        setSelectedCoord(null);
        return;
      }

      const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;

      if (!isAdjacent) {
        setSelectedCoord([r, c]);
        return;
      }

      // Execute animated swap
      executeAnimatedSwap(sr, sc, r, c);
    },
    [isProcessing, phase, selectedCoord, executeAnimatedSwap, resetDwellTimer]
  );

  // Swipe Gesture Handling (for users who prefer dragging like Candy Crush)
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    if (isProcessing || phase === "done") return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, r, c };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isProcessing || phase === "done") return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const { r, c } = touchStartRef.current;
    touchStartRef.current = null;

    const threshold = 28; // minimum swipe distance in px
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return; // was a simple tap, let onClick handle it
    }

    let targetR = r;
    let targetC = c;

    if (Math.abs(dx) > Math.abs(dy)) {
      targetC = dx > 0 ? c + 1 : c - 1;
    } else {
      targetR = dy > 0 ? r + 1 : r - 1;
    }

    if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
      executeAnimatedSwap(r, c, targetR, targetC);
    }
  };

  const handleManualHint = useCallback(() => {
    playPress();
    const move = findValidMove(board, rows, cols);
    if (move) {
      setHintCoords(move);
      playChimeTone();
      speak(
        locale === "as"
          ? "চমকি থকা পাত দুটা সলনি কৰক।"
          : locale === "hi"
          ? "चमकती हुई पत्तियों को बदलें।"
          : "Swap the glowing tiles!",
        locale,
        rate
      );
    }
  }, [board, rows, cols, locale, rate]);

  const restartGame = useCallback(() => {
    playPress();
    setBoard(createInitialBoard(rows, cols, pool));
    setSelectedCoord(null);
    setMatchesCount(0);
    setScore(0);
    setSwapAnim(null);
    setBustState(null);
    setFloatingScores([]);
    setComboBanner(null);
    setPhase("playing");
    setStartedAt(new Date().toISOString());
    setTaps(0);
    resetDwellTimer();
  }, [rows, cols, pool, resetDwellTimer]);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "teaGardenMatch",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading) {
    return (
      <section className="pb-12 min-h-screen bg-canvas">
        <GameHeader
          title="Tea Garden Bloom (চাহ বাগিচা)"
          score={0}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="tea-garden-match"
        />
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <GameLoading />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pb-12 min-h-screen bg-canvas">
        <GameHeader
          title="Tea Garden Bloom (চাহ বাগিচা)"
          score={0}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="tea-garden-match"
        />
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <GameError onRetry={reload} />
        </div>
      </section>
    );
  }

  const progressPct = Math.min(100, Math.round((matchesCount / goalMatches) * 100));

  return (
    <section className="pb-16 min-h-screen bg-canvas select-none">
      {/* Game Header */}
      <GameHeader
        title={
          locale === "as"
            ? "চাহ বাগিচা (Tea Garden Match)"
            : locale === "hi"
            ? "चाय बागान (Tea Garden Match)"
            : "Tea Garden Bloom (Chah Bagisha)"
        }
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="tea-garden-match"
      />

      <div className="mx-auto max-w-md px-3 sm:px-4 pt-3 flex flex-col gap-3">
        {phase === "playing" && (
          <>
            {/* Harvest Goal & Progress Card */}
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[3px_3px_0px_#000] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">🧺</span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-ink leading-tight">
                      {locale === "as" ? "চাহ সংগ্ৰহ" : locale === "hi" ? "चाय संग्रह" : "Tea Harvest Goal"}
                    </h2>
                    <span className="text-xs font-bold text-ink-secondary">
                      {matchesCount} / {goalMatches} {locale === "as" ? "সংগ্ৰহ হ'ল" : "collected"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualHint}
                  disabled={isProcessing}
                  className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-amber-200 hover:bg-amber-300 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{locale === "as" ? "সহায়" : locale === "hi" ? "संकेत" : "Hint"}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden border border-black/20">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full shadow-inner"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Combo Celebration Toast */}
            {comboBanner && (
              <div className="py-1.5 px-4 rounded-xl border-2 border-amber-600 bg-amber-100 text-amber-950 font-black text-xs sm:text-sm text-center shadow-md animate-bounce">
                {comboBanner}
              </div>
            )}

            {/* Match-3 Board Grid with Sliding & Busting Visuals */}
            <div className="rounded-3xl border-3 border-black bg-[#EFE5D5] p-3 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className={`grid gap-2 w-full max-w-[340px] aspect-square relative ${
                  cols === 5 ? "grid-cols-5" : "grid-cols-4"
                }`}
              >
                {board.map((row, r) =>
                  row.map((cell, c) => {
                    const isSelected = selectedCoord && selectedCoord[0] === r && selectedCoord[1] === c;
                    const isHint =
                      hintCoords &&
                      ((hintCoords[0][0] === r && hintCoords[0][1] === c) ||
                        (hintCoords[1][0] === r && hintCoords[1][1] === c));

                    const isBusting = bustState?.coords.has(`${r},${c}`);
                    const bustPhase = bustState?.phase;

                    // Calculate sliding translation for swapping tiles
                    let transformStyle = "";
                    let isSwapping = false;

                    if (swapAnim) {
                      const { r1, c1, r2, c2, phase: sPhase } = swapAnim;
                      if (r === r1 && c === c1) {
                        isSwapping = true;
                        if (sPhase === "sliding") {
                          const dx = (c2 - c1) * 100;
                          const dy = (r2 - r1) * 100;
                          transformStyle = `translate(${dx}%, ${dy}%)`;
                        }
                      } else if (r === r2 && c === c2) {
                        isSwapping = true;
                        if (sPhase === "sliding") {
                          const dx = (c1 - c2) * 100;
                          const dy = (r1 - r2) * 100;
                          transformStyle = `translate(${dx}%, ${dy}%)`;
                        }
                      }
                    }

                    const def = TILE_DEFS[cell.type] || TILE_DEFS.tea_leaf;

                    return (
                      <div
                        key={cell.id}
                        className="relative aspect-square"
                        style={{
                          transform: transformStyle,
                          transition: isSwapping ? "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                          zIndex: isSwapping ? 30 : isSelected ? 20 : 1,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleTileClick(r, c)}
                          onTouchStart={(e) => handleTouchStart(e, r, c)}
                          onTouchEnd={handleTouchEnd}
                          disabled={isProcessing}
                          className={`btn-tactile w-full h-full flex flex-col items-center justify-center rounded-2xl border-3 transition-all cursor-pointer select-none ${
                            isBusting && bustPhase === "highlight"
                              ? "scale-110 ring-4 ring-amber-400 bg-amber-200 border-amber-600 shadow-[0_0_15px_#F59E0B] z-20"
                              : isBusting && bustPhase === "burst"
                              ? "scale-0 opacity-0 rotate-45 transition-all duration-200 ease-out"
                              : isSelected
                              ? "bg-emerald-200 border-emerald-950 ring-4 ring-emerald-500 scale-105 shadow-[3px_3px_0px_#000]"
                              : isHint
                              ? "bg-amber-100 border-amber-600 ring-4 ring-amber-400 animate-pulse scale-105 shadow-[3px_3px_0px_#D97706]"
                              : `${def.bg} ${def.border} shadow-[2px_2px_0px_#000] hover:scale-102 active:scale-95`
                          }`}
                        >
                          <span
                            className={`text-3xl sm:text-4xl select-none leading-none transition-transform duration-200 ${
                              isBusting && bustPhase === "highlight" ? "animate-bounce" : ""
                            }`}
                          >
                            {def.emoji}
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}

                {/* Floating Score Badges */}
                {floatingScores.map((scoreItem) => {
                  const leftPct = (scoreItem.x / (cols - 1)) * 80 + 10;
                  const topPct = (scoreItem.y / (rows - 1)) * 80 + 10;
                  return (
                    <div
                      key={scoreItem.id}
                      className="absolute pointer-events-none font-black text-sm sm:text-base px-2.5 py-1 rounded-full bg-amber-300 border-2 border-black text-amber-950 shadow-md animate-out fade-out slide-out-to-top-8 duration-700 z-40"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {scoreItem.text}
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] font-bold text-amber-950/70 mt-2 text-center">
                {locale === "as"
                  ? "আঙুলিৰে টানক বা দুটা কাষৰ বস্তু চুই সলনি কৰক।"
                  : locale === "hi"
                  ? "उंगली से स्वाइप करें या दो पास की वस्तुएं छूकर बदलें।"
                  : "Swipe or tap two adjacent items to swap and match 3!"}
              </p>

              {/* Caregiver / Family Co-Play Guidance (CST) */}
              <CaregiverCoPlayPrompt
                tip={
                  locale === "as"
                    ? "যত্নকৰ্তাৰ পৰামৰ্শ: বাবাৰ সৈতে একেলগে ৩টা একে ৰঙৰ ফুল বা পাত বিচাৰক।"
                    : locale === "hi"
                    ? "देखभालकर्ता सुझाव: बड़े-बुजुर्गों के साथ मिलकर एक ही रंग की 3 पत्तियां या फूल खोजें।"
                    : "Caregiver Co-Play Tip: Point out 3 matching tea leaves or orchids in a row together to encourage calm visual search."
                }
                className="mt-3"
              />
            </div>
          </>
        )}

        {/* Level Complete / Celebration Screen */}
        {phase === "done" && (
          <Celebration
            title={
              locale === "as"
                ? "চাহ সংগ্ৰহ সফল হ'ল! 🍃"
                : locale === "hi"
                ? "चाय संकलन पूर्ण हुआ! 🍃"
                : "Tea Harvest Complete! 🍃"
            }
            subtitle={
              locale === "as"
                ? "আপুনি সকলো চাহ পাত আৰু কপৌ ফুল অতি সুন্দৰভাৱে মিলাই সংগ্ৰহ কৰিলে।"
                : locale === "hi"
                ? "आपने चाय की पत्तियां और सुंदर फूल सफलतापूर्वक संकलित किए।"
                : "You matched all garden flowers and fresh tea leaves with great focus."
            }
            xpEarned={120}
            accuracy="100%"
          >
            <div className="flex flex-col items-center gap-3.5 max-w-xs mx-auto text-center w-full pt-2">
              {/* Daily Care Routine & Hydration Reminder (SIH Requirement e) */}
              <div className="w-full rounded-2xl border-2 border-sky-600 bg-sky-50 p-3 text-left flex items-start gap-2.5 shadow-sm">
                <Droplets className="h-6 w-6 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-sky-950">
                    {locale === "as"
                      ? "পানী খোৱাৰ সময় 💧"
                      : locale === "hi"
                      ? "पानी पीने का समय 💧"
                      : "Health Reminder • Hydration 💧"}
                  </h4>
                  <p className="text-[11px] font-bold text-sky-900 mt-0.5">
                    {locale === "as"
                      ? "চাহ তোলাৰ পিছত এগিলাচ পৰিষ্কাৰ পানী খাই লওক।"
                      : locale === "hi"
                      ? "चाय चुनने के बाद अब एक गिलास ताज़ा पानी पी लें।"
                      : "After your garden walk, enjoy a refreshing glass of fresh water."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>{locale === "as" ? "পুনৰ খেলক" : locale === "hi" ? "फिर से खेलें" : "Play Again"}</span>
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs sm:text-sm font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
                >
                  {locale === "as" ? "খেললৈ উভতি যাওক" : locale === "hi" ? "खेल सूची" : "Back to Games"}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
