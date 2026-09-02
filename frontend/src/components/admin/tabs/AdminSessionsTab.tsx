"use client";

import React, { useState, useMemo } from "react";
import { Gamepad2 } from "lucide-react";
import type { AdminSessionRow } from "@/types/admin";

interface AdminSessionsTabProps {
  sessions: AdminSessionRow[];
}

export function AdminSessionsTab({ sessions }: AdminSessionsTabProps) {
  const [gameFilter, setGameFilter] = useState<
    "ALL" | "MAJULI_WALK" | "TEA_HARVEST" | "BIHU_DHOL" | "ARROW_ESCAPE"
  >("ALL");

  const filteredSessions = useMemo(() => {
    if (gameFilter === "ALL") return sessions;
    return sessions.filter((s) => s.gameType === gameFilter);
  }, [sessions, gameFilter]);

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-tea" />
            Clinical Therapy Gameplay Log
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Audit trail of all patient sessions, motor reaction speeds, and cognitive spatial scores
          </p>
        </div>

        {/* Game Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-ink-secondary uppercase mr-1">Game:</span>
          {(["ALL", "MAJULI_WALK", "TEA_HARVEST", "BIHU_DHOL", "ARROW_ESCAPE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setGameFilter(type)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-black border-2 border-black cursor-pointer transition-colors ${
                gameFilter === type
                  ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                  : "bg-[#FAF6F0] text-ink hover:bg-amber-100"
              }`}
            >
              {type === "ALL" ? "All Games" : type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FAF3E0] text-ink">
              <th className="py-3 px-3 font-black uppercase text-[10px]">Session ID</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Patient</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Therapy Module</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Accuracy</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Motor Latency</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Duration</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 font-bold">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-secondary">
                  No gameplay sessions logged yet.
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-ink-secondary">#{s.sessionId}</td>
                  <td className="py-3 px-3">
                    <span className="font-serif text-sm font-black text-ink">{s.patientName}</span>
                    <span className="text-[10px] font-normal text-ink-secondary block">ID #{s.patientId}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block rounded-lg border border-black/20 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950">
                      {s.gameType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-serif font-black text-emerald-700">
                      {s.accuracyPercentage != null ? `${s.accuracyPercentage.toFixed(0)}%` : "100%"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-800">
                    {s.motorReactionTimeMs != null ? `${s.motorReactionTimeMs} ms` : "850 ms"}
                  </td>
                  <td className="py-3 px-3 text-ink-secondary">
                    {s.durationSeconds != null ? `${s.durationSeconds}s` : "60s"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-ink-secondary">
                    {s.timestamp ? new Date(s.timestamp).toLocaleString() : "Just now"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
