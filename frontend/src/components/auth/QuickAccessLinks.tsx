"use client";

import { Link } from "@/i18n/navigation";
import { User, UserCheck } from "lucide-react";
import { useLocale } from "next-intl";

const QUICK_ACCESS_I18N: Record<string, { label: string; patient: string; caregiver: string }> = {
  as: { label: "দ্ৰুত প্ৰৱেশাধিকাৰ:", patient: "ৰোগী", caregiver: "যত্নকৰ্তা" },
  hi: { label: "सीधा प्रवेश:", patient: "मरीज़", caregiver: "देखभालकर्ता" },
  en: { label: "Quick access as:", patient: "Patient", caregiver: "Caregiver" },
  bn: { label: "দ্রুত প্রবেশ:", patient: "রোগী", caregiver: "সেবাকারী" },
  mr: { label: "जलद प्रवेश:", patient: "रुग्ण", caregiver: "काळजीवाहक" },
  ne: { label: "द्रुत पहुँच:", patient: "बिरामी", caregiver: "हेरचाहकर्ता" },
  mni: { label: "থুনা চঙবা:", patient: "অনাবা", caregiver: "য়োকখৎপীবা" },
  brx: { label: "गोख्रै थांनाय:", patient: "बेमारि", caregiver: "सामलायग्रा" },
  grt: { label: "Ta·rake re·ani:", patient: "Sa·gipa", caregiver: "Naljokgipa" },
  kha: { label: "Rukom rung ba kloi:", patient: "Nongpang", caregiver: "Nongri" },
  lus: { label: "Luh zung zungna:", patient: "Damlo", caregiver: "Enkawltu" },
};

export function QuickAccessLinks() {
  const locale = useLocale();
  const str = QUICK_ACCESS_I18N[locale] || QUICK_ACCESS_I18N.en;

  return (
    <div className="text-center space-y-2">
      <p className="text-ink-secondary text-sm">{str.label}</p>
      <div className="flex gap-2.5 justify-center">
        <Link href="/patient" className="btn-tactile inline-flex items-center gap-1.5 bg-tea text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg font-bold">
          <User className="h-4 w-4" />
          <span>{str.patient}</span>
        </Link>
        <Link href="/caregiver" className="btn-tactile inline-flex items-center gap-1.5 bg-marigold text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg font-bold">
          <UserCheck className="h-4 w-4" />
          <span>{str.caregiver}</span>
        </Link>
      </div>
    </div>
  );
}
