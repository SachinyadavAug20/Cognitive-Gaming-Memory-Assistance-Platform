"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "terracotta" | "tea" | "marigold" | "outline";
  size?: "lg" | "xl";
  icon?: ReactNode;
}

export function BigButton({
  children,
  variant = "terracotta",
  size = "lg",
  icon,
  className = "",
  ...props
}: BigButtonProps) {
  const base =
    "btn-tactile inline-flex items-center justify-center gap-3 font-bold font-[family-name:var(--font-sans)] select-none";

  const variants = {
    terracotta:
      "bg-terracotta text-ink-inverse border-border hover:bg-terracotta-hover",
    tea: "bg-tea text-ink-inverse border-border hover:bg-tea-hover",
    marigold:
      "bg-marigold text-ink-inverse border-border hover:bg-marigold-hover",
    outline:
      "bg-surface text-ink border-border hover:bg-surface-muted",
  };

  const sizes = {
    lg: "text-base px-5 py-3 min-h-[52px] rounded-xl",
    xl: "text-lg px-6 py-3.5 min-h-[56px] rounded-xl",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      {children}
    </button>
  );
}
