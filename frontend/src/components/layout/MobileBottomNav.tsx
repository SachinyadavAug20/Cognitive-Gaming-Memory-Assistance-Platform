"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Home,
  Sparkles,
  Users,
  ShieldCheck,
  Brain,
  FileText,
  Stethoscope,
  Menu,
} from "lucide-react";
import { playPress, playTapFeedback } from "@/lib/sound";

const PATIENT_TABS: Record<
  string,
  { routine: string; games: string; community: string; caregiver: string; menu: string }
> = {
  en: { routine: "Routine", games: "Activities", community: "Community", caregiver: "Caregiver", menu: "Menu" },
  hi: { routine: "दिनचर्या", games: "गतिविधियां", community: "समुदाय", caregiver: "देखभाल", menu: "मेनू" },
  as: { routine: "নিয়মসূচী", games: "কাৰ্যকলাপ", community: "চক্ৰ", caregiver: "শুশ্ৰূষা", menu: "মেনু" },
  bn: { routine: "রুটিন", games: "কার্যকলাপ", community: "সম্প্রদায়", caregiver: "সেবাকারী", menu: "মেনু" },
  mr: { routine: "दिनचर्या", games: "उपक्रम", community: "समुदाय", caregiver: "काळजी", menu: "मेनू" },
  ne: { routine: "दिनचर्या", games: "गतिविधि", community: "समुदाय", caregiver: "हेरचाह", menu: "मेनु" },
  mni: { routine: "থবক", games: "শাবা", community: "খুন্নাই", caregiver: "য়েংশিনবা", menu: "মেনু" },
  brx: { routine: "बिथांखि", games: "हाबाफोर", community: "गामि", caregiver: "सामलाय", menu: "मेनु" },
  grt: { routine: "Tikat", games: "Kamrang", community: "Songsal", caregiver: "Naljokgipa", menu: "Menu" },
  kha: { routine: "Jingbuh", games: "Ki Kam", community: "Shnong", caregiver: "Nongsumar", menu: "Menu" },
  lus: { routine: "Tih Tur", games: "Hnathawh", community: "Khawtlang", caregiver: "Enkawltu", menu: "Menu" },
};

const GENERAL_TABS: Record<
  string,
  { home: string; patient: string; caregiver: string; doctor: string; menu: string }
> = {
  en: { home: "Home", patient: "Patient", caregiver: "Caregiver", doctor: "Doctor", menu: "Menu" },
  hi: { home: "होम", patient: "मरीज़", caregiver: "देखभाल", doctor: "डॉक्टर", menu: "मेनू" },
  as: { home: "গৃহ", patient: "ৰোগী", caregiver: "শুশ্ৰূষা", doctor: "চিকিৎসক", menu: "মেনু" },
  bn: { home: "হোম", patient: "রোগী", caregiver: "সেবাকারী", doctor: "ডাক্তার", menu: "মেনু" },
  mr: { home: "मुख्यपृष्ठ", patient: "रुग्ण", caregiver: "काळजी", doctor: "डॉक्टर", menu: "मेनू" },
  ne: { home: "गृह", patient: "बिरामी", caregiver: "हेरचाह", doctor: "डाक्टर", menu: "मेनु" },
  mni: { home: "য়ুম", patient: "অনাবা", caregiver: "য়েংশিনবা", doctor: "দোক্তর", menu: "মেনু" },
  brx: { home: "न'खर", patient: "बेमारि", caregiver: "सामलाय", doctor: "डाक्टर", menu: "मेनु" },
  grt: { home: "Nok", patient: "Sa·gipa", caregiver: "Naljokgipa", doctor: "Doctor", menu: "Menu" },
  kha: { home: "Iing", patient: "Nongpang", caregiver: "Nongsumar", doctor: "Doctor", menu: "Menu" },
  lus: { home: "In", patient: "Damlo", caregiver: "Enkawltu", doctor: "Doctor", menu: "Menu" },
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const pLabels = PATIENT_TABS[normLoc] || PATIENT_TABS.en;
  const gLabels = GENERAL_TABS[normLoc] || GENERAL_TABS.en;

  const isPatientRoute = pathname ? pathname.startsWith("/patient") : false;

  const handleOpenDrawer = () => {
    playTapFeedback();
    window.dispatchEvent(new Event("cognicare_open_nav_drawer"));
  };

  const tabs = isPatientRoute
    ? [
        {
          href: "/patient",
          label: pLabels.routine,
          icon: Home,
          exact: true,
        },
        {
          href: "/patient/games",
          label: pLabels.games,
          icon: Sparkles,
          exact: false,
        },
        {
          href: "/patient/community",
          label: pLabels.community,
          icon: Users,
          exact: false,
        },
        {
          href: "/caregiver",
          label: pLabels.caregiver,
          icon: ShieldCheck,
          exact: false,
        },
      ]
    : [
        {
          href: "/",
          label: gLabels.home,
          icon: Home,
          exact: true,
        },
        {
          href: "/patient",
          label: gLabels.patient,
          icon: Brain,
          exact: true,
        },
        {
          href: "/caregiver",
          label: gLabels.caregiver,
          icon: ShieldCheck,
          exact: false,
        },
        {
          href: "/doctor",
          label: gLabels.doctor,
          icon: Stethoscope,
          exact: false,
        },
      ];

  const menuLabel = isPatientRoute ? pLabels.menu : gLabels.menu;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t-2 border-black/20 bg-surface/95 backdrop-blur-md shadow-[0_-3px_12px_rgba(0,0,0,0.08)] select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex h-16 w-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => playPress()}
              className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] ${
                isActive
                  ? "text-tea font-black"
                  : "text-ink-secondary/80 hover:text-ink font-bold"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-xl p-1 transition-all ${
                  isActive
                    ? "bg-tea/15 text-tea scale-105"
                    : "text-ink-secondary/80"
                }`}
              >
                <Icon
                  className={`h-5 w-5 stroke-[2.4] ${
                    isActive ? "text-tea" : "text-ink-secondary"
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-tea" />
                )}
              </div>
              <span className="mt-0.5 text-[11px] leading-tight tracking-tight whitespace-nowrap truncate max-w-[76px]">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: Menu (Triggers Responsive Nav Drawer with all portals and tools) */}
        <button
          type="button"
          onClick={handleOpenDrawer}
          className="flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] text-ink-secondary/80 hover:text-ink font-bold"
        >
          <div className="relative flex items-center justify-center rounded-xl p-1 transition-all text-ink-secondary/80">
            <Menu className="h-5 w-5 stroke-[2.4]" />
          </div>
          <span className="mt-0.5 text-[11px] leading-tight tracking-tight whitespace-nowrap truncate max-w-[76px]">
            {menuLabel}
          </span>
        </button>
      </div>
    </nav>
  );
}
