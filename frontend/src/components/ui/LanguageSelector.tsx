"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";

export interface LanguageDef {
  code: string;
  label: string;
  native: string;
  full: string;
  region: string;
  isNES: boolean;
}

export const ALL_LANGUAGES: LanguageDef[] = [
  // North Eastern Region Languages (MDoNER)
  { code: "as", label: "অসমীয়া", native: "অসমীয়া", full: "Assamese", region: "Assam", isNES: true },
  { code: "bn", label: "বাংলা", native: "বাংলা", full: "Bengali", region: "Tripura & Barak", isNES: true },
  { code: "mni", label: "মৈতৈলোন্", native: "মৈতৈলোন্", full: "Manipuri", region: "Manipur", isNES: true },
  { code: "lus", label: "Mizo", native: "Mizo ṭawng", full: "Mizo", region: "Mizoram", isNES: true },
  { code: "kha", label: "Khasi", native: "Ka Ktien Khasi", full: "Khasi", region: "Meghalaya", isNES: true },
  { code: "grt", label: "Garo", native: "A·chik", full: "Garo", region: "Meghalaya", isNES: true },
  { code: "brx", label: "बर'", native: "बर'", full: "Bodo", region: "Bodoland", isNES: true },
  { code: "ne", label: "नेपाली", native: "नेपाली", full: "Nepali", region: "Sikkim & NES Hills", isNES: true },

  // National & Other Languages
  { code: "en", label: "ENG", native: "English", full: "English", region: "National", isNES: false },
  { code: "hi", label: "हिन्दी", native: "हिन्दी", full: "Hindi", region: "National", isNES: false },
  { code: "mr", label: "मराठी", native: "मराठी", full: "Marathi", region: "Western India", isNES: false },
];

const QUICK_LANGS = ["en", "hi", "as", "bn", "ne"];

export function LanguageSelector({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = ALL_LANGUAGES.find((l) => l.code === locale) || ALL_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: code });
  };

  const nesLangs = ALL_LANGUAGES.filter((l) => l.isNES);
  const otherLangs = ALL_LANGUAGES.filter((l) => !l.isNES);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Quick Access Top Language Buttons for Large Screens */}
      <div className="hidden lg:flex items-center gap-1 bg-surface p-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
        {QUICK_LANGS.map((code) => {
          const lang = ALL_LANGUAGES.find((l) => l.code === code);
          if (!lang) return null;
          const isSelected = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              title={`${lang.full} (${lang.region})`}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? "bg-tea text-white shadow-sm"
                  : "text-ink hover:bg-tea-light/60"
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>

      {/* NES Region Language Hub Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select North East State or National Language"
        className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-2.5 sm:px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
          currentLang.isNES
            ? "bg-marigold text-white hover:bg-amber-600"
            : "bg-surface text-ink hover:bg-surface-muted"
        }`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">
          {currentLang.native} {currentLang.isNES ? "(NES)" : ""}
        </span>
        <span className="sm:hidden font-extrabold">{currentLang.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border-3 border-black bg-surface p-2.5 shadow-[5px_5px_0px_#000] z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="px-2.5 py-1.5 border-b-2 border-black/15 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-tea flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> North Eastern Region (NES)
            </span>
            <span className="text-[9px] font-black uppercase rounded bg-tea-light px-1.5 py-0.5 text-tea border border-tea/30">
              8 States
            </span>
          </div>

          {/* NES Languages Section */}
          <div className="space-y-1">
            {nesLangs.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                      : "hover:bg-tea-light/60 text-ink"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">{lang.native}</span>
                    <span className={`text-[10px] font-semibold ${isSelected ? "text-white/80" : "text-ink-secondary"}`}>
                      {lang.full} &bull; {lang.region}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 font-black" />}
                </button>
              );
            })}
          </div>

          {/* National Languages Section */}
          <div className="px-2.5 py-1.5 border-b-2 border-black/15 my-2 border-t-2 pt-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
              National & Other Languages
            </span>
          </div>

          <div className="space-y-1">
            {otherLangs.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                      : "hover:bg-tea-light/60 text-ink"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">{lang.native}</span>
                    <span className={`text-[10px] font-semibold ${isSelected ? "text-white/80" : "text-ink-secondary"}`}>
                      {lang.full} &bull; {lang.region}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 font-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
