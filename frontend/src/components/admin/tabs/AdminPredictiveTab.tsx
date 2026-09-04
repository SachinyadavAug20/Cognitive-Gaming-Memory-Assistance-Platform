"use client";

import React from "react";
import { TrendingUp, Sparkles, Check } from "lucide-react";
import type { AdminPredictiveTrajectory } from "@/types/admin";

interface AdminPredictiveTabProps {
  predictiveTrajectories: AdminPredictiveTrajectory[];
}

export function AdminPredictiveTab({
  predictiveTrajectories,
}: AdminPredictiveTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-700" />
            AI Cognitive Stability & 90-Day Prognosis Model
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Predictive cognitive trajectory models derived from daily game reaction latencies, spatial recall, and medication adherence
          </p>
        </div>
        <span className="rounded-full bg-purple-100 border border-purple-400 px-3 py-1 text-xs font-black text-purple-950">
          ICMR Staging Model
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {predictiveTrajectories.map((traj) => (
          <div
            key={traj.patientId}
            className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    traj.riskClassification === "STABLE_PRESERVED"
                      ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                      : traj.riskClassification === "MODERATE_RISK"
                      ? "bg-amber-100 text-amber-950 border-amber-400"
                      : "bg-rose-100 text-rose-950 border-rose-400 animate-pulse"
                  }`}
                >
                  {traj.riskClassification.replace(/_/g, " ")}
                </span>
                <span className="font-mono text-xs font-bold text-ink-secondary">#{traj.patientId}</span>
              </div>

              <h3 className="font-serif text-lg font-black text-ink">{traj.patientName}</h3>
              <p className="text-xs font-bold text-purple-900">{traj.currentStage}</p>

              {/* MoCA Trajectory Forecast */}
              <div className="mt-4 rounded-2xl border-2 border-black bg-surface p-3.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-ink-secondary block">
                  Estimated MoCA Score Forecast:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-xl bg-purple-50 p-1.5 border border-purple-200">
                    <span className="text-[9px] text-ink-secondary block">30 Days</span>
                    <span className="font-serif font-black text-purple-950">{traj.predictedMoca30Days} / 30</span>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-1.5 border border-purple-200">
                    <span className="text-[9px] text-ink-secondary block">60 Days</span>
                    <span className="font-serif font-black text-purple-950">{traj.predictedMoca60Days} / 30</span>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-1.5 border border-purple-200">
                    <span className="text-[9px] text-ink-secondary block">90 Days</span>
                    <span className="font-serif font-black text-purple-950">{traj.predictedMoca90Days} / 30</span>
                  </div>
                </div>
              </div>

              {/* Preservative Gain */}
              <div className="mt-3 text-xs font-bold text-emerald-800 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Gaming Adherence Impact: +{traj.adherenceImpactFactor}% stability gain</span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-black uppercase text-ink-secondary block mb-1">
                  Recommended Interventions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {traj.recommendedInterventions.map((rec) => (
                    <span key={rec} className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                      <Check className="h-3 w-3 shrink-0 text-amber-700" />
                      <span>{rec}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
