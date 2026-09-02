"use client";

import React from "react";
import { HeartHandshake } from "lucide-react";
import type { AdminCaregiverBurnout } from "@/types/admin";

interface AdminBurnoutTabProps {
  caregiverBurnout: AdminCaregiverBurnout[];
  onDispatchRespite: (district: string, caregiverName: string) => void;
}

export function AdminBurnoutTab({
  caregiverBurnout,
  onDispatchRespite,
}: AdminBurnoutTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-rose-600" />
            Caregiver Burden Index & Community Respite Care
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Zarit Burden Scale tracking to mitigate caregiver exhaustion, night wandering anxiety, and social isolation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {caregiverBurnout.map((cb) => (
          <div
            key={cb.caregiverId}
            className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    cb.burdenCategory === "MILD_STRAIN"
                      ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                      : cb.burdenCategory === "MODERATE_STRAIN"
                      ? "bg-amber-100 text-amber-950 border-amber-400"
                      : "bg-rose-100 text-rose-950 border-rose-400 animate-pulse"
                  }`}
                >
                  {cb.burdenCategory.replace(/_/g, " ")}
                </span>
                <span className="font-serif font-black text-sm text-ink">Score: {cb.zaritBurdenScore} / 88</span>
              </div>

              <h3 className="font-serif text-base font-black text-ink">{cb.caregiverName}</h3>
              <p className="text-xs text-ink-secondary">{cb.relationship} • Caring for {cb.patientName}</p>
              <p className="text-xs font-bold text-ink-secondary mt-0.5">📍 {cb.district}</p>

              <div className="mt-3 rounded-2xl border border-black/15 bg-surface p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Night Wandering Events:</span>
                  <span className="font-black text-rose-700">{cb.weeklyNightWanderingAlerts} this week</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Logins Active:</span>
                  <span className="font-black text-emerald-700">{cb.daysActiveThisMonth} / 30 days</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-900">
                {cb.respiteCareStatus.replace(/_/g, " ")}
              </span>
              <button
                type="button"
                onClick={() => onDispatchRespite(cb.district, cb.caregiverName)}
                className="btn-tactile rounded-xl border-2 border-black bg-rose-200 px-3 py-1 text-xs font-black text-rose-950 shadow-[2px_2px_0px_#000] hover:bg-rose-300 cursor-pointer"
              >
                Dispatch Respite
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
