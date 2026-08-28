"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "ENG", full: "English" },
  { code: "hi", label: "हिन्दी", full: "Hindi" },
  { code: "as", label: "অসমীয়া", full: "Assamese" },
  { code: "mr", label: "मराठी", full: "Marathi" },
] as const;

export function LanguageSelector({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={`flex items-center gap-1 bg-surface-muted p-1 border-2 border-border rounded-xl shadow-[0_2px_0_var(--color-border)] ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => router.replace(pathname, { locale: lang.code })}
          title={lang.full}
          className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
            locale === lang.code
              ? "bg-marigold text-white shadow-sm"
              : "text-ink-secondary hover:bg-white/80"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
