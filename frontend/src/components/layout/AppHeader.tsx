"use client";

import { useSyncExternalStore } from "react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Brain,
  PhoneCall,
  Radio,
  ShieldCheck,
  Gamepad2,
  Sparkles,
  QrCode,
  Activity,
  Home,
  BookOpen,
} from "lucide-react";

interface AppHeaderProps {
  isOnline?: boolean;
}

const PATIENT_NAV_LABELS: Record<string, { routine: string; games: string }> = {
  en: { routine: "My Routine", games: "Daily Activities" },
  hi: { routine: "मेरी दिनचर्या", games: "दैनिक गतिविधियां" },
  as: { routine: "মোৰ নিয়মসূচী", games: "দৈনিক কাৰ্যকলাপ" },
  bn: { routine: "আমার রুটিন", games: "দৈনিক কার্যকলাপ" },
  mr: { routine: "माझी दिनचर्या", games: "दैनिक उपक्रम" },
  ne: { routine: "मेरो दिनचर्या", games: "दैनिक गतिविधिहरू" },
  mni: { routine: "ঐগী থবক", games: "নুমিৎ খুদিংগী থবক" },
  brx: { routine: "आंनि बिथांखि", games: "सानफ्रोमबो हाबाफोर" },
  grt: { routine: "Angni Tikat", games: "Salanti Kamrang" },
  kha: { routine: "Ka Jingbuh Por", games: "Ki Kam Babha" },
  lus: { routine: "Ka Tih Tur", games: "Ni Tin Hnathawh" },
};

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
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const pNav = PATIENT_NAV_LABELS[normLoc] || PATIENT_NAV_LABELS.en;
  const pathname = usePathname();

  const isOnlineLive = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    () => true
  );

  const online = forcedOnline !== undefined ? forcedOnline : isOnlineLive;

  const isPatientRoute = pathname ? pathname.startsWith("/patient") : false;
  const navLinks = isPatientRoute
    ? [
        { href: "/patient", label: pNav.routine, icon: Home, exact: true },
        { href: "/patient/games", label: pNav.games, icon: Sparkles, exact: false },
      ]
    : [
        { href: "/", label: "Home", icon: Home, exact: true },
        { href: "/patient/games", label: "Daily Activities", icon: Sparkles, exact: false },
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
        <Link href="/" className={`flex items-center group shrink-0 ${isPatientRoute ? "gap-2.5" : "gap-2"}`}>
          <div
            className={`flex items-center justify-center rounded-xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] group-hover:bg-emerald-800 transition-colors ${
              isPatientRoute ? "h-10 w-10 sm:h-11 sm:w-11" : "h-8 w-8 sm:h-9 sm:w-9"
            }`}
          >
            <Brain className={isPatientRoute ? "h-6 w-6 sm:h-6.5 sm:w-6.5" : "h-4.5 w-4.5 sm:h-5 sm:w-5"} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span
                className={`font-serif font-black leading-tight text-ink ${
                  isPatientRoute ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                }`}
              >
                CogniCare
              </span>
            </div>
            {!isPatientRoute && (
              <p className="hidden sm:block font-bold text-ink-secondary whitespace-nowrap text-[8.5px] sm:text-[9px]">
                North East Memory Care
              </p>
            )}
          </div>
        </Link>

        {/* Center: Quick Primary Page Navigation */}
        <div
          suppressHydrationWarning
          className={`${
            isPatientRoute ? "flex gap-2 sm:gap-2.5" : "hidden 2xl:flex gap-1.5 sm:gap-2"
          } items-center font-sans`}
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
                className={`flex items-center transition-all cursor-pointer ${
                  isPatientRoute
                    ? "gap-2 rounded-xl px-3.5 sm:px-4.5 py-2 text-sm sm:text-base font-black"
                    : "gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black"
                } ${
                  isActive
                    ? "border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                    : "border-2 border-transparent text-ink hover:border-black/30 hover:bg-surface"
                }`}
              >
                <Icon className={isPatientRoute ? "h-4.5 w-4.5" : "h-4 w-4"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions, Language, Caregiver Portal, and Emergency SOS */}
        <div className={`flex items-center shrink-0 ${isPatientRoute ? "gap-1.5 sm:gap-2.5" : "gap-1 sm:gap-2"}`}>
          {/* Live Connectivity Badge */}
          <div
            suppressHydrationWarning
            className={`hidden md:flex items-center rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 ${
              isPatientRoute
                ? "gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-black"
                : "gap-1.5 px-2 py-1 text-xs font-black"
            } ${
              online ? "bg-tea-light text-tea" : "bg-marigold-light text-marigold"
            }`}
            title={online ? "Online (Server Connected)" : "Offline Mode (Local Storage Synced)"}
          >
            <Radio className={`${isPatientRoute ? "h-3.5 w-3.5" : "h-3 w-3"} animate-pulse`} />
            <span suppressHydrationWarning>{online ? t("online") : t("offline")}</span>
          </div>

          {/* Multilingual Selector */}
          <LanguageSelector size={isPatientRoute ? "large" : "default"} className="shrink-0" />

          {/* Caregiver & Healthcare Worker Portal Link (Hidden on patient routes to prevent cognitive confusion) */}
          {!isPatientRoute && (
            <Link
              href="/caregiver"
              suppressHydrationWarning
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
              className={`pulse-gentle flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-brick hover:bg-red-700 font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-y-[1px] ${
                isPatientRoute
                  ? "min-h-[36px] sm:min-h-[40px] px-3 sm:px-3.5 text-xs sm:text-sm"
                  : "min-h-[34px] sm:min-h-[38px] px-2 sm:px-3 text-xs"
              }`}
              title="Emergency Tele-MANAS / Ambulance SOS Call (108)"
            >
              <PhoneCall className={isPatientRoute ? "h-4 w-4" : "h-3.5 w-3.5"} />
              <span>{t("sos")}</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
