"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  ArrowLeftRight,
  Palette,
  Volume2,
} from "lucide-react";
import { MugaLoomShuttleIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { LoomScene3D } from "./LoomScene3D";
import { getGameStrings, SupportedLocale } from "@/lib/gameI18n";

interface LoomUiStrings {
  therapeuticTitle: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  silkReady: string;
  weftWarp: (w: number, target: number) => string;
  rowsSpoken: (w: number, target: number) => string;
  preservedBadge: string;
  patternRows: (target: number) => string;
  archivedTitle: string;
  archivedDesc: string;
  folkSong: string;
  assessmentComplete: string;
}

const LOOM_I18N: Record<SupportedLocale, LoomUiStrings> = {
  en: {
    therapeuticTitle: "Therapeutic Benefits:",
    benefit1: "Stimulates bi-manual motor rhythm & constructional sequencing",
    benefit2: "Procedural 3D cloth geometry growth in real time",
    benefit3: "Deep cultural reminiscence of North Eastern handloom traditions",
    silkReady: "Muga Silk Ready",
    weftWarp: (w, t) => `Weft Lines: ${w} / ${t} • Warp Lines: 42 Strands`,
    rowsSpoken: (w, t) => `${w} of ${t} rows woven. Wonderful rhythm!`,
    preservedBadge: "Silk Textile Preserved",
    patternRows: (t) => `${t} Pattern Rows`,
    archivedTitle: "Handloom Masterwork Archived",
    archivedDesc: "Your bi-manual coordination and rhythmic pacing were recorded with optimal motor symmetry.",
    folkSong: "Play Weavers' Folk Song",
    assessmentComplete: "Assessment Complete",
  },
  as: {
    therapeuticTitle: "চিকিৎসাজনিত উপকাৰিতা:",
    benefit1: "দুয়োহাতৰ ছন্দময় গতি আৰু সমন্বয় বৃদ্ধি কৰে",
    benefit2: "বাস্তৱ সময়ত ৩ডি তাঁতশালৰ কাপোৰ বোৱাৰ অনুভূতি",
    benefit3: "অসমৰ পৰম্পৰাগত তাঁতশালৰ সোণালী স্মৃতি জগাই তোলে",
    silkReady: "মুগা ৰেচম প্ৰস্তুত",
    weftWarp: (w, t) => `দীঘৰ শাৰী: ${w} / ${t} • বাণীৰ সূতা: ৪২ ডাল`,
    rowsSpoken: (w, t) => `${t} টা শাৰীৰ ভিতৰত ${w} টা বোৱা হ'ল। বৰ সুন্দৰ ছন্দ!`,
    preservedBadge: "ৰেচম কাপোৰ বোৱা সম্পন্ন",
    patternRows: (t) => `${t} টা ফুলৰ শাৰী`,
    archivedTitle: "তাঁতশালৰ অনবদ্য সৃষ্টি সংৰক্ষিত",
    archivedDesc: "আপোনাৰ দুয়োহাতৰ সুষম গতি আৰু ছন্দ অতি নিখুঁতভাৱে নথিভুক্ত হ'ল।",
    folkSong: "তাঁতীৰ লোকগীত শুনক",
    assessmentComplete: "ব্যায়াম সম্পন্ন",
  },
  hi: {
    therapeuticTitle: "चिकित्सीय लाभ:",
    benefit1: "दोनों हाथों का समन्वय और गतिशीलता बेहतर बनाता है",
    benefit2: "रियल-टाइम ३डी कपड़े की बुनाई का सुंदर अनुभव",
    benefit3: "हथकरघा परंपरा की सुखद स्मृतियों को ताजा करता है",
    silkReady: "मूंगा रेशम तैयार",
    weftWarp: (w, t) => `ताना पंक्तियां: ${w} / ${t} • बाना: ४२ धागे`,
    rowsSpoken: (w, t) => `${t} में से ${w} पंक्तियां बुनी गईं। बहुत सुंदर ताल!`,
    preservedBadge: "रेशमी वस्त्र तैयार",
    patternRows: (t) => `${t} सुंदर पंक्तियां`,
    archivedTitle: "हथकरघा कलाकृति सुरक्षित",
    archivedDesc: "आपके दोनों हाथों का तालमेल और एकाग्रता उत्कृष्ट रही।",
    folkSong: "बुनकरों का लोकगीत सुनें",
    assessmentComplete: "अभ्यास पूरा हुआ",
  },
  bn: {
    therapeuticTitle: "চিকিৎসাগত উপকারিতা:",
    benefit1: "উভয় হাতের ছন্দময় সমন্বয় ও গতি বৃদ্ধি করে",
    benefit2: "রিয়েল-টাইমে ৩ডি তাঁতে কাপড় বোনার মনোরম অনুভূতি",
    benefit3: "ঐতিহ্যবাহী তাঁতশিল্পের মধুর স্মৃতি জাগিয়ে তোলে",
    silkReady: "মুগা রেশম প্রস্তুত",
    weftWarp: (w, t) => `টানার সারি: ${w} / ${t} • বাণার সুতো: ৪২টি`,
    rowsSpoken: (w, t) => `${t}টির মধ্যে ${w}টি সারি বোনা সম্পন্ন। সুন্দর ছন্দ!`,
    preservedBadge: "রেশম বস্ত্র সংরক্ষিত",
    patternRows: (t) => `${t}টি নকশার সারি`,
    archivedTitle: "তাঁতের মাস্টারপিস সংরক্ষিত",
    archivedDesc: "আপনার হাতের চমৎকার সমন্বয় ও মনোযোগ সফলভাবে রেকর্ড হয়েছে।",
    folkSong: "তাঁতশিল্পীদের গান শুনুন",
    assessmentComplete: "মূল্যায়ন সম্পন্ন",
  },
  mr: {
    therapeuticTitle: "उपचारात्मक फायदे:",
    benefit1: "दोन्ही हातांचा समन्वय आणि लय वाढवते",
    benefit2: "रिअल-टाइम ३डी कापड विणण्याचा सुंदर अनुभव",
    benefit3: "पारंपरिक हातमाग परंपरेच्या आठवणी जागृत होतात",
    silkReady: "मुगा रेशीम तयार",
    weftWarp: (w, t) => `विणकाम ओळी: ${w} / ${t} • धागे: ४२`,
    rowsSpoken: (w, t) => `${t} पैकी ${w} ओळी विणल्या गेल्या. उत्तम लय!`,
    preservedBadge: "रेशमी वस्त्र तयार",
    patternRows: (t) => `${t} विणकाम ओळी`,
    archivedTitle: "हातमाग कलाकृती जतन केली",
    archivedDesc: "तुमचा दोन्ही हातांचा समतोल आणि लय अतिशय उत्कृष्ट नोंदवला गेला.",
    folkSong: "विणकरांचे पारंपरिक गीत ऐका",
    assessmentComplete: "मूल्यांकन पूर्ण",
  },
  ne: {
    therapeuticTitle: "उपचारात्मक फाइदाहरू:",
    benefit1: "दुवै हातको लय र समन्वय सुधार गर्छ",
    benefit2: "वास्तविक समयमा ३डी तान बुनाईको राम्रो अनुभव",
    benefit3: "परम्परागत हातबुना संस्कृतिको सम्झना गराउँछ",
    silkReady: "मुगा सिल्क तयार",
    weftWarp: (w, t) => `ताना पङ्क्ति: ${w} / ${t} • बाना: ४२ धागो`,
    rowsSpoken: (w, t) => `${t} मध्ये ${w} पङ्क्ति बुनियो। अति राम्रो लय!`,
    preservedBadge: "रेशमी कपडा तयार भयो",
    patternRows: (t) => `${t} बुनाई पङ्क्तिहरू`,
    archivedTitle: "हातबुना कलाकृति सुरक्षित गरियो",
    archivedDesc: "तपाईंको हातको सन्तुलन र एकाग्रता उत्कृष्ट रूपमा दर्ता भयो।",
    folkSong: "बुन्नेहरूको लोकगीत सुन्नुहोस्",
    assessmentComplete: "मूल्याङ्कन सम्पन्न",
  },
  mni: {
    therapeuticTitle: "লাইয়েংগী কান্নবশিং:",
    benefit1: "খুৎ অনিমক্কী চৎনবী অমসুং খোঙজেল ফগৎহল্লি",
    benefit2: "৩ডি খুৎশমলৈদা ফী শাবা উবা ফংই",
    benefit3: "লৈবাক্কী শাবা-য়োনবগী পুৱারী নীংশিংহল্লি",
    silkReady: "মুগা সিল্ক শেম-শারে",
    weftWarp: (w, t) => `শাংবা পরেং: ${w} / ${t} • পরেং: ৪২`,
    rowsSpoken: (w, t) => `পরেং ${t} গী মনুংদা ${w} শাবা লোইরে। য়াম্না ফজরে!`,
    preservedBadge: "ফী শাবা লোইশিনখ্রে",
    patternRows: (t) => `${t} পরেং`,
    archivedTitle: "খুৎশমলৈগী ফী থমখ্রে",
    archivedDesc: "নহাক্কী খুৎ অনিগী থবক য়াম্না চপ চানা চত্থরে।",
    folkSong: "ফী শাবগী ইশৈ তারসি",
    assessmentComplete: "লোইশিনখ্রে",
  },
  brx: {
    therapeuticTitle: "फाहामनायनि मुलाम्फा:",
    benefit1: "सानैबो आखायनि दावबायनायखौ मोजां खालामो",
    benefit2: "३डि सालियाव सि दानायनि मोजां महर",
    benefit3: "हारिमु सि दानायनि गोसोखांनायखौ गोसोखांफिनहोयो",
    silkReady: "मुगा सिल्क थियारि",
    weftWarp: (w, t) => `दानाय सारि: ${w} / ${t} • खुन्दुं: ४२`,
    rowsSpoken: (w, t) => `सारि ${t} नि गेजेराव ${w} दानाय जाबाय। साबसिं दामनाय!`,
    preservedBadge: "सिल्क सि दानाय जाबाय",
    patternRows: (t) => `${t} सि दानायनि सारि`,
    archivedTitle: "सालियाव दानायखौ दोनथुमबाय",
    archivedDesc: "नोंथांनि आखायनि दावबायनाय आरो गोसो होनाया मोजां जादों।",
    folkSong: "सि दाग्राफोरनि मेथाय खोनासोन",
    assessmentComplete: "जोबबाय",
  },
  grt: {
    therapeuticTitle: "Nama·atna namgipa:",
    benefit1: "Jakkolchini sulsul dakani bilko bariatani",
    benefit2: "3D bara dokani rongo nina nambegipa",
    benefit3: "Dak·bewal bara dokaniko gisik ra·atani",
    silkReady: "Muga Silk Tariaha",
    weftWarp: (w, t) => `Bara dokani riting: ${w} / ${t} • Karing: 42`,
    rowsSpoken: (w, t) => `${t}oni ${w} ritingko dokaha. Nambegipa sur!`,
    preservedBadge: "Silk Barako Dokaha",
    patternRows: (t) => `${t} Ritingrang`,
    archivedTitle: "Bara Dokaniko Donaha",
    archivedDesc: "Nang·ni jakkalgipa kam aro somoy nambee matchotaha.",
    folkSong: "Bara dokgipani ring·aniko knabo",
    assessmentComplete: "Matchotaha",
  },
  kha: {
    therapeuticTitle: "Ki jingmyntoi ba pynbait:",
    benefit1: "Pynkhlain ia ka jingthaw kti baroh arliang",
    benefit2: "Ka jingiohi 3D ba shna ia ka jaiñ ha ka por ba shisha",
    benefit3: "Kynmaw burom ia ka rukom thain jaiñ tynrai",
    silkReady: "U Khasi/Muga Silk La Biang",
    weftWarp: (w, t) => `Ki lain thain: ${w} / ${t} • Ki ksai: 42`,
    rowsSpoken: (w, t) => `${w} na ki ${t} ki lain la dep thain. Ka jingiaid ba bang!`,
    preservedBadge: "Ka Jaiñ Silk La Dep Pynneh",
    patternRows: (t) => `${t} Ki Lain Dur`,
    archivedTitle: "Ka Kam Kti La Buh Bha",
    archivedDesc: "Ka jingiatreilang ki kti jong phi bad ka jingiaid ryntih la thoh bha.",
    folkSong: "Sngap jingrwai nongthain-jaiñ",
    assessmentComplete: "La Dep Thik",
  },
  lus: {
    therapeuticTitle: "Taksa tana hlawkna:",
    benefit1: "Kut pahnih zai rual leh tihchet dan thluak puihtu",
    benefit2: "3D hmanga puan tah dan hmuh theih",
    benefit3: "Hmanlai puan tah dan ropui hriatnawn lehna",
    silkReady: "Muga La Inpeih e",
    weftWarp: (w, t) => `Puan tah tlar: ${w} / ${t} • Hrui zai: 42`,
    rowsSpoken: (w, t) => `Tlar ${t} zinga ${w} tah a ni ta. Zai rual tui tak a ni!`,
    preservedBadge: "Silk Puan Tah Zawh A Ni",
    patternRows: (t) => `${t} Tah Tlar`,
    archivedTitle: "Puan Tah Hna Dahthat A Ni",
    archivedDesc: "I kut pahnih thawhdun dan leh chezia a tha hle mai.",
    folkSong: "Puan tah hla ngaihthlakna",
    assessmentComplete: "Zawhfel A Ni",
  },
};

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
    <section className="pb-12 min-h-screen bg-canvas">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-amber-800"
        gameId="loom"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const THREAD_COLORS = [
  { id: "red", name: "Crimson Red", hex: "#DC2626" },
  { id: "gold", name: "Muga Gold", hex: "#D97706" },
  { id: "emerald", name: "Assam Emerald", hex: "#059669" },
];

export function LoomGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const loomUi = LOOM_I18N[normLocale] || LOOM_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "loom", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "weave" | "done">("intro");
  const [rowsWoven, setRowsWoven] = useState(0);
  const [shuttleSide, setShuttleSide] = useState<-1 | 1>(-1); // -1 = Left, 1 = Right
  const [selectedColor, setSelectedColor] = useState(THREAD_COLORS[0]);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TARGET_ROWS = 8;
  const score = Math.round((rowsWoven / TARGET_ROWS) * 100);

  const startGame = useCallback(() => {
    playPress();
    setPhase("weave");
    setRowsWoven(0);
    setShuttleSide(-1);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const handleShuttlePass = () => {
    if (rowsWoven >= TARGET_ROWS) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playTapFeedback();

    const nextSide = shuttleSide === -1 ? 1 : -1;
    setShuttleSide(nextSide);

    const nextRows = rowsWoven + 1;
    setRowsWoven(nextRows);

    if (nextRows === TARGET_ROWS) {
      setTimeout(() => {
        playComplete();
        setPhase("done");
        if (startedAt) {
          recordGameSession(patientId, {
            gameId: "loom",
            level,
            outcome: "completed",
            score: 100,
            startedAt,
            taps: taps + 1,
            errorCount: 0,
          });
        }
      }, 1000);
    } else {
      if (nextRows % 2 === 0) {
        playCorrect();
        speak(loomUi.rowsSpoken(nextRows, TARGET_ROWS), locale, rate);
      }
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "loom",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("loom", locale);

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
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Module Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block mb-2">
              {loomUi.therapeuticTitle}
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-800" />
                <span>{loomUi.benefit1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>{loomUi.benefit2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-800" />
                <span>{loomUi.benefit3}</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "weave" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* WEAVING STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <ArrowLeftRight className="h-4 w-4" /> {str.hudProgress}: {rowsWoven} / {TARGET_ROWS}
            </span>
            <div className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-ink-secondary" />
              {THREAD_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-transform ${
                    selectedColor.id === c.id ? "scale-125 border-black ring-2 ring-amber-400" : "border-white/80 opacity-70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* THREE.JS 3D LOOM CANVAS */}
          <div className="relative w-full max-w-md aspect-4/3 rounded-2xl border-3 border-black overflow-hidden shadow-[5px_5px_0px_#000] bg-black select-none">
            <LoomScene3D
              shuttlePosition={shuttleSide}
              threadColor={selectedColor.hex}
              progressRows={rowsWoven}
              onShuttlePass={handleShuttlePass}
            />

            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <MugaLoomShuttleIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>{loomUi.weftWarp(rowsWoven, TARGET_ROWS)}</span>
            </div>
          </div>

          {/* INTERACTIVE CONTROLS */}
          <div className="w-full max-w-md flex flex-col items-center gap-3 pt-1">
            <div className="w-full flex items-center justify-between px-1 text-xs font-black text-ink">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-3 w-3 rounded-full bg-tea" /> {loomUi.silkReady}
              </span>
              <button
                type="button"
                onClick={() => speak(str.audioPrompt || "Slide the wooden shuttle from one side to the other to pass the weft thread.", locale, rate)}
                className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" /> {str.listenLabel || "Read for Me"}
              </button>
            </div>

            <ChunkyButton variant="marigold" size="2xl" onClick={handleShuttlePass}>
              <span className="flex items-center gap-3 text-base sm:text-lg font-black tracking-wide">
                <ArrowLeftRight className="h-6 w-6" />
                <span>
                  {shuttleSide === -1 ? `${str.hudAction} ➔` : `⬅ ${str.hudAction}`}
                </span>
              </span>
            </ChunkyButton>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {loomUi.preservedBadge}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-800 text-white px-2 py-0.5">
                  {loomUi.patternRows(TARGET_ROWS)}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {loomUi.archivedTitle}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                {loomUi.archivedDesc}
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">{loomUi.folkSong}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  {loomUi.assessmentComplete}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
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
