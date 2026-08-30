"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { playPress, playEncourage } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate } from "@/games/config";

export function CompanionGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload } = usePatientDetail();

  const rate = speechRate(detail);
  const [message, setMessage] = useState("");
  const [waving, setWaving] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const prompts = useMemo<string[]>(() => {
    const fromJoy = (detail?.joyTriggers ?? "")
      .split(/[.,;，。;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const generic = (t.raw("companion.prompts") as string[]) ?? [];
    return fromJoy.length ? fromJoy : generic;
  }, [detail, t]);

  useEffect(() => {
    if (detail) {
      setMessage(t("companion.hello", { name: detail.name }));
      // playEncourage only fires if sounds are enabled and a gesture has occurred — safe
      playEncourage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  function chat() {
    playPress();
    setWaving(true);
    const pool = prompts.length ? prompts : [t("companion.hello", { name: detail?.name ?? "" })];
    const nextIndex = tapCount % pool.length;
    const line = pool[nextIndex];
    setMessage(line);
    setTapCount((c) => c + 1);
    speak(line, locale, rate);
    window.setTimeout(() => setWaving(false), 800);
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell>
      <div className="flex flex-col items-center gap-8 py-6">
        <div className="flex min-h-[220px] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-3xl border-2 border-tea bg-tea-light/40 p-6 text-center">
          <p className="text-lg font-bold text-ink-secondary">{t("companion.wave")}</p>
          <div
            className={`text-9xl ${waving ? "animate-bounce" : "animate-pulse"}`}
            role="button"
            aria-label={t("companion.tapMe")}
            onClick={chat}
          >
            🧓
          </div>
          <p className="text-base font-semibold text-ink">{t("companion.tapMe")}</p>
        </div>

        {message && (
          <div className="max-w-sm rounded-2xl border-2 border-border bg-surface px-5 py-3 text-lg font-semibold text-ink shadow-sm">
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ChunkyButton variant="marigold" size="xl" onClick={chat}>
            👋 {t("companion.chat")}
          </ChunkyButton>
          <Link
            href="/patient/games"
            className="btn-chunky btn-chunky-outline"
          >
            🎮 {t("companion.games")}
          </Link>
        </div>
      </div>
    </GameShell>
  );

  function GameShell({ children }: { children: React.ReactNode }) {
    return (
      <section className="pb-10">
        <GameHeader title={t("companion.title")} score={tapCount} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4">{children}</div>
      </section>
    );
  }
}