import { PATIENTS } from "@/data/caregiverData";
import { CaregiverContent } from "./CaregiverContent";

export default function CaregiverDashboard() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      <CaregiverContent patients={PATIENTS} />
    </div>
  );
}
