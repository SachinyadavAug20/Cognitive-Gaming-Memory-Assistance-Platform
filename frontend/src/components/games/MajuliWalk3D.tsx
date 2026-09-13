"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import * as THREE from "three";
import gsap from "gsap";
import {
  RotateCcw,
  MapPin,
  CheckCircle2,
  Footprints,
  Music,
  Volume2,
  VolumeX,
  MessageSquare,
  Landmark as LandmarkIcon,
  Home,
  Ship,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useGameVoice } from "@/hooks/useGameVoice";
import { submitGameSessionTelemetry } from "@/lib/gameTelemetry";
import { useAuthStore } from "@/store/useAuthStore";
import {
  playPress,
  playCorrect,
  playComplete,
  playLandmarkChime,
  playPineBreeze,
  playLifeSong,
  playStepSound,
} from "@/lib/sound";

export interface Landmark {
  id: string;
  name: string;
  nativeName: string;
  description: string;
  position: [number, number, number];
  side: "left" | "right" | "center";
  category: "namghar" | "stilt_house" | "banyan" | "river_ghat";
  emoji: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

const WALK_STOP_COORDS = [
  { z: 18, lookAt: [0, 1.5, 8] },
  { z: 10, lookAt: [-6, 2, 8] },
  { z: 0, lookAt: [6, 2, -2] },
  { z: -10, lookAt: [0, 1, -16] },
];

interface MajuliWalkStrings {
  points: (p: number) => string;
  stopOf: (c: number, t: number) => string;
  readForMe: string;
  unmute: string;
  mute: string;
  recognizedToday: string;
  playBihu: string;
  mindfulness: string;
  namgharName: string;
  namgharDesc: string;
  namgharOptions: [string, string, string];
  changGharName: string;
  changGharDesc: string;
  changGharOptions: [string, string, string];
  riverGhatName: string;
  riverGhatDesc: string;
  riverGhatOptions: [string, string, string];
}

const MAJULI_I18N: Record<string, MajuliWalkStrings> = {
  en: {
    points: (p) => `+${p} Points`,
    stopOf: (c, t) => `Stop ${c} of ${t}`,
    readForMe: "Read for Me",
    unmute: "Unmute Voice",
    mute: "Mute Voice",
    recognizedToday: "Landmarks Recognized Today:",
    playBihu: "Play Bihu Melody",
    mindfulness: "Mindfulness Journey",
    namgharName: "Auniati Satra Namghar",
    namgharDesc: "Sacred prayer hall with golden finial and brass bell chimes on the left riverbank.",
    namgharOptions: ["Auniati Satra Namghar", "Modern Highway", "Market Clock Tower"],
    changGharName: "Mising Bamboo Chang Ghar",
    changGharDesc: "Traditional raised bamboo stilt cottage built to stay safe above monsoon floods.",
    changGharOptions: ["Mising Bamboo Chang Ghar", "Brick Factory", "Concrete Apartment"],
    riverGhatName: "Kamalabari River Ghat",
    riverGhatDesc: "Peaceful wooden boat jetty overlooking the sunlit Brahmaputra River waters.",
    riverGhatOptions: ["Kamalabari River Ghat", "Airport Terminal", "Railway Junction"],
  },
  as: {
    points: (p) => `+${p} নম্বৰ`,
    stopOf: (c, t) => `স্থান ${c} (${t} ৰ ভিতৰত)`,
    readForMe: "মোৰ বাবে পঢ়ক",
    unmute: "শব্দ শুনক",
    mute: "শব্দ বন্ধ কৰক",
    recognizedToday: "আজি চিনাক্ত কৰা ঐতিহ্যসমূহ:",
    playBihu: "বিহুৰ সুৰ শুনাওক",
    mindfulness: "মনৰ প্ৰশান্তিৰ যাত্ৰা",
    namgharName: "আউনীআটী সত্ৰ নামঘৰ",
    namgharDesc: "বাওঁহাতে সোণালী কলচী আৰু কাঁহৰ ঘণ্টাৰে শুশোভিত পৱিত্ৰ নামঘৰ।",
    namgharOptions: ["আউনীআটী সত্ৰ নামঘৰ", "আধুনিক ঘাইপথ", "বজাৰৰ ঘড়ী স্তম্ভ"],
    changGharName: "মিচিং বাঁহৰ চাং ঘৰ",
    changGharDesc: "বাৰিষাৰ বানপানীৰ পৰা সুৰক্ষিত ঐতিহ্যবাহী বাঁহৰ ওখ চাং ঘৰ।",
    changGharOptions: ["মিচিং বাঁহৰ চাং ঘৰ", "ইটাৰ ভাটা", "কংক্ৰিটৰ অট্টালিকা"],
    riverGhatName: "কমলাবাৰী ফেৰী ঘাট",
    riverGhatDesc: "ব্ৰহ্মপুত্ৰৰ ৰূপালী জলৰাশিৰ পাৰত শান্ত কাঠৰ নাও ঘাট।",
    riverGhatOptions: ["কমলাবাৰী ফেৰী ঘাট", "বিমান বন্দৰ", "ৰে'ল ষ্টেচন"],
  },
  hi: {
    points: (p) => `+${p} अंक`,
    stopOf: (c, t) => `पड़ाव ${c} (${t} में से)`,
    readForMe: "मेरे लिए पढ़ें",
    unmute: "आवाज़ चालू करें",
    mute: "आवाज़ बंद करें",
    recognizedToday: "आज पहचाने गए स्थल:",
    playBihu: "बिहू धुन बजाएं",
    mindfulness: "शांतिपूर्ण स्मृति यात्रा",
    namgharName: "औनियाती सत्र नामघर",
    namgharDesc: "बाएँ किनारे पर सुनहरे कलश और पीतल की घंटी वाला पवित्र प्रार्थना स्थल।",
    namgharOptions: ["औनियाती सत्र नामघर", "आधुनिक राजमार्ग", "बाज़ार घंटाघर"],
    changGharName: "मिसिंग बांस का चांग घर",
    changGharDesc: "बाढ़ से सुरक्षित रहने के लिए बांस के खंभों पर बना पारंपरिक ऊंचा घर।",
    changGharOptions: ["मिसिंग बांस का चांग घर", "ईंट का भट्ठा", "कंक्रीट की इमारत"],
    riverGhatName: "कमलाबारी नदी घाट",
    riverGhatDesc: "ब्रह्मपुत्र नदी के शांत पानी को निहारता लकड़ी का नाव घाट।",
    riverGhatOptions: ["कमलाबारी नदी घाट", "हवाई अड्डा", "रेलवे जंक्शन"],
  },
  bn: {
    points: (p) => `+${p} পয়েন্ট`,
    stopOf: (c, t) => `বিরতি ${c} (${t}-এর মধ্যে)`,
    readForMe: "পড়ে শোনান",
    unmute: "শব্দ চালু",
    mute: "শব্দ বন্ধ",
    recognizedToday: "আজকে চিহ্নিত স্থানসমূহ:",
    playBihu: "বিহু সুর বাজান",
    mindfulness: "স্মৃতি জাগরণ যাত্রা",
    namgharName: "আউনিয়াটি সত্র নামঘর",
    namgharDesc: "বাঁ তীরে সোনালি চূড়া ও কাঁসার ঘণ্টা শোভিত পবিত্র নামঘর।",
    namgharOptions: ["আউনিয়াটি সত্র নামঘর", "আধুনিক মহাসড়ক", "বাজারের ঘড়ি টাওয়ার"],
    changGharName: "মিচিং বাঁশের চাং ঘর",
    changGharDesc: "বন্যার জল থেকে নিরাপদ থাকার জন্য বাঁশের খুঁটিতে তৈরি ঐতিহ্যবাহী ঘর।",
    changGharOptions: ["মিচিং বাঁশের চাং ঘর", "ইটের ভাটা", "কংক্রিটের বাড়ি"],
    riverGhatName: "কমলাবাড়ি নদী ঘাট",
    riverGhatDesc: "শান্ত ব্রহ্মপুত্র নদীর তীরে কাঠের তৈরি সুন্দর নৌকা ঘাট।",
    riverGhatOptions: ["কমলাবাড়ি নদী ঘাট", "বিমানবন্দর", "রেলওয়ে স্টেশন"],
  },
  mr: {
    points: (p) => `+${p} गुण`,
    stopOf: (c, t) => `थांबा ${c} (${t} पैकी)`,
    readForMe: "वाचून दाखवा",
    unmute: "आवाज सुरू",
    mute: "आवाज बंद",
    recognizedToday: "आज ओळखलेली ठिकाणे:",
    playBihu: "बिहू संगीत ऐका",
    mindfulness: "शांत स्मरण यात्रा",
    namgharName: "औनियाती सत्र नामघर",
    namgharDesc: "डाव्या काठावर सोनेरी कळस आणि पितळी घंटा असलेले पवित्र प्रार्थनास्थळ.",
    namgharOptions: ["औनियाती सत्र नामघर", "आधुनिक महामार्ग", "बाजार क्लॉक टॉवर"],
    changGharName: "मिसिंग बांबूचे चांग घर",
    changGharDesc: "पुराच्या पाण्यापासून सुरक्षित राहण्यासाठी बांबूच्या खांबांवर बांधलेले पारंपरिक घर.",
    changGharOptions: ["मिसिंग बांबूचे चांग घर", "विटांची भट्टी", "काँक्रीटची इमारत"],
    riverGhatName: "कमलाबारी नदी घाट",
    riverGhatDesc: "ब्रह्मपुत्रा नदीच्या शांत पाण्याजवळचा लाकडी बोटीचा घाट.",
    riverGhatOptions: ["कमलाबारी नदी घाट", "विमानतळ", "रेल्वे जंक्शन"],
  },
  ne: {
    points: (p) => `+${p} अंक`,
    stopOf: (c, t) => `पडाव ${c} (${t} मध्ये)`,
    readForMe: "पढेर सुनाउनुहोस्",
    unmute: "आवाज खोल्नुहोस्",
    mute: "आवाज बन्द गर्नुहोस्",
    recognizedToday: "आज पहिचान गरिएका स्थलहरू:",
    playBihu: "बिहू धुन बजाउनुहोस्",
    mindfulness: "शान्त स्मृति यात्रा",
    namgharName: "औनियाती सत्र नामघर",
    namgharDesc: "देब्रे किनारमा सुनौलो कलश र घण्टीले सजिएको पवित्र नामघर।",
    namgharOptions: ["औनियाती सत्र नामघर", "आधुनिक राजमार्ग", "बजार घडी टावर"],
    changGharName: "मिसिङ बाँसको चाङ घर",
    changGharDesc: "बाढीबाट जोगिन बाँसको अग्लो खम्बामा बनाइएको परम्परागत घर।",
    changGharOptions: ["मिसिङ बाँसको चाङ घर", "इँटाको भट्टा", "कङ्क्रिटको घर"],
    riverGhatName: "कमलाबारी नदी घाट",
    riverGhatDesc: "ब्रह्मपुत्र नदीको किनारमा अवस्थित काठको शान्त डुङ्गा घाट।",
    riverGhatOptions: ["कमलाबारी नदी घाट", "विमानस्थल", "रेलवे स्टेसन"],
  },
  mni: {
    points: (p) => `+${p} পোইন্ট`,
    stopOf: (c, t) => `লেপফম ${c} (${t} গী মনুংদা)`,
    readForMe: "ঐগীদমক পারম্মু",
    unmute: "খোন্থোক থোকহল্লু",
    mute: "খোন্থোক লেপ্পু",
    recognizedToday: "ঙসি খঙদোক্লবা মফমশিং:",
    playBihu: "বিহু সুর তাউ",
    mindfulness: "নিংশিং খোঙচৎ",
    namgharName: "আউনিয়াতি সত্ৰ নামঘর",
    namgharDesc: "শোণাগী কলস অমসুং পিথ্রাই ঘণ্টা লৈবা শেংলবা নামঘর।",
    namgharOptions: ["আউনিয়াতি সত্ৰ নামঘর", "মডার্ন হাইৱে", "বাজার ক্লোক্ তাৱার"],
    changGharName: "মিচিং ৱাগী চাং য়ুম",
    changGharDesc: "ঈশিং ইচাওদগী ঙাকথোক্নবা ৱাগী য়ুম্বীদা শাশিবা অরিবা য়ুম।",
    changGharOptions: ["মিচিং ৱাগী চাং য়ুম", "চেক ফাক্টরী", "কনক্রিৎ অপার্টমেন্ট"],
    riverGhatName: "কমলাবাড়ি তুরেল ঘাট",
    riverGhatDesc: "ব্রহ্মপুত্র তুরেল নাকন্দা লৈবা নুংশিরবা উগী হী ঘাট।",
    riverGhatOptions: ["কমলাবাড়ি তুরেল ঘাট", "এয়ারপোর্ট", "রেলৱে জংশন"],
  },
  brx: {
    points: (p) => `+${p} नम्बर`,
    stopOf: (c, t) => `थाथ'नाय ${c} (${t} नि गेजेराव)`,
    readForMe: "आंनि थाखाय फराय",
    unmute: "राव खोनासंनाय",
    mute: "राव बन्द",
    recognizedToday: "दिनै सिनायथि जानाय जायगाफोर:",
    playBihu: "बिहु सुर दाम",
    mindfulness: "गोसोनि गोजोन दावबायनाय",
    namgharName: "आउनियाति सत्र नामघर",
    namgharDesc: "आगसि बारग'आव सनानि कलश आरो फिथ्राय घन्टानि फुंखा थानाय नामघर।",
    namgharOptions: ["आउनियाति सत्र नामघर", "गोदान राजफार", "बजार घडी टावार"],
    changGharName: "मिसिं औवानि साङ घर",
    changGharDesc: "दैबानानिफ्राय रैखा थानो औवानि थामफायाव लुनाय साङ घर।",
    changGharOptions: ["मिसिं औवानि साङ घर", "इथा बाथा", "कंक्रीट बिल्डिं"],
    riverGhatName: "कमलाबारी दैमा घाट",
    riverGhatDesc: "ब्रह्मपुत्र दैमानि सेराव गोजोननाय गंसे दंफां नावनि घाट।",
    riverGhatOptions: ["कमलाबारी दैमा घाट", "बिरखं जायगा", "रेलवे स्टेसन"],
  },
  grt: {
    points: (p) => `+${p} Point-rang`,
    stopOf: (c, t) => `Song·dongani ${c} (${t} oni)`,
    readForMe: "Angna Poraibo",
    unmute: "Ku·rang Khnaatbo",
    mute: "Ku·rang Dingtangatbo",
    recognizedToday: "Da·alo U·itokgipa Song·dongaramrang:",
    playBihu: "Bihu Git Ringo Dokbo",
    mindfulness: "Gisik Kakket Re·ani",
    namgharName: "Auniati Satra Namghar",
    namgharDesc: "Sonani kalasi aro kanchini gonta donggipa rongtalgipa Namghar.",
    namgharOptions: ["Auniati Satra Namghar", "Gital Rama", "Market Ghari Killa"],
    changGharName: "Mising Wa·ani Chang Ghar",
    changGharDesc: "Chi banoni naljokna wa·a krongchi rikbagipa ku·chotgipa nok.",
    changGharOptions: ["Mising Wa·ani Chang Ghar", "Itani Karkhana", "Concrete Nok"],
    riverGhatName: "Kamalabari Chibima Ghat",
    riverGhatDesc: "Brahmaputra chibima rikam gita bolni ring kadongani ghat.",
    riverGhatOptions: ["Kamalabari Chibima Ghat", "Eroplane Maljokram", "Rel Station"],
  },
  kha: {
    points: (p) => `+${p} Point`,
    stopOf: (c, t) => `Jingsangeh ${c} (na ${t})`,
    readForMe: "Pule ia nga",
    unmute: "Plie Sur",
    mute: "Kylliang Sur",
    recognizedToday: "Ki jaka ba la ithuh mynta:",
    playBihu: "Tem Sur Bihu",
    mindfulness: "Jingiaid ban pynshait jingmut",
    namgharName: "Auniati Satra Namghar",
    namgharDesc: "Ka jaka duwai Namghar ba don ka dabor ksiar bad ka shakuriaw ha ka rud wah.",
    namgharOptions: ["Auniati Satra Namghar", "Surok Bah", "Kynton Ktien Ghari"],
    changGharName: "Mising Iing Siej Chang Ghar",
    changGharDesc: "Ka iing siej ba tei halor ki rishot ban lait na ka shlem um shlem sngi.",
    changGharOptions: ["Mising Iing Siej Chang Ghar", "Karkhana Mawit", "Iing Paki"],
    riverGhatName: "Kamalabari Wah Ghat",
    riverGhatDesc: "Ka kad lieng dieng ba jem nud harud wah Brahmaputra.",
    riverGhatOptions: ["Kamalabari Wah Ghat", "Kad Liengsuin", "Station Rel"],
  },
  lus: {
    points: (p) => `+${p} Points`,
    stopOf: (c, t) => `Chawlhna ${c} (${t} zinga)`,
    readForMe: "Min chhiarsak rawh",
    unmute: "Aw ti-chhuak rawh",
    mute: "Aw ti-tawp rawh",
    recognizedToday: "Vawiina Hmun Hriatpuite:",
    playBihu: "Bihu Rimawi Ti-ri rawh",
    mindfulness: "Hriatna Tiharh Zinchhuahna",
    namgharName: "Auniati Satra Namghar",
    namgharDesc: "Vaupuiah rangkachak parthi leh dar thir dar ri hriat theihna in thianghlim.",
    namgharOptions: ["Auniati Satra Namghar", "Kawngpui Lian", "Bazar Sana In Sang"],
    changGharName: "Mising Mau Chang Ghar In",
    changGharDesc: "Tui lian laka him nana mau ban chunga in sawn sanna hlun.",
    changGharOptions: ["Mising Mau Chang Ghar In", "Lehlawn Siamna Hmun", "Concrete In Pui"],
    riverGhatName: "Kamalabari Lui Lawng Chawlhna",
    riverGhatDesc: "Brahmaputra lui kam panga thing lawng chawlhna hmun nuam leh dai.",
    riverGhatOptions: ["Kamalabari Lui Lawng Chawlhna", "Thlawhna Chawlhhmun", "Rel Chawlhna"],
  },
};

export function MajuliWalk3D() {
  const t = useTranslations("games.majuli");
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const m = MAJULI_I18N[normLoc] || MAJULI_I18N.en;

  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;

  const { speakVoice, stopVoice, isMuted, toggleMute, currentSubtitle } = useGameVoice();

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [solvedLandmarks, setSolvedLandmarks] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [viewAngle, setViewAngle] = useState<"front" | "left" | "right">("front");

  // Telemetry session tracking
  const startTimeRef = useRef<number>(0);
  const hesitationCountRef = useRef<number>(0);

  // Localized landmarks derived from next-intl translations
  const localizedLandmarks = useMemo<Landmark[]>(() => {
    return [
      {
        id: "namghar",
        name: m.namgharName,
        nativeName: "আউনীআটী সত্ৰ নামঘৰ",
        description: m.namgharDesc,
        position: [-6, 0, 8],
        side: "left",
        category: "namghar",
        emoji: "namghar",
        question: t("questionNamghar"),
        correctAnswer: m.namgharOptions[0],
        options: m.namgharOptions,
      },
      {
        id: "stilt_house",
        name: m.changGharName,
        nativeName: "মিচিং চাং ঘৰ",
        description: m.changGharDesc,
        position: [6, 0, -2],
        side: "right",
        category: "stilt_house",
        emoji: "stilt_house",
        question: t("questionChangGhar"),
        correctAnswer: m.changGharOptions[0],
        options: m.changGharOptions,
      },
      {
        id: "river_ghat",
        name: m.riverGhatName,
        nativeName: "কমলাবাৰী ফেৰী ঘাট",
        description: m.riverGhatDesc,
        position: [0, 0, -14],
        side: "center",
        category: "river_ghat",
        emoji: "river_ghat",
        question: t("questionRiverGhat"),
        correctAnswer: m.riverGhatOptions[0],
        options: m.riverGhatOptions,
      },
    ];
  }, [t, m]);

  // Three.js Scene Setup (Sunrise, Procedural Terrain, Atmospheric Lighting)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#FED7AA");
    scene.fog = new THREE.FogExp2("#FED7AA", 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2.2, WALK_STOP_COORDS[0].z);
    camera.lookAt(0, 1.8, WALK_STOP_COORDS[0].z - 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight("#FFF7ED", 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#F59E0B", 2.2);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight("#FB923C", 1.0);
    rimLight.position.set(-15, 10, -20);
    scene.add(rimLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#2D5A27",
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Pathway
    const pathGeo = new THREE.PlaneGeometry(5.5, 80);
    const pathMat = new THREE.MeshStandardMaterial({
      color: "#B4835A",
      roughness: 0.95,
      metalness: 0.05,
    });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, 0);
    path.receiveShadow = true;
    scene.add(path);

    // River
    const riverGeo = new THREE.PlaneGeometry(120, 30);
    const riverMat = new THREE.MeshStandardMaterial({
      color: "#0284C7",
      roughness: 0.2,
      metalness: 0.7,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.01, -26);
    scene.add(river);

    // Landmark 1: Namghar
    const namgharGroup = new THREE.Group();
    namgharGroup.position.set(-6, 0, 8);
    const namgharBase = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 8), new THREE.MeshStandardMaterial({ color: "#78350F" }));
    namgharBase.position.y = 0.4;
    namgharGroup.add(namgharBase);
    const namgharWalls = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 7.2), new THREE.MeshStandardMaterial({ color: "#FAF5EE" }));
    namgharWalls.position.y = 2.2;
    namgharGroup.add(namgharWalls);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.4, 4), new THREE.MeshStandardMaterial({ color: "#B45309" }));
    roof.position.y = 4.8;
    roof.rotation.y = Math.PI / 4;
    namgharGroup.add(roof);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: "#F59E0B", metalness: 0.8 }));
    finial.position.y = 6.2;
    namgharGroup.add(finial);
    scene.add(namgharGroup);

    // Landmark 2: Chang Ghar
    const stiltGroup = new THREE.Group();
    stiltGroup.position.set(6, 0, -2);
    for (let x = -2; x <= 2; x += 4) {
      for (let z = -2; z <= 2; z += 4) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2), new THREE.MeshStandardMaterial({ color: "#451A03" }));
        stilt.position.set(x, 1, z);
        stiltGroup.add(stilt);
      }
    }
    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.4, 5.5), new THREE.MeshStandardMaterial({ color: "#92400E" }));
    floor.position.y = 2.1;
    stiltGroup.add(floor);
    const cottage = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 4.6), new THREE.MeshStandardMaterial({ color: "#D4A373" }));
    cottage.position.y = 3.4;
    stiltGroup.add(cottage);
    const thatching = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), new THREE.MeshStandardMaterial({ color: "#78350F" }));
    thatching.position.y = 5.2;
    thatching.rotation.y = Math.PI / 4;
    stiltGroup.add(thatching);
    scene.add(stiltGroup);

    // Landmark 3: River Ghat & Canoe
    const ghatGroup = new THREE.Group();
    ghatGroup.position.set(0, 0, -14);
    const jetty = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 7), new THREE.MeshStandardMaterial({ color: "#5C3D2E" }));
    jetty.position.set(0, 0.2, -1);
    ghatGroup.add(jetty);
    const boat = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 4.5, 8), new THREE.MeshStandardMaterial({ color: "#3E2723" }));
    boat.rotation.z = Math.PI / 2;
    boat.rotation.y = Math.PI / 6;
    boat.position.set(2.8, 0.1, -3);
    ghatGroup.add(boat);
    scene.add(ghatGroup);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      river.position.y = 0.01 + Math.sin(Date.now() * 0.002) * 0.04;
      boat.rotation.z = Math.PI / 2 + Math.sin(Date.now() * 0.003) * 0.06;
      renderer.render(scene, camera);
    };
    animate();
    startTimeRef.current = Date.now();
    speakVoice(t("welcomeSpeech"));

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stopVoice();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = Array.isArray(obj.material) ? obj.material : [obj.material];
          m.forEach((mm) => mm.dispose());
        }
      });
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, [speakVoice, stopVoice, t]);

  // Camera GSAP Walking Animation between Stops
  const advanceWalk = useCallback(() => {
    if (isWalking || currentStopIndex >= WALK_STOP_COORDS.length - 1) return;

    playStepSound();
    playPress();
    setIsWalking(true);
    setActiveLandmark(null);

    const nextIdx = currentStopIndex + 1;
    const targetStop = WALK_STOP_COORDS[nextIdx];
    const camera = cameraRef.current;

    if (camera) {
      gsap.to(camera.position, {
        z: targetStop.z,
        y: 2.2 + (nextIdx % 2 === 0 ? 0.1 : 0),
        duration: 3.2,
        ease: "power1.inOut",
        onUpdate: () => {
          camera.lookAt(targetStop.lookAt[0], targetStop.lookAt[1], targetStop.lookAt[2]);
        },
        onComplete: () => {
          setIsWalking(false);
          setCurrentStopIndex(nextIdx);

          if (nextIdx === 1) {
            playLandmarkChime();
            setActiveLandmark(localizedLandmarks[0]);
            speakVoice(t("speakPromptNamghar"));
          } else if (nextIdx === 2) {
            playPineBreeze();
            setActiveLandmark(localizedLandmarks[1]);
            speakVoice(t("speakPromptChangGhar"));
          } else if (nextIdx === 3) {
            playComplete();
            setActiveLandmark(localizedLandmarks[2]);
            setIsFinished(true);

            // Log Session Telemetry
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
            void submitGameSessionTelemetry({
              patientId,
              gameType: "MAJULI_WALK",
              durationSeconds: duration,
              accuracyPercentage: 100,
              spatialRecallScore: score + 35,
              hesitationCount: hesitationCountRef.current,
              difficultyLevel: 1,
            });

            speakVoice(t("speakPromptRiverGhat"));
          }
        },
      });
    }
  }, [isWalking, currentStopIndex, localizedLandmarks, speakVoice, patientId, score, t]);

  const handleLookAngle = (angle: "left" | "right" | "front") => {
    setViewAngle(angle);
    playPress();
    const camera = cameraRef.current;
    if (!camera) return;

    if (angle === "left") {
      gsap.to(camera.rotation, { y: 0.6, duration: 1.2, ease: "power2.out" });
    } else if (angle === "right") {
      gsap.to(camera.rotation, { y: -0.6, duration: 1.2, ease: "power2.out" });
    } else {
      gsap.to(camera.rotation, { y: 0, duration: 1.2, ease: "power2.out" });
    }
  };

  const handleAnswerLandmark = (selectedOption: string) => {
    if (!activeLandmark) return;

    if (selectedOption === activeLandmark.correctAnswer) {
      playCorrect();
      setScore((s) => s + 35);
      setSolvedLandmarks((prev) => [...prev, activeLandmark.id]);
      speakVoice(t("correctFeedback"));
      setActiveLandmark(null);
    } else {
      hesitationCountRef.current += 1;
      playPineBreeze();
      speakVoice(t("retryFeedback"));
    }
  };

  const restartWalk = () => {
    playPress();
    setCurrentStopIndex(0);
    setSolvedLandmarks([]);
    setIsFinished(false);
    setActiveLandmark(null);
    setScore(0);
    startTimeRef.current = Date.now();
    const camera = cameraRef.current;
    if (camera) {
      camera.position.set(0, 2.2, WALK_STOP_COORDS[0].z);
      camera.lookAt(0, 1.8, WALK_STOP_COORDS[0].z - 10);
    }
    speakVoice(t("welcomeSpeech"));
  };

  return (
    <section className="min-h-screen bg-[#FAF6F0] pb-12 select-none">
      <GameHeader
        title={t("title")}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#2D5A27]"
      />

      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* Visual Subtitle Fallback Pill */}
        {currentSubtitle && (
          <div className="mb-3 flex items-center justify-center animate-fade-in">
            <span className="rounded-full border-2 border-emerald-900/40 bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-950 shadow-sm inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{currentSubtitle}</span>
            </span>
          </div>
        )}

        {isFinished ? (
          <Celebration
            title={t("title")}
            subtitle={t("subtitle")}
            xpEarned={105}
            accuracy="100%"
          >
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-left">
              <div className="w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t("scoreSummary")}
                  </span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-950 border border-emerald-900/30">
                    {m.points(score)}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-ink-secondary">
                    {m.recognizedToday}
                  </span>
                  {localizedLandmarks.map((lm) => (
                    <div key={lm.id} className="flex items-center gap-2 text-xs font-bold text-ink">
                      {lm.category === "namghar" ? (
                        <LandmarkIcon className="w-4 h-4 text-amber-700 shrink-0" />
                      ) : lm.category === "stilt_house" ? (
                        <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <Ship className="w-4 h-4 text-amber-700 shrink-0" />
                      )}
                      <span>{lm.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t-2 border-black/10 pt-3">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer hover:bg-amber-300"
                  >
                    <Music className="h-4 w-4" />
                    <span>{m.playBihu}</span>
                  </button>
                  <span className="text-[11px] font-black text-ink-secondary">
                    {m.mindfulness}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <ChunkyButton variant="tea" size="xl" onClick={restartWalk}>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-5 w-5" /> {t("playAgain")}
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                >
                  {t("backToHub")}
                </Link>
              </div>
            </div>
          </Celebration>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Top Navigation HUD */}
            <div className="flex w-full items-center justify-between rounded-2xl border-3 border-black bg-[#FAF3E0] px-4 py-3 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-400 text-amber-950 font-black">
                  <Footprints className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {t("currentLandmark")}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-ink">
                    {m.stopOf(currentStopIndex + 1, WALK_STOP_COORDS.length)}
                  </div>
                </div>
              </div>

              {/* Angle Controls & Speaker Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title={isMuted ? m.unmute : m.mute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-600" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleLookAngle("left")}
                  className={`btn-tactile rounded-xl border-2 border-black px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                    viewAngle === "left" ? "bg-amber-400" : "bg-surface"
                  }`}
                >
                  {t("lookLeft")}
                </button>
                <button
                  type="button"
                  onClick={() => handleLookAngle("front")}
                  className={`btn-tactile rounded-xl border-2 border-black px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                    viewAngle === "front" ? "bg-amber-400" : "bg-surface"
                  }`}
                >
                  {t("lookAhead")}
                </button>
                <button
                  type="button"
                  onClick={() => handleLookAngle("right")}
                  className={`btn-tactile rounded-xl border-2 border-black px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                    viewAngle === "right" ? "bg-amber-400" : "bg-surface"
                  }`}
                >
                  {t("lookRight")}
                </button>
              </div>
            </div>

            {/* 3D WebGL Canvas Container */}
            <div className="relative w-full overflow-hidden rounded-3xl border-4 border-black bg-[#FED7AA] shadow-[8px_8px_0px_#000]">
              <div ref={mountRef} className="h-[360px] sm:h-[420px] w-full" />

              {/* Landmark Pop-up Question Overlay */}
              {activeLandmark && !solvedLandmarks.includes(activeLandmark.id) && (
                <div className="absolute inset-x-3 sm:inset-x-6 bottom-3 sm:bottom-4 rounded-3xl border-3 border-black bg-surface/95 p-4 sm:p-5 backdrop-blur-md shadow-[6px_6px_0px_#000] animate-fade-in z-20">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl shrink-0">{activeLandmark.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
                          <MapPin className="h-4 w-4 text-emerald-700" /> {t("spatialPrompt")}
                        </div>
                        <button
                          type="button"
                          onClick={() => speakVoice(activeLandmark.question)}
                          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-amber-300 active:scale-95"
                          title={m.readForMe}
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>{m.readForMe}</span>
                        </button>
                      </div>
                      <p className="font-serif text-base sm:text-lg font-black text-ink leading-snug">
                        {activeLandmark.question}
                      </p>

                      <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
                        {activeLandmark.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerLandmark(opt)}
                            className="btn-tactile rounded-2xl border-2 border-black bg-amber-100 p-3 sm:p-3.5 text-xs sm:text-sm font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-300 cursor-pointer active:translate-y-0.5 text-center leading-snug transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Step Forward Chunky Trigger */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <ChunkyButton
                variant="tea"
                size="2xl"
                icon={<Footprints className="h-6 w-6" />}
                onClick={advanceWalk}
                disabled={isWalking || currentStopIndex >= WALK_STOP_COORDS.length - 1}
              >
                {isWalking ? t("walking") : t("walkingPrompt")}
              </ChunkyButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MajuliWalk3D;
