"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GAMES } from "@/games/registry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { getGamePlayCount } from "@/lib/telemetry";
import { GameError, GameLoading } from "@/components/games/GameState";

export default function GamesHubPage() {
  const t = useTranslations("games");
  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const [plays, setPlays] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!patientId) return;
    const timer = window.setTimeout(() => {
      const counts: Record<string, number> = {};
      for (const game of GAMES) {
        counts[game.id] = getGamePlayCount(patientId, game.id);
      }
      setPlays(counts);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [patientId, loading]);

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-extrabold text-ink">
            🎮 {t("title")}
          </h1>
          <p className="text-sm font-semibold text-ink-secondary">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/patient"
          className="text-sm font-bold text-terracotta underline"
        >
          {t("backToRoutine")}
        </Link>
      </div>

      {loading ? (
        <GameLoading />
      ) : error ? (
        <GameError onRetry={reload} />
      ) : (
        <div className="space-y-3">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/patient/games/${game.id}`}
              className="btn-tactile group flex items-center gap-4 rounded-2xl border-2 border-border bg-surface p-4 shadow-[0_3px_0_var(--color-border)]"
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-border text-3xl ${game.accent}`}
              >
                {game.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-extrabold text-ink">
                    {t(game.titleKey)}
                  </span>
                  {game.recommended && (
                    <span className="shrink-0 rounded-full bg-terracotta-light px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-terracotta">
                      {t("recommended")}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-ink-secondary">
                  {t(game.descKey)}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-ink-secondary">
                  <span>⭐ {t("level", { level: startLevel(detail) })}</span>
                  <span>·</span>
                  <span>{t("plays", { count: plays[game.id] ?? 0 })}</span>
                </div>
              </div>
              <span className="text-2xl text-terracotta transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}