import { type ReactNode } from "react";

interface ScrapbookCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "polaroid";
}

export function ScrapbookCard({
  children,
  className = "",
  variant = "default",
}: ScrapbookCardProps) {
  const variants = {
    default: "scrapbook-card",
    muted: "scrapbook-card bg-surface-muted",
    polaroid: "polaroid",
  };

  return (
    <div className={`${variants[variant]} ${className}`}>{children}</div>
  );
}
