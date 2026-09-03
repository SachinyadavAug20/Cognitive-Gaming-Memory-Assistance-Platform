"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { User, MessageCircle, Gamepad2 } from "lucide-react";
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
            className={`flex items-center justify-center p-4 rounded-full bg-white/80 border-2 border-tea ${waving ? "animate-bounce" : "animate-pulse"} cursor-pointer`}
            role="button"
            aria-label={t("companion.tapMe")}
            onClick={chat}
          >
            <User className="h-20 w-20 text-tea" />
          </div>
          <p className="text-base font-semibold text-ink">{t("companion.tapMe")}</p>
        </div>

        {message && (
          <div className="max-w-sm rounded-2xl border-2 border-border bg-surface px-5 py-3 text-lg font-semibold text-ink shadow-sm">
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ChunkyButton variant="marigold" size="xl" onClick={chat} icon={<MessageCircle className="h-5 w-5" />}>
            {t("companion.chat")}
          </ChunkyButton>
          <Link
            href="/patient/games"
            className="btn-chunky btn-chunky-outline inline-flex items-center gap-1.5"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>{t("companion.games")}</span>
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