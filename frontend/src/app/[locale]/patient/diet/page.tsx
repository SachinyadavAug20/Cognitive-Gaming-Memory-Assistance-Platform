"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { PatientMealSnapCard } from "@/components/patient-dashboard/PatientMealSnapCard";
import { useLocale } from "next-intl";

export default function PatientDietSnapPage() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  return (
    <div className="min-h-screen bg-canvas pb-24 text-ink px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="p-2.5 rounded-xl bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-serif font-black text-lg sm:text-xl text-ink">
            {normLoc === "hi"
              ? "वापस मुख्य पृष्ठ"
              : normLoc === "as"
              ? "মুখ্য পৃষ্ঠালৈ ঘূৰি যাওক"
              : "Back to Patient Routine"}
          </span>
        </div>

        <PatientMealSnapCard />
      </div>
    </div>
  );
}
