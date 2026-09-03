"use client";

import { useCallback, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Search,
  User,
  Lightbulb,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Paperclip,
  Music,
  RotateCcw,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import {
  playPress,
  playCorrect,
  playComplete,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, getMediaUrl, type AiCluesResponse } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { FamilyMemberItem } from "@/types";
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
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export function MemoryDetectiveGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "memory-detective", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [clueLevel, setClueLevel] = useState<1 | 2 | 3>(1);
  const [cluesData, setCluesData] = useState<AiCluesResponse | null>(null);
  const [isLoadingClues, setIsLoadingClues] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; note: string } | null>(null);
  const [shakeCardId, setShakeCardId] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const targets: FamilyMemberItem[] = useMemo(() => {
    if (detail?.familyMembers && detail.familyMembers.length > 0) {
      return detail.familyMembers;
    }
    return [
      {
        id: 1,
        name: "Priyadarshini",
        relation: "Daughter",
        notes: "Loves singing Bihu songs and making cardamom tea.",
        photoUrl: null,
      },
      {
        id: 2,
        name: "Rohan",
        relation: "Grandson",
        notes: "Plays cricket and loves visiting Guwahati during holidays.",
        photoUrl: null,
      },
    ];
  }, [detail]);

  const currentTarget = targets[currentTargetIndex] || targets[0];
  const score = (currentTargetIndex + 1) * 50;

  const loadCluesForTarget = useCallback(async (target: FamilyMemberItem) => {
    setIsLoadingClues(true);
    setClueLevel(1);
    try {
      const res = await api.aiClues({
        patientId,
        targetType: "FAMILY",
        targetName: target.name,
        targetRelationOrSignificance: target.relation,
        targetNotes: target.notes || "",
      });
      setCluesData(res);
    } catch {
      const fallback: AiCluesResponse = {
        gentleClue1: `I am someone very special to you: your ${target.relation || "family member"}.`,
        specificClue2: `We have shared wonderful memories together: "${target.notes || "Family gatherings"}"`,
        directClue3: `It is ${target.name}! Can you spot my portrait below?`,
        encouragingEncouragement: "You found me! Wonderful memory!",
        candidateOptions: [target.name, "Old Classmate", "Village Neighbor"],
      };
      setCluesData(fallback);
    } finally {
      setIsLoadingClues(false);
    }
  }, [patientId]);

  const startDetective = useCallback(() => {
    playPress();
    setPhase("play");
    setCurrentTargetIndex(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setErrorCount(0);
    loadCluesForTarget(targets[0]);
  }, [targets, loadCluesForTarget]);

  const nextClue = () => {
    playPress();
    stopSpeaking();
    if (clueLevel === 1) {
      setClueLevel(2);
      if (cluesData) speak(cluesData.specificClue2, locale, rate);
    } else if (clueLevel === 2) {
      setClueLevel(3);
      if (cluesData) speak(cluesData.directClue3, locale, rate);
    }
  };

  const handleCardSelection = (candidate: FamilyMemberItem) => {
    setTaps((t) => t + 1);
    stopSpeaking();

    if (candidate.id === currentTarget.id || candidate.name === currentTarget.name) {
      playCorrect();
      setLightboxPhoto({
        url: candidate.photoUrl || "",
        title: candidate.name,
        note: candidate.notes || `${candidate.relation} — Memory Unlocked!`,
      });

      if (currentTargetIndex + 1 < targets.length) {
        setTimeout(() => {
          const nextIdx = currentTargetIndex + 1;
          setCurrentTargetIndex(nextIdx);
          loadCluesForTarget(targets[nextIdx]);
        }, 2200);
      } else {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "memory-detective",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount,
            });
          }
        }, 2200);
      }
    } else {
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setShakeCardId(String(candidate.id));
      setTimeout(() => setShakeCardId(null), 600);
      if (clueLevel < 3) {
        nextClue();
      }
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "memory-detective",
    level,
    startedAt,
    taps,
    errorCount,
  });

  const str = getGameStrings("memory-detective", locale);

  if (loading)
    return (
      <GameShell title={str.title} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const activeClueText =
    clueLevel === 1
      ? cluesData?.gentleClue1
      : clueLevel === 2
      ? cluesData?.specificClue2
      : cluesData?.directClue3;

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Spaced Retrieval // Module CDTx-15
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-marigold text-white shadow-[4px_4px_0px_#000]">
            <Search className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> Protocol Flow
              </span>
              <span className="text-[10px] font-bold uppercase rounded bg-marigold/20 px-2 py-0.5 text-amber-900 border border-marigold">
                3-Tier Hint Ladder
              </span>
            </div>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black bg-amber-100 text-[11px] font-black">
                  1
                </div>
                <span>Listen to the poetic association clue.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black bg-amber-200 text-[11px] font-black">
                  2
                </div>
                <span>Request a specific life memory if needed.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black bg-amber-300 text-[11px] font-black">
                  3
                </div>
                <span>Tap the portrait card to unlock the memory record.</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="marigold" size="xl" onClick={startDetective}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* HEADER STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-tea" />
              <span className="text-xs font-black text-ink">
                Subject {currentTargetIndex + 1} of {targets.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-ink-secondary">
                Clue Tier {clueLevel} / 3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <span
                    key={num}
                    className={`h-2 w-2 rounded-full border border-black ${
                      num <= clueLevel ? "bg-marigold" : "bg-surface-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* AI CLUE DOSSIER BOX */}
          <div className="relative w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-4.5 shadow-[4px_4px_0px_#000] text-left select-none">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-amber-800" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Case Clue Tier #{clueLevel}
                </span>
              </div>
              {isLoadingClues && (
                <span className="text-[10px] font-bold text-ink-secondary animate-pulse">
                  Querying local AI graph...
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-extrabold text-ink leading-relaxed">
              &ldquo;{activeClueText || "Retrieving personalized clue..."}&rdquo;
            </p>

            <div className="mt-3.5 flex items-center justify-between pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() => speak(activeClueText || "", locale, rate)}
                className="group flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea-light px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Hear Clue</span>
              </button>

              {clueLevel < 3 && (
                <button
                  type="button"
                  onClick={nextClue}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-marigold px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Next Hint (#{clueLevel + 1})</span>
                </button>
              )}
            </div>
          </div>

          {/* CANDIDATE PORTRAIT CARDS */}
          <div className="w-full max-w-md space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Select Matching Portrait:
            </span>
            <div className="grid gap-2.5">
              {targets.map((cand) => {
                const isShaking = shakeCardId === String(cand.id);
                return (
                  <div
                    key={cand.id}
                    className={`group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-3 text-left shadow-[3px_3px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform ${
                      isShaking ? "animate-shake border-red-500" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCardSelection(cand)}
                      className="flex-1 flex items-center gap-3 cursor-pointer text-left"
                    >
                      {cand.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(cand.photoUrl) ?? ""}
                          alt={cand.name}
                          className="h-12 w-12 rounded-xl border-2 border-black object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink shadow-sm">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-base font-black text-ink">{cand.name}</p>
                        <p className="text-xs font-bold text-ink-secondary">
                          {cand.relation || "Family Record"}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxPhoto({
                            url: cand.photoUrl ? (getMediaUrl(cand.photoUrl) ?? "") : "",
                            title: cand.name,
                            note: `${cand.relation || "Family Member"} — ${cand.notes || "Beloved member of the family heritage archive."}`,
                          });
                        }}
                        className="p-2 rounded-xl border border-black/30 bg-amber-50 hover:bg-amber-200 text-ink text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Inspect full memory photo"
                      >
                        <Search className="h-3.5 w-3.5 text-amber-900" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCardSelection(cand)}
                        className="btn-tactile p-2 rounded-xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] cursor-pointer"
                        title="Choose this person"
                      >
                        <ArrowRight className="h-4 w-4 font-black" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration title={str.celebrationTitle}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Facial Cued Recall Validated
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  Score: 100%
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {str.celebrationTitle}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1 leading-relaxed">
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
              <ChunkyButton variant="marigold" size="xl" onClick={startDetective}>
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
      )}

      {/* Memory Lightbox Modal on Recognition */}
      <MemoryLightbox
        open={lightboxPhoto !== null}
        onClose={() => setLightboxPhoto(null)}
        photoUrl={lightboxPhoto?.url}
        title={lightboxPhoto?.title ?? ""}
        text={lightboxPhoto?.note ?? null}
        langCode={locale}
        rate={rate}
        closeLabel="Close"
        listenLabel="Listen"
        speakingLabel="Listening..."
      />
    </GameShell>
  );
}
