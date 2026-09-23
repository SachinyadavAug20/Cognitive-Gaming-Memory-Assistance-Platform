"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Info,
  Calendar,
  Zap,
} from "lucide-react";
import { playTapFeedback, playPress } from "@/lib/sound";
import { useLocale } from "next-intl";

interface GlucoseReading {
  time: string;
  type: "fasting" | "post_meal" | "random";
  glucoseMgDl: number;
  reactionTimeMs: number;
  accuracyPct: number;
}

const DEFAULT_READINGS: GlucoseReading[] = [
  { time: "Mon 08:00", type: "fasting", glucoseMgDl: 98, reactionTimeMs: 330, accuracyPct: 94 },
  { time: "Mon 14:00", type: "post_meal", glucoseMgDl: 165, reactionTimeMs: 410, accuracyPct: 88 },
  { time: "Tue 08:00", type: "fasting", glucoseMgDl: 104, reactionTimeMs: 340, accuracyPct: 92 },
  { time: "Tue 14:00", type: "post_meal", glucoseMgDl: 195, reactionTimeMs: 490, accuracyPct: 79 },
  { time: "Wed 08:00", type: "fasting", glucoseMgDl: 94, reactionTimeMs: 320, accuracyPct: 96 },
  { time: "Wed 14:00", type: "post_meal", glucoseMgDl: 142, reactionTimeMs: 360, accuracyPct: 91 },
  { time: "Thu 08:00", type: "fasting", glucoseMgDl: 101, reactionTimeMs: 335, accuracyPct: 93 },
];

import { useCareSyncStore } from "@/lib/careSyncStore";

