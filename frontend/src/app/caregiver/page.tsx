import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

type Trend = "improving" | "stable" | "declining";

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  lastSession: string;
  trend: Trend;
  scores: { memory: number; spatial: number; reaction: number };
}

const PATIENTS: Patient[] = [
  { id: "1", name: "Ramesh Dutta", age: 72, diagnosis: "Mild Cognitive Impairment", lastSession: "2 hours ago", trend: "improving", scores: { memory: 85, spatial: 62, reaction: 74 } },
  { id: "2", name: "Savitri Devi", age: 68, diagnosis: "Early-Stage Dementia", lastSession: "Yesterday", trend: "stable", scores: { memory: 71, spatial: 58, reaction: 66 } },
  { id: "3", name: "Bhupen Kalita", age: 75, diagnosis: "Mild Cognitive Impairment", lastSession: "3 days ago", trend: "declining", scores: { memory: 64, spatial: 45, reaction: 59 } },
];

const TREND_COLORS: Record<Trend, string> = {
  improving: "text-tea bg-tea-light",
  stable: "text-marigold bg-marigold-light",
  declining: "text-brick bg-brick-light",
};

const TREND_LABELS: Record<Trend, string> = {
  improving: "↗ Improving",
  stable: "→ Stable",
  declining: "↘ Needs Attention",
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[11px] font-bold text-ink-secondary">{label}</span>
        <span className="text-[11px] font-bold text-ink">{value}%</span>
      </div>
      <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden border border-border-soft">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function CaregiverDashboard() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="bg-ink border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
              Caregiver Dashboard
            </h1>
            <p className="text-ink-inverse/60 text-xs mt-0.5">Monitor cognitive health for your patients</p>
          </div>
          <Link href="/" className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-sm transition-colors">
            ← Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-3 space-y-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        {/* ── Alert Banner ── */}
        <ScrapbookCard className="!bg-brick-light !border-brick !p-3">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">⚠️</span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-brick leading-tight">
                Bhupen Kalita — Spatial recall dropped 15% this week
              </h3>
              <p className="text-brick/80 text-xs mt-0.5">
                Recommend reviewing landmark exercises. Consider increasing wayfinding sessions to 4x/week.
              </p>
            </div>
          </div>
        </ScrapbookCard>

        {/* ── Patient Cards ── */}
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            Your Patients
          </h2>
          <div className="space-y-3 flex gap-2 flex-col">
            {PATIENTS.map((patient) => (
              <Link key={patient.id} href={`/caregiver/patients/${patient.id}`}>
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
                    <ScoreBar label="Memory" value={patient.scores.memory} color="bg-tea" />
                    <ScoreBar label="Spatial" value={patient.scores.spatial} color="bg-terracotta" />
                    <ScoreBar label="Reaction" value={patient.scores.reaction} color="bg-marigold" />
                  </div>
                </ScrapbookCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
