"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Globe,
  PlayCircle,
  CloudRain,
  Feather,
  Landmark,
  Mountain,
  Flower2,
  Gamepad2,
} from "lucide-react";
import { AssamTeaLeafIcon, BambooShootIcon } from "@/components/ui/CulturalIcons";
import { Link } from "@/i18n/navigation";
import { playTapFeedback } from "@/lib/sound";

interface StateData {
  id: string;
  name: string;
  nativeName: string;
  tagline: string;
  languages: string[];
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  bgGrad: string;
  games: { title: string; domain: string; path: string }[];
  memoryHeritage: string;
}

const NER_STATES: StateData[] = [
  {
    id: "assam",
    name: "Assam",
    nativeName: "অসম",
    tagline: "Heartland of the Brahmaputra & Tea Valleys",
    languages: ["Assamese", "Bodo", "Bengali"],
    icon: AssamTeaLeafIcon,
    bgGrad: "from-emerald-500 to-teal-700",
    games: [
      { title: "Assam Tea Leaf Harvest", domain: "Visual Attention", path: "/patient/games" },
      { title: "Brahmaputra Boat Crossing", domain: "3D Motor Kinematics", path: "/patient/games" },
      { title: "Majuli Mask Workshop", domain: "Shape Symmetry", path: "/patient/games" },
      { title: "Bihu Drum Rhythm", domain: "Auditory-Motor Sync", path: "/patient/games" },
    ],
    memoryHeritage: "Kaziranga one-horned rhinos, Majuli river island, Bihu festivities & fresh morning CTC tea.",
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    nativeName: "Abode of Clouds",
    tagline: "Sacred Groves & Bio-Engineering Wonders",
    languages: ["Khasi", "Garo", "English"],
    icon: CloudRain,
    bgGrad: "from-sky-500 to-blue-700",
    games: [
      { title: "Cherrapunji Living Root Bridges", domain: "Sequential Logic", path: "/patient/games" },
      { title: "Cloud Valley Wayfinding", domain: "Spatial Memory", path: "/patient/games" },
    ],
    memoryHeritage: "Living Root Bridges of Nohwet, Mawlynnong clean village paths, and pine-scented Shillong peaks.",
  },
  {
    id: "manipur",
    name: "Manipur",
    nativeName: "মৈতৈলোন্ / Sanaleibak",
    tagline: "Jeweled Land of Floating Phumdis",
    languages: ["Manipuri (Meeteilon)", "Hindi"],
    icon: Sparkles,
    bgGrad: "from-purple-500 to-indigo-700",
    games: [
      { title: "Loktak Lake Floating Phumdis", domain: "Balance & Navigation", path: "/patient/games" },
      { title: "Classical Raas Recall", domain: "Visual Sequence", path: "/patient/games" },
    ],
    memoryHeritage: "Keibul Lamjao dancing deer (Sangai), circular floating Phumdis on Loktak Lake & Kangla heritage.",
  },
  {
    id: "mizoram",
    name: "Mizoram",
    nativeName: "Mizo ṭawng",
    tagline: "Land of Rolling Hills & Bamboo Rhythms",
    languages: ["Mizo", "English"],
    icon: BambooShootIcon,
    bgGrad: "from-amber-500 to-orange-700",
    games: [
      { title: "Cheraw Bamboo Rhythm", domain: "Timing & Motor Sync", path: "/patient/games" },
      { title: "Blue Mountain Village Route", domain: "Wayfinding", path: "/patient/games" },
    ],
    memoryHeritage: "Chapchar Kut harvest festival, vibrant woven Puan patterns, and breezy hilltop morning mist.",
  },
  {
    id: "nagaland",
    name: "Nagaland",
    nativeName: "Land of Festivals",
    tagline: "Warrior Heritage & Rich Tapestries",
    languages: ["Nagamese", "English", "Ao", "Angami"],
    icon: Feather,
    bgGrad: "from-rose-500 to-red-700",
    games: [
      { title: "Hornbill Festival Headdress", domain: "Pattern Recognition", path: "/patient/games" },
      { title: "Dzukou Valley Lily Finder", domain: "Visual Discrimination", path: "/patient/games" },
    ],
    memoryHeritage: "Hornbill celebrations at Kisama, traditional beadwork necklaces, and rolling green Dzukou valleys.",
  },
  {
    id: "tripura",
    name: "Tripura",
    nativeName: "ত্রিপুরা",
    tagline: "Royal Palaces & Sacred Rock Sculptures",
    languages: ["Bengali", "Kokborok"],
    icon: Landmark,
    bgGrad: "from-cyan-500 to-teal-700",
    games: [
      { title: "Neermahal Palace Reflection", domain: "Visual Symmetry", path: "/patient/games" },
      { title: "Unakoti Rock Relief Match", domain: "Episodic Recall", path: "/patient/games" },
    ],
    memoryHeritage: "Neermahal water palace on Rudrasagar lake, carved stone colossus of Unakoti & Ujjayanta Palace.",
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    nativeName: "Dawn-Lit Mountains",
    tagline: "Sacred Monasteries & Orchid Sanctuaries",
    languages: ["Monpa", "Nyishi", "Hindi", "English"],
    icon: Mountain,
    bgGrad: "from-emerald-600 to-green-900",
    games: [
      { title: "Monastery Prayer Wheel", domain: "Sensory Rhythm", path: "/patient/games" },
      { title: "Sessa Orchid Sanctuary", domain: "Botanical Matching", path: "/patient/games" },
    ],
    memoryHeritage: "Snow-draped Tawang monastery, spinning sacred prayer wheels, and over 500 species of wild orchids.",
  },
  {
    id: "sikkim",
    name: "Sikkim",
    nativeName: "নেপালী / Denzong",
    tagline: "Valley of Rice & Sacred Kanchenjunga",
    languages: ["Nepali", "Bhutia", "Lepcha"],
    icon: Flower2,
    bgGrad: "from-teal-500 to-emerald-800",
    games: [
      { title: "Kanchenjunga Trail Wayfinding", domain: "Spatial Orientation", path: "/patient/games" },
      { title: "Rumtek Chime Harmonics", domain: "Auditory Processing", path: "/patient/games" },
    ],
    memoryHeritage: "Golden peak of Kanchenjunga, vibrant Rumtek monastery bells, and red pandas in lush rhododendron forests.",
  },
];

