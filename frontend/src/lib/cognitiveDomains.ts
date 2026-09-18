import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Sparkles,
  Compass,
  MessageCircleHeart,
  Grid3X3,
  CalendarCheck,
  Layers,
} from "lucide-react";

export type CognitiveDomainKey =
  | "all"
  | "memory"
  | "attention"
  | "orientation"
  | "language"
  | "visuospatial"
  | "executive_function";

export interface CognitiveDomainInfo {
  key: CognitiveDomainKey;
  label: string;
  tagline: string;
  simpleDescription: string;
  clinicalDomain: string;
  icon: LucideIcon;
  badgeBg: string;
  gameIds: string[];
  spokenIntro: string;
}

export const COGNITIVE_DOMAINS: CognitiveDomainInfo[] = [
  {
    key: "all",
    label: "All Activities",
    tagline: "Complete Brain Therapy Library",
    simpleDescription: "Browse all 40 therapeutic games and activities across the 6 clinical domains.",
    clinicalDomain: "Comprehensive 6-Domain Neuro-Therapeutics",
    icon: Layers,
    badgeBg: "bg-emerald-700",
    gameIds: [], // Matches all games
    spokenIntro: "Showing all 40 therapeutic activities across the six clinical domains for daily brain care.",
  },
  {
    key: "memory",
    label: "Memory & Recall",
    tagline: "Family, Life Stories & Recall",
    simpleDescription: "Remember loved ones, ancestral herbs, old stories, and familiar places.",
    clinicalDomain: "Episodic Memory & Delayed Recall (MoCA / DSM-5)",
    icon: Brain,
    badgeBg: "bg-[#E11D48]",
    gameIds: [
      "day-in-my-world",
      "memory-garden",
      "memory-road",
      "memory-detective",
      "timeline",
      "ancestral-herbalist",
    ],
    spokenIntro: "Showing 6 Memory activities. Reconnect with family memories, life stories, and cherished photographs.",
  },
  {
    key: "attention",
    label: "Attention & Focus",
    tagline: "Leaf Picking, Vigilance & Reaction",
    simpleDescription: "Practice visual focus, picking tea leaves, and following moving objects.",
    clinicalDomain: "Sustained Attention & Processing Speed (ACTIVE Model / MoCA)",
    icon: Sparkles,
    badgeBg: "bg-[#059669]",
    gameIds: [
      "tea-harvest",
      "tea-garden-catch",
      "tea-harvest-vision",
      "tea-garden-match",
      "butterfly-sanctuary",
      "dzukou-botanist",
      "monastery-bell",
      "rhythm-hills",
    ],
    spokenIntro: "Showing 8 Attention activities. Gentle observation drills to practice concentration and steady eyes.",
  },
  {
    key: "orientation",
    label: "Orientation & Wayfinding",
    tagline: "Village Walking, River Boats & Roads",
    simpleDescription: "Walk through scenic village trails, cross the Brahmaputra River, and navigate roads.",
    clinicalDomain: "Spatial & Temporal Orientation (MoCA)",
    icon: Compass,
    badgeBg: "bg-[#EA580C]",
    gameIds: [
      "majuli-walk",
      "wayfinding",
      "brahmaputra-boat",
      "root-bridge",
      "hornbill-flight",
      "arrow-escape",
      "pathways",
    ],
    spokenIntro: "Showing 7 Orientation activities. Scenic 3D village paths, river navigation, and road exploration.",
  },
  {
    key: "language",
    label: "Language & Communication",
    tagline: "Saathi Voice Companion & Stories",
    simpleDescription: "Chat with friendly Saathi, listen to nostalgic radio, and explore family emotions.",
    clinicalDomain: "Language, Naming & Verbal Fluency (MoCA)",
    icon: MessageCircleHeart,
    badgeBg: "bg-[#9333EA]",
    gameIds: [
      "companion",
      "grandchild-chat",
      "family-emotions",
      "storybook",
      "radio",
    ],
    spokenIntro: "Showing 5 Language activities. Friendly conversation with Saathi companion, family stories, and radio melodies.",
  },
  {
    key: "visuospatial",
    label: "Visuospatial & Art",
    tagline: "Air-Painting, Weaving & Jigsaw Puzzles",
    simpleDescription: "Paint lotus flowers, assemble picture puzzles, and weave traditional loom patterns.",
    clinicalDomain: "Visuospatial Construction & Motor Praxis (MoCA)",
    icon: Grid3X3,
    badgeBg: "bg-[#D97706]",
    gameIds: [
      "jigsaw",
      "weaving",
      "loom",
      "alpana",
      "lotus-painter",
      "river-lanterns",
      "majuli-pottery",
      "drum",
      "tuned-drum",
      "bihu-dhol",
    ],
    spokenIntro: "Showing 10 Visuospatial activities. Picture puzzles, traditional silk weaving, air-painting, and pottery.",
  },
  {
    key: "executive_function",
    label: "Daily Routine & Planning",
    tagline: "Morning Tea, Market Shopping & Chores",
    simpleDescription: "Practice everyday morning routines, making red tea, and village market shopping.",
    clinicalDomain: "Executive Function & Instrumental ADLs (MoCA)",
    icon: CalendarCheck,
    badgeBg: "bg-[#16A34A]",
    gameIds: [
      "daily-tasks",
      "daily-routine",
      "bazaar-buddies",
      "heritage-kitchen",
      "sorting",
    ],
    spokenIntro: "Showing 5 Daily Routine activities. Practice making morning tea, visiting the market, and everyday household tasks.",
  },
];

