"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Spinner } from "@/components/ui/Spinner";
import { CaregiverSosButton } from "@/components/patient/CaregiverSosButton";

/**
 * Rehydration is synchronous for localStorage, so `hasHydrated()` is already
 * `true` on the client's first render and `false` during SSR. Gating the
 * children on this prevents a hydration mismatch flicker (server renders the
 * spinner, client matches it, then swaps in the protected UI).
 */
function usePersisted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const persisted = usePersisted();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);

  // Check demo or echoes-of-home from both Next.js pathname and browser window location
  const isDirectAccess = Boolean(
    (pathname && (pathname.includes("demo") || pathname.includes("echoes-of-home"))) ||
    (typeof window !== "undefined" && (window.location.pathname.includes("demo") || window.location.pathname.includes("echoes-of-home")))
  );

  useEffect(() => {
    // If demo route or echoes-of-home, NEVER redirect to kiosk/login
    if (isDirectAccess) {
      if (!isAuthenticated) {
        login("demo-patient-token-101", {
          id: 2,
          name: "Biren Borah",
          languagePreference: "as",
        });
      }
      return;
    }

    if (persisted && !isAuthenticated) {
      router.replace("/kiosk/login");
    }
  }, [persisted, isAuthenticated, router, isDirectAccess, login]);

  // Demo or echoes-of-home route immediately renders content with zero auth blocking or spinner delay
  if (isDirectAccess) {
    return <>{children}</>;
  }

  if (!persisted || !isAuthenticated) {
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