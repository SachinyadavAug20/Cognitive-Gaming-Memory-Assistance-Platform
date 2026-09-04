import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

interface PortalCardProps {
  headerBg: string;
  emoji?: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  href?: string;
  children: ReactNode;
  actionButton: ReactNode;
}

export function PortalCard({
  headerBg,
  emoji,
  icon: Icon,
  title,
  subtitle,
  description,
  href,
  children,
  actionButton,
}: PortalCardProps) {
  const card = (
    <div className="scrapbook-card !p-0 overflow-hidden hover:translate-y-[-2px] transition-transform h-full flex flex-col">
      <div className={`${headerBg} px-5 py-3 border-b-4 border-border`}>
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-ink-inverse shrink-0">
              <Icon className="h-7 w-7 stroke-[2.2]" />
            </div>
          ) : emoji ? (
            <div className="text-4xl">{emoji}</div>
          ) : null}
          <div>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse leading-tight">
              {title}
            </h2>
            <p className="text-ink-inverse/70 text-sm mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <p className="text-base text-ink leading-snug">
          {description}
        </p>
        {children}
        {actionButton}
      </div>
    </div>
  );

  if (!href) {
    return <div className="block group">{card}</div>;
  }

  return (
    <Link href={href} className="block group">
      {card}
    </Link>
  );
}