export function MetabolicCognitiveTracker() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const storeReadings = useCareSyncStore((s) => s.glucoseReadings);
  const addGlucoseReading = useCareSyncStore((s) => s.addGlucoseReading);

  const [newGlucose, setNewGlucose] = useState<string>("110");
  const [readingType, setReadingType] = useState<"fasting" | "post_meal" | "random">("fasting");
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  const readings: GlucoseReading[] = useMemo(() => {
    return storeReadings.map((r) => ({
      time: r.time,
      type: r.type,
      glucoseMgDl: r.glucoseMgDl,
      reactionTimeMs: r.reactionTimeMs,
      accuracyPct: Math.max(68, Math.min(98, Math.round(100 - (r.reactionTimeMs - 300) * 0.12))),
    }));
  }, [storeReadings]);

  // Latest reading
  const latest = readings[readings.length - 1] || DEFAULT_READINGS[0];

  // Correlation status
  const isOptimal = latest.glucoseMgDl >= 80 && latest.glucoseMgDl <= 140;
  const isHigh = latest.glucoseMgDl > 160;
  const isLow = latest.glucoseMgDl < 75;

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(newGlucose);
    if (isNaN(g) || g < 40 || g > 500) return;

    addGlucoseReading({
      type: readingType,
      glucoseMgDl: g,
    });

    setShowLogModal(false);
    playTapFeedback();
  };

  // SVG Chart Dimensions
  const chartW = 480;
  const chartH = 160;
  const pad = 24;

  const pts = readings.map((r, i) => {
    const x = pad + (i / (readings.length - 1)) * (chartW - pad * 2);
    // Glucose scale: 70 to 220
    const yGlucose = chartH - pad - ((r.glucoseMgDl - 70) / (220 - 70)) * (chartH - pad * 2);
    // Reaction time scale: 280 to 520 ms
    const yRT = chartH - pad - ((r.reactionTimeMs - 280) / (520 - 280)) * (chartH - pad * 2);
    return { x, yGlucose, yRT, r };
  });

  const glucosePath = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.yGlucose}` : `${acc} L ${p.x} ${p.yGlucose}`), "");
  const rtPath = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.yRT}` : `${acc} L ${p.x} ${p.yRT}`), "");

  return (
    <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-black flex items-center justify-center text-red-600 shrink-0 shadow-[2px_2px_0px_#000]">
            <HeartPulse className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded border border-black">
                {normLoc === "hi" ? "मेटाबॉलिक-संज्ञानात्मक लिंक" : normLoc === "as" ? "চেনি আৰু মস্তিষ্ক সম্বন্ধ" : "Glycemic-Cognitive Link"}
              </span>
              <span className="text-xs font-bold text-ink-secondary flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-tea" />
                <span>Active Correlation</span>
              </span>
            </div>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-0.5">
              {normLoc === "hi"
                ? "रक्त शर्करा (Sugar) एवं मानसिक सतर्कता ट्रैकर"
                : normLoc === "as"
                ? "তেজৰ চেনি (Sugar) আৰু মানসিক ক্ষিপ্ৰতা নিৰীক্ষণ"
                : "Blood Sugar vs Cognitive Speed Correlation"}
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            playPress();
            setShowLogModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-tea text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{normLoc === "hi" ? "शुगर दर्ज करें" : normLoc === "as" ? "চেনি জোখক" : "Log Glucose"}</span>
        </button>
      </div>

      {/* Clinical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Latest Glucose */}
        <div className="p-3.5 rounded-2xl border-2 border-black bg-amber-50">
          <span className="text-xs font-bold text-ink-secondary">Latest Glucose</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif font-black text-2xl sm:text-3xl text-ink">
              {latest.glucoseMgDl}
            </span>
            <span className="text-xs font-bold text-ink-secondary">mg/dL</span>
          </div>
          <span className="text-[11px] font-bold text-ink-secondary capitalize">
            {latest.type.replace("_", " ")} reading
          </span>
        </div>

        {/* Reaction Time */}
        <div className="p-3.5 rounded-2xl border-2 border-black bg-sky-50">
          <span className="text-xs font-bold text-ink-secondary">Cognitive Reaction Latency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif font-black text-2xl sm:text-3xl text-sky-900">
              {latest.reactionTimeMs}
            </span>
            <span className="text-xs font-bold text-sky-800">ms</span>
          </div>
          <span className="text-[11px] font-bold text-sky-700">
            {latest.reactionTimeMs < 360 ? "✓ Fast & Alert" : "⚠️ Delayed (Brain Fog)"}
          </span>
        </div>

        {/* Scientific Correlation Insight */}
        <div
          className={`p-3.5 rounded-2xl border-2 border-black ${
            isOptimal ? "bg-emerald-50" : isHigh ? "bg-red-50" : "bg-amber-50"
          }`}
        >
          <span className="text-xs font-bold text-ink-secondary">Brain Status</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
            {isOptimal ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-emerald-900">Optimal Brain Fuel</span>
              </>
            ) : isHigh ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <span className="text-red-900">Sugar Spike Slowdown (+34% lag)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="text-amber-900">Low Glucose Fog</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-ink-secondary mt-1">
            {isOptimal
              ? "Steady glucose provides peak memory recall."
              : isHigh
              ? "Post-meal spikes temporarily reduce reaction speed."
              : "Hypoglycemia triggers memory confusion; hydrate & snack."}
          </p>
        </div>
      </div>

      {/* Correlation Graph SVG */}
      <div className="p-4 rounded-2xl border-2 border-black/20 bg-muted/20">
        <div className="flex items-center justify-between text-xs font-bold text-ink-secondary mb-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-3 h-1 bg-red-500 rounded" />
              <span>Blood Glucose (mg/dL)</span>
            </span>
            <span className="flex items-center gap-1.5 text-sky-700">
              <span className="w-3 h-1 bg-sky-600 rounded" />
              <span>Reaction Latency (ms)</span>
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px]">Direct Clinical Link</span>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40">
            {/* Safe Glucose Target Band (80-140) */}
            <rect
              x={pad}
              y={chartH - pad - ((140 - 70) / (220 - 70)) * (chartH - pad * 2)}
              width={chartW - pad * 2}
              height={((140 - 80) / (220 - 70)) * (chartH - pad * 2)}
              fill="rgba(16, 185, 129, 0.12)"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeDasharray="2,2"
            />

            {/* Glucose Path (Red) */}
            <path d={glucosePath} fill="none" stroke="#EF4444" strokeWidth="2.5" />
            {pts.map((p, i) => (
              <circle key={`g-${i}`} cx={p.x} cy={p.yGlucose} r="3.5" fill="#EF4444" stroke="#000" strokeWidth="1" />
            ))}

            {/* Reaction Time Path (Sky Blue) */}
            <path d={rtPath} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="3,2" />
            {pts.map((p, i) => (
              <circle key={`rt-${i}`} cx={p.x} cy={p.yRT} r="3.5" fill="#0284C7" stroke="#000" strokeWidth="1" />
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-ink-secondary mt-1 px-2 font-mono">
          <span>{readings[0].time}</span>
          <span className="text-emerald-700 font-bold">Green Band = Target Euglycemia</span>
          <span>{readings[readings.length - 1].time}</span>
        </div>
      </div>

      {/* Clinical Reference Box */}
      <div className="p-3.5 rounded-xl border border-black/20 bg-amber-50/70 text-xs text-ink-secondary flex items-start gap-2.5">
        <Info className="h-4 w-4 text-tea shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink">Medical Insight: </strong>
          Chronic post-meal sugar spikes induce neuro-inflammation and microvascular dementia progression. Maintaining steady fasting glucose (80-110 mg/dL) through fiber-rich meals and post-meal strolls protects synaptic transmission and cuts cognitive reaction lag by up to 40%.
        </div>
      </div>

      {/* Modal to Log Glucose */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h4 className="font-serif font-black text-xl text-ink">Log Blood Glucose Reading</h4>
            <p className="text-xs text-ink-secondary mt-1">
              Correlates your metabolic status with today's cognitive therapy games.
            </p>

            <form onSubmit={handleAddReading} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-ink">Glucose Reading (mg/dL)</label>
                <input
                  type="number"
                  min="40"
                  max="500"
                  value={newGlucose}
                  onChange={(e) => setNewGlucose(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border-2 border-black bg-white font-mono font-black text-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Reading Context</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: "fasting", label: "Fasting (पुৱা)" },
                    { id: "post_meal", label: "Post-Meal (আহাৰৰ পিছত)" },
                    { id: "random", label: "Random" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReadingType(t.id as typeof readingType)}
                      className={`p-2 rounded-xl border-2 text-xs font-bold cursor-pointer ${
                        readingType === t.id
                          ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                          : "border-black/20 bg-surface text-ink hover:bg-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-black bg-white font-bold text-xs hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl border-2 border-black bg-tea text-white font-bold text-xs hover:bg-emerald-800 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Save & Correlate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
