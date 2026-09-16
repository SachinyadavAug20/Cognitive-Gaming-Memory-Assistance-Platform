"use client";

import React, { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { RotateCcw, Droplets } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { resolveAdaptiveLevel } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { TileType } from "./types";
import { useTeaGardenMatchEngine } from "./useTeaGardenMatchEngine";
import { TeaGardenMatchScoreboard } from "./TeaGardenMatchScoreboard";
import { TeaGardenMatchGrid } from "./TeaGardenMatchGrid";

export { TILE_DEFS } from "./types";
export type { TileType } from "./types";

export function TeaGardenMatchGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const adaptiveLevel = resolveAdaptiveLevel(patientId, "teaGardenMatch", startLevel(detail));
  const patientSpeechRate = speechRate(detail);

  const { rows, cols, pool, goalMatches } = useMemo(() => {
    if (adaptiveLevel <= 1) {
      return {
        rows: 4,
        cols: 4,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket"] as TileType[],
        goalMatches: 10,
      };
    } else if (adaptiveLevel === 2) {
      return {
        rows: 4,
        cols: 4,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket", "clay_cup"] as TileType[],
        goalMatches: 12,
      };
    } else {
      return {
        rows: 5,
        cols: 5,
        pool: ["tea_leaf", "kopou_orchid", "cane_basket", "clay_cup", "golden_silk"] as TileType[],
        goalMatches: 15,
      };
    }
  }, [adaptiveLevel]);

  const engine = useTeaGardenMatchEngine({
    patientId: patientId ?? 0,
    level: adaptiveLevel,
    rate: patientSpeechRate,
    locale,
    rows,
    cols,
    pool,
    goalMatches,
  });

  if (loading) {
    return <GameLoading />;
  }

  if (error || !detail) {
    return (
      <section className="p-4 sm:p-6 text-center">
        <GameError onRetry={reload} />
        <div className="mt-4">
          <Link
            href="/patient/games"
            className="btn-tactile inline-block rounded-2xl border-2 border-black bg-white px-5 py-3 text-sm font-black text-ink shadow-[2px_2px_0px_#000]"
          >
            Back to Games
          </Link>
        </div>
      </section>
    );
  }

  const harvestProgressPercentage = Math.min(100, Math.round((engine.matchesCount / goalMatches) * 100));

  return (
    <section className="pb-16 min-h-screen bg-canvas select-none">
      <GameHeader
        title={
          locale === "as"
            ? "চাহ বাগিচা (Tea Garden Match)"
            : locale === "hi"
            ? "चाय बागान (Tea Garden Match)"
            : "Tea Garden Bloom (Chah Bagisha)"
        }
        score={engine.score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="tea-garden-match"
      />

      <div className="mx-auto max-w-md px-3 sm:px-4 pt-3 flex flex-col gap-3">
        {engine.phase === "playing" && (
          <>
            <TeaGardenMatchScoreboard
              locale={locale}
              matchesCount={engine.matchesCount}
              goalMatches={goalMatches}
              progressPct={harvestProgressPercentage}
              isProcessing={engine.isProcessing}
              onManualHint={engine.handleManualHint}
              comboBanner={engine.comboBanner}
            />

            <TeaGardenMatchGrid
              board={engine.board}
              rows={rows}
              cols={cols}
              selectedCoord={engine.selectedCoord}
              hintCoords={engine.hintCoords}
              bustState={engine.bustState}
              swapAnim={engine.swapAnim}
              floatingScores={engine.floatingScores}
              isProcessing={engine.isProcessing}
              locale={locale}
              onTileClick={engine.handleTileClick}
              onTouchStart={engine.handleTouchStart}
              onTouchEnd={engine.handleTouchEnd}
            />
          </>
        )}

        {engine.phase === "done" && (
          <Celebration
            title={
              locale === "as"
                ? "চাহ সংগ্ৰহ সফল হ'ল! 🍃"
                : locale === "hi"
                ? "चाय संकलन पूर्ण हुआ! 🍃"
                : "Tea Harvest Complete! 🍃"
            }
            subtitle={
              locale === "as"
                ? "আপুনি সকলো চাহ পাত আৰু কপৌ ফুল অতি সুন্দৰভাৱে মিলাই সংগ্ৰহ কৰিলে।"
                : locale === "hi"
                ? "आपने चाय की पत्तियां और सुंदर फूल सफलतापूर्वक संकलित किए।"
                : "You matched all garden flowers and fresh tea leaves with great focus."
            }
            xpEarned={120}
            accuracy="100%"
          >
            <div className="flex flex-col items-center gap-3.5 max-w-xs mx-auto text-center w-full pt-2">
              <div className="w-full rounded-2xl border-2 border-sky-600 bg-sky-50 p-3 text-left flex items-start gap-2.5 shadow-sm">
                <Droplets className="h-6 w-6 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-sky-950">
                    {locale === "as"
                      ? "পানী খোৱাৰ সময় 💧"
                      : locale === "hi"
                      ? "पानी पीने का समय 💧"
                      : "Health Reminder • Hydration 💧"}
                  </h4>
                  <p className="text-[11px] font-bold text-sky-900 mt-0.5">
                    {locale === "as"
                      ? "চাহ তোলাৰ পিছত এগিলাচ পৰিষ্কাৰ পানী খাই লওক।"
                      : locale === "hi"
                      ? "चाय चुनने के बाद अब एक गिलास ताज़ा पानी पी लें।"
                      : "After your garden walk, enjoy a refreshing glass of fresh water."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <ChunkyButton variant="tea" size="xl" onClick={engine.restartGame}>
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>{locale === "as" ? "পুনৰ খেলক" : locale === "hi" ? "फिर से खेलें" : "Play Again"}</span>
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs sm:text-sm font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
                >
                  {locale === "as" ? "খেললৈ উভতি যাওক" : locale === "hi" ? "खेल सूची" : "Back to Games"}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
