import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { QuickAccessLinks } from "@/components/auth/QuickAccessLinks";
import { KioskLoginSection } from "@/components/auth/KioskLoginSection";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Staff, Caregiver & Clinician Login",
    description:
      "Secure sign-in for CogniCare caregivers, ASHA workers, PHC clinicians and administrators managing elderly dementia and MCI digital therapy.",
    path: "/login",
  });
}

const LOGIN_PAGE_I18N: Record<string, { welcome: string; subtitle: string; orManual: string }> = {
  as: { welcome: "পুনৰ স্বাগতম", subtitle: "অব্যাহত ৰাখিবলৈ ছাইন ইন কৰক", orManual: "বা মেনুৱেলী ছাইন ইন কৰক" },
  hi: { welcome: "पुनः स्वागत है", subtitle: "आगे बढ़ने के लिए साइन इन करें", orManual: "या मैन्युअल रूप से साइन इन करें" },
  en: { welcome: "Welcome Back", subtitle: "Sign in to continue", orManual: "or sign in manually" },
  bn: { welcome: "পুনরায় স্বাগতম", subtitle: "চালিয়ে যেতে সাইন ইন করুন", orManual: "বা ম্যানুয়ালি সাইন ইন করুন" },
  mr: { welcome: "पुन्हा स्वागत आहे", subtitle: "सुरू ठेवण्यासाठी साइन इन करा", orManual: "किंवा स्वतः साइन इन करा" },
  ne: { welcome: "पुनः स्वागत छ", subtitle: "जारी राख्न साइन इन गर्नुहोस्", orManual: "वा म्यानुअल रूपमा साइन इन गर्नुहोस्" },
  mni: { welcome: "অমুক হন্না তরাম্না ওকচরি", subtitle: "মখা চত্থনবা সাইন ইন তৌবীয়ু", orManual: "নত্রগা মশানা সাইন ইন তৌবীয়ু" },
  brx: { welcome: "फिन बरायबाय", subtitle: "दावगानो साइन इन खालाम", orManual: "एबा गाव गावनो साइन इन खालाम" },
  grt: { welcome: "Rimnaptaita", subtitle: "Re·angana sign in ka·bo", orManual: "Ba an·tang sign in ka·bo" },
  kha: { welcome: "Pdiang sngewbha biang", subtitle: "Sign in ban bteng", orManual: "Lane sign in da lade" },
  lus: { welcome: "Lo lawm leh a che", subtitle: "Chhunzawm turin sign in rawh", orManual: "A nih loh leh mahniin sign in rawh" },
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const str = LOGIN_PAGE_I18N[locale] || LOGIN_PAGE_I18N.en;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 paper-texture">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 bg-terracotta rounded-xl border-3 border-border flex items-center justify-center shadow-[3px_3px_0px_var(--color-border)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-ink-inverse">
                <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" />
                <path d="M10 10h4M12 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink">CogniCare</span>
          </Link>
          <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-1">{str.welcome}</h1>
          <p className="text-ink-secondary text-base">{str.subtitle}</p>
        </div>

        {/* QR Kiosk Scanner */}
        <KioskLoginSection />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border-soft" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-canvas text-ink-secondary font-bold uppercase tracking-wider">
              {str.orManual}
            </span>
          </div>
        </div>

        <LoginForm />

        <QuickAccessLinks />
      </div>
    </div>
  );
}
