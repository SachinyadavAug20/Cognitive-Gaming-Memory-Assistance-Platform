"use client";

import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface AppHeaderProps {
  isOnline?: boolean;
}

export function AppHeader({ isOnline: forcedOnline }: AppHeaderProps) {
  const t = useTranslations("nav");
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (forcedOnline !== undefined) {
      const id = window.setTimeout(() => setOnline(forcedOnline), 0);
      return () => window.clearTimeout(id);
    }
    const update = () => setOnline(navigator.onLine);
    const id = window.setTimeout(update, 0);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [forcedOnline]);

  return (
    <header className="w-full border-b-2 border-border/10 bg-canvas px-3 py-2 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-border bg-marigold text-sm text-white shadow-[0_2px_0_var(--color-border)]">
            🧠
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-lg font-black leading-tight text-ink">
              CogniCare
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
              MDoNER Initiative
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`hidden items-center gap-2 rounded-xl border-2 border-border px-2 py-1 text-xs font-bold shadow-[0_2px_0_var(--color-border)] sm:flex ${
              online ? "bg-tea-light text-tea" : "bg-marigold-light text-marigold"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                online ? "animate-pulse bg-tea" : "bg-marigold"
              }`}
            />
            {online ? t("online") : t("offline")}
          </div>

          <LanguageSelector />

          <Link href="tel:108">
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border-2 border-border bg-brick px-3 text-sm font-extrabold text-white shadow-[0_3px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-none md:px-4"
            >
              <span className="text-base">🚨</span>
              <span>{t("sos")}</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}