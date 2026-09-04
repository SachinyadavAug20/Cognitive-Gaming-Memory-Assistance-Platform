"use client";

import { useTranslations } from "next-intl";
import { Wrench } from "lucide-react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";

export function GameLoading() {
  const t = useTranslations("games");
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-terracotta border-t-transparent" />
      <p className="text-lg font-semibold text-ink-secondary">{t("loading")}</p>
    </div>
  );
}

export function GameError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("games");
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <Wrench className="w-16 h-16 text-amber-600 stroke-[1.5]" />
      <p className="max-w-xs text-lg font-semibold text-ink-secondary">
        {t("loadError")}
      </p>
      <ChunkyButton variant="terracotta" size="xl" onClick={onRetry}>
        {t("retry")}
      </ChunkyButton>
    </div>
  );
}