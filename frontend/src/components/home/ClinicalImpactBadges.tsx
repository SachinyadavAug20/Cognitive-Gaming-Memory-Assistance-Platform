"use client";

import { Activity, ShieldCheck, Cpu, Globe2 } from "lucide-react";

export function ClinicalImpactBadges() {
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Pillar 1: 18 Serious CDTx Games */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-tea-light border-2 border-black flex items-center justify-center text-tea mb-2.5 shadow-xs">
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            18 Serious CDTx Games
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            Clinically calibrated across 5 cognitive domains, 3D motor kinematics, and daily memory recall.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-tea uppercase tracking-wider">
          ✓ Memory • Attention • Motor
        </div>
      </div>

      {/* Pillar 2: Edge Ollama LLM */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-marigold-light border-2 border-black flex items-center justify-center text-marigold-dark mb-2.5 shadow-xs">
            <Cpu className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            100% Offline Edge AI
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            Local Ollama LLM extracts 17 clinical report domains with zero patient data leaving the device.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-marigold-dark uppercase tracking-wider">
          ✓ Private • On-Device • Edge
        </div>
      </div>

      {/* Pillar 3: 11 Regional Dialects */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-sky-100 border-2 border-black flex items-center justify-center text-sky-800 mb-2.5 shadow-xs">
            <Globe2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            11 Indigenous Languages
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            Native voice & visual support across all 8 North Eastern states with zero-flicker language transitions.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-sky-800 uppercase tracking-wider">
          ✓ 8 NES States • Zero-Flicker
        </div>
      </div>

      {/* Pillar 4: ABDM & MDoNER Telemetry */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border-2 border-black flex items-center justify-center text-emerald-800 mb-2.5 shadow-xs">
            <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            ABDM & MDoNER GIS
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            Ayushman Bharat ABHA Health ID integration with continuous 8-state public health telemetry.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
          ✓ ABHA ID • GIS Telemetry
        </div>
      </div>
    </section>
  );
}
