import { Link } from "@/i18n/navigation";
import { DevImportTools } from "./DevImportTools";

export const metadata = {
  title: "Add New Patient — CogniCare",
  description: "Add a new patient profile to the cognitive care platform",
};

export default function AddPatientPage() {
  return (
    <div className="min-h-screen pb-8">
      <div className="bg-ink border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
              Add New Patient
            </h1>
            <p className="text-ink-inverse/60 text-xs mt-0.5">
              Create a personalized profile for cognitive care
            </p>
          </div>
          <Link
            href="/caregiver"
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-sm transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <DevImportTools />
      </div>
    </div>
  );
}
