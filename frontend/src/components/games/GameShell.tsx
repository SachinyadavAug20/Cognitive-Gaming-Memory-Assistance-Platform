"use client";

import React from "react";
import { GameHeader } from "@/components/layout/GameHeader";

export interface GameShellProps {
  title: string;
  score: number;
  backHref?: string;
  bgColor?: string;
  maxWidthClass?: string;
  audioPrompt?: string;
  gameId?: string;
  children: React.ReactNode;
}

/**
 * Standardized High-Contrast Game Shell for MDoNER / CogniCare Therapy Modules
 * Guarantees accessible padding, high-contrast borders, and elder-friendly viewport hierarchy.
 */
export function GameShell({
  title,
  score,
  backHref = "/patient/games",
  bgColor = "bg-tea",
  maxWidthClass = "max-w-2xl",
  audioPrompt,
  gameId,
  children,
}: GameShellProps) {
  return (
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader
        title={title}
        score={score}
        backHref={backHref}
        bgColor={bgColor}
        audioPrompt={audioPrompt}
        gameId={gameId}
      />
      <div className={`mx-auto ${maxWidthClass} px-4 pt-5`}>
        {children}
      </div>
    </section>
  );
}
