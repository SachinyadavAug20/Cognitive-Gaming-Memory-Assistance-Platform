"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playPress,
  playComplete,
  playEncourage,
  playLeafPluck,
  playChimeTone,
  playWaterRipple,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import type { GridCell, TileType, SwapAnimationState, BustState, FloatingScore } from "./types";
import { checkMatches, createInitialBoard, findValidMove, getRandomTileType, sleep } from "./boardLogic";

interface UseTeaGardenMatchEngineProps {
  patientId: number;
  level: number;
  rate: number;
  locale: string;
  rows: number;
  cols: number;
  pool: TileType[];
  goalMatches: number;
}

export function useTeaGardenMatchEngine({
  patientId,
  level,
  rate,
  locale,
  rows,
  cols,
  pool,
  goalMatches,
}: UseTeaGardenMatchEngineProps) {
  const [board, setBoard] = useState<GridCell[][]>(() => createInitialBoard(rows, cols, pool));
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [matchesCount, setMatchesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [isProcessing, setIsProcessing] = useState(false);

  const [swapAnim, setSwapAnim] = useState<SwapAnimationState | null>(null);
  const [bustState, setBustState] = useState<BustState | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [comboBanner, setComboBanner] = useState<string | null>(null);

  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [taps, setTaps] = useState(0);
  const [hintCoords, setHintCoords] = useState<[[number, number], [number, number]] | null>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

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

  const spawnFloatingScore = useCallback((text: string, r: number, c: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingScores((prev) => [...prev, { id, text, x: c, y: r }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  }, []);

  const executeAnimatedSwap = useCallback(
    async (r1: number, c1: number, r2: number, c2: number) => {
      setIsProcessing(true);
      setSelectedCoord(null);
      setHintCoords(null);

      setSwapAnim({ r1, c1, r2, c2, phase: "sliding" });
      playPress();
      await sleep(220);

      const testBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      const tmp = testBoard[r1][c1];
      testBoard[r1][c1] = testBoard[r2][c2];
      testBoard[r2][c2] = tmp;

      const matched = checkMatches(testBoard, rows, cols);

      if (matched.size === 0) {
        setSwapAnim({ r1, c1, r2, c2, phase: "reverting" });
        playEncourage();
        await sleep(200);
        setSwapAnim(null);
        setIsProcessing(false);
        resetDwellTimer();
        return;
      }

      setBoard(testBoard);
      setSwapAnim(null);
      playWaterRipple();

      let currentBoard = testBoard;
      let cascadeMatches = matched;
      let comboCount = 0;
      let totalNewMatches = 0;

      while (cascadeMatches.size > 0) {
        comboCount++;
        const matchesInStep = Math.floor(cascadeMatches.size / 3);
        totalNewMatches += matchesInStep;

        setBustState({ coords: cascadeMatches, phase: "highlight" });
        playLeafPluck();

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

        await sleep(280);

        setBustState({ coords: cascadeMatches, phase: "burst" });
        await sleep(200);

        const clearedBoard = currentBoard.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (cascadeMatches.has(`${rowIdx},${colIdx}`)) {
              return { id: "", type: "tea_leaf" as TileType };
            }
            return cell;
          })
        );

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
        await sleep(220);

        cascadeMatches = checkMatches(currentBoard, rows, cols);
      }

      setComboBanner(null);

      const updatedMatchesCount = matchesCount + totalNewMatches;
      setMatchesCount(updatedMatchesCount);
      setScore((s) => s + totalNewMatches * 30 + (comboCount > 1 ? comboCount * 20 : 0));

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

      executeAnimatedSwap(sr, sc, r, c);
    },
    [isProcessing, phase, selectedCoord, executeAnimatedSwap, resetDwellTimer]
  );

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

    const threshold = 28;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return;
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

  return {
    board,
    selectedCoord,
    matchesCount,
    score,
    phase,
    isProcessing,
    swapAnim,
    bustState,
    floatingScores,
    comboBanner,
    hintCoords,
    handleTileClick,
    handleTouchStart,
    handleTouchEnd,
    handleManualHint,
    restartGame,
  };
}
