"use client";

import { useSyncExternalStore } from "react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Brain,
  PhoneCall,
  Radio,
  ShieldCheck,
  Gamepad2,
  QrCode,
  Activity,
  Home,
  BookOpen,
} from "lucide-react";

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
  const pathname = usePathname();

  const isOnlineLive = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    () => true
  );

  const online = forcedOnline !== undefined ? forcedOnline : isOnlineLive;

  const isPatientRoute = pathname.startsWith("/patient");
  const navLinks = isPatientRoute
    ? [
        { href: "/patient", label: "My Routine", icon: Home, exact: true },
        { href: "/patient/games", label: "Daily Games", icon: Gamepad2, exact: false },
      ]
    : [
        { href: "/", label: "Home", icon: Home, exact: true },
        { href: "/patient/games", label: "Daily Games", icon: Gamepad2, exact: false },
        { href: "/kiosk/login", label: "Kiosk", icon: QrCode, exact: false },
        { href: "/command-center", label: "Telemetry", icon: Activity, exact: false },
        { href: "/clinical-evidence", label: "Clinical R&D", icon: BookOpen, exact: false },
      ];

  return (
    <nav
      aria-label="Main Navigation"
      className="w-full border-b-3 border-black bg-white/95 px-2 sm:px-4 md:px-6 py-2 shadow-sm backdrop-blur-md overflow-x-clip"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-3 flex-nowrap">
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] group-hover:bg-emerald-800 transition-colors">
            <Brain className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-serif text-base sm:text-lg font-black leading-tight text-ink">
                CogniCare
              </span>
            </div>
            <p className="hidden sm:block text-[8.5px] sm:text-[9px] font-bold text-ink-secondary whitespace-nowrap">
              North East Memory Care
            </p>
          </div>
        </Link>

        {/* Center: Quick Primary Page Navigation */}
        <div
          className={`${
            isPatientRoute ? "flex" : "hidden 2xl:flex"
          } items-center gap-1.5 sm:gap-2 font-sans`}
        >
          {navLinks.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isActive
                    ? "border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                    : "border-2 border-transparent text-ink hover:border-black/30 hover:bg-surface"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions, Language, Caregiver Portal, and Emergency SOS */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Live Connectivity Badge */}
          <div
            suppressHydrationWarning
            className={`hidden md:flex items-center gap-1.5 rounded-xl border-2 border-black px-2 py-1 text-xs font-black shadow-[2px_2px_0px_#000] shrink-0 ${
              online ? "bg-tea-light text-tea" : "bg-marigold-light text-marigold"
            }`}
            title={online ? "Online (Server Connected)" : "Offline Mode (Local Storage Synced)"}
          >
            <Radio className="h-3 w-3 animate-pulse" />
            <span suppressHydrationWarning>{online ? t("online") : t("offline")}</span>
          </div>

          {/* Multilingual Selector */}
          <LanguageSelector className="shrink-0" />

          {/* Caregiver & Healthcare Worker Portal Link (Hidden on patient routes to prevent cognitive confusion) */}
          {!isPatientRoute && (
            <Link
              href="/caregiver"
              className="flex min-h-[34px] sm:min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-surface hover:bg-tea-light hover:border-tea px-2 sm:px-2.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] transition-all active:translate-y-[1px] shrink-0"
              title="Caregiver & Healthcare Worker Portal"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-tea shrink-0" />
              <span className="hidden lg:inline">Caregiver Portal</span>
              <span className="lg:hidden">Caregiver</span>
            </Link>
          )}

          {/* Emergency SOS Button */}
          <Link href="tel:108" className="shrink-0">
            <button
              type="button"
              className="pulse-gentle flex min-h-[34px] sm:min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-brick hover:bg-red-700 px-2 sm:px-3 text-xs font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-y-[1px]"
              title="Emergency Tele-MANAS / Ambulance SOS Call (108)"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{t("sos")}</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
