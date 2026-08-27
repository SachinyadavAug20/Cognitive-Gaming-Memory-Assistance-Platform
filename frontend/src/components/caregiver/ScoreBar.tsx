interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
  size?: "sm" | "md";
}

export function ScoreBar({ label, value, color, size = "md" }: ScoreBarProps) {
  const heightClass = size === "sm" ? "h-2.5" : "h-3";
  const labelSize = size === "sm" ? "text-[11px]" : "text-sm";

  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className={`${labelSize} font-bold text-ink-secondary`}>{label}</span>
        <span className={`${labelSize} font-bold text-ink`}>{value}%</span>
      </div>
      <div className={`${heightClass} bg-surface-muted rounded-full overflow-hidden border border-border-soft`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
