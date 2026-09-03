"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
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
  const persisted = usePersisted();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (persisted && !isAuthenticated) {
      router.replace("/kiosk/login");
    }
  }, [persisted, isAuthenticated, router]);

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