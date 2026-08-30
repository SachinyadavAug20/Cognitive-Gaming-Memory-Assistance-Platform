"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Brain,
  Paperclip,
  ShieldCheck,
  ArrowRight,
  Activity,
  Award,
  Layers,
} from "lucide-react";
import { GAMES } from "@/games/registry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { getGamePlayCount } from "@/lib/telemetry";
import { GameError, GameLoading } from "@/components/games/GameState";

export default function GamesHubPage() {
  const t = useTranslations("games");
  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const [, setPlays] = useState<Record<string, number>>({});
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
    if (selectedFilter === "ai") return g.domain.startsWith("AI");
    if (selectedFilter === "3d") return g.domain.includes("3D");
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Government Dossier Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-tea">
            <Paperclip className="h-4 w-4 text-ink" />
            <span className="text-[11px] font-black uppercase tracking-wider text-ink">
              MDoNER Cognitive Digital Therapeutics (CDTx) Suite
            </span>
          </div>
          <h1 className="font-serif text-3xl font-black text-ink flex items-center gap-2">
            <Brain className="h-8 w-8 text-tea shrink-0" /> Cognitive Therapy Modules
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            Culturally tailored interactive clinical games for elderly dementia care
          </p>
        </div>

        <Link
          href="/patient"
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
        >
          ← {t("backToRoutine")}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "all"
              ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Modules ({GAMES.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("3d")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "3d"
              ? "border-black bg-teal-800 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>3D & Vision ({GAMES.filter((g) => g.domain.includes("3D")).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("ai")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "ai"
              ? "border-black bg-purple-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>AI Reminiscence ({GAMES.filter((g) => g.domain.startsWith("AI")).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("recommended")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "recommended"
              ? "border-black bg-marigold text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Flagship Clinical CDTx</span>
        </button>
      </div>

      {loading ? (
        <GameLoading />
      ) : error ? (
        <GameError onRetry={reload} />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredGames.map((game) => {
            const Icon = game.icon || Brain;
            return (
              <Link
                key={game.id}
                href={`/patient/games/${game.id}`}
                className="btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-3 border-black text-white shadow-[3px_3px_0px_#000] ${game.accent}`}
                  >
                    <Icon className="h-7 w-7 text-white stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-black text-ink leading-tight">
                        {t(game.titleKey)}
                      </span>
                      {game.recommended && (
                        <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> CDTx
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 mt-1 rounded bg-tea-light px-2 py-0.5 text-[10px] font-extrabold text-tea border border-tea/30">
                      <Activity className="h-3 w-3" /> {game.domain}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-ink-secondary line-clamp-2 leading-relaxed">
                      {t(game.descKey)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-black/10 pt-2 text-[11px] font-bold text-ink-secondary">
                  <span>Level {startLevel(detail)} Adaptive</span>
                  <span className="rounded-lg bg-tea px-2.5 py-1 text-xs font-black text-white group-hover:bg-emerald-800 flex items-center gap-1">
                    <span>Start</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
