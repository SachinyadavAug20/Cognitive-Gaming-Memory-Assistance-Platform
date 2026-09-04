"use client";

import React from "react";
import { Video, Stethoscope, Clock } from "lucide-react";
import type { AdminTeleManasConsultation } from "@/types/admin";

interface AdminTeleManasTabProps {
  teleManasQueue: AdminTeleManasConsultation[];
}

export function AdminTeleManasTab({ teleManasQueue }: AdminTeleManasTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-700" />
            National Tele-MANAS (14416) & eSanjeevani Neurology Queue
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Scheduled remote video triage slots connecting rural PHCs with tertiary neurology specialists at AIIMS Guwahati & NIMHANS
          </p>
        </div>
        <span className="rounded-full bg-blue-100 border border-blue-400 px-3 py-1 text-xs font-black text-blue-950">
          {teleManasQueue.length} Active Appointments
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teleManasQueue.map((tm) => (
          <div
            key={tm.consultationId}
            className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-blue-200 border border-blue-900/30 px-2.5 py-0.5 text-[10px] font-black text-blue-950">
                  {tm.status}
                </span>
                <span className="font-mono text-xs font-black text-ink-secondary">{tm.consultationId}</span>
              </div>

              <h3 className="font-serif text-lg font-black text-ink">
                {tm.patientName} (Patient #{tm.patientId})
              </h3>
              <p className="text-xs font-bold text-blue-900 mt-0.5 inline-flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-blue-700" /> {tm.specialistDoctor}
              </p>
              <p className="text-xs text-ink-secondary">{tm.hospitalCenter}</p>

              <div className="mt-3 rounded-2xl border border-black/15 bg-surface p-3 text-xs space-y-1">
                <span className="font-black text-ink block">AI Pre-Assessment Attached:</span>
                <p className="text-ink-secondary leading-relaxed italic">{tm.aiPreAssessmentSummary}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs font-bold text-ink inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0 text-ink-secondary" /> {new Date(tm.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </span>

              <a
                href={tm.videoCallUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-blue-700 cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Join Tele-MANAS Room</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
