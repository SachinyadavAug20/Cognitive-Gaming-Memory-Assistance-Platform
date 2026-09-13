"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const LOGIN_FORM_I18N: Record<string, { email: string; password: string; signIn: string }> = {
  as: { email: "ইমেইল", password: "পাছৱৰ্ড", signIn: "ছাইন ইন" },
  hi: { email: "ईमेल", password: "पासवर्ड", signIn: "साइन इन" },
  en: { email: "Email", password: "Password", signIn: "Sign In" },
  bn: { email: "ইমেল", password: "পাসওয়ার্ড", signIn: "সাইন ইন" },
  mr: { email: "ईमेल", password: "पासवर्ड", signIn: "साइन इन" },
  ne: { email: "इमेल", password: "पासवर्ड", signIn: "साइन इन" },
  mni: { email: "ইমেল", password: "পাসৱার্দ", signIn: "সাইন ইন" },
  brx: { email: "इमेल", password: "पासवर्ड", signIn: "साइन इन" },
  grt: { email: "Email", password: "Password", signIn: "Napbo" },
  kha: { email: "Email", password: "Password", signIn: "Rung Noh" },
  lus: { email: "Email", password: "Password", signIn: "Lut Rawh" },
};

export function LoginForm() {
  const locale = useLocale();
  const str = LOGIN_FORM_I18N[locale] || LOGIN_FORM_I18N.en;

  return (
    <div className="scrapbook-card space-y-4">
      <div>
        <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">{str.email}</label>
        <input type="email" placeholder="you@example.com"
          className="w-full px-4 py-3 text-base border-3 border-border rounded-xl bg-surface text-ink focus:border-terracotta focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">{str.password}</label>
        <input type="password" placeholder="••••••••"
          className="w-full px-4 py-3 text-base border-3 border-border rounded-xl bg-surface text-ink focus:border-terracotta focus:outline-none transition-colors" />
      </div>
      <Link href="/patient"
        className="btn-tactile bg-terracotta text-ink-inverse border-border text-lg px-6 py-3.5 min-h-[56px] rounded-xl w-full flex items-center justify-center gap-2">
        {str.signIn} <span className="text-lg">→</span>
      </Link>
    </div>
  );
}
