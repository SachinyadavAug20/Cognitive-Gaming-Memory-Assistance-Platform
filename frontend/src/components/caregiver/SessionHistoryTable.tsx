import type { SessionRecord } from "@/types";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

interface SessionHistoryTableProps {
  sessions: SessionRecord[];
}

export function SessionHistoryTable({ sessions }: SessionHistoryTableProps) {
  return (
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
              <th className="py-3 text-sm font-bold text-ink-secondary uppercase tracking-wider hidden sm:table-cell">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
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
                <td className="py-3 text-base text-ink-secondary font-[family-name:var(--font-mono)] hidden sm:table-cell">
                  {s.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrapbookCard>
  );
}
