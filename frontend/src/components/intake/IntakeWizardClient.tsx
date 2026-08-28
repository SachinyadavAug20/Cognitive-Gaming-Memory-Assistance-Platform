"use client";

import dynamic from "next/dynamic";

const IntakeWizard = dynamic(
  () => import("@/components/intake/IntakeWizard").then((mod) => mod.IntakeWizard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-marigold border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export function IntakeWizardClient() {
  return <IntakeWizard />;
}
