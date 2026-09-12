"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  PlayCircle,
  CloudRain,
  Feather,
  Landmark,
  Mountain,
  Flower2,
  Gamepad2,
  Volume2,
  VolumeX,
  Mic,
  ArrowRight,
  Shield,
  Coffee,
  Music,
  Waves,
  TreePine,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { AssamTeaLeafIcon, BambooShootIcon } from "@/components/ui/CulturalIcons";
import { Link } from "@/i18n/navigation";
import { playTapFeedback, unlockAudio } from "@/lib/sound";
import { playCapsuleSoundscape, stopCapsuleSoundscape } from "@/lib/capsuleSoundscapes";
import { speak, stopSpeaking } from "@/lib/speech";
import type { AmbientSoundType } from "@/types/capsule";

interface CulturalAnchor {
  title: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StateData {
  id: string;
  name: string;
  nativeName: string;
  tagline: string;
  languages: string[];
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  soundType: AmbientSoundType;
  voiceGreeting: {
    text: string;
    langCode: string;
    label: string;
  };
  culturalAnchors: CulturalAnchor[];
  games: { title: string; domain: string; path: string }[];
}

const NER_STATES: StateData[] = [
  {
    id: "assam",
    name: "Assam",
    nativeName: "অসম",
    tagline: "Heartland of the Brahmaputra, Tea Valleys & Bihu Rhythms",
    languages: ["Assamese (অসমীয়া)", "Bodo (বড়ো)", "Bengali (বাংলা)"],
    icon: AssamTeaLeafIcon,
    soundType: "birds",
    voiceGreeting: {
      text: "নমস্কাৰ! আপুনি কেনে আছে? আহক চাহ একাপ খাই খেলা-ধূলা কৰোঁ।",
      langCode: "as",
      label: "Assamese Voice Sample",
    },
    culturalAnchors: [
      { title: "Kaziranga Wildlife", detail: "One-horned rhinos grazing in morning grassland mist", icon: Shield },
      { title: "Majuli River Island", detail: "Centuries-old Vaishnavite Satras & sacred mask craftsmanship", icon: Landmark },
      { title: "Bihu Folk Rhythms", detail: "Dhol beats, pepa horns & spring harvest joy", icon: Music },
      { title: "CTC Morning Garden Tea", detail: "Aromatic veranda tea ritual with fresh Assam leaves", icon: Coffee },
    ],
    games: [
      { title: "Assam Tea Leaf Harvest", domain: "Visual Attention & Search", path: "/patient/games/tea-harvest" },
      { title: "Brahmaputra Boat Crossing", domain: "3D Spatial Kinematics", path: "/patient/games/brahmaputra-boat" },
      { title: "Majuli Pottery Craft", domain: "Tactile Motor Praxis", path: "/patient/games/majuli-pottery" },
      { title: "Bihu Drum Rhythm", domain: "Auditory-Motor Entrainment", path: "/patient/games/drum" },
    ],
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    nativeName: "Abode of Clouds",
    tagline: "Sacred Khasi Groves & Living Bio-Engineering Marvels",
    languages: ["Khasi (Ka Ktien)", "Garo (A·chik)", "English"],
    icon: CloudRain,
    soundType: "rain",
    voiceGreeting: {
      text: "Khublei shibun! Welcome to the sacred rain-kissed hills of Meghalaya.",
      langCode: "en",
      label: "Khasi / English Voice",
    },
    culturalAnchors: [
      { title: "Living Root Bridges", detail: "Centuries-old Ficus roots woven across crystal forest streams", icon: TreePine },
      { title: "Mawlynnong Pathways", detail: "Cleanest stone footpaths & bamboo walking trails", icon: Compass },
      { title: "Pine-Scented Shillong", detail: "Crisp highland mountain breezes and drifting cloud mist", icon: Mountain },
      { title: "Sacred Forest Groves", detail: "Preserved Law Kyntang woodlands with ancient medicinal lore", icon: Shield },
    ],
    games: [
      { title: "Living Root Bridge Logic", domain: "Spatial Navigation & Planning", path: "/patient/games/root-bridge" },
      { title: "Cloud Valley Wayfinding", domain: "Topographic Orientation", path: "/patient/games/wayfinding" },
      { title: "Sacred Grove Butterfly Perch", domain: "Hand Stabilization Praxis", path: "/patient/games/butterfly-sanctuary" },
    ],
  },
  {
    id: "manipur",
    name: "Manipur",
    nativeName: "মৈতৈলোন্",
    tagline: "Jeweled Land of Floating Phumdis & Classical Raas",
    languages: ["Manipuri (Meeteilon)", "Hindi", "English"],
    icon: Sparkles,
    soundType: "flute",
    voiceGreeting: {
      text: "Khurumjari! Loktak lake welcomes you with peaceful rhythms and memories.",
      langCode: "en",
      label: "Manipuri Voice",
    },
    culturalAnchors: [
      { title: "Loktak Lake Phumdis", detail: "Unique circular floating biomass islands on tranquil waters", icon: Waves },
      { title: "Sangai Dancing Deer", detail: "Keibul Lamjao national sanctuary & graceful heritage", icon: Feather },
      { title: "Classical Manipuri Raas", detail: "Gentle bamboo flutes, devotional song & rhythmic bells", icon: Music },
      { title: "Kangla Fort Legacy", detail: "Ancient royal capital and sacred stone dragon symbols", icon: Landmark },
    ],
    games: [
      { title: "Loktak Lake Crossing", domain: "Visuospatial Navigation", path: "/patient/games/wayfinding" },
      { title: "Traditional Loom Weaving", domain: "3D Constructional Praxis", path: "/patient/games/loom" },
      { title: "Heritage Kitchen Cooking", domain: "Executive Recipe Sequencing", path: "/patient/games/heritage-kitchen" },
    ],
  },
  {
    id: "mizoram",
    name: "Mizoram",
    nativeName: "Mizo ṭawng",
    tagline: "Land of Rolling Hills, Bamboo Grooves & Cheraw Dance",
    languages: ["Mizo (Lushai)", "English"],
    icon: BambooShootIcon,
    soundType: "flute",
    voiceGreeting: {
      text: "Chibai! Let us enjoy the peaceful breeze of the rolling blue hills.",
      langCode: "en",
      label: "Mizo Voice",
    },
    culturalAnchors: [
      { title: "Cheraw Bamboo Dance", detail: "Synchronized tapping poles and joyous harvest footwork", icon: Music },
      { title: "Vibrant Puan Weaves", detail: "Intricate red, white and black geometric loom tapestries", icon: Flower2 },
      { title: "Phawngpui Blue Mountain", detail: "Highland rhododendrons and panoramic sea of clouds", icon: Mountain },
      { title: "Zawlbuk Community Bond", detail: "Communal fireside storytelling and generational warmth", icon: Landmark },
    ],
    games: [
      { title: "Cheraw Bamboo Rhythms", domain: "Kinesthetic Tempo Matching", path: "/patient/games/rhythm-hills" },
      { title: "Blue Mountain Village Route", domain: "Spatial Wayfinding", path: "/patient/games/wayfinding" },
      { title: "Daily Village Care Routine", domain: "Prospective Memory Recall", path: "/patient/games/daily-routine" },
    ],
  },
  {
    id: "nagaland",
    name: "Nagaland",
    nativeName: "Tenyidie / Ao",
    tagline: "Land of Festivals, Great Hornbill & Living Tapestries",
    languages: ["Nagamese", "Ao", "Angami", "English"],
    icon: Feather,
    soundType: "birds",
    voiceGreeting: {
      text: "Welcome to the land of Hornbill, vibrant hills, and brave heritage.",
      langCode: "en",
      label: "Nagamese Voice",
    },
    culturalAnchors: [
      { title: "Hornbill at Kisama", detail: "Grand tribal unity, log drum reverberations & vibrant attire", icon: Feather },
      { title: "Traditional Beadwork", detail: "Carnelian, glass beads and ancestral heirloom patterns", icon: Sparkles },
      { title: "Dzukou Valley Lilies", detail: "Rare endemic lilies blooming across rolling green ridges", icon: Flower2 },
      { title: "Stone Monolith Pillars", detail: "Ancient village memorial monoliths guarding mountain trails", icon: Landmark },
    ],
    games: [
      { title: "Hornbill Flight Navigation", domain: "Visuomotor Glider Physics", path: "/patient/games/hornbill-flight" },
      { title: "Dzukou Flora Discrimination", domain: "Botanical Visual Search", path: "/patient/games/dzukou-botanist" },
      { title: "Tribal Tapestry Puzzles", domain: "Visuospatial Assembly", path: "/patient/games/jigsaw" },
    ],
  },
  {
    id: "tripura",
    name: "Tripura",
    nativeName: "ত্রিপুরা",
    tagline: "Royal Water Palaces & Sacred Rock Colossi",
    languages: ["Bengali (বাংলা)", "Kokborok (ককবরক)", "English"],
    icon: Landmark,
    soundType: "river",
    voiceGreeting: {
      text: "নমস্কার! ত্রিপুরার শান্ত নীরমহল প্রাসাদে আপনাকে স্বাগত।",
      langCode: "bn",
      label: "Bengali / Kokborok Voice",
    },
    culturalAnchors: [
      { title: "Neermahal Water Palace", detail: "Floating palace reflecting on Rudrasagar lake at dusk", icon: Waves },
      { title: "Unakoti Rock Sculptures", detail: "Ancient rock-carved colossi hidden in lush green jungle", icon: Mountain },
      { title: "Ujjayanta White Palace", detail: "Grand tiled courtyards, fountain gardens and royal legacy", icon: Landmark },
      { title: "Bamboo Craftsmanship", detail: "Intricate handwoven cane partitions & delicate basketry", icon: Compass },
    ],
    games: [
      { title: "Neermahal Palace Reflection", domain: "Visual Symmetry & Air-Canvas", path: "/patient/games/alpana" },
      { title: "Unakoti Heritage Jigsaw", domain: "Episodic Face & Detail Recall", path: "/patient/games/jigsaw" },
      { title: "Bazaar Market Memory", domain: "IADL Everyday Math & Categorization", path: "/patient/games/bazaar-buddies" },
    ],
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    nativeName: "Dawn-Lit Land",
    tagline: "Sacred Monasteries & Orchid-Draped Highland Valleys",
    languages: ["Monpa", "Nyishi", "Hindi (हिन्दी)", "English"],
    icon: Mountain,
    soundType: "namghar",
    voiceGreeting: {
      text: "Tashi Delek! Welcome to the peaceful dawn-lit mountains of Arunachal.",
      langCode: "en",
      label: "Monpa / Hindi Voice",
    },
    culturalAnchors: [
      { title: "Tawang Sacred Monastery", detail: "Golden Buddha, chanting monks and ancient parchment texts", icon: Landmark },
      { title: "Spinning Prayer Wheels", detail: "Polished brass cylinders spun with mindful, calming breath", icon: Sparkles },
      { title: "Sessa Orchid Sanctuary", detail: "Over 500 species of vivid mountain orchids in bloom", icon: Flower2 },
      { title: "Namdapha Cloud Forests", detail: "Misty virgin canopies and peaceful mountain wildlife", icon: TreePine },
    ],
    games: [
      { title: "Tawang Monastery Bells", domain: "Auditory Working Memory Span", path: "/patient/games/monastery-bell" },
      { title: "Sessa Orchid Discrimination", domain: "Color & Shape Feature Match", path: "/patient/games/dzukou-botanist" },
      { title: "Sacred Wheel Kinematics", domain: "Visuomotor Smooth Pursuit", path: "/patient/games/lotus-painter" },
    ],
  },
  {
    id: "sikkim",
    name: "Sikkim",
    nativeName: "नेपाली / Denzong",
    tagline: "Valley of Rice & Guardian Peak of Kanchenjunga",
    languages: ["Nepali (नेपाली)", "Bhutia", "Lepcha", "English"],
    icon: Flower2,
    soundType: "namghar",
    voiceGreeting: {
      text: "नमस्ते! कञ्चनजङ्घाको शान्त हिमालमा यहाँलाई स्वागत छ।",
      langCode: "ne",
      label: "Nepali / Bhutia Voice",
    },
    culturalAnchors: [
      { title: "Kanchenjunga Sunrise", detail: "Third-highest sacred peak glowing in early morning amber rays", icon: Mountain },
      { title: "Rumtek Chime Harmonics", detail: "Harmonic brass chimes resounding through monastery corridors", icon: Music },
      { title: "Red Panda Rhododendrons", detail: "Gentle mountain wildlife sheltered in alpine flower forests", icon: TreePine },
      { title: "Temi Highland Tea Slopes", detail: "Organic green terraced tea gardens cascading down ridges", icon: Coffee },
    ],
    games: [
      { title: "Kanchenjunga Trail Wayfinding", domain: "Topographic Spatial Orientation", path: "/patient/games/wayfinding" },
      { title: "Rumtek Harmonic Chimes", domain: "Auditory Frequency Processing", path: "/patient/games/monastery-bell" },
      { title: "Alpine Flora Search", domain: "Visual Attention & Target Search", path: "/patient/games/dzukou-botanist" },
    ],
  },
];

export function RegionalStatesHub() {
  const [selectedStateId, setSelectedStateId] = useState<string>("assam");
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentState = NER_STATES.find((s) => s.id === selectedStateId) || NER_STATES[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopCapsuleSoundscape();
      stopSpeaking();
    };
  }, []);

  const handleSelectState = (id: string) => {
    playTapFeedback();
    setSelectedStateId(id);

    const targetState = NER_STATES.find((s) => s.id === id);
    if (soundPlaying && targetState) {
      playCapsuleSoundscape(targetState.soundType, 0.35);
    }
  };

  const handleToggleSoundscape = () => {
    unlockAudio();
    if (soundPlaying) {
      stopCapsuleSoundscape();
      setSoundPlaying(false);
    } else {
      playCapsuleSoundscape(currentState.soundType, 0.35);
      setSoundPlaying(true);
    }
  };

  const handleSpeakGreeting = () => {
    unlockAudio();
    setIsSpeaking(true);
    speak(currentState.voiceGreeting.text, currentState.voiceGreeting.langCode, 0.85);
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  return (
    <section className="w-full rounded-3xl border-3 border-black bg-surface p-5 md:p-7 shadow-[6px_6px_0px_#000]">
      {/* Header — Clean, Authoritative, Clutter-Free */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black/15 pb-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-black text-ink tracking-tight">
            Culturally Grounded Cognitive Therapeutics
          </h2>
          <p className="text-xs md:text-sm font-semibold text-ink-secondary mt-1 max-w-2xl leading-relaxed">
            Clinically calibrated therapeutic gaming, nostalgic soundscapes, and native-dialect voice assistance tailored for elderly dementia care across all 8 North Eastern states.
          </p>
        </div>

        <Link
          href="/patient/games"
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs md:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark transition-all shrink-0 cursor-pointer"
        >
          <Gamepad2 className="h-4 w-4" />
          <span>Explore All 40+ Games</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 8 State Selector Tabs — High-Contrast Balanced Grid without Text Truncation */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
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
              className={`btn-tactile flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[106px] sm:min-h-[114px] text-center ${
                isSelected
                  ? "border-black bg-tea text-white shadow-[3px_3px_0px_#000] scale-[1.01]"
                  : "border-black/20 bg-white hover:border-black hover:bg-amber-50/70 text-ink shadow-xs"
              }`}
            >
              <div
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected
                    ? "border-white/30 bg-white/20 text-white"
                    : "border-black/10 bg-amber-50/80 text-tea"
                }`}
              >
                <StateIcon className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[2.3]" />
              </div>
              <span className="text-sm sm:text-base font-black leading-tight text-current w-full px-1">
                {st.name}
              </span>
              <span
                className={`text-xs sm:text-sm font-bold leading-tight mt-1 w-full px-1 ${
                  isSelected ? "text-amber-300 font-black" : "text-ink-secondary"
                }`}
              >
                {st.nativeName}
              </span>
              <span
                className={`h-2 w-2 rounded-full mt-1.5 transition-all ${
                  isSelected ? "bg-amber-400 opacity-100 shadow-xs" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Selected State Showcase Hero Card */}
      <div className="mt-5 rounded-2xl border-3 border-black bg-gradient-to-br from-[#FAF6F0] via-white to-amber-50/40 p-5 md:p-6 shadow-[4px_4px_0px_#000] relative overflow-hidden">
        {/* Top Hero Bar with State Identity and Audio Immersion Tools */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/10 pb-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2 border-black bg-tea/15 text-tea flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              <currentState.icon className="h-7 w-7 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-2xl md:text-3xl text-ink">
                  {currentState.name}
                </h3>
                <span className="px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-sm font-black">
                  {currentState.nativeName}
                </span>
              </div>
              <p className="text-sm md:text-base font-bold text-ink-secondary mt-1">
                {currentState.tagline}
              </p>
            </div>
          </div>

          {/* Interactive Sensory Preview Audio Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSoundscape}
              className={`btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                soundPlaying
                  ? "bg-emerald-700 text-white animate-pulse"
                  : "bg-white text-ink hover:bg-emerald-50"
              }`}
              title="Listen to procedural regional ambient soundscape"
            >
              <Volume2 className={`h-4.5 w-4.5 ${soundPlaying ? "text-amber-300" : "text-tea"}`} />
              <span>
                {soundPlaying
                  ? "Playing Ambience (Tap to Mute)"
                  : `Listen ${currentState.soundType === "namghar" ? "Namghar Bells" : currentState.soundType === "river" ? "River Stream" : currentState.soundType === "birds" ? "Forest Birds" : "Ambience"}`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSpeakGreeting}
              disabled={isSpeaking}
              className="btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 px-4 py-2.5 text-xs sm:text-sm font-black text-ink transition-all cursor-pointer shadow-[2px_2px_0px_#000] disabled:opacity-50"
              title="Hear text-to-speech greeting in regional dialect"
            >
              <Mic className={`h-4.5 w-4.5 text-amber-900 ${isSpeaking ? "animate-spin" : ""}`} />
              <span>{isSpeaking ? "Speaking Greeting..." : currentState.voiceGreeting.label}</span>
            </button>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 Cols): Dialects & Cultural Memory Anchors */}
          <div className="lg:col-span-7 space-y-4">
            {/* Native Dialects Available */}
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-secondary block mb-2">
                Voice-Assisted in Native Dialects
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {currentState.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3.5 py-1.5 rounded-xl bg-surface border-2 border-black/20 text-xs sm:text-sm font-black text-ink shadow-2xs"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Cultural Memory Anchors 2x2 Grid */}
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-tea-dark flex items-center gap-2 mb-2.5">
                <MapPin className="h-4 w-4 text-tea shrink-0" />
                <span>Regional Memory Anchors (Sensory Reminiscence Triggers)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentState.culturalAnchors.map((anchor) => {
                  const AnchorIcon = anchor.icon;
                  return (
                    <div
                      key={anchor.title}
                      className="rounded-2xl border-2 border-black/15 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-black transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="h-8 w-8 rounded-xl bg-tea/10 text-tea flex items-center justify-center shrink-0 border border-tea/20">
                          <AnchorIcon className="h-4.5 w-4.5" />
                        </div>
                        <h4 className="font-serif text-sm sm:text-base font-black text-ink leading-snug">
                          {anchor.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-ink-secondary leading-relaxed mt-0.5">
                        {anchor.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Grounding Note */}
            <div className="rounded-xl border-2 border-tea/30 bg-tea-light/60 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-tea-dark">
              <CheckCircle2 className="h-4.5 w-4.5 text-tea shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                <strong>Neurocognitive Basis:</strong> Familiar regional landscapes and sensory anchors unlock preserved episodic memories in the medial prefrontal cortex, reducing dementia agitation and sundowning confusion.
              </p>
            </div>
          </div>

          {/* Right Column (5 Cols): Regional Serious Games */}
          <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5 mb-3">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Regional Serious Games</span>
                </span>
                <span className="text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-md px-2.5 py-0.5">
                  {currentState.games.length} Modules
                </span>
              </div>

              <div className="space-y-2.5">
                {currentState.games.map((g) => (
                  <Link
                    key={g.title}
                    href={g.path}
                    className="block p-3 rounded-xl bg-[#FAF6F0] hover:bg-tea-light/70 border-2 border-black/15 hover:border-black transition-all group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-sm sm:text-base font-black text-ink group-hover:text-tea leading-snug">
                          {g.title}
                        </h5>
                        <span className="inline-block mt-1 text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 rounded px-2.5 py-0.5">
                          {g.domain}
                        </span>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-white border border-black/20 flex items-center justify-center text-tea group-hover:bg-tea group-hover:text-white transition-colors shrink-0 shadow-2xs">
                        <PlayCircle className="h-4.5 w-4.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs sm:text-sm font-bold text-ink-secondary">
              <span>100% Offline Capable</span>
              <Link href="/patient/games" className="text-tea font-black hover:underline flex items-center gap-1">
                <span>View Full Library</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
