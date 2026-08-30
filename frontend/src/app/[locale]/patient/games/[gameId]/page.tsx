"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GAME_BY_ID } from "@/games/registry";

export default function GamePage() {
  const t = useTranslations("games");
  const params = useParams<{ gameId: string }>();
  const game = GAME_BY_ID[params.gameId];

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <div className="text-7xl">🚧</div>
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-extrabold text-ink">
          {t("notFound.title")}
        </h1>
        <p className="max-w-xs text-lg font-semibold text-ink-secondary">
          {t("notFound.desc")}
        </p>
        <Link
          href="/patient/games"
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
        >
          {t("backToHub")}
        </Link>
      </div>
    );
  }

  const Game = game.component;
  return <Game />;
}