import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { PatientCardClient } from "./PatientCardClient";

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
    title: `Secure Patient Card — ID ${id}`,
    description:
      "Printable secure patient identity card for CogniCare CDTx caregiver verification.",
    path: `/caregiver/patients/${id}/card`,
  });
}

export default async function PatientCardPage({ params }: Props) {
  const { id } = await params;
  return <PatientCardClient key={id} />;
}