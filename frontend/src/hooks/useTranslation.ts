"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  const { locale, setLocale, t } = useLanguage();
  return { locale, setLocale, t };
}
