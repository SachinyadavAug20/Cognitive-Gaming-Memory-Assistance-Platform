"use client";

import { useTranslations } from "next-intl";
import { Pill, Droplets, Users, Check, Clock } from "lucide-react";
import type { RoutineItem as RoutineItemType } from "@/types";

interface RoutineItemProps {
  item: RoutineItemType;
}

export function RoutineItem({ item }: RoutineItemProps) {
  const t = useTranslations("home.routine");

  const title = item.key && t.has(item.key) ? t(item.key) : item.title;
  const time = item.timeKey && t.has(item.timeKey) ? t(item.timeKey) : item.time;

  const renderIcon = () => {
    if (item.key === "morning_medicine" || item.emoji === "pill") {
      return <Pill className="w-5 h-5 text-terracotta" />;
    }
    if (item.key === "water_reminder" || item.emoji === "water") {
      return <Droplets className="w-5 h-5 text-blue-600" />;
    }
    if (item.key === "family_photos" || item.emoji === "family") {
      return <Users className="w-5 h-5 text-emerald-600" />;
    }
    return <Clock className="w-5 h-5 text-ink-secondary" />;
  };

  return (
    <div
      className={`scrapbook-card !p-3 flex items-center gap-3 ${item.status === "due" ? "!border-marigold !border-4" : ""}`}
    >
      <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 border border-border-soft">
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-ink leading-tight">{title}</div>
        <div className="text-xs text-ink-secondary">{time}</div>
      </div>
      {item.status === "completed" && (
        <span className="w-7 h-7 rounded-full bg-tea-light border-2 border-tea flex items-center justify-center text-tea shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}
      {item.status === "due" && (
        <span className="px-2.5 py-1 rounded-full bg-marigold-light border-2 border-marigold text-marigold text-xs font-bold pulse-gentle">
          {t("now")}
        </span>
      )}
    </div>
  );
}
