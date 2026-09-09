import type { Metadata } from "next";
import { ClinicalEvidenceClient } from "./ClinicalEvidenceClient";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Clinical Evidence & Neuropsychological R&D Dossier",
    description:
      "Comprehensive clinical evidence, neuropsychological frameworks (Errorless Learning, CST, FINGER model), MoCA 6-domain translation, and W3C COGA guidelines for CogniCare CDTx dementia platform.",
    path: "/clinical-evidence",
  });
}

export default function ClinicalEvidencePage() {
  return <ClinicalEvidenceClient />;
}
