import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

const MOCK_PATIENT = {
  id: "1",
  name: "Ramesh Dutta",
  age: 72,
  diagnosis: "Mild Cognitive Impairment",
  caregiver: "Priya Dutta (Daughter)",
  startDate: "2026-06-15",
  scores: { memory: 85, spatial: 62, reaction: 74 },
};

const SESSIONS = [
  {
    date: "Aug 26",
    game: "Memory Pieces",
    score: 88,
    duration: "11m 23s",
    status: "completed",
  },
  {
    date: "Aug 25",
    game: "Remember the Way",
    score: 72,
    duration: "8m 45s",
    status: "completed",
  },
  {
    date: "Aug 24",
    game: "Memory Pieces",
    score: 82,
    duration: "12m 01s",
    status: "completed",
  },
  {
    date: "Aug 23",
    game: "Remember the Way",
    score: 65,
    duration: "9m 12s",
    status: "completed",
  },
  {
    date: "Aug 22",
    game: "Memory Pieces",
    score: 78,
    duration: "10m 55s",
    status: "completed",
  },
];

const TREND_DATA = [
  { week: "W1", memory: 72, spatial: 55, reaction: 68 },
  { week: "W2", memory: 76, spatial: 58, reaction: 70 },
  { week: "W3", memory: 80, spatial: 60, reaction: 72 },
  { week: "W4", memory: 85, spatial: 62, reaction: 74 },
];

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-bold text-ink-secondary">{label}</span>
        <span className="text-sm font-bold text-ink">{value}%</span>
      </div>
      <div className="h-3 bg-surface-muted rounded-full overflow-hidden border border-border-soft">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: typeof TREND_DATA }) {
  const maxVal = 100;
  const chartHeight = 120;
  const chartWidth = 100;
  const barWidth = chartWidth / data.length;

  const colors = { memory: "#2B593F", spatial: "#C85A32", reaction: "#D97706" };

  return (
    <div className="relative" style={{ height: chartHeight + 30 }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1="0"
              y1={chartHeight - (v / maxVal) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (v / maxVal) * chartHeight}
              stroke="#D4C9BA"
              strokeWidth="0.3"
            />
          </g>
        ))}

        {/* Memory line */}
        <polyline
          points={data
            .map(
              (d, i) =>
                `${i * barWidth + barWidth / 2},${chartHeight - (d.memory / maxVal) * chartHeight}`,
            )
            .join(" ")}
          fill="none"
          stroke={colors.memory}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Spatial line */}
        <polyline
          points={data
            .map(
              (d, i) =>
                `${i * barWidth + barWidth / 2},${chartHeight - (d.spatial / maxVal) * chartHeight}`,
            )
            .join(" ")}
          fill="none"
          stroke={colors.spatial}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Reaction line */}
        <polyline
          points={data
            .map(
              (d, i) =>
                `${i * barWidth + barWidth / 2},${chartHeight - (d.reaction / maxVal) * chartHeight}`,
            )
            .join(" ")}
          fill="none"
          stroke={colors.reaction}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={i * barWidth + barWidth / 2}
              cy={chartHeight - (d.memory / maxVal) * chartHeight}
              r="2"
              fill={colors.memory}
            />
            <circle
              cx={i * barWidth + barWidth / 2}
              cy={chartHeight - (d.spatial / maxVal) * chartHeight}
              r="2"
              fill={colors.spatial}
            />
            <circle
              cx={i * barWidth + barWidth / 2}
              cy={chartHeight - (d.reaction / maxVal) * chartHeight}
              r="2"
              fill={colors.reaction}
            />
          </g>
        ))}
      </svg>

      {/* Week labels */}
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.week} className="text-xs font-bold text-ink-secondary">
            {d.week}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function CaregiverPatientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void id;

  return (
    <div className="min-h-screen pb-8">
      {/* ── Header ── */}
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
        {/* ── Cognitive Scores ── */}
        <ScrapbookCard>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
            Current Cognitive Scores
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ScoreBar
              label="Visual Memory"
              value={MOCK_PATIENT.scores.memory}
              color="bg-tea"
            />
            <ScoreBar
              label="Spatial Orientation"
              value={MOCK_PATIENT.scores.spatial}
              color="bg-terracotta"
            />
            <ScoreBar
              label="Reaction Time"
              value={MOCK_PATIENT.scores.reaction}
              color="bg-marigold"
            />
          </div>
        </ScrapbookCard>

        {/* ── Trend Chart ── */}
        <ScrapbookCard>
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
        </ScrapbookCard>

        {/* ── Session History ── */}
        <ScrapbookCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink">
              Session History
            </h2>
            <button className="btn-tactile bg-surface text-ink border-border text-sm px-4 py-2 min-h-[48px] rounded-lg">
              Export PDF Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-border-soft">
                  <th className="py-3 text-sm font-bold text-ink-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 text-sm font-bold text-ink-secondary uppercase tracking-wider">
                    Game
                  </th>
                  <th className="py-3 text-sm font-bold text-ink-secondary uppercase tracking-wider">
                    Score
                  </th>
                  <th className="py-3 text-sm font-bold text-ink-secondary uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {SESSIONS.map((s, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-soft last:border-0"
                  >
                    <td className="py-3 text-base font-bold text-ink">
                      {s.date}
                    </td>
                    <td className="py-3 text-base text-ink-secondary">
                      {s.game}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold text-base ${
                          s.score >= 80
                            ? "text-tea"
                            : s.score >= 65
                              ? "text-marigold"
                              : "text-brick"
                        }`}
                      >
                        {s.score}
                      </span>
                    </td>
                    <td className="py-3 text-base text-ink-secondary font-[family-name:var(--font-mono)]">
                      {s.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrapbookCard>

        {/* ── Memory Vault ── */}
        <ScrapbookCard>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
            📸 Memory Vault — Family Photos
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {["👨‍👩‍👧", "🏡", "🎂", "🌺", "🎭", "📸"].map((emoji, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-border-soft bg-surface-muted flex items-center justify-center text-3xl hover:border-border hover:bg-surface transition-colors cursor-pointer"
              >
                {emoji}
              </div>
            ))}
            <button className="aspect-square rounded-lg border-3 border-dashed border-border-soft bg-surface-muted flex items-center justify-center text-2xl text-ink-secondary hover:border-terracotta hover:text-terracotta transition-colors">
              +
            </button>
          </div>
          <p className="text-sm text-ink-secondary mt-3">
            Upload family photos for personalized memory puzzles. Drag photos
            here or click + to add.
          </p>
        </ScrapbookCard>
      </div>
    </div>
  );
}
