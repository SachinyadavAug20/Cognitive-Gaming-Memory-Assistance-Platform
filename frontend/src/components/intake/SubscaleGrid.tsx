"use client";

import { useTranslations } from "next-intl";
import type { SubscaleScore } from "@/types/intake";

interface SubscaleGridProps {
  subscales: Record<string, SubscaleScore>;
}

export function SubscaleGrid({ subscales }: SubscaleGridProps) {
  const t = useTranslations("intake.medical");

  if (Object.keys(subscales).length === 0) return null;

  return (
    <div className="border-3 border-ink rounded-2xl bg-surface p-5 shadow-[4px_4px_0_var(--color-border)]">
      <h4 className="font-[family-name:var(--font-serif)] font-black text-lg text-ink mb-3">
        {t("subscales")}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(subscales).map(([key, val]) => (
          <div key={key} className="text-center bg-warm-surface border border-ink rounded-xl p-2">
            <span className="text-[10px] font-black uppercase text-ink-soft block truncate">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-lg font-black text-ink">
              {val.score}
              <span className="text-xs text-ink-secondary">/{val.max}</span>
            </span>
            <div className="w-full bg-surface h-2 rounded-full border border-border-soft overflow-hidden mt-1">
              <div
                className="h-full bg-amber"
                style={{ width: `${val.max > 0 ? (val.score / val.max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
