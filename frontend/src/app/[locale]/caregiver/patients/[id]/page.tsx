import Link from "next/link";
import { MOCK_PATIENT, SESSIONS, TREND_DATA } from "@/data/caregiverData";
import { TrendChart } from "@/components/caregiver/TrendChart";
import { CognitiveScoreCard } from "@/components/caregiver/CognitiveScoreCard";
import { SessionHistoryTable } from "@/components/caregiver/SessionHistoryTable";
import { MemoryVault } from "@/components/caregiver/MemoryVault";

export default async function CaregiverPatientDetail({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  void id;

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-ink border-b-4 border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/caregiver"
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-base transition-colors mb-3 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full border-3 border-ink-inverse/20 bg-ink-secondary/20 flex items-center justify-center text-2xl text-ink-inverse font-bold shrink-0">
              {MOCK_PATIENT.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse">
                {MOCK_PATIENT.name}
              </h1>
              <p className="text-ink-inverse/60 text-base">
                Age {MOCK_PATIENT.age} &bull; {MOCK_PATIENT.diagnosis} &bull;
                Since {MOCK_PATIENT.startDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        <CognitiveScoreCard scores={MOCK_PATIENT.scores} />

        <div className="scrapbook-card">
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
            4-Week Trend
          </h2>
          <TrendChart data={TREND_DATA} />
          <div className="flex gap-6 mt-4 justify-center">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="w-3 h-3 rounded-full bg-tea" /> Memory
            </span>
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="w-3 h-3 rounded-full bg-terracotta" /> Spatial
            </span>
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="w-3 h-3 rounded-full bg-marigold" /> Reaction
            </span>
          </div>
        </div>

        <SessionHistoryTable sessions={SESSIONS} />

        <MemoryVault photos={["👨‍👩‍👧", "🏡", "🎂", "🌺", "🎭", "📸"]} />
      </div>
    </div>
  );
}