export const LOCALIZED_DOMAIN_LABELS: Record<string, Record<CognitiveDomainKey, string>> = {
  en: {
    all: "All Activities",
    memory: "Memory & Recall",
    attention: "Attention & Focus",
    orientation: "Orientation & Wayfinding",
    language: "Language & Communication",
    visuospatial: "Visuospatial & Art",
    executive_function: "Daily Routine & Planning",
  },
  hi: {
    all: "सभी गतिविधियां",
    memory: "स्मृति और याददाश्त",
    attention: "ध्यान और एकाग्रता",
    orientation: "दिशा और मार्ग पहचान",
    language: "भाषा और संवाद",
    visuospatial: "दृश्य-स्थानिक और कला",
    executive_function: "दैनिक कार्य और योजना",
  },
  as: {
    all: "সকলো কাৰ্যকলাপ",
    memory: "স্মৃতি আৰু সোঁৱৰণ",
    attention: "মনোযোগ আৰু লক্ষ্য",
    orientation: "দিশ আৰু বাট সন্ধান",
    language: "ভাষা আৰু কথোপকথন",
    visuospatial: "দৃশ্য-স্থানিক আৰু কলা",
    executive_function: "দৈনিক কাম আৰু পৰিকল্পনা",
  },
  bn: {
    all: "সকল কার্যকলাপ",
    memory: "স্মৃতি ও স্মরণ",
    attention: "মনোযোগ ও লক্ষ্য",
    orientation: "দিক ও পথ সন্ধান",
    language: "ভাষা ও যোগাযোগ",
    visuospatial: "দৃশ্য-স্থানিক ও শিল্প",
    executive_function: "দৈনিক কাজ ও পরিকল্পনা",
  },
  mr: {
    all: "सर्व उपक्रम",
    memory: "स्मृती आणि आठवण",
    attention: "लक्ष आणि एकाग्रता",
    orientation: "दिशा आणि मार्ग शोध",
    language: "भाषा आणि संवाद",
    visuospatial: "दृश्य-स्थानिक आणि कला",
    executive_function: "दैनंदिन कामे आणि नियोजन",
  },
  ne: {
    all: "सबै गतिविधिहरू",
    memory: "स्मृति र सम्झना",
    attention: "ध्यान र एकाग्रता",
    orientation: "दिशा र बाटो पहिचान",
    language: "भाषा र संवाद",
    visuospatial: "दृश्य-स्थानिक र कला",
    executive_function: "दैनिक कार्य र योजना",
  },
  mni: {
    all: "থবক পুম্নমক",
    memory: "স্মৃতি অমসুং নীংশিংবা",
    attention: "মিৎয়েং অমসুং পুক্নিং",
    orientation: "মায়কৈ অমসুং লম্বী",
    language: "লোল অমসুং ৱারী",
    visuospatial: "দৃশ্য-মফম অমসুং কলা",
    executive_function: "নুমিৎ খুদিংগী থবক",
  },
  brx: {
    all: "गासैबो हाबाफोर",
    memory: "गोसोखां आरो मिथिंगा",
    attention: "गोसो होनाय",
    orientation: "दिग आरो लामा",
    language: "राव आरो सावरायनाय",
    visuospatial: "फथ' नायनाय आरो महर",
    executive_function: "सानफ्रोमबोनि हाबा",
  },
  grt: {
    all: "Salanti Kamrang",
    memory: "Gisik Ra·ani",
    attention: "Miksongani",
    orientation: "Ramako Am·ani",
    language: "Ku·sik aro Golpo",
    visuospatial: "Noksako Nibo",
    executive_function: "Salanti Tikat Kam",
  },
  kha: {
    all: "Baroh Ki Jingtrei",
    memory: "Kynmaw Jingmut",
    attention: "Jingpyrkhat",
    orientation: "Ki Lynti bad Ka Jingmut",
    language: "Ka Ktien bad Jingiatreilang",
    visuospatial: "Hmul peit & Art",
    executive_function: "Jingtrei Man Ka Sngi",
  },
  lus: {
    all: "Hnathawh Zawng Zawng",
    memory: "Hriatrengna",
    attention: "Rilru Pekna",
    orientation: "Kawng Hriatna",
    language: "Tawng leh Inbiakna",
    visuospatial: "Hmul en & Art",
    executive_function: "Nitintin Rilru Ruahmanna",
  },
};

export function getDomainLabel(key: CognitiveDomainKey, locale = "en"): string {
  const norm = (locale?.split("-")[0]?.toLowerCase() || "en");
  const dict = LOCALIZED_DOMAIN_LABELS[norm] || LOCALIZED_DOMAIN_LABELS.en;
  return dict[key] || LOCALIZED_DOMAIN_LABELS.en[key] || key;
}

export function getDomainForGame(gameId: string): CognitiveDomainInfo {
  for (const domain of COGNITIVE_DOMAINS) {
    if (domain.key !== "all" && domain.gameIds.includes(gameId)) {
      return domain;
    }
  }
  return COGNITIVE_DOMAINS[1]; // fallback to memory
}
