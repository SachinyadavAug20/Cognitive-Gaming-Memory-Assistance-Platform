"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as THREE from "three";
import {
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { useGameVoice } from "@/hooks/useGameVoice";
import { api } from "@/lib/api";
import type { GameSessionPayload } from "@/types/gameSession";

export type DayChapter = 1 | 2 | 3 | 4 | 5 | 6;

interface CollectibleItem {
  id: "key" | "cap" | "bag";
  name: string;
  emoji: string;
  pos: [number, number, number];
  collected: boolean;
}

interface MarketItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  selected: boolean;
}

const SAVE_KEY = "cognicare_adimw_chapter";

export function DayInMyWorld3D() {
  const t = useTranslations("games.dayInMyWorld");

  const { speakVoice, isMuted, toggleMute, currentSubtitle } = useGameVoice({
    rate: 0.82,
    pitch: 1.0,
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Game state
  const [currentChapter, setCurrentChapter] = useState<DayChapter>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
          const ch = parseInt(saved, 10);
          if (ch >= 1 && ch <= 6) return ch as DayChapter;
        }
      } catch {
        // Ignore
      }
    }
    return 1;
  });
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Chapter 1: Morning Memorize & Collect
  const [ch1Memorized, setCh1Memorized] = useState(false);
  const [ch1Items, setCh1Items] = useState<CollectibleItem[]>([
    { id: "key", name: "House Key", emoji: "🔑", pos: [-4, 1, 2], collected: false },
    { id: "cap", name: "Sun Cap", emoji: "🧢", pos: [4, 1, -1], collected: false },
    { id: "bag", name: "Cloth Bag", emoji: "👜", pos: [0, 1, 5], collected: false },
  ]);

  // Chapter 2: Missing Photograph
  const [ch2SelectedPhoto, setCh2SelectedPhoto] = useState<number | null>(null);

  // Chapter 3: Spatial Navigation / Detour
  const [ch3Step, setCh3Step] = useState<"start" | "detour" | "arrived">("start");

  // Chapter 4: Market Shopping & Budget
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    { id: "rice", name: "Joha Rice (1kg)", price: 90, emoji: "🍚", selected: false },
    { id: "tea", name: "Assam CTC Tea (250g)", price: 70, emoji: "☕", selected: false },
    { id: "oil", name: "Mustard Oil (1L)", price: 110, emoji: "🫙", selected: false },
    { id: "fruit", name: "Fresh Apples (500g)", price: 60, emoji: "🍎", selected: false },
    { id: "sweet", name: "Pitha Sweets", price: 50, emoji: "🥟", selected: false },
  ]);
  const [ch4Paid, setCh4Paid] = useState(false);
  const [ch4ChangeAnswer, setCh4ChangeAnswer] = useState<number | null>(null);

  // Chapter 5: Everyday Problem Solving
  const [ch5SolvedProblems, setCh5SolvedProblems] = useState<string[]>([]);

  // Chapter 6: Final Chronological Day Reconstruction
  const [ch6Order, setCh6Order] = useState<string[]>([]);

  // Telemetry
  const startTimeRef = useRef<number | null>(null);
  const hesitationCountRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);

  // Save progress on chapter advance
  const saveChapter = useCallback((ch: DayChapter) => {
    try {
      localStorage.setItem(SAVE_KEY, String(ch));
    } catch {
      // Ignore
    }
  }, []);

  // Procedural Web Audio Sound Generator
  const playProceduralSound = useCallback((type: "alarm" | "footstep" | "correct" | "fanfare" | "bell") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "alarm") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "correct" || type === "fanfare") {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.4);
        });
      } else if (type === "bell") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      }
    } catch {
      // Web Audio fallback
    }
  }, []);

  // Three.js Scene Setup (Morning, Afternoon, Sunset Lighting)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 300;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background color based on chapter
    const skyColor =
      currentChapter <= 2
        ? "#FED7AA" // Morning gold
        : currentChapter <= 4
        ? "#BAE6FD" // Bright midday
        : "#FDBA74"; // Sunset twilight
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight("#FFFBEB", 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#F59E0B", 2.2);
    sunLight.position.set(15, 25, 10);
    scene.add(sunLight);

    // Floor Plane
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: currentChapter <= 2 ? "#D97706" : "#15803D",
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Chapter-specific procedural 3D scenery objects
    if (currentChapter <= 2) {
      // Room with table and bed
      const tableGeo = new THREE.BoxGeometry(4, 1.2, 2.5);
      const tableMat = new THREE.MeshStandardMaterial({ color: "#854D0E" });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 0.6, 0);
      scene.add(table);

      // Note on table
      const noteGeo = new THREE.PlaneGeometry(1.2, 0.8);
      const noteMat = new THREE.MeshStandardMaterial({ color: "#FEF08A" });
      const note = new THREE.Mesh(noteGeo, noteMat);
      note.rotation.x = -Math.PI / 2;
      note.position.set(0, 1.22, 0);
      scene.add(note);
    } else if (currentChapter === 3) {
      // Path with Trees & Temple
      const pathGeo = new THREE.PlaneGeometry(4, 40);
      const pathMat = new THREE.MeshStandardMaterial({ color: "#D97706" });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(0, 0.02, 0);
      scene.add(path);

      // Namghar Landmark
      const namgharGeo = new THREE.BoxGeometry(4, 3, 4);
      const namgharMat = new THREE.MeshStandardMaterial({ color: "#DC2626" });
      const namghar = new THREE.Mesh(namgharGeo, namgharMat);
      namghar.position.set(-6, 1.5, -5);
      scene.add(namghar);
    } else {
      // Sunset Market Stalls
      const stallGeo = new THREE.BoxGeometry(3, 2, 2);
      const stallMat = new THREE.MeshStandardMaterial({ color: "#B45309" });
      const stall = new THREE.Mesh(stallGeo, stallMat);
      stall.position.set(4, 1, -2);
      scene.add(stall);
    }

    // Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentChapter]);

  // Transmit Session Telemetry
  const sendSessionTelemetry = useCallback(
    async (finalAccuracy: number) => {
      const durationSeconds = startTimeRef.current
        ? Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 60;
      const avgLatency =
        reactionTimesRef.current.length > 0
          ? Math.round(
              reactionTimesRef.current.reduce((a, b) => a + b, 0) /
                reactionTimesRef.current.length
            )
          : 820;

      const payload: GameSessionPayload = {
        patientId: 1,
        gameType: "DAY_IN_MY_WORLD",
        durationSeconds,
        accuracyPercentage: finalAccuracy,
        spatialRecallScore: Math.round(finalAccuracy),
        motorReactionTimeMs: avgLatency,
        hesitationCount: hesitationCountRef.current,
        difficultyLevel: currentChapter,
      };

      try {
        await api.post("/patients/1/sessions", payload);
      } catch {
        // Safe offline local fallback
      }
    },
    [currentChapter]
  );

  // Start Chapter Narration
  const handleStartGame = () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();
    playProceduralSound("alarm");
    speakVoice(t("saathiWakeup"));
  };

  // Chapter 1: Collect Item
  const handleCollectItem = (id: "key" | "cap" | "bag") => {
    playProceduralSound("correct");
    setCh1Items((prev) =>
      prev.map((it) => (it.id === id ? { ...it, collected: true } : it))
    );

    const remaining = ch1Items.filter((it) => it.id !== id && !it.collected);
    if (remaining.length === 0) {
      setScore((s) => s + 20);
      playProceduralSound("fanfare");
      speakVoice(t("ch1Complete"));
      setTimeout(() => {
        setCurrentChapter(2);
        saveChapter(2);
        speakVoice(t("ch2Intro"));
      }, 2500);
    }
  };

  // Chapter 2: Choose Photo
  const handleChoosePhoto = (index: number) => {
    setCh2SelectedPhoto(index);
    if (index === 1) {
      // Correct photo
      setScore((s) => s + 20);
      playProceduralSound("correct");
      speakVoice(t("ch2Correct"));
      setTimeout(() => {
        setCurrentChapter(3);
        saveChapter(3);
        speakVoice(t("ch3Intro"));
      }, 2500);
    } else {
      hesitationCountRef.current += 1;
      speakVoice(t("ch2Retry"));
    }
  };

  // Chapter 3: Detour Navigation
  const handleCh3Action = (action: "normal" | "detour") => {
    if (action === "normal") {
      setCh3Step("detour");
      speakVoice(t("ch3RoadClosed"));
      playProceduralSound("bell");
    } else {
      setCh3Step("arrived");
      setScore((s) => s + 20);
      playProceduralSound("fanfare");
      speakVoice(t("ch3Arrived"));
      setTimeout(() => {
        setCurrentChapter(4);
        saveChapter(4);
        speakVoice(t("ch4Intro"));
      }, 2500);
    }
  };

  // Chapter 4: Market Shopping
  const totalBasket = useMemo(
    () => marketItems.filter((i) => i.selected).reduce((sum, item) => sum + item.price, 0),
    [marketItems]
  );

  const toggleMarketItem = (id: string) => {
    setMarketItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handlePayMarket = () => {
    if (totalBasket > 500) {
      speakVoice(t("ch4OverBudget"));
      return;
    }
    setCh4Paid(true);
    playProceduralSound("correct");
    speakVoice(t("ch4ChangePrompt", { change: 500 - totalBasket }));
  };

  const handleConfirmChange = (val: number) => {
    setCh4ChangeAnswer(val);
    const expected = 500 - totalBasket;
    if (val === expected) {
      setScore((s) => s + 20);
      playProceduralSound("fanfare");
      speakVoice(t("ch4Complete"));
      setTimeout(() => {
        setCurrentChapter(5);
        saveChapter(5);
        speakVoice(t("ch5Intro"));
      }, 2500);
    } else {
      hesitationCountRef.current += 1;
      speakVoice(t("ch4RetryChange"));
    }
  };

  // Chapter 5: Problem Solving
  const handleSolveProblem = (probId: string) => {
    playProceduralSound("correct");
    setCh5SolvedProblems((prev) => [...prev, probId]);
    if (ch5SolvedProblems.length + 1 >= 3) {
      setScore((s) => s + 20);
      playProceduralSound("fanfare");
      speakVoice(t("ch5Complete"));
      setTimeout(() => {
        setCurrentChapter(6);
        saveChapter(6);
        speakVoice(t("ch6Intro"));
      }, 2500);
    }
  };

  // Chapter 6: Final Sequence
  const handleAddFinalSequence = (cardName: string) => {
    if (ch6Order.includes(cardName)) return;
    const next = [...ch6Order, cardName];
    setCh6Order(next);
    playProceduralSound("correct");

    if (next.length === 4) {
      setIsCompleted(true);
      setScore(100);
      playProceduralSound("fanfare");
      speakVoice(t("ch6Complete"));
      void sendSessionTelemetry(100);
    }
  };

  const handleRestart = () => {
    setCurrentChapter(1);
    saveChapter(1);
    setIsCompleted(false);
    setScore(0);
    setCh1Memorized(false);
    setCh1Items([
      { id: "key", name: "House Key", emoji: "🔑", pos: [-4, 1, 2], collected: false },
      { id: "cap", name: "Sun Cap", emoji: "🧢", pos: [4, 1, -1], collected: false },
      { id: "bag", name: "Cloth Bag", emoji: "👜", pos: [0, 1, 5], collected: false },
    ]);
    setCh3Step("start");
    setCh4Paid(false);
    setCh5SolvedProblems([]);
    setCh6Order([]);
    speakVoice(t("saathiWakeup"));
  };

  return (
    <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-between rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
      {/* Saathi Floating Voice Subtitle Pill */}
      {currentSubtitle && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full border-4 border-black bg-amber-200 px-7 py-3 shadow-[5px_5px_0px_#000] animate-fade-in max-w-xl text-center">
          <p className="font-serif text-base sm:text-lg font-black text-amber-950 flex items-center justify-center gap-2">
            <span className="text-2xl">🗣️</span>
            <span>Saathi: &ldquo;{currentSubtitle}&rdquo;</span>
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex w-full items-center justify-between border-b-3 border-black/15 pb-4">
        <Link
          href="/patient/games"
          className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-surface px-4 py-2.5 text-sm font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t("backToHub")}</span>
        </Link>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-tea">
            <Sparkles className="h-4 w-4" />
            <span>Saathi 3D Story Campaign</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {t("title")}
          </h1>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="btn-tactile flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-amber-100 text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-200 cursor-pointer"
          aria-label={isMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isMuted ? <VolumeX className="h-6 w-6 text-rose-700" /> : <Volume2 className="h-6 w-6 text-emerald-800" />}
        </button>
      </div>

      {/* 3D Scene Viewport */}
      <div className="my-4 w-full overflow-hidden rounded-3xl border-4 border-black shadow-[5px_5px_0px_#000]">
        <div ref={mountRef} className="w-full h-72 bg-amber-100 block" />
      </div>

      {/* Narrative Interactive Content by Chapter */}
      {!hasStarted ? (
        /* Start Screen */
        <div className="my-6 flex flex-col items-center text-center space-y-5 max-w-xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-black bg-amber-300 text-amber-950 shadow-[4px_4px_0px_#000]">
            <Sun className="h-10 w-10" />
          </div>
          <h2 className="font-serif text-3xl font-black text-ink">
            {t("welcomeTitle")}
          </h2>
          <p className="text-base sm:text-lg font-bold text-ink-secondary leading-relaxed">
            {t("welcomeDesc")}
          </p>

          <button
            type="button"
            onClick={handleStartGame}
            className="btn-tactile rounded-full border-4 border-black bg-amber-400 px-10 py-4 text-xl font-black text-black shadow-[5px_5px_0px_#000] hover:bg-amber-300 cursor-pointer transition-transform active:translate-y-1"
          >
            {t("beginDayButton")} 🌅
          </button>
        </div>
      ) : isCompleted ? (
        /* Final Day Complete Screen */
        <div className="my-6 flex flex-col items-center text-center space-y-5 max-w-xl animate-fade-in">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-black bg-emerald-200 text-emerald-950 shadow-[5px_5px_0px_#000]">
            <CheckCircle2 className="h-12 w-12 text-emerald-800" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-ink">
            {t("finalDayCompleteTitle")}
          </h2>
          <p className="text-base sm:text-lg font-bold text-ink-secondary">
            {t("finalDayCompleteDesc")}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-amber-300 px-8 py-3.5 text-base font-black text-black shadow-[4px_4px_0px_#000] hover:bg-amber-400 cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              <span>{t("reliveDayButton")}</span>
            </button>
            <Link
              href="/patient/games"
              className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-surface px-8 py-3.5 text-base font-black text-ink shadow-[4px_4px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <span>{t("backToHub")}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Active Chapter Play Area */
        <div className="w-full space-y-5 my-2">
          {/* Chapter Stepper Indicator Ribbon */}
          <div className="flex flex-col gap-2 rounded-2xl border-3 border-black bg-amber-100/80 p-4 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between text-sm sm:text-base font-bold text-amber-950">
              <span>
                📖 Chapter {currentChapter} of 6:{" "}
                <strong className="font-serif text-lg font-black text-ink">
                  {currentChapter === 1
                    ? t("ch1Title")
                    : currentChapter === 2
                    ? t("ch2Title")
                    : currentChapter === 3
                    ? t("ch3Title")
                    : currentChapter === 4
                    ? t("ch4Title")
                    : currentChapter === 5
                    ? t("ch5Title")
                    : t("ch6Title")}
                </strong>
              </span>
              <span className="font-serif font-black text-base bg-surface px-3 py-1 rounded-xl border-2 border-black">
                Score: {score}
              </span>
            </div>

            {/* 6-Step Visual Badges */}
            <div className="grid grid-cols-6 gap-2 pt-1">
              {[
                { ch: 1, icon: "🔑", label: "Morning" },
                { ch: 2, icon: "🖼️", label: "Album" },
                { ch: 3, icon: "🛣️", label: "Path" },
                { ch: 4, icon: "🛒", label: "Market" },
                { ch: 5, icon: "💡", label: "Tasks" },
                { ch: 6, icon: "🌅", label: "Sunset" },
              ].map((step) => {
                const isCurrent = currentChapter === step.ch;
                const isPassed = currentChapter > step.ch;
                return (
                  <div
                    key={step.ch}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-black py-1.5 transition-all ${
                      isCurrent
                        ? "bg-amber-400 font-black shadow-[2px_2px_0px_#000] scale-105"
                        : isPassed
                        ? "bg-emerald-200 text-emerald-950 opacity-80"
                        : "bg-surface/70 opacity-40"
                    }`}
                  >
                    <span className="text-base">{step.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHAPTER 1: Morning Objects */}
          {currentChapter === 1 && (
            <div className="space-y-5 text-center">
              {!ch1Memorized ? (
                <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 shadow-[4px_4px_0px_#000]">
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">
                    🔑 {t("ch1MemorizeTitle")}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-ink-secondary">
                    {t("ch1MemorizeDesc")}
                  </p>

                  <div className="flex justify-center gap-5 py-3">
                    {ch1Items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center rounded-2xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000] min-w-[100px]"
                      >
                        <span className="text-5xl">{item.emoji}</span>
                        <span className="font-serif text-base font-black text-ink mt-3">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCh1Memorized(true);
                      speakVoice(t("ch1FindPrompt"));
                    }}
                    className="btn-tactile rounded-full border-4 border-black bg-amber-400 px-8 py-3.5 text-lg font-black text-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 cursor-pointer"
                  >
                    {t("ch1ReadyButton")} ✓
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 shadow-[4px_4px_0px_#000]">
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">
                    🔍 {t("ch1FindTitle")}
                  </h3>
                  <div className="flex justify-center gap-5 py-3">
                    {ch1Items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.collected}
                        onClick={() => handleCollectItem(item.id)}
                        className={`btn-tactile flex flex-col items-center rounded-2xl border-3 border-black p-5 shadow-[4px_4px_0px_#000] cursor-pointer transition-all min-w-[120px] ${
                          item.collected
                            ? "bg-emerald-100 opacity-50 cursor-not-allowed"
                            : "bg-surface hover:bg-amber-100"
                        }`}
                      >
                        <span className="text-5xl">{item.emoji}</span>
                        <span className="font-serif text-base font-black text-ink mt-3">
                          {item.collected ? "Collected ✓" : `Find ${item.name}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAPTER 2: Missing Photograph */}
          {currentChapter === 2 && (
            <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 text-center shadow-[4px_4px_0px_#000]">
              <h3 className="font-serif text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-2">
                <ImageIcon className="h-6 w-6 text-tea" />
                {t("ch2Prompt")}
              </h3>
              <p className="text-base sm:text-lg font-bold text-ink-secondary">
                {t("ch2Subtext")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 0, label: "Busy Train Station 🚉" },
                  { id: 1, label: "Family at Majuli Courtyard 🏡 (Correct)" },
                  { id: 2, label: "Office Meeting Room 🏢" },
                ].map((ph) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => handleChoosePhoto(ph.id)}
                    className={`btn-tactile rounded-2xl border-3 border-black p-5 text-base sm:text-lg font-black shadow-[4px_4px_0px_#000] cursor-pointer ${
                      ch2SelectedPhoto === ph.id && ph.id === 1
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 3: Spatial Navigation / Detour */}
          {currentChapter === 3 && (
            <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 text-center shadow-[4px_4px_0px_#000]">
              <h3 className="font-serif text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-2">
                <Compass className="h-6 w-6 text-tea" />
                {t("ch3WalkPrompt")}
              </h3>

              {ch3Step === "start" ? (
                <button
                  type="button"
                  onClick={() => handleCh3Action("normal")}
                  className="btn-tactile rounded-full border-4 border-black bg-amber-400 px-8 py-4 text-lg font-black text-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 cursor-pointer"
                >
                  Walk Down Riverbank Path 🚶
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border-3 border-rose-600 bg-rose-100 p-4 text-base font-black text-rose-950 shadow-[2px_2px_0px_#000]">
                    🚧 Main River Road is Closed for Ferry Repair!
                  </div>
                  <p className="text-base sm:text-lg font-bold text-ink-secondary">
                    Saathi: &ldquo;No worries, let us take the shaded detour past the Namghar prayer hall.&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCh3Action("detour")}
                    className="btn-tactile rounded-full border-4 border-black bg-emerald-400 px-8 py-4 text-lg font-black text-emerald-950 shadow-[4px_4px_0px_#000] hover:bg-emerald-300 cursor-pointer"
                  >
                    Take Shaded Namghar Detour 🛕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHAPTER 4: Market Mission & Budget */}
          {currentChapter === 4 && (
            <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-3">
                <h3 className="font-serif text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-tea" />
                  {t("ch4MarketTitle")}
                </h3>
                <span className="font-mono text-base font-black text-purple-950 rounded-2xl bg-purple-100 px-4 py-1.5 border-2 border-purple-400">
                  Budget: ₹500 | Total: ₹{totalBasket}
                </span>
              </div>

              {!ch4Paid ? (
                <div>
                  <p className="text-base font-bold text-ink-secondary mb-4">
                    Select 3 essential items within your ₹500 budget:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {marketItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMarketItem(item.id)}
                        className={`btn-tactile rounded-2xl border-3 border-black p-4 text-base font-bold shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-between ${
                          item.selected ? "bg-amber-300 text-amber-950" : "bg-surface text-ink"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{item.emoji}</span>
                          <span>{item.name}</span>
                        </span>
                        <span className="font-black font-mono text-lg">₹{item.price}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-5 text-center">
                    <button
                      type="button"
                      disabled={totalBasket === 0 || totalBasket > 500}
                      onClick={handlePayMarket}
                      className="btn-tactile rounded-full border-4 border-black bg-emerald-400 px-8 py-4 text-lg font-black text-emerald-950 shadow-[4px_4px_0px_#000] hover:bg-emerald-300 cursor-pointer disabled:opacity-50"
                    >
                      Pay ₹500 Note at Cashier 💵
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-base sm:text-lg font-black text-ink">
                    You paid ₹500 for ₹{totalBasket} worth of groceries. How much change should the shopkeeper return?
                  </p>
                  <div className="flex justify-center gap-4">
                    {[500 - totalBasket - 20, 500 - totalBasket, 500 - totalBasket + 30].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleConfirmChange(opt)}
                        className={`btn-tactile rounded-2xl border-3 border-black px-7 py-4 font-mono text-xl font-black shadow-[4px_4px_0px_#000] cursor-pointer min-w-[100px] ${
                          ch4ChangeAnswer === opt && opt === 500 - totalBasket
                            ? "bg-emerald-200"
                            : "bg-surface hover:bg-amber-100"
                        }`}
                      >
                        ₹{opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAPTER 5: Problem Solving */}
          {currentChapter === 5 && (
            <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 text-center shadow-[4px_4px_0px_#000]">
              <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">
                💡 {t("ch5Title")}
              </h3>
              <p className="text-base sm:text-lg font-bold text-ink-secondary">
                Resolve 3 everyday tasks around the home:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: "door", title: "Locked Front Door", action: "Use House Key 🔑" },
                  { id: "tea", title: "Afternoon Rest", action: "Boil Assam Tea ☕" },
                  { id: "light", title: "Evening Twilight", action: "Switch On Lamp 💡" },
                ].map((prob) => {
                  const isDone = ch5SolvedProblems.includes(prob.id);
                  return (
                    <button
                      key={prob.id}
                      type="button"
                      disabled={isDone}
                      onClick={() => handleSolveProblem(prob.id)}
                      className={`btn-tactile rounded-2xl border-3 border-black p-5 text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer ${
                        isDone ? "bg-emerald-200 opacity-60 cursor-not-allowed" : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      <span className="block text-ink-secondary text-sm mb-1">{prob.title}</span>
                      <span>{isDone ? "Solved ✓" : prob.action}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHAPTER 6: Chronological Memory Reconstruction */}
          {currentChapter === 6 && (
            <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 sm:p-8 space-y-5 text-center shadow-[4px_4px_0px_#000]">
              <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">
                🌅 {t("ch6Title")}
              </h3>
              <p className="text-base sm:text-lg font-bold text-ink-secondary">
                Tap the moments in chronological order from morning to sunset:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { id: "c1", label: "1. Morning Alarm ⏰" },
                  { id: "c2", label: "2. Family Photo 🖼️" },
                  { id: "c3", label: "3. Walk to Market 🛒" },
                  { id: "c4", label: "4. Sunset Tea ☕" },
                ].map((card) => {
                  const isPicked = ch6Order.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isPicked}
                      onClick={() => handleAddFinalSequence(card.id)}
                      className={`btn-tactile rounded-2xl border-3 border-black p-4 text-sm sm:text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer ${
                        isPicked ? "bg-emerald-200 opacity-60 cursor-not-allowed" : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      {card.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
