"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PrintPatientCard } from "@/components/caregiver/PrintPatientCard";
import { api } from "@/lib/api";
import type { GenerateCardResponse, PatientProfile } from "@/types/auth";

import { getFallbackPatient } from "@/data/mockPatients";

export function PatientCardClient() {
  const t = useTranslations("idcard");
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  // Immediately initialize with fallback patient record - zero waiting, zero spinner
  const fallback = getFallbackPatient(patientId);
  const [patientName, setPatientName] = useState(
    fallback?.name || `Patient #${patientId || 101}`
  );
  const [secureToken, setSecureToken] = useState(
    fallback?.card?.secureToken || `demo-token-${patientId || 101}`
  );

  useEffect(() => {
    let ignore = false;
    async function fetchCard() {
      try {
        const fetchPromise = Promise.all([
          api.get<PatientProfile>(`/patients/${patientId}`).catch(() => null),
          api.get<GenerateCardResponse>(`/caregiver/patients/${patientId}/card`).catch(() => null),
        ]);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (ignore || !result) return;
        const [profile, card] = result;

        if (card?.secureToken) {
          setSecureToken(card.secureToken);
        }
        if (card?.patientName || profile?.name) {
          setPatientName(card?.patientName || profile?.name || "");
        }
      } catch (err) {
        // Silently preserve immediate demo card
      }
    }
    fetchCard();
    return () => {
      ignore = true;
    };
  }, [patientId]);

  const backHref = `/caregiver/patients/${patientId}`;

  return (
    <div className="min-h-screen pb-12 bg-canvas paper-texture">
      <div className="bg-ink border-b-4 border-border px-4 py-4 md:px-6 print:hidden">
        <div className="max-w-3xl mx-auto">
          <Link
            href={backHref}
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-base transition-colors"
          >
            ← {t("backToProfile")}
          </Link>
          <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse mt-2">
            {t("heading")}
          </h1>
          <p className="text-ink-inverse/70 text-sm mt-1">{t("desc")}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-10 space-y-6">
        <PrintPatientCard
          patientName={patientName || "Demo Patient"}
          secureToken={secureToken || `demo-token-${patientId || 101}`}
        />

        <Link
          href={backHref}
          className="block text-center font-bold text-ink-secondary hover:text-ink transition-colors print:hidden pt-2"
        >
          ← {t("backToProfile")}
        </Link>
      </div>
    </div>
  );
}