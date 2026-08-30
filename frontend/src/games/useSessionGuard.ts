"use client";

import { useEffect, useRef } from "react";
import { recordGameAbandonment } from "@/lib/telemetry";

interface SessionInfo {
  patientId: number;
  gameId: string;
  level: number;
  startedAt: string | null;
  taps: number;
  errorCount: number;
}

const MIN_ACTIVE_MS = 5000;

/**
 * Records an `abandoned` telemetry session when the player leaves the game
 * before finishing. Games call `markCompleted()` inside their completion path to
 * opt out. Sub-second visits and StrictMode re-mounts are filtered out in dev.
 */
export function useSessionGuard(info: SessionInfo) {
  const completed = useRef(false);
  const live = useRef(info);

  useEffect(() => {
    live.current = info;
  });

  useEffect(() => {
    const liveRef = live;
    return () => {
      if (typeof window === "undefined") return;
      if (completed.current) return;
      const started = liveRef.current.startedAt;
      if (!started) return;
      const activeMs = Date.now() - Date.parse(started);
      if (!Number.isFinite(activeMs) || activeMs < MIN_ACTIVE_MS) return;
      recordGameAbandonment(liveRef.current.patientId, {
        gameId: liveRef.current.gameId,
        level: liveRef.current.level,
        startedAt: started,
        taps: liveRef.current.taps,
        errorCount: liveRef.current.errorCount,
      });
    };
  }, []);

  return {
    markCompleted: () => {
      completed.current = true;
    },
  };
}