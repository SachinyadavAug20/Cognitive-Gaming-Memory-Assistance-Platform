"use client";

import React from "react";
import {
  ShieldAlert,
  Database,
  CheckCircle2,
  HeartPulse,
  Radio,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import type { AdminEpidemiologicalSurveillance } from "@/types/admin";

interface AdminSurveillanceTabProps {
  surveillance: AdminEpidemiologicalSurveillance[];
  unresolvedAlertsCount: number;
  onExportJson: () => void;
}

export function AdminSurveillanceTab({
  surveillance,
  unresolvedAlertsCount,
  onExportJson,
}: AdminSurveillanceTabProps) {
  const defaultSurveillance: AdminEpidemiologicalSurveillance[] = [
    { state: "Assam", stateCode: "AS", estimatedElderlyPopulation: 2680000, screenedPatientsCount: 36, mciPrevalencePct: 6.8, dementiaPrevalencePct: 3.4, earlyInterventionIndexPct: 91.2, remoteTerrainBarrierIndex: "RIVERINE_ISLAND", offlineSyncDelayAvgHours: 1.4, activeAshaUnits: 28, highRiskWanderingFlagged: 2, sundowningAgitationHotspots: ["Majuli River Island", "Duliajan Tea Belts"] },
    { state: "Meghalaya", stateCode: "ML", estimatedElderlyPopulation: 245000, screenedPatientsCount: 11, mciPrevalencePct: 7.4, dementiaPrevalencePct: 3.9, earlyInterventionIndexPct: 88.5, remoteTerrainBarrierIndex: "EXTREME_HILL", offlineSyncDelayAvgHours: 2.8, activeAshaUnits: 14, highRiskWanderingFlagged: 1, sundowningAgitationHotspots: ["East Khasi Hills", "Williamnagar"] },
    { state: "Manipur", stateCode: "MN", estimatedElderlyPopulation: 260000, screenedPatientsCount: 9, mciPrevalencePct: 7.1, dementiaPrevalencePct: 3.6, earlyInterventionIndexPct: 89.0, remoteTerrainBarrierIndex: "BORDER_TERRAIN", offlineSyncDelayAvgHours: 3.1, activeAshaUnits: 12, highRiskWanderingFlagged: 1, sundowningAgitationHotspots: ["Ukhrul Hill Tracts", "Loktak Lake"] },
    { state: "Mizoram", stateCode: "MZ", estimatedElderlyPopulation: 110000, screenedPatientsCount: 8, mciPrevalencePct: 6.2, dementiaPrevalencePct: 3.1, earlyInterventionIndexPct: 94.2, remoteTerrainBarrierIndex: "EXTREME_HILL", offlineSyncDelayAvgHours: 2.2, activeAshaUnits: 9, highRiskWanderingFlagged: 0, sundowningAgitationHotspots: ["Champhai", "Lunglei"] },
    { state: "Nagaland", stateCode: "NL", estimatedElderlyPopulation: 155000, screenedPatientsCount: 6, mciPrevalencePct: 7.8, dementiaPrevalencePct: 4.1, earlyInterventionIndexPct: 86.4, remoteTerrainBarrierIndex: "EXTREME_HILL", offlineSyncDelayAvgHours: 3.6, activeAshaUnits: 8, highRiskWanderingFlagged: 1, sundowningAgitationHotspots: ["Tuensang Ridge", "Mon Foothills"] },
    { state: "Arunachal Pradesh", stateCode: "AR", estimatedElderlyPopulation: 98000, screenedPatientsCount: 5, mciPrevalencePct: 8.2, dementiaPrevalencePct: 4.3, earlyInterventionIndexPct: 84.0, remoteTerrainBarrierIndex: "EXTREME_HILL", offlineSyncDelayAvgHours: 4.2, activeAshaUnits: 7, highRiskWanderingFlagged: 1, sundowningAgitationHotspots: ["Tawang Sector", "Ziro Valley"] },
    { state: "Tripura", stateCode: "TR", estimatedElderlyPopulation: 320000, screenedPatientsCount: 7, mciPrevalencePct: 6.9, dementiaPrevalencePct: 3.5, earlyInterventionIndexPct: 90.1, remoteTerrainBarrierIndex: "ACCESSIBLE_VALLEY", offlineSyncDelayAvgHours: 1.1, activeAshaUnits: 10, highRiskWanderingFlagged: 0, sundowningAgitationHotspots: ["Dhalai Tribal Belts", "Gomati"] },
    { state: "Sikkim", stateCode: "SK", estimatedElderlyPopulation: 58000, screenedPatientsCount: 4, mciPrevalencePct: 6.5, dementiaPrevalencePct: 3.2, earlyInterventionIndexPct: 93.5, remoteTerrainBarrierIndex: "EXTREME_HILL", offlineSyncDelayAvgHours: 1.8, activeAshaUnits: 6, highRiskWanderingFlagged: 0, sundowningAgitationHotspots: ["Mangan North Valley", "Geyzing"] },
  ];

  const data = surveillance.length > 0 ? surveillance : defaultSurveillance;

  return (
    <div className="space-y-6">
      {/* Surveillance Executive Banner */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full border border-rose-600 bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-950">
                MDoNER • ICMR Cognitive Health Surveillance
              </span>
              <span className="rounded-full border border-emerald-600 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                8 North Eastern States Live
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-ink flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-tea shrink-0" />
              NER Age-Related Cognitive Disorders Epidemiological Surveillance
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-1">
              Real-time monitoring of dementia prevalence, MCI early detection, low-connectivity 2G store-and-forward edge sync, and geographical terrain access barriers across North East India
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportJson}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-4 py-2 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Surveillance JSON</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Print Official MDoNER Report</span>
            </button>
          </div>
        </div>

        {/* 4 Core Surveillance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border-2 border-black bg-emerald-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 block">
              Elderly Population at Risk
            </span>
            <span className="font-serif text-2xl font-black text-emerald-900 mt-1 block">
              3,826,000
            </span>
            <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
              Projected elderly cohort (60+) across 8 NER states
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-blue-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 block">
              Early MCI Detection Rate
            </span>
            <span className="font-serif text-2xl font-black text-blue-900 mt-1 block">
              89.6%
            </span>
            <p className="text-[10px] font-semibold text-blue-800 mt-0.5">
              Diagnosed before severe cognitive decline
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-amber-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 block">
              Remote 2G Sync Latency
            </span>
            <span className="font-serif text-2xl font-black text-amber-900 mt-1 block">
              2.3 Hours Avg
            </span>
            <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
              Store-and-forward edge packets from hill sub-centers
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-rose-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 block">
              Active Clinical Escalations
            </span>
            <span className="font-serif text-2xl font-black text-rose-900 mt-1 block">
              {unresolvedAlertsCount} Flagged Cases
            </span>
            <p className="text-[10px] font-semibold text-rose-800 mt-0.5">
              Tremor spikes, hesitation & wandering risks
            </p>
          </div>
        </div>
      </div>

      {/* 8-State Surveillance Matrix Table */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
          <div>
            <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
              <Database className="h-5 w-5 text-tea" />
              8-State North Eastern Region Cognitive Disease Registry
            </h3>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">
              Epidemiological prevalence, early intervention rates, and geographical barrier ratings
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border-2 border-black">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-black text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="p-3">State & Code</th>
                <th className="p-3">Est. 60+ Pop</th>
                <th className="p-3">Screened</th>
                <th className="p-3">MCI Prev. %</th>
                <th className="p-3">Dementia %</th>
                <th className="p-3">Early Interv. %</th>
                <th className="p-3">Terrain Barrier</th>
                <th className="p-3">2G Sync Delay</th>
                <th className="p-3">ASHA Units</th>
                <th className="p-3">Hotspots & Agitation Belts</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-bold bg-white">
              {data.map((row) => (
                <tr key={row.stateCode} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3">
                    <span className="font-serif font-black text-ink">{row.state}</span>
                    <span className="ml-1.5 rounded-sm bg-black/10 px-1 py-0.5 text-[9px] font-black">{row.stateCode}</span>
                  </td>
                  <td className="p-3 text-ink-secondary">{row.estimatedElderlyPopulation.toLocaleString()}</td>
                  <td className="p-3 text-ink font-black">{row.screenedPatientsCount}</td>
                  <td className="p-3 text-amber-800 font-black">{row.mciPrevalencePct}%</td>
                  <td className="p-3 text-rose-800 font-black">{row.dementiaPrevalencePct}%</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-950">
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                      {row.earlyInterventionIndexPct}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                      row.remoteTerrainBarrierIndex === "RIVERINE_ISLAND"
                        ? "bg-teal-100 text-teal-950 border border-teal-400"
                        : row.remoteTerrainBarrierIndex === "EXTREME_HILL"
                        ? "bg-purple-100 text-purple-950 border border-purple-400"
                        : row.remoteTerrainBarrierIndex === "BORDER_TERRAIN"
                        ? "bg-rose-100 text-rose-950 border border-rose-400"
                        : "bg-emerald-100 text-emerald-950 border border-emerald-400"
                    }`}>
                      {row.remoteTerrainBarrierIndex.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-ink-secondary font-mono text-[11px]">{row.offlineSyncDelayAvgHours}h</td>
                  <td className="p-3 font-black text-tea">{row.activeAshaUnits} ASHA</td>
                  <td className="p-3 text-xs text-ink-secondary">
                    <div className="flex flex-wrap gap-1">
                      {row.sundowningAgitationHotspots.map((h, i) => (
                        <span key={i} className="rounded-sm bg-black/5 px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                          📍 {h}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early Warning & Clinical Anomaly Surveillance Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box A: Rapid Cognitive Decline Early Warning Feeds */}
        <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-700" />
              Kinesthetic & Spatial Early Warning Stream
            </h3>
            <span className="rounded-full bg-rose-100 border border-rose-400 px-2.5 py-0.5 text-[10px] font-black text-rose-950">
              Live Telemetry Feeds
            </span>
          </div>

          <div className="space-y-3">
            {[
              { patient: "Biren Borah (Majuli)", anomaly: "Motor Latency Deviation: +35% slowdown during tea harvest tactile task", severity: "HIGH", time: "2 hrs ago", action: "ASHA Doorstep Visit Scheduled" },
              { patient: "Mary Nongrum (East Khasi Hills)", anomaly: "Hydration Check-in Deficit: 2/6 glasses recorded today", severity: "MODERATE", time: "4 hrs ago", action: "Caregiver Reminder Pushed" },
              { patient: "Ibochouba Singh (Imphal West)", anomaly: "Prescription Adherence: Missed morning neuro-protective dose", severity: "CRITICAL", time: "45 mins ago", action: "Tele-MANAS Escalation" },
              { patient: "Daphisha Mawlong (Shillong)", anomaly: "Micro-Hesitation Tremor Spike: 4 hesitation taps on Bihu rhythm beats", severity: "MODERATE", time: "1 day ago", action: "Sensory Calming Active" },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-sm text-ink">{item.patient}</span>
                    <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-black ${
                      item.severity === "CRITICAL" ? "bg-rose-500 text-white" : item.severity === "HIGH" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">{item.anomaly}</p>
                  <span className="text-[10px] font-bold text-ink-muted mt-0.5 block">Triggered: {item.time}</span>
                </div>
                <span className="shrink-0 rounded-xl border border-black bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-950">
                  ✓ {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Box B: Low-Connectivity 2G Sync & Offline Health Surveillance */}
        <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
              <Radio className="h-5 w-5 text-tea" />
              Remote Low-Connectivity 2G Sync Surveillance
            </h3>
            <span className="rounded-full bg-emerald-100 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
              Store-and-Forward Active
            </span>
          </div>

          <div className="space-y-3">
            {[
              { location: "Kamalabari Sub-Center, Majuli River Island", status: "SYNCED", packets: 48, bandwidth: "2G Edge (68% Compressed)", syncTime: "4 mins ago" },
              { location: "Tawang High-Altitude Health Post, Arunachal", status: "BUFFERED", packets: 12, bandwidth: "Intermittent Hill Cellular", syncTime: "Pending Window" },
              { location: "Ukhrul Hill Clinic, Manipur", status: "SYNCED", packets: 29, bandwidth: "2G Edge (71% Compressed)", syncTime: "12 mins ago" },
              { location: "Champhai Border Sub-Center, Mizoram", status: "SYNCED", packets: 19, bandwidth: "2G Edge (65% Compressed)", syncTime: "18 mins ago" },
            ].map((k, idx) => (
              <div key={idx} className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-xs text-ink">{k.location}</span>
                    <span className={`rounded-sm px-1.5 py-0.2 text-[9px] font-black ${
                      k.status === "SYNCED" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
                    }`}>
                      {k.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">
                    {k.bandwidth} • {k.packets} Encrypted Packets
                  </p>
                </div>
                <span className="text-[10px] font-black text-ink-secondary">{k.syncTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
