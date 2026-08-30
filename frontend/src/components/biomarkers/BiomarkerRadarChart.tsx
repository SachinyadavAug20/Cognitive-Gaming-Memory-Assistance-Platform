"use client";

interface BiomarkerAxis {
  label: string;
  value: number; // 0..100
  domain: string;
}

interface BiomarkerRadarChartProps {
  axes?: BiomarkerAxis[];
}

const DEFAULT_AXES: BiomarkerAxis[] = [
  { label: "Memory Recall", value: 92, domain: "Episodic & Semantic" },
  { label: "Executive Function", value: 88, domain: "IADL & Arithmetic" },
  { label: "Motor Precision", value: 94, domain: "Bilateral Symmetry" },
  { label: "Processing Speed", value: 86, domain: "Reaction Latency" },
  { label: "Language Fluency", value: 95, domain: "Lexical Diversity" },
];

export function BiomarkerRadarChart({ axes = DEFAULT_AXES }: BiomarkerRadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const numAxes = axes.length;

  // Compute polygon points for concentric rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, normalizedValue: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Build patient score polygon
  const patientPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.value / 100);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Polygon Web */}
        {rings.map((ring, ringIdx) => {
          const ringPoints = axes
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
              opacity={0.3 + ringIdx * 0.15}
            />
          );
        })}

        {/* Axis Spokes from Center */}
        {axes.map((_, i) => {
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
              opacity={0.4}
            />
          );
        })}

        {/* Patient Clinical Biomarker Shape */}
        <polygon
          points={patientPoints}
          fill="#1B4D3E"
          fillOpacity={0.45}
          stroke="#1B4D3E"
          strokeWidth="3"
        />

        {/* Metric Data Points & Labels */}
        {axes.map((axis, i) => {
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
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-black fill-current text-ink select-none"
              >
                {axis.label} ({axis.value}%)
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-ink">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-teal-800" /> Current Assessment Profile
        </span>
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> Optimal Clinical Baseline
        </span>
      </div>
    </div>
  );
}
