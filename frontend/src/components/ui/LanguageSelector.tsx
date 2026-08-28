"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "ENG", full: "English" },
  { code: "hi", label: "हिन्दी", full: "Hindi" },
  { code: "as", label: "অসমীয়া", full: "Assamese" },
  { code: "mr", label: "मराठी", full: "Marathi" },
];

export function LanguageSelector({ className = "" }: { className?: string; compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
  }

  return (
    <div className={`flex items-center gap-1 bg-[#F2ECE1] p-1 border-2 border-[#16120E] rounded-xl shadow-[0_2px_0_#16120E] ${className}`}>
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          title={l.full}
          className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
            locale === l.code
              ? "bg-[#E66A00] text-white shadow-sm"
              : "text-[#4A4036] hover:bg-white/80"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
