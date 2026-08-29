"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";

const IntakeWizard = dynamic(
  () => import("@/components/intake/IntakeWizard").then((mod) => mod.IntakeWizard),
  {
    ssr: false,
    loading: () => <Spinner className="min-h-[400px]" />,
  }
);

export function IntakeWizardClient() {
  return <IntakeWizard />;
}
