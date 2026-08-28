"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface LanguageContextType {
  locale: string;
  setLocale: (code: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

function getSavedLocale(): string {
  try {
    return localStorage.getItem("cognicore:locale") || "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState(getSavedLocale);
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      import("@/messages/en.json"),
      locale === "en"
        ? Promise.resolve({ default: {} })
        : import(`@/messages/${locale}.json`).catch(() => ({ default: {} })),
    ]).then(([enMod, langMod]) => {
      const enMessages = enMod.default as Record<string, string>;
      const langMessages = langMod.default as Record<string, string>;
      const merged: Record<string, string> = { ...enMessages };
      for (const [key, val] of Object.entries(langMessages)) {
        if (val) merged[key] = val;
      }
      setMessages(merged);
    });
  }, [locale]);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    try {
      localStorage.setItem("cognicore:locale", code);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = messages[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        });
      }
      return value;
    },
    [messages]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
