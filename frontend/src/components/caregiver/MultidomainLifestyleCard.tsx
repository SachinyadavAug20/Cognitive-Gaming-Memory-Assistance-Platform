"use client";

import { useState } from "react";
import {
  Calendar,
  Sparkles,
  Award,
  Footprints,
  Droplet,
  Users,
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface MultidomainLifestyleCardProps {
  patientName?: string;
}

export function MultidomainLifestyleCard({
  patientName = "Patient",
}: MultidomainLifestyleCardProps) {
  const [completedPillars, setCompletedPillars] = useState<Record<string, boolean>>({
    cognitive: true,
    kinesthetic: true,
    nutrition: false,
    social: true,
  });

  const togglePillar = (key: string) => {
    setCompletedPillars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black/15 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-tea" />
            <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
              Multidomain Lifestyle & ACTIVE Booster Protocol
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            Grounded in the landmark NIH ACTIVE Study (20-year RCT) & LatAm-FINGERS / US POINTER multidomain dementia prevention paradigms.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-amber-200 px-3 py-1 text-xs font-black uppercase text-amber-950 shadow-xs">
          <Award className="h-4 w-4" />
          <span>25% Risk Reduction Cadence</span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Pillar 1: Cognitive Training */}
        <div
          onClick={() => togglePillar("cognitive")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.cognitive ? "bg-teal-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-teal-200 text-teal-950 font-black">
                <Brain className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.cognitive ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              1. Cognitive Training
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              3 serious game sessions weekly (MoCA-mapped memory & visuospatial practice).
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.cognitive ? "Completed Today (35 min)" : "Pending Today"}
          </div>
        </div>

        {/* Pillar 2: Kinesthetic & Motor Exergaming */}
        <div
          onClick={() => togglePillar("kinesthetic")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.kinesthetic ? "bg-emerald-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-200 text-emerald-950 font-black">
                <Footprints className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.kinesthetic ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              2. Kinesthetic Exergames
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              Motion plucking & bilateral hand coordination to stimulate motor plasticity.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.kinesthetic ? "Completed (Tea Catch 94%)" : "Pending Today"}
          </div>
        </div>

        {/* Pillar 3: Hydration & Ethnobotanical Nutrition */}
        <div
          onClick={() => togglePillar("nutrition")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.nutrition ? "bg-cyan-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-cyan-200 text-cyan-950 font-black">
                <Droplet className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.nutrition ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              3. Hydration & Diet
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              6 water milestones + fresh Manimuni pennywort or Lakadong turmeric broth.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.nutrition ? "Goal Reached (6/6 Cups)" : "Tap to Mark 6 Cups"}
          </div>
        </div>

        {/* Pillar 4: Social Reminiscence & Calm */}
        <div
          onClick={() => togglePillar("social")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.social ? "bg-purple-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-purple-200 text-purple-950 font-black">
                <Users className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.social ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              4. Social & Calm
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              Family voice notes, nostalgic Bihu folk tunes, and 432 Hz bedtime soundscapes.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.social ? "Completed (Echoes of Home)" : "Pending Today"}
          </div>
        </div>
      </div>

      {/* ACTIVE Study Booster Cadence Tracker */}
      <div className="rounded-2xl border-2 border-black/20 bg-[#FAF6F0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              ACTIVE Protocol Longitudinal Booster Milestones
            </span>
          </div>
          <p className="text-xs font-medium text-ink-secondary max-w-xl">
            As demonstrated in the 20-year ACTIVE trial, booster reinforcement sessions at systematic intervals maintain neural adaptations and prevent cognitive skill decay over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink shadow-xs">
            <Clock className="h-3.5 w-3.5 text-tea" />
            <span>Next Booster: Day 30 Review (In 11 days)</span>
          </div>
          <span className="rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-xs">
            Cadence: 100% On-Track
          </span>
        </div>
      </div>
    </div>
  );
}
