import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  title: string;
  description: string;
}

export function AlertBanner({ title, description }: AlertBannerProps) {
  return (
    <ScrapbookCard className="!bg-brick-light !border-brick !p-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-brick mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-brick leading-tight">
            {title}
          </h3>
          <p className="text-brick/80 text-xs mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </ScrapbookCard>
  );
}
