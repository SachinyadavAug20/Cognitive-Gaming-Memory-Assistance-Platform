"use client";

import { useSyncExternalStore } from "react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Brain, PhoneCall, Radio } from "lucide-react";

interface AppHeaderProps {
  isOnline?: boolean;
}

function subscribeOnline(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function AppHeader({ isOnline: forcedOnline }: AppHeaderProps) {
  const t = useTranslations("nav");
  const isOnlineLive = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    () => true
  );

  const online = forcedOnline !== undefined ? forcedOnline : isOnlineLive;

  return (
    <header className="w-full border-b-3 border-black bg-surface px-3 py-2.5 md:px-6 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] group-hover:bg-emerald-800 transition-colors">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-black leading-tight text-ink">
              CogniCare
            </h1>
            <p className="text-[9px] font-black uppercase tracking-wider text-ink-secondary">
              CDTx Memory Care // MDoNER Track
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <div
            suppressHydrationWarning
            className={`hidden items-center gap-1.5 rounded-xl border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000] sm:flex ${
              online ? "bg-tea-light text-tea" : "bg-marigold-light text-marigold"
            }`}
          >
            <Radio className="h-3 w-3 animate-pulse" />
            <span suppressHydrationWarning>{online ? t("online") : t("offline")}</span>
          </div>

          <LanguageSelector />

          <Link href="tel:108">
            <button
              type="button"
              className="flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-brick px-3 text-xs font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-y-[1px] md:px-3.5"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{t("sos")}</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
