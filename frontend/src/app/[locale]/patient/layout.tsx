"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getSessionCookie } from "@/lib/authCookie";
import { Spinner } from "@/components/ui/Spinner";
import { CaregiverSosButton } from "@/components/patient/CaregiverSosButton";

/**
 * Auth gate for /patient routes.
 *
 * Priority order:
 *   1. Demo / echoes-of-home routes → always allowed
 *   2. Zustand says authenticated → render children
 *   3. Cookie has valid session → restore into zustand, wait for next render
 *   4. None of the above → redirect to /kiosk/login
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);

  const [mounted, setMounted] = useState(false);

  const isDirectAccess = Boolean(
    pathname?.includes("demo") || pathname?.includes("echoes-of-home")
  );

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // On mount: if not authenticated and not direct access, try cookie or storage restore
  useEffect(() => {
    if (!mounted || isDirectAccess || isAuthenticated) return;

    // 1. Try 30-day session cookie
    const cookieData = getSessionCookie();
    if (cookieData && cookieData.token && cookieData.patient) {
      login(cookieData.token, cookieData.patient as any);
      return;
    }

    // 2. Try localStorage directly (handles cases where cookie was blocked or partitioned)
    try {
      const raw = localStorage.getItem("cognicare-auth");
      if (raw) {
        const stored = JSON.parse(raw)?.state;
        if (stored?.token && stored?.patient) {
          login(stored.token, stored.patient);
          return;
        }
      }
    } catch {
      // ignore JSON parse failures
    }

    // 3. Fallback: check Zustand store snapshot
    const currentStore = useAuthStore.getState();
    if (currentStore.patient && currentStore.token) {
      login(currentStore.token, currentStore.patient);
      return;
    }

    // No valid session anywhere — redirect to kiosk
    router.replace("/kiosk/login");
  }, [mounted, isAuthenticated, isDirectAccess, login, router]);

  // Demo routes: bypass auth entirely
  if (isDirectAccess) {
    return <>{children}</>;
  }

  // Not ready yet: show spinner (prevents flash of redirect)
  if (!mounted || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas">
        <Spinner />
      </main>
    );
  }

  return (
    <>
      {children}
      <CaregiverSosButton />
    </>
  );
}