export function RegionalStatesHub() {
  const [selectedStateId, setSelectedStateId] = useState<string>("assam");

  const currentState = NER_STATES.find((s) => s.id === selectedStateId) || NER_STATES[0];

  const handleSelectState = (id: string) => {
    playTapFeedback();
    setSelectedStateId(id);
  };

  return (
    <section className="w-full rounded-3xl border-3 border-black bg-surface p-4 md:p-6 shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/15 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-marigold-light border border-marigold/30 text-marigold-dark text-xs font-black mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>MDoNER 8-State Indigenous Memory Ecosystem</span>
          </div>
          <h2 className="font-serif text-xl md:text-2xl font-black text-ink">
            Culturally Grounded Cognitive Therapeutics
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-ink-secondary bg-surface-muted px-2.5 py-1 rounded-xl border border-black/10">
          <Globe className="h-3.5 w-3.5 text-tea" />
          <span>8 Sister States</span>
        </div>
      </div>

      {/* State Selector Tabs */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
        {NER_STATES.map((st) => {
          const isSelected = st.id === selectedStateId;
          const StateIcon = st.icon;
          return (
            <button
              key={st.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleSelectState(st.id)}
              className={`btn-tactile flex flex-col items-center justify-center p-2 rounded-xl border-2 border-black transition-all cursor-pointer ${
                isSelected
                  ? "bg-tea text-white shadow-[2px_2px_0px_#000] scale-[1.03]"
                  : "bg-surface-muted hover:bg-tea-light/50 text-ink"
              }`}
            >
              <div className="h-6 w-6 flex items-center justify-center mb-0.5">
                <StateIcon className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black leading-tight text-center truncate w-full">
                {st.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected State Showcase Hero Card */}
      <div className="mt-4 rounded-2xl border-2 border-black bg-surface-muted p-4 md:p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl border-2 border-black bg-tea/10 flex items-center justify-center text-tea shrink-0">
                <currentState.icon className="h-5 w-5 stroke-[2.5]" />
              </div>
              <h3 className="font-serif font-black text-xl md:text-2xl text-ink">
                {currentState.name} <span className="text-tea text-base font-bold font-sans">({currentState.nativeName})</span>
              </h3>
            </div>
            <p className="text-xs md:text-sm font-bold text-ink-secondary">
              {currentState.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-black text-ink-secondary">Native Dialects:</span>
              {currentState.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-md bg-surface border border-black/20 text-[10px] font-extrabold text-ink shadow-xs"
                >
                  {lang}
                </span>
              ))}
            </div>

            <div className="p-3 bg-surface rounded-xl border border-black/15 text-xs text-ink leading-relaxed">
              <span className="font-black text-tea flex items-center gap-1 mb-0.5">
                <MapPin className="h-3.5 w-3.5" /> Cultural Memory Anchors:
              </span>
              <p className="font-medium text-ink-secondary">{currentState.memoryHeritage}</p>
            </div>
          </div>

          {/* Regional Game Module Pairing */}
          <div className="w-full md:w-72 bg-surface rounded-xl border-2 border-black p-3.5 shadow-[3px_3px_0px_#000] shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-tea flex items-center gap-1.5 mb-2">
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Regional Serious Games</span>
            </span>
            <div className="space-y-2">
              {currentState.games.map((g) => (
                <Link
                  key={g.title}
                  href="/patient/games"
                  className="block p-2 rounded-lg bg-surface-muted hover:bg-tea-light/80 border border-black/15 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-ink group-hover:text-tea truncate">
                      {g.title}
                    </span>
                    <PlayCircle className="h-3.5 w-3.5 text-tea shrink-0 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold text-ink-secondary">
                    {g.domain}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
