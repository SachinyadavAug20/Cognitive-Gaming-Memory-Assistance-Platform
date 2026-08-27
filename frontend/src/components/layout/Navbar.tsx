"use client";

import Link from "next/link";
import type { Language } from "@/types";

interface NavbarProps {
  lang: string;
  onLangChange: (code: string) => void;
  isOnline: boolean;
  languages: Language[];
}

export function Navbar({ lang, onLangChange, isOnline, languages }: NavbarProps) {
  return (
    <header className="w-full bg-canvas border-b-2 border-border/10 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-marigold border-2 border-border rounded-xl flex items-center justify-center text-white text-xl shadow-[0_2px_0_var(--color-border)]">
            🧠
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-black text-xl text-ink leading-tight">CogniCare</h1>
            <p className="text-[11px] font-bold text-ink-secondary tracking-wider uppercase">
              MDoNER Cognitive Health Initiative
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-border rounded-xl text-xs font-bold shadow-[0_2px_0_var(--color-border)] ${isOnline ? "bg-tea-light text-tea" : "bg-marigold-light text-marigold"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-tea animate-pulse" : "bg-marigold"}`} />
            {isOnline ? "Online" : "Offline"}
          </div>

          <div className="flex items-center gap-1 bg-surface-muted p-1 border-2 border-border rounded-xl shadow-[0_2px_0_var(--color-border)]">
            {languages.map((l) => (
              <button key={l.code} onClick={() => onLangChange(l.code)}
                title={l.full}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === l.code
                    ? "bg-marigold text-white shadow-sm"
                    : "text-ink-secondary hover:bg-white/80"
                }`}
              >{l.label}</button>
            ))}
          </div>

          <Link href="tel:108">
            <button className="flex items-center gap-2 px-4 py-2 bg-brick hover:bg-[#A31815] text-white font-extrabold text-sm border-2 border-border rounded-xl shadow-[0_3px_0_var(--color-border)] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer min-h-[44px]">
              <span className="text-base">🚨</span>
              <span>SOS HELP</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
