"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export const IDLE_TIMEOUT_MS = 3 * 60 * 1000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
];

export function useIdleTimeout(timeoutMs: number = IDLE_TIMEOUT_MS) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const logoutAndRedirect = () => {
      logout();
      router.push("/kiosk/login");
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logoutAndRedirect, timeoutMs);
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timer) clearTimeout(timer);
    };
  }, [timeoutMs, logout, router]);
}