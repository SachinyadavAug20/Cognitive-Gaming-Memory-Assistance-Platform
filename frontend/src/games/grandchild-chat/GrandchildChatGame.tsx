"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Coffee,
  User,
  Send,
  Paperclip,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  Heart,
  Image as ImageIcon,
} from "lucide-react";
import { ClayKulharIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playTapFeedback,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiChatResponse } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
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
  const [isListening, setIsListening] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const sendResponseRef = useRef<(text: string) => void>(() => {});

  const persona = useMemo(() => {
    if (detail?.familyMembers && detail.familyMembers.length > 0) {
      const first = detail.familyMembers[0];
      return {
        name: `${first.name} (${first.relation || "Family"})`,
        relation: first.relation || "Grandchild",
      };
    }
    return { name: "Manash Borah (Loving Grandson)", relation: "Grandchild" };
  }, [detail]);

  const familyPhotos = useMemo(() => {
    return detail?.familyMembers?.filter((f) => f.photoUrl) ?? [];
  }, [detail]);

  const targetInteractions = 4;
  const score = Math.min(100, reminiscenceCount * 25);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Get culturally authentic default messages
  const getDefaultContent = useCallback(() => {
    if (locale === "hi") {
      return {
        greeting: "नमस्ते दादाजी! मैंने आपके लिए अदरक और इलायची वाली गरमा-गरम चाय बनाई है। आइए, साथ बैठकर एक चुस्की लेते हैं! आज आपका मन कैसा है?",
        replies: [
          "चाय बहुत स्वादिष्ट बनी है, बेटा!",
          "आज की सुबह बहुत शांत और सुखद रही।",
          "गुवाहाटी में तुम्हारा काम कैसा चल रहा है?",
          "चलो भूपेन हज़ारिका जी का कोई गीत सुनते हैं।",
        ],
      };
    }
    if (locale === "as") {
      return {
        greeting: "নমস্কাৰ দেউতা! মই আপোনাৰ বাবে আদা আৰু ইলাচী দি গৰম ৰঙা চাহ বনাইছোঁ। আহক, একেলগে একাপ চাহ খাওঁ! আজি আপোনাৰ দিনটো কেনে লাগিছে?",
        replies: [
          "চাহ কাপ বৰ সোৱাদ হৈছে, বোপা!",
          "আজি ৰাতিপুৱাটো বৰ শান্ত আছিল।",
          "গুৱাহাটীত তোমাৰ খবৰ কোৱাচোন।",
          "আহক ড০ ভূপেন হাজৰিকাৰ গান শুনোঁ।",
        ],
      };
    }
    return {
      greeting: "Deuta, good afternoon! I brewed warm cardamom Assam tea for us. Look how fragrant it is! How are you feeling today?",
      replies: [
        "The tea smells wonderful, dear!",
        "I had a very peaceful morning today.",
        "Tell me how your day went in Guwahati.",
        "Let us put on some sweet folk music.",
      ],
    };
  }, [locale]);

  // Start Teatime with INSTANT Warm Opening (No waiting on blank void!)
  const startTeatime = useCallback(() => {
    playPress();
    setPhase("chat");
    setTypedMessage("");
    setReminiscenceCount(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setIsAiThinking(false);

    const { greeting, replies } = getDefaultContent();

    const initialMsg: MessageItem = {
      id: "msg-0",
      sender: "ai",
      text: greeting,
      time: "Just now",
    };

    setMessages([initialMsg]);
    setQuickReplies(replies);
    scrollToBottom();

    speak(greeting, locale, rate);
  }, [getDefaultContent, locale, rate]);

  // Voice Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = locale === "hi" ? "hi-IN" : locale === "as" ? "as-IN" : "en-IN";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            sendResponseRef.current(transcript);
          }
          setIsListening(false);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [locale]);

  const toggleMic = () => {
    playPress();
    if (!recognitionRef.current) {
      speak("Voice input is ready. You can also tap any of the quick reply buttons below.", locale, rate);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Send Response (Either via quick reply, voice, or text)
  const sendResponse = async (textToSend: string) => {
    sendResponseRef.current = sendResponse;
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
        text: res.replyText || (locale === "as" ? "আপোনাৰ লগত কথা পাতি বৰ ভাল লাগিল! চাহ কাপ খাই লওক দেউতা।" : "That is so wonderful to hear! I love sitting with you."),
        time: "Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setQuickReplies(res.suggestedQuickReplies || [
        "Tell me about our old village memories.",
        "Let us take another sip of tea.",
        "The weather is very pleasant today.",
      ]);
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
        }, 3200);
      }
    } catch {
      // Immediate loving local fallback so elder NEVER hangs
      const fallbackAiMsg: MessageItem = {
        id: `ai-${msgIndex + 1}`,
        sender: "ai",
        text: locale === "as"
          ? "মই সদায় আপোনাৰ কথাবোৰ শুনি বৰ আনন্দ পাওঁ! চাহৰ লগত বিস্কুটো খাওকচোন।"
          : locale === "hi"
          ? "आपकी बातें सुनकर मुझे बहुत अच्छा लगता है! आराम से चाय पीजिए, मैं आपके साथ हूँ।"
          : "I love listening to you! Every moment we share together is so precious. Take another sip of tea.",
        time: "Just now",
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      setQuickReplies([
        "Tell me more about your work!",
        "The tea is so comforting.",
        "You take care of yourself too, son.",
      ]);
      speak(fallbackAiMsg.text, locale, rate);
    } finally {
      setIsAiThinking(false);
      scrollToBottom();
    }
  };

  // Interactive Teatime Sip Action
  const handleSipTea = () => {
    playTapFeedback();
    const sipText = locale === "as"
      ? "*এঢোক গৰম চাহ খোৱা হ'ল* বৰ সোৱাদ ইলাচী চাহ!"
      : locale === "hi"
      ? "*चाय की एक घूंट ली* वाह, बहुत ही लाजवाब चाय बनी है!"
      : "*Sips warm tea* Ah, wonderful cardamom tea!";
    sendResponse(sipText);
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

          {/* Assigned Family Relative Card */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Assigned Teatime Companion
              </span>
              <span className="text-[10px] font-bold uppercase rounded bg-tea/10 px-2 py-0.5 text-tea border border-tea">
                Loving Grandchild
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-amber-950 shadow-sm">
                <User className="h-6 w-6 text-amber-900" />
              </div>
              <div>
                <p className="text-base font-black text-ink">{persona.name}</p>
                <p className="text-xs font-semibold text-ink-secondary">
                  Ready with warm Assam cardamom tea & sweet village memories
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
        <div className="flex flex-col gap-3 py-1">
          {/* TOP STATUS BAR: COMPANION & TEA SIP BUTTON */}
          <div className="flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-black bg-amber-100 text-sm">
                <User className="h-4 w-4 text-amber-900" />
              </div>
              <div>
                <span className="text-xs font-black text-ink block leading-tight">{persona.name}</span>
                <span className="text-[10px] font-bold text-tea block">Assam CTC Tea Session</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Interactive Sip Tea Button */}
              <button
                type="button"
                onClick={handleSipTea}
                className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 hover:bg-amber-300 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-0.5"
                title="Take a warm sip of tea together"
              >
                <span className="flex items-center gap-1.5">
                  <ClayKulharIcon className="h-3.5 w-3.5 text-amber-950" /> Sip Tea
                </span>
                <span className="bg-white/80 rounded px-1.5 py-0.2 text-[10px] font-black border border-black/30">
                  {reminiscenceCount} / {targetInteractions}
                </span>
              </button>
            </div>
          </div>

          {/* FAMILY PHOTO MEMORY POPUP IF AVAILABLE */}
          {activePhoto && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-black bg-amber-50 p-2.5 shadow-sm animate-in fade-in">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/20 bg-amber-100">
                <ImageIcon className="h-5 w-5 text-amber-800" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-ink">{activePhoto.title}</p>
                <p className="text-[11px] font-semibold text-ink-secondary">{activePhoto.note}</p>
              </div>
            </div>
          )}

          {/* CHAT STREAM CONTAINER */}
          <div
            ref={chatScrollRef}
            className="flex flex-col gap-3 h-[270px] sm:h-[290px] overflow-y-auto rounded-2xl border-3 border-black bg-[#FAF5EE] p-3.5 shadow-[4px_4px_0px_#000]"
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
                    m.sender === "ai" ? "bg-amber-100 text-amber-950 text-base" : "bg-tea text-white"
                  }`}
                >
                  {m.sender === "ai" ? <User className="h-4 w-4 text-amber-900" /> : <User className="h-4 w-4" />}
                </div>
                <div
                  className={`rounded-2xl border-2 border-black p-3 text-xs sm:text-sm font-semibold leading-relaxed shadow-sm ${
                    m.sender === "ai"
                      ? "bg-white text-ink"
                      : "bg-tea text-white font-bold"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.sender === "ai" && (
                    <button
                      type="button"
                      onClick={() => speak(m.text, locale, rate)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black text-tea hover:underline cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3" /> Replay Voice
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="self-start flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-2 shadow-sm animate-pulse">
                <Coffee className="h-4 w-4 text-tea animate-spin" />
                <span className="text-xs font-bold text-ink-secondary">
                  {persona.name} is pouring another warm cup...
                </span>
              </div>
            )}
          </div>

          {/* QUICK RESPONSE CHUNKY TOUCH OPTIONS (ELDERS NEVER HAVE TO TYPE!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-tea flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                Tap to Answer with Love:
              </span>
              <span className="text-[10px] font-bold text-ink-secondary">
                One-touch reply
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendResponse(reply)}
                  disabled={isAiThinking}
                  className="btn-tactile text-left rounded-xl border-2 border-black bg-white hover:bg-amber-100/70 p-2.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* VOICE INPUT OR TEXT INPUT FALLBACK */}
          <div className="flex items-center gap-2 pt-1">
            {/* Giant Push-to-Talk Microphone */}
            <button
              type="button"
              onClick={toggleMic}
              className={`btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-bounce ring-4 ring-rose-300"
                  : "bg-tea text-white hover:bg-emerald-800"
              }`}
              title="Tap to speak your message aloud"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isListening ? "Listening... Speak Now" : "Tap to Speak"}</span>
            </button>

            {/* Optional Text Field for Caregivers */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendResponse(typedMessage);
              }}
              className="flex-1 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Or type a custom reply..."
                disabled={isAiThinking}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink shadow-xs focus:outline-none focus:ring-2 focus:ring-tea disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim() || isAiThinking}
                className="btn-tactile rounded-xl border-2 border-black bg-surface p-2 text-ink shadow-xs hover:bg-surface-muted disabled:opacity-30 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={100}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center pt-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={startTeatime}
                className="btn-tactile rounded-xl border-2 border-black bg-tea px-5 py-2.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {str.playAgainButton}
              </button>
              <Link
                href="/patient/games"
                className="btn-tactile rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
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
