import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { CaregiverPatientDetailClient } from "@/components/patient-detail/PatientDetailClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return buildMetadata({
    locale,
    title: `Patient Record — ID ${id} · Cognitive Care Dashboard`,
    description:
      "Caregiver clinical dashboard with patient vitals, cognitive biomarkers, motor trajectory, family network and life-story personalization.",
    path: `/caregiver/patients/${id}`,
    keywords: [
      "patient record",
      "cognitive biomarkers",
      "caregiver dashboard",
      "clinical telemetry",
      "CDTx therapy",
    ],
  });
}

export default async function CaregiverPatientDetailPage({ params }: Props) {
  const { id } = await params;
  return <CaregiverPatientDetailClient key={id} />;
}