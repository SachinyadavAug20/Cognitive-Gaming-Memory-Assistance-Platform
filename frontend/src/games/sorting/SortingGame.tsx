"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Music,
  CheckCircle2,
  RotateCcw,
  ShoppingBag,
  Utensils,
  Citrus,
  Leaf,
  Bell,
  Package,
  Droplets,
} from "lucide-react";
import {
  ClayKulharIcon,
  DiyaLampIcon,
  BambooShootIcon,
  MugaLoomShuttleIcon,
} from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { playCorrect, playComplete, playPress, playLifeSong, playWaterRipple } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { resolveAdaptiveLevel } from "@/lib/telemetry";
import { getGameStrings, type SupportedLocale } from "@/lib/gameI18n";
import { calculateVanishingCue } from "@/lib/errorlessLearning";

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
        gameId="sorting"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

type Category = "kitchen" | "prayer";

interface SortItem {
  key: string;
  category: Category;
  labels: Record<SupportedLocale, string>;
}

function renderSortItemIcon(key: string, className = "h-8 w-8") {
  switch (key) {
    case "teacup":
      return <ClayKulharIcon className={`${className} text-amber-800`} />;
    case "sugar":
      return <Droplets className={`${className} text-amber-600`} />;
    case "lemon":
      return <Citrus className={`${className} text-yellow-600`} />;
    case "ginger":
      return <Leaf className={`${className} text-amber-700`} />;
    case "incense":
      return <DiyaLampIcon className={`${className} text-amber-500`} />;
    case "bell":
      return <Bell className={`${className} text-amber-700`} />;
    case "japi":
      return <BambooShootIcon className={`${className} text-emerald-700`} />;
    case "gamosa":
      return <MugaLoomShuttleIcon className={`${className} text-red-700`} />;
    default:
      return <Package className={`${className} text-stone-700`} />;
  }
}

const ITEMS: SortItem[] = [
  {
    key: "teacup",
    category: "kitchen",
    labels: {
      en: "Assam CTC Tea",
      hi: "असम कड़क चाय",
      as: "অসমৰ ৰঙা চাহ",
      bn: "আসাম কড়া চা",
      mr: "आसाम कडक चहा",
      ne: "आसाम कडा चिया",
      mni: "অসাম কড়ক চা",
      brx: "आसामनि साहा",
      grt: "Assam Cha Ding'gipa",
      kha: "Sha Kshaid Assam",
      lus: "Assam Thingpui Hang",
    },
  },
  {
    key: "sugar",
    category: "kitchen",
    labels: {
      en: "Wild Forest Honey",
      hi: "जंगली शहद",
      as: "বনৰীয়া মৌ",
      bn: "বুনো মধু",
      mr: "जंगली मध",
      ne: "जंगली मह",
      mni: "উমংগী খোইহি",
      brx: "हाग्रामा मोव",
      grt: "Buringni Bija",
      kha: "Ngap Khlaw",
      lus: "Ram Khawivah",
    },
  },
  {
    key: "lemon",
    category: "kitchen",
    labels: {
      en: "Fragrant Kaji Nemu",
      hi: "सुगंधित काजी नेमु",
      as: "সুগন্ধি কাজি নেমু",
      bn: "সুগন্ধি কাজী লেবু",
      mr: "सुवासिक काझी लिंबू",
      ne: "सुगन्धित काजी कागती",
      mni: "হৈনু কাজি চম্প্রা",
      brx: "गोथाव काजि नेमू",
      grt: "Simil Kaji Thembil",
      kha: "Soh Kaji Nemu",
      lus: "Serthlum Kaji Thei",
    },
  },
  {
    key: "ginger",
    category: "kitchen",
    labels: {
      en: "Fresh Wild Ginger",
      hi: "ताज़ा अदरक",
      as: "কেঁচা আদা",
      bn: "টাটকা আদা",
      mr: "ताजे आले",
      ne: "ताजा अदुवा",
      mni: "নিংথৌশিং শিং",
      brx: "गोदान हासिं",
      grt: "Gital E'ching",
      kha: "Sying Khlaw",
      lus: "Sawhthing Hring",
    },
  },
  {
    key: "incense",
    category: "prayer",
    labels: {
      en: "Brass Diya (Chaki)",
      hi: "पीतल का दीया",
      as: "পিতলৰ চাকি",
      bn: "পিতলের প্রদীপ",
      mr: "पितळी दिवा",
      ne: "पित्तलको दियो",
      mni: "পিতলগী চাকি",
      brx: "पितलनि बाथि",
      grt: "Rang'ni Diya",
      kha: "Diat Pityr",
      lus: "Darte Khawnvar",
    },
  },
  {
    key: "bell",
    category: "prayer",
    labels: {
      en: "Monastery Bell",
      hi: "प्रार्थना घंटी",
      as: "নামঘৰৰ কাঁহৰ ঘণ্টা",
      bn: "নামঘরের ঘণ্টা",
      mr: "प्रार्थना घंटा",
      ne: "प्रार्थना घण्टी",
      mni: "লাইশঙ ঘণ্টা",
      brx: "मन्दिरनि घन्टा",
      grt: "Gilja Kinta",
      kha: "Klok Iingmane",
      lus: "Biakin Dar",
    },
  },
  {
    key: "japi",
    category: "prayer",
    labels: {
      en: "Bamboo Jaapi Hat",
      hi: "बांस की जापी",
      as: "বাঁহৰ ফুলাম জাপি",
      bn: "বাঁশের ফুলাম জাপি",
      mr: "बांबूची जापी टोपी",
      ne: "बाँसको जापी टोपी",
      mni: "ৱাগী জাপি খুপ",
      brx: "ओवानि जापि खफ",
      grt: "Wa'ani Jaapi Tupi",
      kha: "Tupia Jaapi Shken",
      lus: "Mau Lukhum Jaapi",
    },
  },
  {
    key: "gamosa",
    category: "prayer",
    labels: {
      en: "Sacred Muga Gamosa",
      hi: "पवित्र गमोसा",
      as: "মৰমৰ ফুলাম গামোচা",
      bn: "পবিত্র মুগা গামোছা",
      mr: "पवित्र मुगा गमोसा",
      ne: "पवित्र मुगा गमोसा",
      mni: "শেংলবা মুগা গামোসা",
      brx: "पवित्र मुगा गामोसा",
      grt: "Rongtalgipa Gamosa",
      kha: "Gamosa Kyntang",
      lus: "Gamosa Thianghlim",
    },
  },
];

