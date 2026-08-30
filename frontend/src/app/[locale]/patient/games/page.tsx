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
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

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

  const filteredGames = GAMES.filter((g) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "recommended") return g.recommended;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-ink flex items-center gap-2">
            <span>🧠</span> Cognitive Therapy Suite
          </h1>
          <p className="text-sm font-bold text-ink-secondary mt-1">
            Culturally tailored Digital Therapeutics (CDTx) for North East India
          </p>
        </div>
        <Link
          href="/patient"
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-surface-muted"
        >
          ← {t("backToRoutine")}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all ${
            selectedFilter === "all"
              ? "border-black bg-tea text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-border bg-surface text-ink hover:bg-surface-muted"
          }`}
        >
          All Games ({GAMES.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("recommended")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all ${
            selectedFilter === "recommended"
              ? "border-black bg-marigold text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-border bg-surface text-ink hover:bg-surface-muted"
          }`}
        >
          ⭐ Flagship Clinical Modules
        </button>
      </div>

      {loading ? (
        <GameLoading />
      ) : error ? (
        <GameError onRetry={reload} />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/patient/games/${game.id}`}
              className="btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-black text-3xl shadow-sm text-white ${game.accent}`}
                >
                  {game.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-base font-black text-ink leading-tight">
                      {t(game.titleKey)}
                    </span>
                    {game.recommended && (
                      <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                        ⭐ CDTx
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-0.5 rounded bg-tea-light px-2 py-0.2 text-[10px] font-extrabold text-tea border border-tea/40">
                    🎯 {game.domain}
                  </span>
                  <p className="mt-1.5 text-xs font-semibold text-ink-secondary line-clamp-2">
                    {t(game.descKey)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/80 pt-2 text-[11px] font-bold text-ink-secondary">
                <span>⭐ Level {startLevel(detail)}</span>
                <span className="rounded-lg bg-tea px-2.5 py-1 text-xs font-black text-white group-hover:bg-tea/90">
                  Play →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}