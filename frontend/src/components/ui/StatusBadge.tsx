import { type ReactNode } from "react";

interface StatusBadgeProps {
  status: "completed" | "due" | "upcoming" | "skipped";
  children: ReactNode;
  className?: string;
}

const STATUS_STYLES = {
  completed: "bg-tea-light text-tea border-tea",
  due: "bg-marigold-light text-marigold border-marigold pulse-gentle",
  upcoming: "bg-surface-muted text-ink-secondary border-border-soft",
  skipped: "bg-brick-light text-brick border-brick",
};

export function StatusBadge({ status, children, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[status]} ${className}`}
    >
      {status === "completed" && (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === "due" && (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </span>
  );
}
