"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Coffee,
  User,
  Send,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Music,
  RotateCcw,
  MessageSquareText,
  X,
  Bot,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, getMediaUrl, type AiChatResponse } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

const MAX_INPUT_CHARS = 120;

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
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="grandchild-chat"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface MessageItem {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

export function GrandchildChatGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "grandchild-chat", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "chat" | "done">("intro");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [reminiscenceCount, setReminiscenceCount] = useState(0);
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string; note: string } | null>(null);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const persona = useMemo(() => {
    if (detail?.familyMembers && detail.familyMembers.length > 0) {
      const first = detail.familyMembers[0];
      return {
        name: `${first.name} (${first.relation || "Family"})`,
        relation: first.relation || "Grandchild",
      };
    }
    return { name: "Rohan (Loving Grandson)", relation: "Grandchild" };
  }, [detail]);

  const familyPhotos = useMemo(() => {
    return detail?.familyMembers?.filter((f) => f.photoUrl) ?? [];
  }, [detail]);

  const targetInteractions = 4;
  const score = reminiscenceCount * 25;

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const startTeatime = useCallback(async () => {
    playPress();
    setPhase("chat");
    setMessages([]);
    setTypedMessage("");
    setReminiscenceCount(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setIsAiThinking(true);

    try {
      const res: AiChatResponse = await api.aiChat({
        patientId,
        userMessage: "Hello my dear, let us have morning tea together.",
        personaName: persona.name,
      });

      const initialMsg: MessageItem = {
        id: "msg-0",
        sender: "ai",
        text: res.replyText || "Hello! I am so happy to sit with you today. Shall I pour some warm cardamom tea?",
        time: "Just now",
      };

      setMessages([initialMsg]);
      setQuickReplies(res.suggestedQuickReplies || ["Yes, sweet cardamom tea please!", "Tell me how your day was, dear!"]);
    } catch {
      const fallbackMsg: MessageItem = {
        id: "msg-0",
        sender: "ai",
        text: "Hello! It is so wonderful to sit together for warm tea. How are you feeling this beautiful morning?",
        time: "Just now",
      };
      setMessages([fallbackMsg]);
      setQuickReplies(["I feel wonderful, thank you!", "The morning breeze is so peaceful."]);
    } finally {
      setIsAiThinking(false);
      scrollToBottom();
    }
  }, [patientId, persona.name]);

  const sendResponse = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isAiThinking) return;

    playPress();
    stopSpeaking();
    setTaps((t) => t + 1);
    setTypedMessage("");

    const msgIndex = messages.length + 1;
    const userMsg: MessageItem = {
      id: `user-${msgIndex}`,
      sender: "user",
      text: trimmed,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    scrollToBottom();

    const nextCount = reminiscenceCount + 1;
    setReminiscenceCount(nextCount);

    // Trigger photo memory if available
    if (familyPhotos.length > 0) {
      const photoIdx = (nextCount - 1) % familyPhotos.length;
      const mem = familyPhotos[photoIdx];
      setActivePhoto({
        url: mem.photoUrl || "",
        title: mem.name,
        note: mem.notes || `${mem.relation} - Cherished Family Memory`,
      });
    }

    try {
      const history = messages.map((m) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        text: m.text,
      }));
      history.push({ role: "user", text: trimmed });

      const res: AiChatResponse = await api.aiChat({
        patientId,
        userMessage: trimmed,
        personaName: persona.name,
        conversationHistory: history,
      });

      const aiMsg: MessageItem = {
        id: `ai-${msgIndex + 1}`,
        sender: "ai",
        text: res.replyText || "That is so wonderful to hear! I love listening to your stories.",
        time: "Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setQuickReplies(res.suggestedQuickReplies || ["Tell me another memory!", "Let us drink our tea."]);
      playCorrect();
      speak(aiMsg.text, locale, rate);

      if (nextCount >= targetInteractions) {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "grandchild-chat",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 3500);
      }
    } catch {
      const fallbackAiMsg: MessageItem = {
        id: `ai-${msgIndex + 1}`,
        sender: "ai",
        text: "I love hearing that! Every moment we share together is so precious to me.",
        time: "Just now",
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      setQuickReplies(["Tell me another story!", "Yes, it is very peaceful."]);
      speak(fallbackAiMsg.text, locale, rate);
    } finally {
      setIsAiThinking(false);
      scrollToBottom();
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "grandchild-chat",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("grandchild-chat", locale);

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

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Dossier Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Clinical Reminiscence Protocol // Module CDTx-01
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Coffee className="h-10 w-10" />
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
                <User className="h-3.5 w-3.5" /> Assigned Dialogue Companion
              </span>
              <span className="text-[10px] font-bold uppercase rounded bg-tea/10 px-2 py-0.5 text-tea border border-tea">
                Local AI Persona
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#EFE9DF] text-ink shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-black text-ink">{persona.name}</p>
                <p className="text-xs font-semibold text-ink-secondary">
                  Ready with warm Assam cardamom tea
                </p>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startTeatime}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "chat" ? (
        <div className="flex flex-col gap-3.5 py-1">
          {/* DOSSIER HEADER STATUS BAR */}
          <div className="flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-tea" />
              <div className="flex items-center gap-1.5">
                <Coffee className="h-4 w-4 text-tea" />
                <span className="text-xs font-black text-ink">{persona.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playPress();
                  speak(
                    locale === "hi"
                      ? "गरमा-गरम इलायची चाय की एक घूंट लीजिए।"
                      : locale === "as"
                      ? "এঢোক গৰম ইলাচী চাহ খাওক।"
                      : "Taking a warm sip of cardamom tea together.",
                    locale,
                    rate
                  );
                }}
                className="btn-tactile flex items-center gap-1 rounded-lg border border-black bg-amber-100 hover:bg-amber-200 px-2 py-1 text-[11px] font-black text-amber-950 shadow-xs cursor-pointer"
                title="Sip warm tea"
              >
                <span>☕ Sip Tea</span>
              </button>

              <span className="text-[11px] font-bold text-ink-secondary">
                {reminiscenceCount} / {targetInteractions}
              </span>
            </div>
          </div>

          {/* CHAT STREAM CONTAINER */}
          <div
            ref={chatScrollRef}
            className="flex flex-col gap-3 h-[280px] sm:h-[300px] overflow-y-auto rounded-2xl border-3 border-black bg-[#FAF5EE] p-3.5 shadow-[4px_4px_0px_#000]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[88%] ${
                  m.sender === "ai" ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-black shadow-sm ${
                    m.sender === "ai" ? "bg-tea text-white" : "bg-ink text-white"
                  }`}
                >
                  {m.sender === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-2xl border-2 border-black p-3 text-xs sm:text-sm font-semibold leading-relaxed shadow-sm ${
                    m.sender === "ai"
                      ? "bg-white text-ink"
                      : "bg-tea text-white font-bold"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="self-start flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-2 shadow-sm">
                <Coffee className="h-4 w-4 text-tea animate-bounce" />
                <span className="text-xs font-bold text-ink-secondary">
                  {persona.name} is listening & responding...
                </span>
              </div>
            )}
          </div>

          {/* ACTIVE MEMORY PHOTO REVEAL */}
          {activePhoto && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-[#FFF9E6] p-2.5 shadow-[2px_2px_0px_#000]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(activePhoto.url) ?? ""}
                alt={activePhoto.title}
                className="h-12 w-12 rounded-lg border-2 border-black object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Memory Illuminated
                </span>
                <p className="text-xs font-black text-ink truncate">{activePhoto.title}</p>
                <p className="text-[11px] text-ink-secondary truncate">{activePhoto.note}</p>
              </div>
            </div>
          )}

          {/* FLEXIBLE DUAL-INPUT SECTION: TYPE OR SELECT */}
          <div className="rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] space-y-2.5">
            {/* Quick-Reply Options */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
                  <MessageSquareText className="h-3 w-3 text-tea" /> Quick Response Options
                </span>
                <span className="text-[10px] font-bold text-ink-secondary">Tap or Type</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((replyText, idx) => (
                  <button
                    key={`reply-${idx}`}
                    type="button"
                    disabled={isAiThinking}
                    onClick={() => sendResponse(replyText)}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FAF6F0] px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>&ldquo;{replyText}&rdquo;</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Typing Area */}
            <div className="border-t-2 border-black/15 pt-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-ink-secondary">
                  Type Custom Response
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    typedMessage.length >= MAX_INPUT_CHARS - 15
                      ? "text-red-600 font-black"
                      : "text-ink-secondary"
                  }`}
                >
                  {typedMessage.length}/{MAX_INPUT_CHARS} chars
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendResponse(typedMessage);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={MAX_INPUT_CHARS}
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={isAiThinking}
                    className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs sm:text-sm font-bold text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-tea"
                  />
                  {typedMessage.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTypedMessage("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!typedMessage.trim() || isAiThinking}
                  className="btn-tactile flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 active:translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
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
                  <CheckCircle2 className="h-4 w-4" /> Clinical Record Logged
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
                  Module Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startTeatime}>
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
    </GameShell>
  );
}
