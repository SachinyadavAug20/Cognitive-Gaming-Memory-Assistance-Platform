"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { KioskScanner } from "@/components/kiosk/KioskScanner";

export function KioskLoginSection() {
  const router = useRouter();
  const [paused, setPaused] = useState(false);

  const handleScan = useCallback(
    (_text: string) => {
      setPaused(true);
      // Redirect after the success animation plays
      setTimeout(() => {
        router.push("/patient");
      }, 2200);
    },
    [router]
  );

  return (
    <div className="scrapbook-card space-y-4">
      <KioskScanner onScan={handleScan} paused={paused} />
    </div>
  );
}
