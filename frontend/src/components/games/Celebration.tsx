"use client";

import type { ReactNode } from "react";

const COLORS = ["#E2725B", "#2F9E77", "#FFB703", "#6B9AC4", "#7A5C43", "#E9C46A"];

interface CelebrationProps {
  emoji?: string;
  title: string;
  pieces?: number;
  children?: ReactNode;
}

export function Celebration({
  emoji = "🎉",
  title,
  pieces = 24,
  children,
}: CelebrationProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6 py-10 text-center">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: pieces }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 10) * 0.3}s`,
              backgroundColor: COLORS[i % COLORS.length],
            }}
          />
        ))}
      </div>
      <div className="animate-bounce text-8xl drop-shadow-sm">{emoji}</div>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink">
        {title}
      </h2>
      {children && <div className="z-10 flex flex-col items-center gap-4">{children}</div>}
    </div>
  );
}