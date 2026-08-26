"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { BigButton } from "@/components/ui/BigButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";

type Stage = "presentation" | "puzzle" | "recognition";

const GRID_SIZE = 3;
const PIECES = GRID_SIZE * GRID_SIZE;

const FAMILY_MEMBERS = ["Daughter Meena", "Doctor Baruah"];
const CORRECT_INDEX = 0;

export default function PuzzleGame() {
  const [stage, setStage] = useState<Stage>("presentation");
  const [countdown, setCountdown] = useState(10);
  const [pieces, setPieces] = useState<number[]>(
    () => Array.from({ length: PIECES }, (_, i) => i).sort(() => Math.random() - 0.5)
  );
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completedPieces, setCompletedPieces] = useState<Set<number>>(new Set());
  const [recognized, setRecognized] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Presentation countdown
  useEffect(() => {
    if (stage !== "presentation") return;
    if (countdown <= 0) {
      setStage("puzzle");
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, countdown]);

  const placePiece = useCallback(
    (targetIndex: number) => {
      if (selectedPiece === null) return;
      if (selectedPiece === targetIndex) {
        // Correct placement
        setCompletedPieces((prev) => new Set(prev).add(targetIndex));
        setScore((s) => s + 10);
        if (completedPieces.size + 1 === PIECES) {
          setTimeout(() => setStage("recognition"), 500);
        }
      }
      setSelectedPiece(null);
    },
    [selectedPiece, completedPieces.size]
  );

  const isPieceCorrectlyPlaced = (index: number) => completedPieces.has(index);
  const isPieceSelected = (index: number) => selectedPiece === index;

  return (
    <div className="min-h-screen pb-8">
      {/* ── Header Bar ── */}
      <div className="bg-terracotta border-b-4 border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/patient"
            className="text-ink-inverse/80 hover:text-ink-inverse font-bold text-lg transition-colors"
          >
            ← Back
          </Link>
          <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
            Memory Pieces
          </h1>
          <div className="font-bold text-lg text-ink-inverse">
            Score: {score}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        {/* ── Stage 1: Photo Presentation ── */}
        {stage === "presentation" && (
          <div className="space-y-6">
            <ScrapbookCard variant="polaroid" className="max-w-md mx-auto">
              <div className="bg-surface-muted aspect-square rounded flex items-center justify-center text-8xl">
                👨‍👩‍👧
              </div>
              <p className="font-[family-name:var(--font-serif)] text-center text-lg text-ink mt-2 font-semibold">
                Your Daughter Meena at Shillong
              </p>
            </ScrapbookCard>

            {/* Countdown ring */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none" stroke="#F2E8DC" strokeWidth="6"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none" stroke="#C85A32" strokeWidth="6"
                    strokeLinecap="round"
                    className="radial-timer"
                    style={{
                      strokeDashoffset: ((10 - countdown) / 10) * 283,
                    }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-3xl text-terracotta">
                  {countdown}
                </span>
              </div>
              <p className="text-ink-secondary text-lg font-bold">
                Remember this photo carefully...
              </p>
              <AudioPrompt
                text="Look at this photo carefully. This is your daughter Meena, taken in Shillong. Remember her face and the background."
                lang="en-US"
                label="Listen to Story"
              />
            </div>
          </div>
        )}

        {/* ── Stage 2: Puzzle Reassembly ── */}
        {stage === "puzzle" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink mb-2">
                Put the photo back together!
              </h2>
              <p className="text-ink-secondary text-lg">
                Tap a piece below, then tap where it goes.
              </p>
            </div>

            {/* Wooden frame puzzle grid */}
            <div className="max-w-md mx-auto">
              <div className="wood-frame p-3">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: PIECES }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => placePiece(i)}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                        isPieceCorrectlyPlaced(i)
                          ? "bg-tea-light border-tea text-tea"
                          : isPieceSelected(i)
                          ? "bg-marigold-light border-marigold text-marigold"
                          : "bg-surface border-border-soft text-ink-secondary hover:border-border hover:bg-surface-muted"
                      } ${showHint && !isPieceCorrectlyPlaced(i) ? "border-dashed border-marigold" : ""}`}
                    >
                      {isPieceCorrectlyPlaced(i) ? "✓" : i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Piece tray */}
            <div>
              <p className="text-sm font-bold text-ink-secondary mb-2 uppercase tracking-wider">
                Available Pieces
              </p>
              <div className="flex flex-wrap gap-2">
                {pieces.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPiece(p)}
                    disabled={completedPieces.has(p)}
                    className={`w-14 h-14 rounded-lg border-3 font-bold text-lg transition-all ${
                      completedPieces.has(p)
                        ? "bg-surface-muted border-border-soft text-ink-secondary/40 cursor-not-allowed"
                        : isPieceSelected(p)
                        ? "bg-marigold-light border-marigold text-marigold -translate-y-1"
                        : "bg-surface border-border text-ink hover:-translate-y-0.5"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <BigButton
                variant="outline"
                size="lg"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </BigButton>
              <AudioPrompt
                text="Tap a piece number below, then tap where it should go in the grid above."
                lang="en-US"
                label="How to Play"
                size="lg"
              />
            </div>
          </div>
        )}

        {/* ── Stage 3: Recognition Checkpoint ── */}
        {stage === "recognition" && (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-3xl text-ink">
              Wonderful! You assembled the photo!
            </h2>

            <ScrapbookCard variant="polaroid" className="max-w-sm mx-auto">
              <div className="bg-surface-muted aspect-square rounded flex items-center justify-center text-8xl">
                👨‍👩‍👧
              </div>
              <p className="font-[family-name:var(--font-serif)] text-center text-lg text-ink mt-2 font-semibold">
                Who is in this photo?
              </p>
            </ScrapbookCard>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {FAMILY_MEMBERS.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setRecognized(i)}
                  className={`btn-tactile text-xl px-8 py-5 min-h-[72px] rounded-2xl ${
                    recognized === i
                      ? i === CORRECT_INDEX
                        ? "bg-tea text-ink-inverse border-border"
                        : "bg-brick text-ink-inverse border-border"
                      : "bg-surface text-ink border-border hover:bg-surface-muted"
                  }`}
                >
                  {name}
                  {recognized === i && (
                    <span className="ml-2">
                      {i === CORRECT_INDEX ? "✓" : "✗"}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {recognized !== null && (
              <div className="space-y-4">
                <p className="text-xl font-bold text-ink">
                  {recognized === CORRECT_INDEX
                    ? "Correct! That is your daughter Meena!"
                    : "Not quite — that was Meena, your daughter."}
                </p>
                <Link href="/patient">
                  <BigButton variant="terracotta" size="xl">
                    ← Back Home
                  </BigButton>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
