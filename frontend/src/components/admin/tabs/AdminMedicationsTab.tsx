"use client";

import React from "react";
import { Pill, PhoneCall } from "lucide-react";
import type { AdminMedicationAdherence } from "@/types/admin";

interface AdminMedicationsTabProps {
  medAdherence: AdminMedicationAdherence[];
  onRemindMedication: (patientId: number, patientName: string) => void;
}

export function AdminMedicationsTab({
  medAdherence,
  onRemindMedication,
}: AdminMedicationsTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-700" />
            Pharmacotherapy & Daily Care Routine Adherence
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Real-time monitoring of anti-dementia medications, blood pressure tracking, and daily hydration compliance
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FAF3E0] text-ink">
              <th className="py-3 px-3 font-black uppercase text-[10px]">Patient</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">District</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Active Prescriptions</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Adherence Rate</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Hydration</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Risk State</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 font-bold">
            {medAdherence.map((med) => (
              <tr key={med.patientId} className="hover:bg-amber-50/50 transition-colors">
                <td className="py-3 px-3">
                  <span className="font-serif text-sm font-black text-ink">{med.patientName}</span>
                  <span className="text-[10px] font-normal text-ink-secondary block">#{med.patientId}</span>
                </td>
                <td className="py-3 px-3 text-ink-secondary">{med.district}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {med.activePrescriptions.map((p) => (
                      <span
                        key={p}
                        className="rounded-md border border-black/20 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-950"
                      >
                        💊 {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-serif font-black text-emerald-700">{med.adherenceRate}%</span>
                  <span className="text-[10px] text-ink-secondary block">{med.missedDosesThisWeek} missed this week</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-blue-900 font-black">💧 {med.hydrationAvgGlasses} / 6 glasses</span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                      med.riskStatus === "STABLE"
                        ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                        : med.riskStatus === "NEEDS_REMINDER"
                        ? "bg-amber-100 text-amber-950 border-amber-400"
                        : "bg-rose-100 text-rose-950 border-rose-400 animate-pulse"
                    }`}
                  >
                    {med.riskStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemindMedication(med.patientId, med.patientName)}
                    className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-amber-200 px-3 py-1 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
                  >
                    <PhoneCall className="h-3 w-3" />
                    <span>Dispatch IVR Call</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
