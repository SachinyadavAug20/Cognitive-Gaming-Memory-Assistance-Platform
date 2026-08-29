"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import type { IntakeFormData } from "@/types/intake";

const IntakeWizard = dynamic(
  () => import("@/components/intake/IntakeWizard").then((mod) => mod.IntakeWizard),
  {
    ssr: false,
    loading: () => <Spinner className="min-h-[400px]" />,
  }
);

export function IntakeWizardClient({ prefill }: { prefill?: IntakeFormData }) {
  return <IntakeWizard prefill={prefill} />;
}