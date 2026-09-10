"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneCall, CheckCircle2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import { api, HttpError } from "@/lib/api";

type SosState = "idle" | "sending" | "sent" | "error" | "onTheWay";

const SOS_LABELS: Record<string, { call: string; sending: string; sent: string; onWay: string; retry: string }> = {
  en: { call: "Call Caregiver", sending: "Calling...", sent: "Caregiver alerted", onWay: "Caregiver is coming", retry: "Retry" },
  hi: { call: "सहायक को बुलाएं", sending: "बुला रहे हैं...", sent: "संदेश भेज दिया गया", onWay: "सहायक आ रहे हैं", retry: "पुनः प्रयास" },
  as: { call: "সহায়কা মাতক", sending: "মাতি থকা হৈছে...", sent: "খবৰ পঠোৱা হ'ল", onWay: "সহায়কা আহি আছে", retry: "পুনৰ চেষ্টা" },
  bn: { call: "সাহায্যকারীকে ডাকুন", sending: "ডাকা হচ্ছে...", sent: "খবর পাঠানো হয়েছে", onWay: "সহায়তাকারী আসছেন", retry: "পুনরায় চেষ্টা" },
  mr: { call: "मदतनीसाला बोलवा", sending: "संपर्क करत आहे...", sent: "निरोप पाठवला", onWay: "मदत येत आहे", retry: "पुन्हा प्रयत्न" },
  ne: { call: "सहयोगी बोलाउनुहोस्", sending: "सम्पर्क हुँदैछ...", sent: "सन्देश पठाइयो", onWay: "सहयोगी आउँदैछन्", retry: "पुनः प्रयास" },
  mni: { call: "মতেং পাংবীবু কৌবীয়ু", sending: "কৌরি...", sent: "পাউ থাখ্রে", onWay: "মতেং লাক্লি", retry: "অমুক হন্না" },
  brx: { call: "हेफाजाबगिरिखौ लिगं", sending: "लिंदों...", sent: "खौरां दैथायबाय", onWay: "फैगासिनो दं", retry: "फिन नाजा" },
  grt: { call: "Ni-rokgipana Okambo", sending: "Okamitinga...", sent: "Watataha", onWay: "Rebaenga", retry: "Daktaibo" },
  kha: { call: "Khot Nongsumar", sending: "Dang khot...", sent: "La phah", onWay: "Dang wan", retry: "Pyrshang biang" },
  lus: { call: "Enkawltu Ko Rawh", sending: "Ko mek...", sent: "Thawn tawh", onWay: "Lo kal mek", retry: "Tih nawn leh" },
};

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
        if (typeof window !== "undefined" && window.location.pathname.includes("demo")) {
          setState("error");
          window.setTimeout(() => setState("idle"), 4000);
          return;
        }
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

  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en");
  const labels = SOS_LABELS[normLocale] || SOS_LABELS.en;

  return (
    <button
      onClick={state === "onTheWay" ? reset : handleCall}
      disabled={state === "sending"}
      className={`fixed bottom-6 left-5 sm:left-6 z-40 inline-flex max-w-[calc(100vw-4rem)] items-center gap-2.5 rounded-full px-5 py-3 text-sm sm:text-base font-black shadow-[4px_4px_0px_#000] border-3 border-black transition-transform active:scale-95 ${
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
        ? labels.sending
        : state === "sent"
          ? labels.sent
          : state === "onTheWay"
            ? acknowledgedBy
              ? `${acknowledgedBy}`
              : labels.onWay
            : state === "error"
              ? labels.retry
              : labels.call}
    </button>
  );
}