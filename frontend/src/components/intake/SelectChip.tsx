"use client";

import { type ButtonHTMLAttributes } from "react";

interface SelectChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  label: string;
  selected?: boolean;
  tone?: "marigold" | "tea" | "terracotta";
  size?: "sm" | "md";
}

const SELECTED_CLASSES: Record<string, string> = {
  marigold: "bg-marigold text-white border-border",
  tea: "bg-tea text-white border-border",
  terracotta: "bg-terracotta text-white border-border",
};

const UNSELECTED_CLASSES =
  "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted";

const SIZE_CLASSES: Record<string, string> = {
  sm: "px-3 py-1.5 rounded-lg text-xs font-bold border-2",
  md: "px-5 rounded-xl border-3 font-bold text-lg min-h-[56px]",
};

export function SelectChip({
  label,
  selected = false,
  tone = "marigold",
  size = "md",
  className = "",
  ...props
}: SelectChipProps) {
  return (
    <button
      type="button"
      className={`transition-all ${SIZE_CLASSES[size]} ${
        selected ? SELECTED_CLASSES[tone] : UNSELECTED_CLASSES
      } ${className}`}
      aria-pressed={selected}
      {...props}
    >
      {label}
    </button>
  );
}
