"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ShieldAlert,
  Database,
  CheckCircle2,
  HeartPulse,
  Radio,
  Download,
  FileSpreadsheet,
  PhoneCall,
  BatteryCharging,
  MapPinned,
  Play,
  Loader,
  Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type {
  AdminEpidemiologicalSurveillance,
  PatientSurveillance,
  SurveillanceAlert,
  CaregiverSosRequest,
  SurveillanceReading,
} from "@/types/admin";

type Sev = "CRITICAL" | "HIGH" | "MODERATE" | string;

function sevChip(sev: Sev) {
  const map: Record<string, string> = {
    CRITICAL: "bg-rose-500 text-white",
    HIGH: "bg-amber-500 text-white",
    MODERATE: "bg-blue-500 text-white",
  };
  return map[sev] ?? "bg-gray-500 text-white";
}

function timeAgo(iso: string) {
  const then = new Date(iso);
  const diff = Math.max(0, Date.now() - then.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Offline-first coordinate plot: plots patients on a stylised NER backdrop. */
function SurveillanceMap({ patients }: { patients: PatientSurveillance[] }) {
  const lats = patients.map((p) => p.latitude ?? 25).filter((v) => v !== null);
  const anyCoords = lats.length > 0;
  const minLat = 24, maxLat = 28.5, minLng = 89.5, maxLng = 97.5;
  const W = 640, H = 420;

  const plot = (p: PatientSurveillance) => {
    const lat = p.latitude ?? 25.7;
    const lng = p.longitude ?? 94.2;
    const x = ((lng - minLng) / (maxLng - minLng)) * W;
    const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
    return { x, y };
  };

  const fallback = [
    { name: "Mary Nongrum", x: 0.62, y: 0.42 },
    { name: "Biren Borah", x: 0.40, y: 0.62 },
  ];

  return (
    <div className="relative rounded-2xl border-2 border-black bg-[#e8efe2] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          <defs>
            <pattern id="contour" width="90" height="90" patternUnits="userSpaceOnUse">
              <path d="M0 90 Q 22 44 45 90 T 90 0" stroke="#b9c9a8" strokeWidth="1.5" fill="none" opacity="0.6" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#contour)" />
          <path d="M90 300 Q160 240 200 260 M300 260 Q360 180 380 220 M420 320 Q470 250 500 300"
            stroke="#7fa06b" strokeWidth="3" fill="none" strokeLinecap="round" />
          {!anyCoords &&
            fallback.map((f) => (
              <g key={f.name}>
                <circle cx={f.x * W} cy={f.y * H} r="6" fill="#1E5136" opacity="0.9" />
                <text x={f.x * W + 10} y={f.y * H + 4} fontSize="13" fontWeight="900" fill="#181511" fontFamily="serif">
                  {f.name}
                </text>
              </g>
            ))}
          {anyCoords &&
            patients.map((p) => {
              const { x, y } = plot(p);
              return (
                <g key={p.patientId}>
                  <circle cx={x} cy={y} r="7" fill={p.openAlertCount > 0 ? "#b3132f" : "#1E5136"} opacity="0.9" stroke="#fffdf6" strokeWidth="2" />
                  <text x={x + 10} y={y + 4} fontSize="13" fontWeight="900" fill="#181511" fontFamily="serif">
                    {p.patientName}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
      {patients.map((p) => {
        const { x, y } = plot(p);
        return (
          <button
            key={p.patientId}
            type="button"
            className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${p.openAlertCount > 0 ? "bg-rose-600" : "bg-emerald-700"}`}
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
            aria-label={p.patientName}
          />
        );
      })}
      {!anyCoords && (
        <div className="absolute bottom-2 left-2 text-[9px] font-black text-ink/60">
          Offline geo-fallback • seeded district coordinates
        </div>
      )}
    </div>
  );
}

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
  const [patients, setPatients] = useState<PatientSurveillance[]>([]);
  const [alerts, setAlerts] = useState<SurveillanceAlert[]>([]);
  const [sos, setSos] = useState<CaregiverSosRequest[]>([]);
  const [history, setHistory] = useState<SurveillanceReading[]>([]);
  const [trendPatientId, setTrendPatientId] = useState<number | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const trendPatientRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const p = await api.surveillancePatients();
        if (!active) return;
        setPatients(p);
        setAlerts(await api.surveillanceAlerts(true));
        setSos(await api.surveillanceSos("PENDING"));
        const targetId = trendPatientRef.current;
        if (targetId) {
          setHistory(await api.surveillanceHistory(targetId, 24));
        } else if (p.length > 0) {
          const firstId = p[0].patientId;
          trendPatientRef.current = firstId;
          setTrendPatientId(firstId);
          setHistory(await api.surveillanceHistory(firstId, 24));
        }
        setError(null);
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Surveillance API unavailable";
        setError(msg);
      }
    }
    void load();
    const iv = setInterval(() => void load(), 12000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [refreshTick]);

  const handleAcknowledgeSos = async (sosId: number) => {
    try {
      await api.acknowledgeSos(sosId);
      setSos((prev) => prev.filter((s) => s.id !== sosId));
    } catch {
      // keep visible on failure
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.resolveSurveillanceAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      // keep visible on failure
    }
  };

  const handleRunDemo = async () => {
    setDemoRunning(true);
    try {
      await api.runSurveillanceDemo();
      setRefreshTick((t) => t + 1);
      setError(null);
    } catch {
      setError("Demo simulation failed to reach server.");
    } finally {
      setDemoRunning(false);
    }
  };

  const handleTrendChange = async (patientId: number) => {
    setTrendPatientId(patientId);
    trendPatientRef.current = patientId;
    try {
      setHistory(await api.surveillanceHistory(patientId, 24));
    } catch {
      // ignore
    }
  };

  const vitalsTrend = history
    .filter((r) => r.readingType === "VITALS" && r.recordedAt)
    .slice(-24)
    .map((r) => ({
      time: new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      heartRate: r.heartRateBpm ?? 0,
      spo2: r.spo2Pct ?? 0,
      temp: r.bodyTempC ?? 0,
    }));

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

  const matrixData = surveillance.length > 0 ? surveillance : defaultSurveillance;

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
                {patients.length > 0 ? `Live: ${patients.length} Patients Monitored` : "8 North Eastern States Live"}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-ink flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-tea shrink-0" />
              NER Age-Related Cognitive Disorders Surveillance
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-1">
              Live vitals, activity, geo-fencing, 2G store-and-forward sync, fall/wandering alerts and caregiver SOS dispatch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunDemo}
              disabled={demoRunning}
              className={`btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${demoRunning ? "bg-surface text-ink-secondary" : "bg-tea text-white hover:bg-emerald-800"}`}
            >
              <Play className={`h-3.5 w-3.5 ${demoRunning ? "animate-spin" : ""}`} />
              <span>{demoRunning ? "Simulation running..." : "Run Demo Simulation"}</span>
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-4 py-2 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Surveillance JSON</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Print MDoNER Report</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-black bg-amber-100 px-4 py-3 text-amber-950 shadow-[2px_2px_0px_#000] flex items-center gap-2">
            <Loader className="h-4 w-4 text-amber-800 animate-spin" />
            <span className="text-xs font-black">Live link in low-bandwidth buffering mode — {error}. Cached demo grid shown.</span>
          </div>
        )}

        {/* 4 Core Surveillance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border-2 border-black bg-emerald-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 block">
              Patients Monitored
            </span>
            <span className="font-serif text-2xl font-black text-emerald-900 mt-1 block">
              {patients.length > 0 ? patients.length : "3,826,000"}
            </span>
            <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
              {patients.length > 0 ? "Live wearable + sensor feeds" : "Projected elderly cohort (60+)"}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-rose-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 block">
              Open Clinical Escalations
            </span>
            <span className="font-serif text-2xl font-black text-rose-900 mt-1 block">
              {alerts.length > 0 ? alerts.length : unresolvedAlertsCount} Flagged
            </span>
            <p className="text-[10px] font-semibold text-rose-800 mt-0.5">
              {sos.length > 0 ? `${sos.length} caregiver SOS awaiting dispatch` : "Wandering, low activity, vitals risks"}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-amber-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 block">
              Pending SOS Calls
            </span>
            <span className="font-serif text-2xl font-black text-amber-900 mt-1 block">
              {sos.length}
            </span>
            <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
              Call-Caregiver requests from patient devices
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-blue-50 p-4 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 block">
              Device Sync Health
            </span>
            <span className="font-serif text-2xl font-black text-blue-900 mt-1 block">
              {patients.filter((p) => p.syncStatus === "LIVE" || p.networkType !== "2G_EDGE").length}/{patients.length || 1} Live
            </span>
            <p className="text-[10px] font-semibold text-blue-800 mt-0.5">
              2G store-and-forward edge buffering active
            </p>
          </div>
        </div>
      </div>

      {patients.length > 0 && (
        <section className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
            <div>
              <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-tea" />
                Live Geo-Surveillance Map & Patient Grid
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-0.5">
                Real-time GPS geofencing across NER monsoon terrain • offline-cached coordinates
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-400 px-3 py-1 text-[10px] font-black text-rose-950">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
              </span>
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <SurveillanceMap patients={patients} />

            <div className="overflow-x-auto rounded-2xl border-2 border-black">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-black text-white uppercase text-[9px] font-black tracking-wider">
                  <tr>
                    <th className="p-2">Patient</th>
                    <th className="p-2">Vitals</th>
                    <th className="p-2 hidden md:table-cell">Activity</th>
                    <th className="p-2">Risk</th>
                    <th className="p-2 hidden sm:table-cell">2G Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10 bg-white">
                  {patients.map((p) => (
                    <tr key={p.patientId} className="hover:bg-emerald-50/40">
                      <td className="p-2">
                        <div className="font-serif font-black text-ink">{p.patientName}</div>
                        <div className="text-[9px] text-ink-muted">{p.district} • {p.gender}</div>
                      </td>
                      <td className="p-2 font-mono text-[10px] text-ink-secondary">
                        {p.heartRateBpm != null ? `♥${p.heartRateBpm}` : "—"}
                        <span className="text-ink-muted">/</span>
                        {p.spo2Pct != null ? `O₂${p.spo2Pct}%` : "—"}
                        <br />
                        {p.bodyTempC != null ? `${p.bodyTempC}°C` : "—"} • {p.hydrationGlasses ?? 0}💧
                      </td>
                      <td className="p-2 hidden md:table-cell text-[10px]">
                        {p.activityLevel ?? "—"}
                        {p.steps ? ` • ${p.steps} steps` : ""}
                      </td>
                      <td className="p-2">
                        <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-black ${
                          p.riskLevel === "HIGH" ? "bg-rose-500 text-white" : p.riskLevel === "MEDIUM" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                        }`}>
                          {p.riskLevel} · {p.riskScore}
                        </span>
                        {p.openAlertCount > 0 && (
                          <span className="ml-1 rounded-md bg-rose-100 border border-rose-400 px-1.5 py-0.2 text-[9px] font-black text-rose-950">
                            {p.openAlertCount} alerts
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-[10px] hidden sm:table-cell">
                        <span className={`rounded-sm px-1.5 py-0.2 text-[9px] font-black ${
                          p.syncStatus === "LIVE" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
                        }`}>
                          {p.networkType}
                        </span>
                        <div className="text-[9px] text-ink-muted hidden md:block">{p.queuedPackets} pkts • 🔋{p.batteryPct}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Early Warning Stream + 2G Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-700" />
              Live Clinical Early Warning Stream
            </h3>
            <span className="rounded-full bg-rose-100 border border-rose-400 px-2.5 py-0.5 text-[10px] font-black text-rose-950">
              {alerts.length} Unresolved
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-2xl border-2 border-black bg-emerald-50 p-4 text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <span className="text-xs font-black">No unresolved clinical anomalies. All patients stable.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 8).map((a) => (
                <div key={a.id} className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-xs text-ink">{a.patientName}</span>
                      <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-black ${sevChip(a.severity)}`}>{a.severity}</span>
                      <span className="rounded-sm bg-black/10 px-1.5 py-0.2 text-[9px] font-black text-ink">{a.alertType}</span>
                    </div>
                    <p className="text-xs font-semibold text-ink-secondary mt-1">{a.message}</p>
                    <span className="text-[10px] font-bold text-ink-muted mt-0.5 block">Triggered: {timeAgo(a.triggeredAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleResolveAlert(a.id)}
                    className="shrink-0 rounded-xl border border-black bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-950 hover:bg-emerald-200 cursor-pointer"
                  >
                    ✓ Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

          {patients.length === 0 ? (
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
                      }`}>{k.status}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">{k.bandwidth} • {k.packets} Encrypted Packets</p>
                  </div>
                  <span className="text-[10px] font-black text-ink-secondary">{k.syncTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((p) => (
                <div key={p.patientId} className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <BatteryCharging className="h-4 w-4 text-tea shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-black text-xs text-ink truncate">{`Wearable #PAT-00${p.patientId}`}</span>
                        <span className={`rounded-sm px-1.5 py-0.2 text-[9px] font-black ${
                          p.syncStatus === "LIVE" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
                        }`}>{p.syncStatus}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">{p.networkType} • {p.queuedPackets} Encrypted Packets</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-ink-secondary">
                    🔋 {p.batteryPct}% • {timeAgo(p.lastSeen)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SOS Call-Caregiver Queue */}
      <section className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-rose-700" />
            Call-Caregiver SOS Queue
          </h3>
          <span className={`rounded-full px-3 py-1 text-[10px] font-black ${sos.length > 0 ? "bg-rose-100 border border-rose-400 text-rose-950" : "bg-emerald-100 border border-emerald-400 text-emerald-950"}`}>
            {sos.length > 0 ? `${sos.length} Pending SOS` : "No Active SOS"}
          </span>
        </div>

        {sos.length === 0 ? (
          <div className="rounded-2xl border-2 border-black bg-emerald-50 p-4 text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <span className="text-xs font-black">No patient is currently requesting a caregiver call. Queue is clear.</span>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {sos.map((s) => (
              <div key={s.id} className="rounded-2xl border-3 border-rose-600 bg-rose-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-base text-ink">{s.patientName}</span>
                    <span className="rounded-md bg-rose-600 text-white px-2 py-0.5 text-[9px] font-black uppercase">SOS • PENDING</span>
                    <span className="rounded-sm bg-black/10 px-1.5 py-0.2 text-[9px] font-black text-ink">{s.locationLabel || "Coordinates Attached"}</span>
                  </div>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    Patient pressed <span className="font-black text-rose-900">Call Caregiver</span> — requesting immediate voice/ASHA dispatch.
                  </p>
                  <span className="text-[10px] font-bold text-ink-muted mt-0.5 block">Requested {timeAgo(s.requestedAt)} • {s.patientLat != null ? `${s.patientLat}, ${s.patientLng}` : "live GPS ping"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleAcknowledgeSos(s.id)}
                  className="btn-tactile shrink-0 rounded-xl border-2 border-black bg-emerald-600 text-white px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#000] hover:bg-emerald-700 cursor-pointer"
                >
                  ✓ Acknowledge & Dispatch Caregiver
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vitals Trend Chart */}
      <section className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
          <div>
            <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
              <Activity className="h-5 w-5 text-tea" />
              Live Vitals Telemetry & Activity Trend
            </h3>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">Heart rate, SpO₂ and body temperature over the last 24h</p>
          </div>
          <select
            value={trendPatientId ?? ""}
            onChange={(e) => void handleTrendChange(Number(e.target.value))}
            className="rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
            ))}
          </select>
        </div>

        {vitalsTrend.length === 0 ? (
          <div className="rounded-2xl border-2 border-black bg-tea p-4 text-xs font-black text-white flex items-center gap-2 mt-4">
            <Loader className="h-4 w-4 animate-spin" />
            Waiting for VITALS readings from wearable device...
          </div>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitalsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#D8CEBE" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 700, fill: "#181511" }} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#181511" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "3px solid #181511", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#1E5136" strokeWidth={2.5} fill="#1E5136" fillOpacity={0.2} />
                <Area type="monotone" dataKey="spo2" name="SpO₂ (%)" stroke="#2E5AA7" strokeWidth={2.5} fill="#2E5AA7" fillOpacity={0.2} />
                <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="#C24E26" strokeWidth={2.5} fill="#C24E26" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 8-State Epidemiological Registry Matrix */}
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
                <th className="p-3 hidden lg:table-cell">Est. 60+ Pop</th>
                <th className="p-3 hidden sm:table-cell">Screened</th>
                <th className="p-3">MCI Prev. %</th>
                <th className="p-3 hidden sm:table-cell">Dementia %</th>
                <th className="p-3">Early Interv. %</th>
                <th className="p-3 hidden lg:table-cell">Terrain Barrier</th>
                <th className="p-3 hidden lg:table-cell">2G Sync Delay</th>
                <th className="p-3 hidden lg:table-cell">ASHA Units</th>
                <th className="p-3 hidden md:table-cell">Hotspots & Agitation Belts</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-bold bg-white">
              {matrixData.map((row) => (
                <tr key={row.stateCode} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3">
                    <span className="font-serif font-black text-ink">{row.state}</span>
                    <span className="ml-1.5 rounded-sm bg-black/10 px-1 py-0.5 text-[9px] font-black">{row.stateCode}</span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-ink-secondary">{row.estimatedElderlyPopulation.toLocaleString()}</td>
                  <td className="p-3 text-ink font-black hidden sm:table-cell">{row.screenedPatientsCount}</td>
                  <td className="p-3 text-amber-800 font-black">{row.mciPrevalencePct}%</td>
                  <td className="p-3 text-rose-800 font-black hidden sm:table-cell">{row.dementiaPrevalencePct}%</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-950">
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                      {row.earlyInterventionIndexPct}%
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
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
                  <td className="p-3 text-ink-secondary font-mono text-[11px] hidden lg:table-cell">{row.offlineSyncDelayAvgHours}h</td>
                  <td className="p-3 font-black text-tea hidden lg:table-cell">{row.activeAshaUnits} ASHA</td>
                  <td className="p-3 text-xs text-ink-secondary hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {row.sundowningAgitationHotspots.map((h, i) => (
                        <span key={i} className="rounded-sm bg-black/5 px-1.5 py-0.2 text-[10px] font-semibold text-ink">📍 {h}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}