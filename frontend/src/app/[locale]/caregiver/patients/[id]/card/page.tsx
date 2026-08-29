"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PrintPatientCard } from "@/components/caregiver/PrintPatientCard";
import { api, HttpError } from "@/lib/api";
import type { GenerateCardResponse, PatientProfile } from "@/types/auth";

export default function PatientCardPage() {
  const t = useTranslations("idcard");
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [secureToken, setSecureToken] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchCard() {
      try {
        const [profile, card] = await Promise.all([
          api.get<PatientProfile>(`/patients/${patientId}`),
          api.post<GenerateCardResponse>(`/caregiver/patients/${patientId}/card`, {}),
        ]);
        if (ignore) return;
        setPatientName(card.patientName || profile.name);
        setSecureToken(card.secureToken);
      } catch (err) {
        if (ignore) return;
        setError(
          err instanceof HttpError
            ? `${t("error.fetch")} (${err.status})`
            : t("error.fetch")
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCard();
    return () => {
      ignore = true;
    };
  }, [patientId, t]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const card = await api.post<GenerateCardResponse>(
        `/caregiver/patients/${patientId}/card`,
        {}
      );
      setSecureToken(card.secureToken);
      setPatientName(card.patientName || patientName);
    } catch {
      setError(t("error.regenerate"));
    } finally {
      setRegenerating(false);
    }
  };

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
        {loading && (
          <div className="flex items-center justify-center py-16 print:hidden">
            <div className="w-12 h-12 border-4 border-marigold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="rounded-xl bg-brick-light border-2 border-brick p-4 text-brick font-bold text-center print:hidden"
          >
            {error}
          </div>
        )}

        {!loading && !error && secureToken && (
          <>
            <PrintPatientCard
              patientName={patientName}
              secureToken={secureToken}
            />

            <div className="flex justify-center">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="btn-chunky btn-chunky-outline btn-chunky-xl print:hidden"
              >
                {regenerating ? "…" : `↻ ${t("regenerate")}`}
              </button>
            </div>

            <Link
              href={backHref}
              className="block text-center font-bold text-ink-secondary hover:text-ink transition-colors print:hidden"
            >
              ← {t("backToProfile")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}