import Link from "next/link";
import { PATIENTS } from "@/data/caregiverData";
import { AlertBanner } from "@/components/caregiver/AlertBanner";
import { PatientCard } from "@/components/caregiver/PatientCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";

export default function CaregiverDashboard() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      <div className="bg-ink border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
              Caregiver Dashboard
            </h1>
            <p className="text-ink-inverse/60 text-xs mt-0.5">Monitor cognitive health for your patients</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/caregiver/add-patient">
              <ChunkyButton variant="marigold" size="xl">
                + Add Patient
              </ChunkyButton>
            </Link>
            <Link href="/" className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-sm transition-colors">
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-3 space-y-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        <AlertBanner
          title="Bhupen Kalita — Spatial recall dropped 15% this week"
          description="Recommend reviewing landmark exercises. Consider increasing wayfinding sessions to 4x/week."
        />

        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            Your Patients
          </h2>
          <div className="space-y-3 flex gap-2 flex-col">
            {PATIENTS.map((patient) => (
              <Link key={patient.id} href={`/caregiver/patients/${patient.id}`}>
                <PatientCard patient={patient} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
