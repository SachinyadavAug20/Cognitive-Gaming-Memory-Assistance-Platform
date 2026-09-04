"use client";

import React from "react";
import { HeartPulse, Check, CheckCircle2, MapPin, UserCheck } from "lucide-react";
import type { AdminClinicalAlert, AdminAshaWorker } from "@/types/admin";

interface AdminAlertsTabProps {
  alerts: AdminClinicalAlert[];
  ashaWorkers: AdminAshaWorker[];
  onResolveAlert: (alertId: string) => void;
}

export function AdminAlertsTab({
  alerts,
  ashaWorkers,
  onResolveAlert,
}: AdminAlertsTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-600" />
            Regional Clinical Escalation & ASHA Dispatch
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Automated cognitive decline anomalies, hydration deficits, and missed neurological medications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((al) => (
          <div
            key={al.id}
            className={`rounded-3xl border-3 border-black p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between ${
              al.resolved
                ? "bg-surface-muted opacity-70"
                : al.severity === "CRITICAL"
                ? "bg-rose-50 border-rose-900"
                : "bg-amber-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    al.resolved
                      ? "bg-gray-200 text-gray-700 border-gray-400"
                      : al.severity === "CRITICAL"
                      ? "bg-rose-200 text-rose-950 border-rose-400 animate-pulse"
                      : "bg-amber-200 text-amber-950 border-amber-400"
                  }`}
                >
                  {al.resolved ? "RESOLVED" : `${al.severity} ALERT`}
                </span>
                <span className="font-mono text-[11px] font-black text-ink-secondary">
                  {al.id}
                </span>
              </div>

              <h3 className="font-serif text-base font-black text-ink">
                {al.patientName} (#{al.patientId})
              </h3>
              <p className="text-xs font-bold text-ink-secondary inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-secondary" /> {al.location}
              </p>

              <p className="mt-3 text-xs font-semibold text-ink leading-relaxed border-l-3 border-black/30 pl-2">
                {al.clinicalNote}
              </p>

              <div className="mt-3 text-[11px] font-bold text-purple-900">
                Assigned ASHA: <span className="font-black">{al.assignedAsha}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
              <span className="text-[10px] text-ink-secondary">
                {new Date(al.triggeredAt).toLocaleTimeString()}
              </span>

              {!al.resolved ? (
                <button
                  type="button"
                  onClick={() => onResolveAlert(al.id)}
                  className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950 shadow-[2px_2px_0px_#000] hover:bg-emerald-400 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Acknowledge & Resolve</span>
                </button>
              ) : (
                <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Closed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ASHA Field Worker Roster */}
      <div className="mt-6 pt-4 border-t-2 border-black/10">
        <h3 className="font-serif text-lg font-black text-ink mb-3 inline-flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-emerald-700" /> Active ASHA Health Worker Roster (Field Units)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ashaWorkers.map((w) => (
            <div key={w.id} className="rounded-2xl border-2 border-black bg-surface p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-sm font-black text-ink">{w.name}</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-900 border border-emerald-400">
                  {w.status}
                </span>
              </div>
              <p className="text-[11px] font-bold text-ink-secondary">{w.assignedDistrict} • {w.primaryPhc}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-ink">
                <span>Patients: {w.assignedPatients}</span>
                <span className="text-emerald-700">Visits: {w.homeVisitsThisWeek}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
