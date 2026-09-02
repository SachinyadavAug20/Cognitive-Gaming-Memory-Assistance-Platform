"use client";

import React, { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import type { AdminDistrictHealth } from "@/types/admin";

interface AdminRegionsTabProps {
  districts: AdminDistrictHealth[];
}

export function AdminRegionsTab({ districts }: AdminRegionsTabProps) {
  const [stateFilter, setStateFilter] = useState<string>("ALL");

  const filteredDistricts = useMemo(() => {
    if (stateFilter === "ALL") return districts;
    return districts.filter((d) => d.state.toUpperCase().includes(stateFilter));
  }, [districts, stateFilter]);

  return (
    <div className="space-y-6">
      {/* Interactive SVG NER Geographic Visualizer */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <div>
            <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
              <MapPin className="h-5 w-5 text-tea" />
              Interactive 8 NER States Geographic Heatmap
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">
              Click any state node to filter district health indicators and ASHA deployment
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 border border-emerald-400 px-3 py-0.5 text-xs font-black text-emerald-950">
            8 States Active
          </span>
        </div>

        {/* Geographic Grid Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { name: "Assam", code: "ASSAM", color: "bg-emerald-100 border-emerald-600 text-emerald-950", count: "36 Pts" },
            { name: "Meghalaya", code: "MEGHALAYA", color: "bg-blue-100 border-blue-600 text-blue-950", count: "11 Pts" },
            { name: "Manipur", code: "MANIPUR", color: "bg-purple-100 border-purple-600 text-purple-950", count: "9 Pts" },
            { name: "Mizoram", code: "MIZORAM", color: "bg-amber-100 border-amber-600 text-amber-950", count: "8 Pts" },
            { name: "Nagaland", code: "NAGALAND", color: "bg-rose-100 border-rose-600 text-rose-950", count: "6 Pts" },
            { name: "Arunachal", code: "ARUNACHAL PRADESH", color: "bg-teal-100 border-teal-600 text-teal-950", count: "5 Pts" },
            { name: "Tripura", code: "TRIPURA", color: "bg-orange-100 border-orange-600 text-orange-950", count: "7 Pts" },
            { name: "Sikkim", code: "SIKKIM", color: "bg-indigo-100 border-indigo-600 text-indigo-950", count: "4 Pts" },
          ].map((st) => (
            <button
              key={st.code}
              type="button"
              onClick={() => setStateFilter(stateFilter === st.code ? "ALL" : st.code)}
              className={`rounded-2xl border-3 p-3 text-center transition-all cursor-pointer ${st.color} ${
                stateFilter === st.code ? "ring-4 ring-black scale-105 shadow-md" : "hover:scale-102 opacity-90 hover:opacity-100"
              }`}
            >
              <span className="font-serif text-sm font-black block">{st.name}</span>
              <span className="text-[10px] font-bold block mt-1">{st.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Districts Breakdown Cards */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-3">
          <h3 className="font-serif text-lg font-black text-ink">
            District Health Centers ({filteredDistricts.length} Listed)
          </h3>
          {stateFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => setStateFilter("ALL")}
              className="text-xs font-black underline text-ink-secondary hover:text-black cursor-pointer"
            >
              Clear Filter (Show All NER)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDistricts.map((d) => (
            <div
              key={d.district}
              className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-amber-200 border border-amber-900/30 px-2.5 py-0.5 text-[10px] font-black text-amber-950 uppercase">
                    {d.state}
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    {d.cognitiveAdherenceRate}% Adherence
                  </span>
                </div>

                <h3 className="font-serif text-lg font-black text-ink">{d.district}</h3>
                <p className="text-xs font-semibold text-ink-secondary mt-0.5">
                  🏥 {d.primaryPhc}
                </p>

                <div className="mt-4 space-y-1.5 text-xs font-bold text-ink">
                  <div className="flex items-center justify-between">
                    <span>Enrolled Patients:</span>
                    <span className="font-black text-blue-900">{d.enrolledPatients}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MCI Stage (Mild):</span>
                    <span className="font-black text-emerald-700">{d.mciStageCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Moderate / Severe:</span>
                    <span className="font-black text-amber-800">{d.moderateStageCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active ASHA Workers:</span>
                    <span className="font-black text-purple-900">{d.ashaWorkersActive}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-black text-ink">
                <span>Active Kiosks: {d.activeKiosks}</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-950 border border-emerald-400">
                  Live Telemetry
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
