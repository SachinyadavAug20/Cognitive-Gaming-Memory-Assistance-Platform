import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { BigButton } from "@/components/ui/BigButton";

interface ExerciseBannerProps {
  label: string;
  labelColor: string;
  bgColor: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant: "terracotta" | "tea" | "marigold" | "outline";
}

export function ExerciseBanner({
  label,
  labelColor,
  bgColor,
  emoji,
  title,
  description,
  href,
  buttonText,
  buttonVariant,
}: ExerciseBannerProps) {
  return (
    <ScrapbookCard className="!p-0 overflow-hidden">
      <div className={`${bgColor} px-4 py-2 border-b-3 border-border`}>
        <span className={`text-xs font-bold ${labelColor} uppercase tracking-wider`}>{label}</span>
      </div>
      <div className="p-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="text-4xl shrink-0">{emoji}</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-1">
              {title}
            </h2>
            <p className="text-ink-secondary text-sm">{description}</p>
          </div>
          <Link href={href} className="w-full md:w-auto shrink-0">
            <BigButton variant={buttonVariant} size="lg" className="w-full md:w-auto text-base min-h-[56px] px-5 py-3">
              {buttonText} <span className="text-lg">→</span>
            </BigButton>
          </Link>
        </div>
      </div>
    </ScrapbookCard>
  );
}
