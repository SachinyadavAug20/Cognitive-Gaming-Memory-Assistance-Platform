"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Music, CheckCircle2, RotateCcw } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { playCorrect, playIncorrect, playComplete, playPress, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-10">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

type Category = "kitchen" | "prayer";

interface SortItem {
  key: string;
  emoji: string;
  category: Category;
  labels: { en: string; hi: string; as: string };
}

const ITEMS: SortItem[] = [
  { key: "teacup", emoji: "🍵", category: "kitchen", labels: { en: "Assam CTC Tea", hi: "असम कड़क चाय", as: "অসমৰ ৰঙা চাহ" } },
  { key: "sugar", emoji: "🍯", category: "kitchen", labels: { en: "Wild Forest Honey", hi: "जंगली शहद", as: "বনৰীয়া মৌ" } },
  { key: "lemon", emoji: "🍋", category: "kitchen", labels: { en: "Fragrant Kaji Nemu", hi: "सुगंधित काजी नेमु", as: "সুগন্ধি কাজি নেমু" } },
  { key: "ginger", emoji: "🫚", category: "kitchen", labels: { en: "Fresh Wild Ginger", hi: "ताज़ा अदरक", as: "কেঁচা আদা" } },
  { key: "incense", emoji: "🪔", category: "prayer", labels: { en: "Brass Diya (Chaki)", hi: "पीतल का दीया", as: "পিতলৰ চাকি" } },
  { key: "bell", emoji: "🔔", category: "prayer", labels: { en: "Monastery Bell", hi: "प्रार्थना घंटी", as: "নামঘৰৰ কাঁহৰ ঘণ্টা" } },
  { key: "japi", emoji: "🧢", category: "prayer", labels: { en: "Bamboo Jaapi Hat", hi: "बांस की जापी", as: "বাঁহৰ ফুলাম জাপি" } },
  { key: "gamosa", emoji: "🧣", category: "prayer", labels: { en: "Sacred Muga Gamosa", hi: "पवित्र गमोसा", as: "মৰমৰ ফুলাম গামোচা" } },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function SortingGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const rate = speechRate(detail);

  const [queue] = useState<SortItem[]>(() => shuffle(ITEMS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false);
  const [placed, setPlaced] = useState<SortItem[]>([]);
  const [shakeCat, setShakeCat] = useState<Category | null>(null);
  const [done, setDone] = useState(false);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());

  const current = useMemo(() => queue[Math.min(index, queue.length - 1)], [queue, index]);

  const guard = useSessionGuard({
    patientId,
    gameId: "sorting",
    level: 1,
    startedAt,
    taps,
    errorCount,
  });

  useEffect(() => () => stopSpeaking(), []);

  const normLocale = locale === "hi" ? "hi" : locale === "as" ? "as" : "en";
  const str = getGameStrings("sorting", locale);

  function pickUp() {
    if (!current || done || picked) return;
    playPress();
    setPicked(true);
    const itemName = current.labels[normLocale];
    speak(
      `${normLocale === "hi" ? "यह है" : normLocale === "as" ? "এইটো হ'ল" : "This is"} ${itemName}. ${str.hudAction}`,
      locale,
      rate
    );
  }

  function placeIn(category: Category) {
    if (!current || done || !picked) return;
    setTaps((v) => v + 1);
    const itemName = current.labels[normLocale];
    if (category === current.category) {
      playCorrect();
      const items = [...placed, current];
      setPlaced(items);
      setPicked(false);
      speak(
        `${itemName} ${normLocale === "hi" ? "सही टोकरी में रखा गया!" : normLocale === "as" ? "সঠিক পাচিত ৰখা হ'ল!" : "placed correctly!"}`,
        locale,
        rate
      );
      if (index + 1 >= queue.length) {
        finish(items);
      } else {
        setIndex((i) => i + 1);
      }
    } else {
      playIncorrect();
      setErrorCount((v) => v + 1);
      setShakeCat(category);
      speak(
        `${itemName} ${normLocale === "hi" ? "दूसरी टोकरी में आता है। आराम से सोचें।" : normLocale === "as" ? "অন্য পাচিতহে থাকিব। মন দি চাওক।" : "belongs in the other basket. Take your time."}`,
        locale,
        rate
      );
      window.setTimeout(() => setShakeCat(null), 800);
    }
  }

  function finish(items: SortItem[]) {
    playComplete();
    setDone(true);
    guard.markCompleted();
    recordGameSession(patientId, {
      gameId: "sorting",
      level: 1,
      outcome: "completed",
      score: items.length,
      startedAt,
      taps,
      errorCount,
    });
    speak(str.celebrationSubtitle, locale, rate);
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const inBasket = (category: Category) => placed.filter((i) => i.category === category);

  return (
    <GameShell title={str.title} score={placed.length}>
      {done ? (
        <Celebration emoji="🧺" title={str.celebrationTitle}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {normLocale === "hi" ? "वर्गीकरण पूर्ण" : normLocale === "as" ? "শ্ৰেণীবিভাজন সম্পূৰ্ণ" : "Executive Categorization Complete"}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  {placed.length}/{queue.length} {str.hudProgress}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {str.celebrationTitle}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                {str.celebrationSubtitle}
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Folk Melody</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={() => window.location.reload()}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {str.playAgainButton}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-6 py-6">
          <AudioPrompt
            text={`${str.introSubtitle} ${str.hudAction}`}
            label={str.listenLabel}
            size="md"
          />

          {/* TWO TRADITIONAL BASKET TARGET TRAYS */}
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => placeIn("kitchen")}
              aria-label="Kitchen Tray"
              className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-amber-50 p-4 shadow-[4px_4px_0px_#000] transition-transform cursor-pointer hover:bg-amber-100 ${
                shakeCat === "kitchen" ? "animate-shake bg-rose-200" : ""
              } ${picked ? "ring-4 ring-amber-400 animate-pulse" : ""}`}
            >
              <span className="text-5xl">🍳</span>
              <span className="text-base sm:text-lg font-black text-amber-950">
                {normLocale === "hi" ? "रसोई घर (Kitchen)" : normLocale === "as" ? "ৰান্ধনি শাল (Kitchen)" : "Kitchen Pantry"}
              </span>
              <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1.5">
                {inBasket("kitchen").map((item) => (
                  <span key={item.key} className="text-2xl">
                    {item.emoji}
                  </span>
                ))}
              </span>
            </button>

            <button
              type="button"
              onClick={() => placeIn("prayer")}
              aria-label="Prayer Tray"
              className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-emerald-50 p-4 shadow-[4px_4px_0px_#000] transition-transform cursor-pointer hover:bg-emerald-100 ${
                shakeCat === "prayer" ? "animate-shake bg-rose-200" : ""
              } ${picked ? "ring-4 ring-emerald-400 animate-pulse" : ""}`}
            >
              <span className="text-5xl">🪔</span>
              <span className="text-base sm:text-lg font-black text-emerald-950">
                {normLocale === "hi" ? "पूजा घर (Prayer)" : normLocale === "as" ? "নামঘৰ / গোসাঁই ঘৰ (Prayer)" : "Prayer & Culture"}
              </span>
              <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1.5">
                {inBasket("prayer").map((item) => (
                  <span key={item.key} className="text-2xl">
                    {item.emoji}
                  </span>
                ))}
              </span>
            </button>
          </div>

          <p className="text-sm sm:text-base font-black text-ink">
            {picked
              ? (normLocale === "hi" ? `👉 "${current?.labels[normLocale]}" को सही टोकरी पर टैप करके रखें` : normLocale === "as" ? `👉 "${current?.labels[normLocale]}" ক উপযুক্ত পাচিত ৰাখক` : `👉 Place "${current?.labels[normLocale]}" into the correct basket above`)
              : (normLocale === "hi" ? "नीचे से कोई भी वस्तु चुनने के लिए टैप करें 👇" : normLocale === "as" ? "তলৰ পৰা বস্তু বাছি ল'বলৈ স্পৰ্শ কৰক 👇" : "Tap an item below to pick it up 👇")}
          </p>

          <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
            {queue.map((item, i) => {
              const isDone = i < index;
              const isCurrent = i === index && !done;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={isCurrent ? pickUp : undefined}
                  disabled={!isCurrent}
                  className={`btn-tactile flex max-w-[45%] sm:max-w-[22%] flex-col items-center gap-1.5 rounded-2xl border-3 p-3 transition-all cursor-pointer ${
                    isCurrent
                      ? picked
                        ? "scale-105 border-tea bg-tea-light shadow-[4px_4px_0px_#000] ring-4 ring-tea"
                        : "border-black bg-white shadow-[3px_3px_0px_#000] hover:bg-amber-50"
                      : isDone
                      ? "border-emerald-700 bg-emerald-100 opacity-80"
                      : "border-black/20 bg-surface-muted opacity-40"
                  }`}
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="text-xs font-black text-ink text-center leading-tight">
                    {item.labels[normLocale]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
}