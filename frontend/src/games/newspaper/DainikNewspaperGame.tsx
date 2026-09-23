"use client";

import { useState } from "react";
import {
  Newspaper,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Volume2,
  Calendar,
  Award,
} from "lucide-react";
import { SUDOKU_PUZZLES, WORD_SEARCH_EN } from "./newspaperData";
import { playCorrect, playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";

export function DainikNewspaperGame() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const [activeTab, setActiveTab] = useState<"sudoku" | "wordsearch">("sudoku");

  // Sudoku State
  const puzzle = SUDOKU_PUZZLES[0];
  const [grid, setGrid] = useState<number[][]>(() =>
    puzzle.initialGrid.map((row) => [...row])
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorCell, setErrorCell] = useState<{ r: number; c: number } | null>(null);

  // Word Search State
  const [foundWords, setFoundWords] = useState<string[]>([]);

  const handleCellClick = (r: number, c: number) => {
    // If it's an initial cell, skip selection
    if (puzzle.initialGrid[r][c] !== 0) return;
    playTapFeedback();
    setSelectedCell({ r, c });
    setErrorCell(null);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    playTapFeedback();
    const { r, c } = selectedCell;

    // Check solution
    if (puzzle.solution[r][c] === num) {
      playCorrect();
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      setSelectedCell(null);
      setErrorCell(null);

      // Check if finished
      const allDone = newGrid.every((row, ri) =>
        row.every((val, ci) => val === puzzle.solution[ri][ci])
      );
      if (allDone) {
        setIsCompleted(true);
        playEncourage();
      }
    } else {
      setErrorCell({ r, c });
      // Errorless gentle prompt
      unlockAudio();
      speak(
        normLoc === "hi"
          ? "कोई बात नहीं! दूसरा अंक आज़माएं।"
          : normLoc === "as"
          ? "একো কথা নাই! আন এটা সংখ্যা দি চাওক।"
          : "Gentle try! Try another number.",
        normLoc,
        0.85
      );
    }
  };

  const handleHint = () => {
    playTapFeedback();
    unlockAudio();
    // Find first empty cell
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) {
          const solutionVal = puzzle.solution[r][c];
          const newGrid = grid.map((row) => [...row]);
          newGrid[r][c] = solutionVal;
          setGrid(newGrid);
          setSelectedCell(null);
          playCorrect();
          speak(
            normLoc === "hi"
              ? `यहाँ ${solutionVal} आएगा।`
              : normLoc === "as"
              ? `ইয়াত ${solutionVal} বহিব।`
              : `Number ${solutionVal} fits here.`,
            normLoc,
            0.85
          );
          return;
        }
      }
    }
  };

  const handleWordClick = (word: string) => {
    playCorrect();
    if (!foundWords.includes(word)) {
      setFoundWords((prev) => [...prev, word]);
      if (foundWords.length + 1 >= WORD_SEARCH_EN.words.length) {
        playEncourage();
      }
    }
  };

  const todayStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* ── CLASSIC NEWSPAPER MASTHEAD ── */}
      <div className="border-4 border-black bg-amber-50/70 p-4 sm:p-6 rounded-3xl shadow-[6px_6px_0px_#000] text-center space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-ink-secondary border-b-2 border-black/30 pb-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-tea" />
            <span>{todayStr}</span>
          </span>
          <span className="uppercase tracking-widest text-tea font-black">
            EDITION: ELDER MORNING CLUB
          </span>
          <span>PRICE: FREE FOR SENIORS</span>
        </div>

        <div className="py-2">
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight uppercase">
            {normLoc === "hi"
              ? "दैनिक समाचार पत्र खेल"
              : normLoc === "as"
              ? "দৈনিক বাতৰি কাকত খেল"
              : "The Daily Morning Newspaper Games"}
          </h2>
          <p className="font-serif italic text-xs sm:text-sm text-ink-secondary mt-1">
            "Warm tea, crisp morning breeze, and stimulating mind puzzles."
          </p>
        </div>

        <div className="flex justify-center gap-2 border-t-2 border-black/30 pt-3">
          <button
            onClick={() => {
              playTapFeedback();
              setActiveTab("sudoku");
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer transition-all ${
              activeTab === "sudoku"
                ? "border-black bg-black text-white shadow-[2px_2px_0px_#000]"
                : "border-black/30 bg-white text-ink hover:bg-amber-100"
            }`}
          >
            🧩 4x4 Mini Sudoku
          </button>
          <button
            onClick={() => {
              playTapFeedback();
              setActiveTab("wordsearch");
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer transition-all ${
              activeTab === "wordsearch"
                ? "border-black bg-black text-white shadow-[2px_2px_0px_#000]"
                : "border-black/30 bg-white text-ink hover:bg-amber-100"
            }`}
          >
            🔍 Morning Word Search
          </button>
        </div>
      </div>

      {/* ── GAME 1: 4X4 SUDOKU ── */}
      {activeTab === "sudoku" && (
        <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-tea bg-emerald-100 px-2 py-0.5 rounded border border-emerald-600">
                Number Placement Logic
              </span>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-1">
                4x4 Gentle Sudoku Grid
              </h3>
              <p className="text-xs text-ink-secondary">
                Fill each row, column, and 2x2 box with numbers 1, 2, 3, and 4.
              </p>
            </div>

            <button
              onClick={handleHint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-300 text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-400 cursor-pointer active:scale-95"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Hint (সহায়তা)</span>
            </button>
          </div>

          {/* 4x4 Grid Board */}
          <div className="flex justify-center py-2">
            <div className="grid grid-cols-4 gap-2 bg-neutral-900 p-2.5 rounded-2xl border-3 border-black shadow-inner max-w-xs w-full">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const isInitial = puzzle.initialGrid[r][c] !== 0;
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isError = errorCell?.r === r && errorCell?.c === c;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`h-16 rounded-xl border-2 font-mono font-black text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isInitial
                          ? "bg-amber-100 border-black/40 text-black cursor-default"
                          : isSelected
                          ? "bg-amber-300 border-black ring-4 ring-tea scale-105 shadow-md"
                          : isError
                          ? "bg-red-200 border-red-600 text-red-900 animate-shake"
                          : val !== 0
                          ? "bg-white border-black text-tea font-bold"
                          : "bg-surface border-neutral-300 hover:bg-amber-50"
                      }`}
                    >
                      {val !== 0 ? val : ""}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Keypad */}
          {!isCompleted && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-ink-secondary text-center block">
                Tap an empty square above, then choose a number:
              </span>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="w-14 h-14 rounded-2xl bg-white border-3 border-black font-mono font-black text-2xl text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-200 active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-3 border-black text-center space-y-2 animate-in zoom-in">
              <CheckCircle2 className="h-10 w-10 text-tea mx-auto" />
              <h4 className="font-serif font-black text-xl text-ink">
                Shabash! Sudoku Solved! 🌸
              </h4>
              <p className="text-xs font-bold text-ink-secondary">
                You earned 50 Brain Points for working memory & logical sequencing!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── GAME 2: WORD SEARCH ── */}
      {activeTab === "wordsearch" && (
        <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-tea bg-emerald-100 px-2 py-0.5 rounded border border-emerald-600">
              Visual Word Search
            </span>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-1">
              Morning Heritage Word Search
            </h3>
            <p className="text-xs text-ink-secondary">
              Find familiar words from our morning culture. Tap a word clue when you spot it!
            </p>
          </div>

          {/* Word Search Grid Visual */}
          <div className="flex justify-center py-2">
            <div className="grid grid-cols-5 gap-1.5 bg-neutral-900 p-3 rounded-2xl border-3 border-black shadow-inner max-w-xs w-full">
              {WORD_SEARCH_EN.grid.map((row, r) =>
                row.map((char, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="h-12 bg-white rounded-lg border border-black/30 font-mono font-black text-lg text-ink flex items-center justify-center"
                  >
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Word Clues Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink-secondary">Words to Find:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WORD_SEARCH_EN.words.map((w) => {
                const isFound = foundWords.includes(w.word);
                return (
                  <button
                    key={w.word}
                    onClick={() => handleWordClick(w.word)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                      isFound
                        ? "border-black bg-amber-200 line-through opacity-80 shadow-xs"
                        : "border-black/30 bg-canvas hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-ink">{w.word}</div>
                      <div className="text-[11px] text-ink-secondary">{w.clue}</div>
                    </div>
                    {isFound && <CheckCircle2 className="h-5 w-5 text-tea" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
