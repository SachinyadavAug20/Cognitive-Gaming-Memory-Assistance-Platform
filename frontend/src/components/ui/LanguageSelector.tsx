"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const ALL_LANGUAGES = [
  { code: "en", label: "ENG", full: "English" },
  { code: "hi", label: "हि", full: "हिन्दी" },
  { code: "as", label: "অস", full: "অসমীয়া" },
  { code: "bn", label: "বা", full: "বাংলা" },
  { code: "mni", label: "মৈ", full: "মৈতৈলোন্" },
  { code: "kha", label: "Kha", full: "Khasi" },
  { code: "lus", label: "Miz", full: "Mizo" },
  { code: "nep", label: "ने", full: "नेपाली" },
  { code: "brx", label: "बड़", full: "बड़ो" },
  { code: "trl", label: "Kok", full: "Kokborok" },
  { code: "ta", label: "த", full: "தமிழ்" },
  { code: "te", label: "తె", full: "తెలుగు" },
  { code: "mr", label: "म", full: "मराठी" },
  { code: "ml", label: "മ", full: "മലയാളം" },
  { code: "kn", label: "ಕ", full: "ಕನ್ನಡ" },
  { code: "gu", label: "ગુ", full: "ગુજરાતી" },
  { code: "pa", label: "ਪੰ", full: "ਪੰਜਾਬੀ" },
  { code: "od", label: "ଓଡ़", full: "ଓଡ଼ିଆ" },
  { code: "ur", label: "اُر", full: "اردو" },
  { code: "mai", label: "मै", full: "मैथिली" },
  { code: "sat", label: "ᱥᱟ", full: "ᱥᱟᱨᱤᱡ" },
  { code: "sd", label: "سن", full: "سنڌي" },
  { code: "ks", label: "कश", full: "कश्मीरी" },
  { code: "dog", label: "डो", full: "डोगरी" },
  { code: "kok", label: "कों", full: "कोंकणी" },
  { code: "sa", label: "सं", full: "संस्कृतम्" },
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className = "" }: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const displayLanguages = compact && !showAll ? ALL_LANGUAGES.slice(0, 5) : ALL_LANGUAGES;

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex items-center gap-1 bg-surface-muted p-1 border-2 border-border rounded-xl shadow-[0_2px_0_var(--color-border)]">
          {displayLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              title={l.full}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                locale === l.code
                  ? "bg-marigold text-white shadow-sm"
                  : "text-ink-secondary hover:bg-white/80"
              }`}
            >
              {l.label}
            </button>
          ))}
          {!showAll && ALL_LANGUAGES.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg text-ink-secondary hover:bg-white/80 transition-all"
              title="More languages"
            >
              +{ALL_LANGUAGES.length - 5}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
        Select Language
      </p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Language">
        {ALL_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={locale === l.code}
            onClick={() => setLocale(l.code)}
            className={`min-h-[48px] px-4 rounded-xl border-3 font-bold transition-all ${
              locale === l.code
                ? "bg-marigold text-white border-border"
                : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
            }`}
          >
            <span className="block text-sm">{l.label}</span>
            <span className="block text-[10px] opacity-70">{l.full}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
