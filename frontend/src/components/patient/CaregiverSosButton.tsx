"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneCall, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api, HttpError } from "@/lib/api";

type SosState = "idle" | "sending" | "sent" | "error" | "onTheWay";

interface CaregiverSosButtonProps {
  className?: string;
}

export function CaregiverSosButton({ className = "" }: CaregiverSosButtonProps) {
  const patient = useAuthStore((s) => s.patient);
  const logout = useAuthStore((s) => s.logout);
  const [state, setState] = useState<SosState>("idle");
  const [acknowledgedBy, setAcknowledgedBy] = useState<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  if (!patient) return null;

  const handleCall = async () => {
    setState("sending");
    try {
      await api.post(`/surveillance/patients/${patient.id}/sos`, {
        patientLat: null,
        patientLng: null,
        locationLabel: null,
      });
      setState("sent");
      setAcknowledgedBy(null);
      pollTimer.current = window.setInterval(async () => {
        try {
          const latest = await api.get<{
            status?: string;
            acknowledgedBy?: string | null;
          }>(`/surveillance/patients/${patient.id}/sos/latest`);
          if (latest?.status === "ACKNOWLEDGED") {
            setAcknowledgedBy(latest.acknowledgedBy ?? null);
            setState("onTheWay");
            stopPolling();
          }
        } catch {
          // transient polling failure; keep trying on the next tick
        }
      }, 3000);
    } catch (err) {
      const notFound = err instanceof HttpError && err.status === 404;
      if (notFound) {
        // Stale/invalid patient session (e.g. DB reseeded). Reset so the
        // patient re-scans their card to get a valid id.
        logout();
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/kiosk/login";
        return;
      }
      setState("error");
      window.setTimeout(() => setState("idle"), 4000);
    }
  };

  const reset = () => {
    stopPolling();
    setState("idle");
  };

  return (
    <button
      onClick={state === "onTheWay" ? reset : handleCall}
      disabled={state === "sending"}
      className={`fixed bottom-5 left-5 z-50 inline-flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full px-5 py-3 text-sm font-black shadow-xl border-3 border-black transition-transform active:scale-95 ${
        state === "sent"
          ? "bg-emerald-600 text-white"
          : state === "onTheWay"
            ? "bg-emerald-500 text-white animate-pulse"
            : state === "error"
              ? "bg-amber-600 text-white"
              : "bg-rose-600 text-white hover:bg-rose-700"
      } ${className}`}
      aria-label="Call caregiver for help"
      title={state === "onTheWay" ? "Tap to dismiss" : undefined}
    >
      {state === "onTheWay" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <PhoneCall className="h-5 w-5 shrink-0" />
      )}
      {state === "sending"
        ? "Calling caregiver..."
        : state === "sent"
          ? "Caregiver alerted"
          : state === "onTheWay"
            ? acknowledgedBy
              ? `${acknowledgedBy} will be here soon`
              : "Caregiver will show up soon"
            : state === "error"
              ? "Retry"
              : "Call Caregiver"}
    </button>
  );
}