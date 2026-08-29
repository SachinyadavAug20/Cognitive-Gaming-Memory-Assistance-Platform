"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { KioskScanner } from "@/components/kiosk/KioskScanner";
import { useAuthStore } from "@/store/useAuthStore";
import { api, HttpError } from "@/lib/api";
import { playSuccessChime } from "@/lib/sound";
import type { KioskScanResponse } from "@/types/auth";

type ScanStatus = "scanning" | "loading" | "error";

export default function KioskLoginPage() {
  const t = useTranslations("kiosk");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const busyRef = useRef(false);

  const handleScan = useCallback(
    (text: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setStatus("loading");
      playSuccessChime();

      api
        .post<KioskScanResponse>("/auth/kiosk/scan", { qrData: text.trim() })
        .then((res) => {
          login(res.token, res.patient);
          router.push("/patient");
        })
        .catch((err) => {
          const unauthorized = err instanceof HttpError && err.status === 401;
          busyRef.current = false;
          setErrorMsg(unauthorized ? t("error.invalid") : t("error.generic"));
          setStatus("error");
        });
    },
    [login, router, t]
  );

  useEffect(() => {
    if (status !== "error") return;
    const timer = setTimeout(() => {
      setErrorMsg(null);
      setStatus("scanning");
    }, 4000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <main className="min-h-screen bg-canvas paper-texture flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8 max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] font-bold text-4xl md:text-5xl text-ink leading-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-2xl md:text-3xl font-bold text-ink-secondary">
          {t("subtitle")}
        </p>
      </div>

      {status === "loading" ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 border-8 border-marigold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-2xl font-bold text-ink">{t("loading")}</p>
        </div>
      ) : (
        <KioskScanner onScan={handleScan} paused={status !== "scanning"} />
      )}

      {status === "error" && errorMsg && (
        <div
          role="alert"
          className="mt-6 max-w-xl w-full rounded-xl bg-brick-light border-3 border-brick p-4 text-brick font-bold text-xl text-center"
        >
          {errorMsg}
          <p className="text-base mt-1">{t("error.retry")}</p>
        </div>
      )}
    </main>
  );
}