interface SortingI18nEntry {
  kitchenTitle: string;
  prayerTitle: string;
  thisIs: (item: string) => string;
  placedCorrectly: (item: string) => string;
  belongsInHighlight: (item: string) => string;
  promptPicked: (item: string) => string;
  promptUnpicked: string;
  categorizationComplete: string;
  playFolkMelody: string;
  assessmentComplete: string;
}

const SORTING_I18N: Record<SupportedLocale, SortingI18nEntry> = {
  as: {
    kitchenTitle: "ৰান্ধনি শাল (Kitchen)",
    prayerTitle: "নামঘৰ / গোসাঁই ঘৰ (Prayer)",
    thisIs: (item) => `এইটো হ'ল ${item}।`,
    placedCorrectly: (item) => `${item} সঠিক পাচিত ৰখা হ'ল!`,
    belongsInHighlight: (item) => `${item} পোহৰ হৈ থকা পাচিতহে থাকিব। মন দি চাওক।`,
    promptPicked: (item) => `"${item}" ক উপযুক্ত পাচিত ৰাখক`,
    promptUnpicked: "তলৰ পৰা বস্তু বাছি ল'বলৈ স্পৰ্শ কৰক",
    categorizationComplete: "শ্ৰেণীবিভাজন সম্পূৰ্ণ",
    playFolkMelody: "লোকগীতৰ সুৰ শুনক",
    assessmentComplete: "মূল্যায়ন সম্পূৰ্ণ",
  },
  hi: {
    kitchenTitle: "रसोई घर (Kitchen)",
    prayerTitle: "पूजा घर (Prayer)",
    thisIs: (item) => `यह है ${item}।`,
    placedCorrectly: (item) => `${item} सही टोकरी में रखा गया!`,
    belongsInHighlight: (item) => `${item} चमकती हुई टोकरी में आता है। आराम से देखें।`,
    promptPicked: (item) => `"${item}" को ऊपर सही टोकरी में रखें`,
    promptUnpicked: "नीचे से कोई भी वस्तु चुनने के लिए टैप करें",
    categorizationComplete: "वर्गीकरण पूर्ण",
    playFolkMelody: "लोक धुन सुनें",
    assessmentComplete: "मूल्यांकन पूर्ण",
  },
  en: {
    kitchenTitle: "Kitchen Pantry",
    prayerTitle: "Prayer & Culture",
    thisIs: (item) => `This is ${item}.`,
    placedCorrectly: (item) => `${item} placed correctly!`,
    belongsInHighlight: (item) => `${item} belongs in the highlighted basket. Notice the golden beacon.`,
    promptPicked: (item) => `Place "${item}" into the correct basket above`,
    promptUnpicked: "Tap an item below to pick it up",
    categorizationComplete: "Executive Categorization Complete",
    playFolkMelody: "Play Folk Melody",
    assessmentComplete: "Assessment Complete",
  },
  bn: {
    kitchenTitle: "রান্নাঘর (Kitchen)",
    prayerTitle: "পূজোর ঘর (Prayer)",
    thisIs: (item) => `এটি হল ${item}।`,
    placedCorrectly: (item) => `${item} সঠিক ঝুড়িতে রাখা হয়েছে!`,
    belongsInHighlight: (item) => `${item} আলোকিত ঝুড়িতে যাবে। ভালো করে লক্ষ্য করুন।`,
    promptPicked: (item) => `"${item}" উপরে সঠিক ঝুড়িতে রাখুন`,
    promptUnpicked: "নিচের যে কোনো জিনিসে স্পর্শ করে তুলে নিন",
    categorizationComplete: "শ্রেণিবিভাগ সম্পন্ন",
    playFolkMelody: "লোক সুর শুনুন",
    assessmentComplete: "মূল্যায়ন সম্পন্ন",
  },
  mr: {
    kitchenTitle: "स्वयंपाकघर (Kitchen)",
    prayerTitle: "पूजा घर (Prayer)",
    thisIs: (item) => `हे आहे ${item}.`,
    placedCorrectly: (item) => `${item} योग्य टोपलीत ठेवले गेले!`,
    belongsInHighlight: (item) => `${item} चमकणाऱ्या टोपलीत ठेवायचे आहे. लक्षपूर्वक पहा.`,
    promptPicked: (item) => `"${item}" वरील योग्य टोपलीत ठेवा`,
    promptUnpicked: "खालील कोणतीही वस्तू उचलण्यासाठी टॅप करा",
    categorizationComplete: "वर्गीकरण पूर्ण",
    playFolkMelody: "लोकसंगीत ऐका",
    assessmentComplete: "मूल्यांकन पूर्ण",
  },
  ne: {
    kitchenTitle: "भान्सा कोठा (Kitchen)",
    prayerTitle: "पूजा कोठा (Prayer)",
    thisIs: (item) => `यो हो ${item}।`,
    placedCorrectly: (item) => `${item} सही टोकरीमा राखियो!`,
    belongsInHighlight: (item) => `${item} चम्किएको टोकरीमा पर्दछ। ध्यान दिएर हेर्नुहोस्।` ,
    promptPicked: (item) => `"${item}" लाई माथिको सही टोकरीमा राख्नुहोस्`,
    promptUnpicked: "तलबाट कुनै पनि वस्तु रोज्न ट्याप गर्नुहोस्",
    categorizationComplete: "वर्गीकरण सम्पन्न",
    playFolkMelody: "लोक धुन सुन्नुहोस्",
    assessmentComplete: "मूल्यांकन पूरा भयो",
  },
  mni: {
    kitchenTitle: "চাকশঙ (Kitchen)",
    prayerTitle: "লাইনিং শঙ (Prayer)",
    thisIs: (item) => `মসিদি ${item} নি।`,
    placedCorrectly: (item) => `${item} চুম্বা লাইথাংদা থমখ্রে!`,
    belongsInHighlight: (item) => `${item} মঙাল খাইরিবা থাংদা থমগদবনি। য়েংবীয়ু।`,
    promptPicked: (item) => `"${item}" অসি মথক্কী চুম্বা লাইথাংদা থম্বীয়ু`,
    promptUnpicked: "মখাগী পোৎ অমা লৌনবা নম্বীয়ু",
    categorizationComplete: "পোৎ খাঙদোকপা লোইরে",
    playFolkMelody: "মীয়ামগী ঈশৈ তাবীয়ু",
    assessmentComplete: "মরী লোইরে",
  },
  brx: {
    kitchenTitle: "संख्रि नो (Kitchen)",
    prayerTitle: "पुजा नो (Prayer)",
    thisIs: (item) => `बेयो जाबाय ${item}।`,
    placedCorrectly: (item) => `${item} गेबें थुरियाव दोनबाय!`,
    belongsInHighlight: (item) => `${item} सोरां जानाय थुरियाव थानांगौ। गोसो होना नाय।`,
    promptPicked: (item) => `"${item}" खौ सायाव थानाय गेबें थुरियाव दोन`,
    promptUnpicked: "गाहायनि बेसादफोरखौ लानो थु",
    categorizationComplete: "राननाय जोबबाय",
    playFolkMelody: "हारिमुनि सोदोब दाम",
    assessmentComplete: "आनजाद जोबबाय",
  },
  grt: {
    kitchenTitle: "Song'chakani (Kitchen)",
    prayerTitle: "Bi'ani Nok (Prayer)",
    thisIs: (item) => `Ia ong'a ${item}.`,
    placedCorrectly: (item) => `${item} kakket kok-o donaha!`,
    belongsInHighlight: (item) => `${item} teng'sokgipa kok-o donga. Nibo.`,
    promptPicked: (item) => `"${item}" ko kosakni kakket kok-o donbo`,
    promptUnpicked: "Ka'mao bastuko ra'na jotbo",
    categorizationComplete: "Dingtang Dingtang Donani Matchotaha",
    playFolkMelody: "Songni Gitko Knabo",
    assessmentComplete: "Parikani Matchotaha",
  },
  kha: {
    kitchenTitle: "Iing Shetsla (Kitchen)",
    prayerTitle: "Iing Mane (Prayer)",
    thisIs: (item) => `Kane ka dei ${item}.`,
    placedCorrectly: (item) => `La buh beit ia ka ${item} ha ka shang kaba dei!`,
    belongsInHighlight: (item) => `${item} ka hap ha ka shang kaba tyngshaiñ. Peit bha.`,
    promptPicked: (item) => `Buh ia ka "${item}" ha ka shang kaba dei haneng`,
    promptUnpicked: "Shon ban shim ia ki tiar harum",
    categorizationComplete: "Jingpynbynta la dep",
    playFolkMelody: "Put Sur Tynrai",
    assessmentComplete: "Jingthew la dep",
  },
  lus: {
    kitchenTitle: "Choka (Kitchen)",
    prayerTitle: "Biak In (Prayer)",
    thisIs: (item) => `Hei hi ${item} a ni.`,
    placedCorrectly: (item) => `${item} bawm dik takah dah a ni ta!`,
    belongsInHighlight: (item) => `${item} hi bawm eng zawkah khian a awm tur a ni. En rawh.`,
    promptPicked: (item) => `"${item}" hi a chung a bawm dik zawkah dah rawh`,
    promptUnpicked: "A hnuai a thil la turin hmet rawh",
    categorizationComplete: "Thliarhranna Zawh a Ni Ta",
    playFolkMelody: "Hnam Hla Ngaithla Rawh",
    assessmentComplete: "Endikna Zawh a Ni Ta",
  },
};

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

  const level = resolveAdaptiveLevel(patientId, "sorting", startLevel(detail));
  const rate = speechRate(detail);

  const [queue, setQueue] = useState<SortItem[]>(() => shuffle(ITEMS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false);
  const [placed, setPlaced] = useState<SortItem[]>([]);
  const [shakeCat, setShakeCat] = useState<Category | null>(null);
  const [done, setDone] = useState(false);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  // Track hesitation for errorless vanishing cues
  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setHesitationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [done, index, picked]);

  const scaffold = calculateVanishingCue(hesitationSeconds, attemptCount);

  function resetGame() {
    setQueue(shuffle(ITEMS));
    setIndex(0);
    setPicked(false);
    setPlaced([]);
    setShakeCat(null);
    setDone(false);
    setTaps(0);
    setErrorCount(0);
    setHesitationSeconds(0);
    setAttemptCount(0);
    setStartedAt(new Date().toISOString());
  }

  const current = useMemo(() => queue[Math.min(index, queue.length - 1)], [queue, index]);

  const guard = useSessionGuard({
    patientId,
    gameId: "sorting",
    level,
    startedAt,
    taps,
    errorCount,
  });

  useEffect(() => () => stopSpeaking(), []);

  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const sortingUi = SORTING_I18N[normLocale] || SORTING_I18N.en;
  const str = getGameStrings("sorting", locale);

  function pickUp() {
    if (!current || done || picked) return;
    playPress();
    setPicked(true);
    const itemName = current.labels[normLocale] || current.labels.en;
    speak(
      `${sortingUi.thisIs(itemName)} ${str.hudAction}`,
      locale,
      rate
    );
  }

  function placeIn(category: Category) {
    if (!current || done || !picked) return;
    setTaps((v) => v + 1);
    const itemName = current.labels[normLocale] || current.labels.en;
    if (category === current.category) {
      playCorrect();
      const items = [...placed, current];
      setPlaced(items);
      setPicked(false);
      setAttemptCount(0);
      setHesitationSeconds(0);
      speak(
        sortingUi.placedCorrectly(itemName),
        locale,
        rate
      );
      if (index + 1 >= queue.length) {
        finish(items);
      } else {
        setIndex((i) => i + 1);
      }
    } else {
      playWaterRipple();
      setErrorCount((v) => v + 1);
      setAttemptCount((a) => a + 1);
      setShakeCat(category);
      speak(
        sortingUi.belongsInHighlight(itemName),
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
      level,
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
        <Celebration icon={ShoppingBag} title={str.celebrationTitle}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {sortingUi.categorizationComplete}
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
                  <span className="text-xs font-black">{sortingUi.playFolkMelody}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  {sortingUi.assessmentComplete}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={resetGame}>
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
          {(() => {
            const isTargetKitchen = current?.category === "kitchen";
            const isTargetPrayer = current?.category === "prayer";
            const showKitchenCue = picked && isTargetKitchen && (scaffold.intensity !== "none" || attemptCount > 0);
            const showPrayerCue = picked && isTargetPrayer && (scaffold.intensity !== "none" || attemptCount > 0);

            return (
              <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => placeIn("kitchen")}
                  aria-label="Kitchen Tray"
                  className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-amber-50 p-4 shadow-[4px_4px_0px_#000] transition-all cursor-pointer hover:bg-amber-100 ${
                    shakeCat === "kitchen" ? "animate-shake bg-amber-100" : ""
                  } ${
                    showKitchenCue
                      ? "ring-4 ring-amber-500 bg-amber-100 scale-105 animate-pulse shadow-lg"
                      : picked
                      ? "border-amber-700/60"
                      : ""
                  }`}
                >
                  <Utensils className="h-10 w-10 text-amber-800" />
                  <span className="text-base sm:text-lg font-black text-amber-950">
                    {sortingUi.kitchenTitle}
                  </span>
                  <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1.5">
                    {inBasket("kitchen").map((item) => (
                      <span key={item.key} className="inline-flex">
                        {renderSortItemIcon(item.key, "h-6 w-6")}
                      </span>
                    ))}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => placeIn("prayer")}
                  aria-label="Prayer Tray"
                  className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-emerald-50 p-4 shadow-[4px_4px_0px_#000] transition-all cursor-pointer hover:bg-emerald-100 ${
                    shakeCat === "prayer" ? "animate-shake bg-emerald-100" : ""
                  } ${
                    showPrayerCue
                      ? "ring-4 ring-emerald-500 bg-emerald-100 scale-105 animate-pulse shadow-lg"
                      : picked
                      ? "border-emerald-700/60"
                      : ""
                  }`}
                >
                  <DiyaLampIcon className="h-10 w-10 text-emerald-800" />
                  <span className="text-base sm:text-lg font-black text-emerald-950">
                    {sortingUi.prayerTitle}
                  </span>
                  <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1.5">
                    {inBasket("prayer").map((item) => (
                      <span key={item.key} className="inline-flex">
                        {renderSortItemIcon(item.key, "h-6 w-6")}
                      </span>
                    ))}
                  </span>
                </button>
              </div>
            );
          })()}

          <p className="text-sm sm:text-base font-black text-ink">
            {picked
              ? sortingUi.promptPicked(current?.labels[normLocale] || current?.labels.en || "")
              : sortingUi.promptUnpicked}
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
                        : hesitationSeconds >= 6
                        ? "scale-102 border-amber-600 bg-amber-50 shadow-[4px_4px_0px_#000] ring-4 ring-amber-400 animate-pulse"
                        : "border-black bg-white shadow-[3px_3px_0px_#000] hover:bg-amber-50"
                      : isDone
                      ? "border-emerald-700 bg-emerald-100 opacity-80"
                      : "border-black/20 bg-surface-muted opacity-40"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center">
                    {renderSortItemIcon(item.key, "h-8 w-8")}
                  </div>
                  <span className="text-xs font-black text-ink text-center leading-tight">
                    {item.labels[normLocale] || item.labels.en}
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