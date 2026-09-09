"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// 30 days (1 month) session duration in milliseconds
export const IDLE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

export function useIdleTimeout() {
  const touchSession = useAuthStore((s) => s.touchSession);
  const lastTouchRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      // Throttle session renewal to at most once every 5 minutes on active usage
      const now = Date.now();
      if (now - lastTouchRef.current > 5 * 60 * 1000) {
        lastTouchRef.current = now;
        touchSession();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [touchSession]);
}