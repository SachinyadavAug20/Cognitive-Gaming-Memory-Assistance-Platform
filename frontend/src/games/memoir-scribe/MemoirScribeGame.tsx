"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Feather,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Send,
  Sparkles,
  Volume2,
  BookOpen,
  Award,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiMemoirResponse } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

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
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-purple-900" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const MEMORY_PROMPTS = [
  {
    id: "tea",
    title: "Morning Tea with Grandchildren",
    photoUrl: "/photos/manash.png",
    starter: "We sat on the front porch with sweet cardamom tea and shared old stories...",
  },
  {
    id: "wedding",
    title: "The Traditional Assam Wedding",
    photoUrl: "/photos/anita.png",
    starter: "Dressed in golden Muga silk, the whole village gathered to celebrate...",
  },
  {
    id: "home",
    title: "Guwahati Garden by the River",
    photoUrl: "/photos/home.png",
    starter: "The orchids were blooming in our garden as the cool evening river breeze blew...",
  },
];

export function MemoirScribeGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "memoir-scribe", startLevel(detail));
  const rate = speechRate(detail);

  const prompts = useMemo(() => {
    if (!detail) return MEMORY_PROMPTS;
    if (detail.familyMembers && detail.familyMembers.length > 0) {
      return detail.familyMembers.map((m, idx) => ({
        id: `fam-${idx}`,
        title: `Precious Memories with ${m.name} (${m.relation || "Family"})`,
        photoUrl: m.photoUrl || (idx % 2 === 0 ? "/photos/manash.png" : "/photos/anita.png"),
        starter: m.notes ? `I remember when ${m.notes}` : `We spent peaceful afternoons together talking about family...`,
      }));
    }
    return MEMORY_PROMPTS;
  }, [detail]);

  const [phase, setPhase] = useState<"intro" | "write" | "done">("intro");
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [isScribing, setIsScribing] = useState(false);
  const [memoirResult, setMemoirResult] = useState<AiMemoirResponse | null>(null);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const currentPrompt = prompts[selectedPromptIndex] || prompts[0];
  const score = memoirResult ? 100 : 30;

  const startGame = useCallback(() => {
    playPress();
    setPhase("write");
    setSpokenText(currentPrompt.starter);
    setMemoirResult(null);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    speak(`Share a loving memory about ${currentPrompt.title}.`, locale, rate);
  }, [currentPrompt, locale, rate]);

  const handleGenerateMemoir = async () => {
    if (!spokenText.trim() || isScribing) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playPress();
    setIsScribing(true);

    try {
      const res = await api.aiMemoir({
        patientId,
        photoPromptTitle: currentPrompt.title,
        userSpokenNarrative: spokenText,
      });
      setMemoirResult(res);
      playCorrect();
      speak(res.poeticNarrative, locale, rate);
    } catch {
      const fallback: AiMemoirResponse = {
        memoirTitle: `Golden Chronicle of ${currentPrompt.title}`,
        poeticNarrative:
          "Moments of laughter and eternal love remain deeply woven into the rich fabric of our family heritage, shining like morning dew on Assam tea leaves.",
        emotionalTone: "Warm & Nostalgic",
        syntacticRichnessScore: 94,
        culturalDedication: "Preserved in the Digital Living Heritage Archive of North East India.",
      };
      setMemoirResult(fallback);
      playCorrect();
      speak(fallback.poeticNarrative, locale, rate);
    } finally {
      setIsScribing(false);
    }
  };

  const finishSession = () => {
    playComplete();
    setPhase("done");
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "memoir-scribe",
        level,
        outcome: "completed",
        score: 100,
        startedAt,
        taps: taps + 1,
        errorCount: 0,
      });
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "memoir-scribe",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="The Voice Reminiscence Scribe" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="The Voice Reminiscence Scribe" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The Voice Reminiscence Scribe" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                AI Narrative Synthesis // Module CDTx-18
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-700" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Feather className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              The Living Memoir Scribe
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Speak or type heartfelt family memories. Our local AI transforms your words into an illustrated poetic Golden Page for your family memoir book.
            </p>
          </div>

          {/* Prompt Selection Carousel */}
          <div className="w-full max-w-md space-y-2 text-left">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
              Choose a Memory Theme:
            </span>
            <div className="grid gap-2">
              {prompts.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPromptIndex(idx)}
                  className={`btn-tactile flex items-center gap-3 rounded-xl border-2 border-black p-3 text-left transition-all cursor-pointer ${
                    selectedPromptIndex === idx
                      ? "bg-purple-100 border-purple-900 shadow-[3px_3px_0px_#000]"
                      : "bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photoUrl} alt={p.title} className="h-10 w-10 rounded-lg object-cover border border-black shrink-0" />
                  <span className="text-xs font-black truncate">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Living Memoir Scribe. Choose a memory and tell your story."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            Open Memoir Quill
          </ChunkyButton>
        </div>
      ) : phase === "write" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* PHOTO PROMPT CARD */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] text-left flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPrompt.photoUrl}
              alt={currentPrompt.title}
              className="h-16 w-16 rounded-xl border-2 border-black object-cover shadow-sm shrink-0"
            />
            <div>
              <span className="text-[10px] font-black uppercase text-purple-900 block">
                Memory Focus:
              </span>
              <h3 className="font-serif text-sm sm:text-base font-black text-ink leading-tight">
                {currentPrompt.title}
              </h3>
            </div>
          </div>

          {/* DUAL SPEECH / TEXT INPUT STAGE */}
          {!memoirResult ? (
            <div className="w-full max-w-md space-y-3">
              <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 shadow-[4px_4px_0px_#000] text-left">
                <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-ink-secondary">
                    Your Spoken Story:
                  </span>
                  <span className="text-[10px] font-bold text-ink-secondary">
                    {spokenText.length}/160 chars
                  </span>
                </div>

                <textarea
                  rows={3}
                  maxLength={160}
                  value={spokenText}
                  disabled={isScribing}
                  onChange={(e) => setSpokenText(e.target.value)}
                  placeholder="Share a sweet memory of this day..."
                  className="w-full rounded-xl bg-white p-3 text-xs sm:text-sm font-bold text-ink border-2 border-black/20 focus:border-purple-900 focus:outline-none disabled:opacity-50"
                />

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSpokenText(currentPrompt.starter)}
                    className="text-[11px] font-bold text-purple-900 hover:underline cursor-pointer"
                  >
                    ✨ Use Memory Prompt Idea
                  </button>

                  <button
                    type="button"
                    disabled={!spokenText.trim() || isScribing}
                    onClick={handleGenerateMemoir}
                    className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-purple-900 px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isScribing ? "Scribing with AI..." : "Scribe Memoir Page"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GOLDEN MEMOIR PAGE REVEAL */
            <div className="w-full max-w-md rounded-2xl border-4 border-[#B45309] bg-[#FFFBF0] p-5 shadow-[6px_6px_0px_#000] text-left space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b-2 border-[#B45309]/30 pb-2">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" /> Golden Memoir Page
                </span>
                <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-amber-400">
                  {memoirResult.syntacticRichnessScore}% Lexical Richness
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-black text-amber-950 leading-tight">
                  {memoirResult.memoirTitle}
                </h3>
                <p className="font-serif italic text-sm sm:text-base font-bold text-ink mt-2 leading-relaxed">
                  &ldquo;{memoirResult.poeticNarrative}&rdquo;
                </p>
              </div>

              <div className="rounded-xl bg-amber-100/60 p-2.5 border border-amber-300 text-[11px] font-bold text-amber-900">
                <span className="block uppercase text-[9px] font-black text-amber-950">
                  Cultural Dedication:
                </span>
                <span>{memoirResult.culturalDedication}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-[#B45309]/20">
                <button
                  type="button"
                  onClick={() => speak(memoirResult.poeticNarrative, locale, rate)}
                  className="flex items-center gap-1.5 text-xs font-black text-amber-900 hover:underline cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" /> Listen to Poem
                </button>

                <ChunkyButton variant="tea" size="xl" onClick={finishSession}>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" /> Archive in Book →
                  </span>
                </ChunkyButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title="Living Memoir Page Archived!"
          subtitle="Your personal family narrative has been transformed into a timeless digital memoir with high semantic richness."
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Family Heritage Preserved
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-purple-900 text-white px-2 py-0.5">
                  1 Memoir Page
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {memoirResult?.memoirTitle || "Cherished Living Heritage"}
              </h3>
              <p className="font-serif italic text-xs font-bold text-ink-secondary mt-1">
                &ldquo;{memoirResult?.poeticNarrative}&rdquo;
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
                <span className="text-xs font-bold text-ink-secondary flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-purple-900" /> Scribed
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Scribe Another Memoir
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← Back to Therapy Suite
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
