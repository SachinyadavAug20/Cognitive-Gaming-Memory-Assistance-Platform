"use client";

import { useState } from "react";

export interface ClinicalBiomarkerProps {
  gameTitle: string;
  targetDomain: string;
  brainRegions: string[];
  clinicalScale: string; // e.g. "MMSE Visuospatial Item 30 / ACE-III"
  latencyMs?: number;
  scaffoldingCount?: number;
  accuracyPercent?: number;
}

export function ClinicalBiomarkerHUD({
  gameTitle,
  targetDomain,
  brainRegions,
  clinicalScale,
  latencyMs = 420,
  scaffoldingCount = 0,
  accuracyPercent = 100,
}: ClinicalBiomarkerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-tactile group flex items-center gap-2 rounded-full border-2 border-black bg-[#181512] px-3.5 py-1.5 text-xs font-black text-amber-300 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#2A241F] cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🔬 Clinical Biomarkers</span>
        </button>
      ) : (
        <div className="w-80 rounded-3xl border-3 border-black bg-[#181512] p-4 text-white shadow-[6px_6px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔬</span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                CDTx Clinical Telemetry
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white hover:bg-white/20"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60">Module / Domain</span>
              <p className="font-extrabold text-amber-200">{gameTitle} — {targetDomain}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-white/60">Target Neural Substrates</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {brainRegions.map((region, i) => (
                  <span key={i} className="rounded bg-teal-950 border border-teal-500/50 px-2 py-0.5 text-[10px] font-black text-teal-300">
                    🧠 {region}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-white/60">Validated Clinical Scale Alignment</span>
              <p className="font-semibold text-white/90">{clinicalScale}</p>
            </div>

            {/* Real-time Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div className="rounded-xl bg-black/50 p-2 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-white/60">Motor Latency</span>
                <p className="text-sm font-black text-emerald-400">{latencyMs} ms</p>
              </div>
              <div className="rounded-xl bg-black/50 p-2 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-white/60">Scaffolding Activations</span>
                <p className="text-sm font-black text-amber-400">{scaffoldingCount} (Errorless)</p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-950/40 p-2 border border-emerald-500/30 text-[10px] text-emerald-300">
              ✓ Non-punitive adaptive difficulty enabled (MTA-grade calibrated)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
