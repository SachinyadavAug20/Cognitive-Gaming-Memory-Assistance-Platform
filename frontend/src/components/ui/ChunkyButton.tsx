"use client";

import { type ButtonHTMLAttributes, type ReactNode, useCallback } from "react";
import { playPress } from "@/lib/sound";

interface ChunkyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "terracotta" | "tea" | "marigold" | "outline";
  size?: "xl" | "2xl";
  icon?: ReactNode;
  sound?: boolean;
}

const VARIANT_CLASSES: Record<string, string> = {
  terracotta: "",
  tea: "btn-chunky-tea",
  marigold: "btn-chunky-marigold",
  outline: "btn-chunky-outline",
};

const SIZE_CLASSES: Record<string, string> = {
  xl: "btn-chunky-xl",
  "2xl": "btn-chunky-2xl",
};

export function ChunkyButton({
  children,
  variant = "terracotta",
  size = "xl",
  icon,
  sound = true,
  onClick,
  className = "",
  ...props
}: ChunkyButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sound) playPress();
      onClick?.(e);
    },
    [onClick, sound]
  );

  return (
    <button
      className={`btn-chunky ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="flex-shrink-0 [&>svg]:w-9 [&>svg]:h-9">{icon}</span>}
      {children}
    </button>
  );
}
