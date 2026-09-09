"use client";

import { useState } from "react";
import { Brain, ShieldCheck, Activity, Award, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { mapTelemetryToMoCA, type MoCAProfileSummary } from "@/lib/errorlessLearning";

interface BiomarkerAxis {
  label: string;
  value: number; // 0..100
  domain: string;
}

interface BiomarkerRadarChartProps {
  axes?: BiomarkerAxis[];
  patientMoCATelemetry?: {
    visuospatialAccuracyPct: number;
    languageFluencyPct: number;
    delayedRecallPct: number;
    attentionReactionPct: number;
    abstractionSortingPct: number;
    orientationAccuracyPct: number;
  };
}

const DEFAULT_BIOMARKER_AXES: BiomarkerAxis[] = [
  { label: "Memory Retrieval", value: 88, domain: "Episodic Recall" },
  { label: "Motor Smoothness", value: 92, domain: "Tremor EMA Filter" },
  { label: "Bilateral Symmetry", value: 85, domain: "Two-Hand Coordination" },
  { label: "Processing Speed", value: 82, domain: "Reaction Latency" },
  { label: "Acoustic Fluency", value: 90, domain: "Speech-Pause Ratio" },
];

const DEFAULT_MOCA_TELEMETRY = {
  visuospatialAccuracyPct: 86,
  languageFluencyPct: 92,
  delayedRecallPct: 80,
  attentionReactionPct: 85,
  abstractionSortingPct: 90,
  orientationAccuracyPct: 95,
};

export function BiomarkerRadarChart({
  axes = DEFAULT_BIOMARKER_AXES,
  patientMoCATelemetry = DEFAULT_MOCA_TELEMETRY,
}: BiomarkerRadarChartProps) {
  const [viewMode, setViewMode] = useState<"moca" | "telemetry">("moca");
  const [showSubtestTable, setShowSubtestTable] = useState(false);

  const mocaProfile: MoCAProfileSummary = mapTelemetryToMoCA(patientMoCATelemetry);

  const mocaAxes: BiomarkerAxis[] = mocaProfile.domains.map((d) => ({
    label: d.domainTitle.split("&")[0].trim(),
    value: d.percentage,
    domain: `${d.estimatedScore}/${d.maxScore} pts`,
  }));

  const activeAxes = viewMode === "moca" ? mocaAxes : axes;
  const numAxes = activeAxes.length;
  const size = 380;
  const center = size / 2;
  const radius = 105;

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, normalizedValue: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  const patientPoints = activeAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.value / 100);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Mode Switcher */}
      <div className="mb-4 flex w-full items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-tea" />
          <span className="font-serif font-black text-sm sm:text-base text-ink">
            {viewMode === "moca" ? "MoCA 6-Domain Clinical Matrix" : "Micro-Telemetry Biomarkers"}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-surface p-1 shadow-[2px_2px_0px_#000]">
          <button
            type="button"
            onClick={() => setViewMode("moca")}
            className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors cursor-pointer ${
              viewMode === "moca"
                ? "bg-tea text-white shadow-xs"
                : "text-ink hover:bg-surface-muted"
            }`}
          >
            MoCA Mapping (6-Domain)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("telemetry")}
            className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors cursor-pointer ${
              viewMode === "telemetry"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-ink hover:bg-surface-muted"
            }`}
          >
            5-Axis Sensors
          </button>
        </div>
      </div>

      {viewMode === "moca" && (
        <div className="mb-3 w-full flex items-center justify-between rounded-xl border-2 border-black bg-tea-light/70 px-3.5 py-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-tea-dark" />
            <span className="text-xs font-black text-tea-dark uppercase tracking-wider">
              Predicted MoCA Score:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-black text-ink">
              {mocaProfile.totalEstimatedScore} / 30
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-black text-tea-dark border border-tea/30">
              {mocaProfile.clinicalTier}
            </span>
          </div>
        </div>
      )}

      {/* SVG Radar Visualization */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full max-w-[340px] h-auto"
      >
        {/* Background Concentric Polygon Web */}
        {rings.map((ring, ringIdx) => {
          const ringPoints = activeAxes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, ring);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill="none"
              stroke="#000000"
              strokeWidth={ringIdx === rings.length - 1 ? "2" : "1"}
              strokeDasharray={ringIdx < rings.length - 1 ? "3 3" : undefined}
              opacity={0.25 + ringIdx * 0.15}
            />
          );
        })}

        {/* Axis Spokes from Center */}
        {activeAxes.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#000000"
              strokeWidth="1.5"
              opacity={0.35}
            />
          );
        })}

        {/* Patient Score Polygon */}
        <polygon
          points={patientPoints}
          fill={viewMode === "moca" ? "#1B4D3E" : "#D97706"}
          fillOpacity={0.45}
          stroke={viewMode === "moca" ? "#1B4D3E" : "#D97706"}
          strokeWidth="3.5"
        />

        {/* Data Point Dots & Labels */}
        {activeAxes.map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.value / 100);
          const labelCoords = getCoordinates(i, 1.28);

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#F59E0B"
                stroke="#000000"
                strokeWidth="2"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-black fill-current text-ink select-none"
              >
                {axis.label}
              </text>
              <text
                x={labelCoords.x}
                y={labelCoords.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-bold fill-current text-ink-secondary select-none"
              >
                {viewMode === "moca" ? axis.domain : `${axis.value}%`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-ink">
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${viewMode === "moca" ? "bg-teal-800" : "bg-amber-600"}`} />
          <span>Patient In-Game Performance</span>
        </span>
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <span className="h-3 w-3 rounded-full border border-dashed border-black bg-white" />
          <span>Optimal Clinical Target (80% Flow)</span>
        </span>
      </div>

      {/* Expandable MoCA Clinical Subtest Equivalents Table */}
      {viewMode === "moca" && (
        <div className="mt-4 w-full border-t-2 border-black/10 pt-3">
          <button
            type="button"
            onClick={() => setShowSubtestTable((s) => !s)}
            className="w-full flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2 text-xs font-black text-ink hover:bg-tea-light/50 transition-colors cursor-pointer border border-black/15"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-tea" />
              <span>MoCA Clinical Subtest Translation Table</span>
            </span>
            {showSubtestTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSubtestTable && (
            <div className="mt-2.5 overflow-x-auto rounded-xl border-2 border-black bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink text-white font-black text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">MoCA Domain</th>
                    <th className="px-3 py-2">Clinical Subtest</th>
                    <th className="px-3 py-2">Digital Game Equivalent</th>
                    <th className="px-3 py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 font-medium text-ink">
                  {mocaProfile.domains.map((d) => (
                    <tr key={d.domainKey} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-3 py-2 font-bold text-ink whitespace-nowrap">
                        {d.domainTitle}
                      </td>
                      <td className="px-3 py-2 text-ink-secondary text-[11px]">
                        {d.clinicalSubtest}
                      </td>
                      <td className="px-3 py-2 text-tea-dark font-bold text-[11px]">
                        {d.digitalGameMapping}
                      </td>
                      <td className="px-3 py-2 text-right font-black whitespace-nowrap">
                        <span className="rounded-md bg-tea-light px-1.5 py-0.5 text-tea-dark border border-tea/30">
                          {d.estimatedScore}/{d.maxScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
