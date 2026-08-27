import type { Patient } from "@/types";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { ScoreBar } from "@/components/caregiver/ScoreBar";
import { TREND_COLORS, TREND_LABELS } from "@/data/caregiverData";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <ScrapbookCard className="!p-4 py-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform cursor-pointer">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full border-3 border-border bg-surface-muted flex items-center justify-center text-lg font-bold shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-ink truncate">{patient.name}</h3>
            <p className="text-ink-secondary text-xs">
              Age {patient.age} &bull; {patient.diagnosis}
            </p>
            <p className="text-ink-secondary text-[11px]">Last session: {patient.lastSession}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 self-start md:self-center shrink-0 ${TREND_COLORS[patient.trend]}`}>
          {TREND_LABELS[patient.trend]}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t-2 border-border-soft">
        <ScoreBar label="Memory" value={patient.scores.memory} color="bg-tea" size="sm" />
        <ScoreBar label="Spatial" value={patient.scores.spatial} color="bg-terracotta" size="sm" />
        <ScoreBar label="Reaction" value={patient.scores.reaction} color="bg-marigold" size="sm" />
      </div>
    </ScrapbookCard>
  );
}
