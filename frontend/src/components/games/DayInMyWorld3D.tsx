"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  ShoppingBag,
  Image as ImageIcon,
  Compass,
  Award,
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
  mesh?: THREE.Group;
}

export function DayInMyWorld3D() {
  const t = useTranslations("games.dayInMyWorld");

  // Fallback-safe translation resolver so raw keys NEVER leak on screen
  const getT = useCallback(
    (key: string, fallback: string): string => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = t(key as any);
        if (val && !val.includes("games.dayInMyWorld")) return val;
      } catch {
        // Safe fallback
      }
      return fallback;
    },
    [t]
  );

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
  const [currentChapter, setCurrentChapter] = useState<DayChapter>(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Chapter 1: Morning Memorize & Collect
  const [ch1Memorized, setCh1Memorized] = useState(false);
  const [ch1Items, setCh1Items] = useState<CollectibleItem[]>([
    { id: "key", name: "House Key", emoji: "🔑", pos: [-2, 1.3, 0], collected: false },
    { id: "cap", name: "Sun Cap", emoji: "🧢", pos: [0, 1.3, 0], collected: false },
    { id: "bag", name: "Cloth Bag", emoji: "👜", pos: [2, 1.3, 0], collected: false },
  ]);

  // Chapter 2: Missing Photograph
  const [ch2SelectedPhoto, setCh2SelectedPhoto] = useState<number | null>(null);
  const [ch2Feedback, setCh2Feedback] = useState<string | null>(null);

  // Chapter 3: Spatial Navigation / Detour
  const [ch3Choice, setCh3Choice] = useState<number | null>(null);
  const [ch3Feedback, setCh3Feedback] = useState<string | null>(null);

  // Chapter 4: Market Shopping & Budget
  const [ch4ChangeAnswer, setCh4ChangeAnswer] = useState<number | null>(null);
  const [ch4Feedback, setCh4Feedback] = useState<string | null>(null);

  // Chapter 5: Everyday Problem Solving
  const [ch5Selected, setCh5Selected] = useState<number | null>(null);
  const [ch5Feedback, setCh5Feedback] = useState<string | null>(null);

  // Chapter 6: Final Chronological Day Reconstruction
  const [ch6Slots, setCh6Slots] = useState<string[]>([]);

  // Telemetry
  const startTimeRef = useRef<number | null>(null);
  const hesitationCountRef = useRef<number>(0);

  // Procedural Web Audio Sound Generator
  const playSound = useCallback((type: "click" | "correct" | "fanfare" | "bell") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "correct" || type === "fanfare") {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.35);
        });
      } else if (type === "bell") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Audio fallback
    }
  }, []);

  // 3D Scene Initialization with Rich Interactive Low-Poly Diorama
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 220;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Sky gradient & Lighting by chapter
    const skyColors: Record<number, string> = {
      1: "#FED7AA", // Morning warm golden sunrise
      2: "#FEF08A", // Bright sunlit room
      3: "#BAE6FD", // Midday sky over river
      4: "#FEF08A", // Lively market square
      5: "#FDBA74", // Late afternoon golden hour
      6: "#FB923C", // Sunset twilight
    };
    const skyColor = skyColors[currentChapter] || "#FED7AA";
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 7.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Warm Ambient and Sun Lighting
    const ambientLight = new THREE.AmbientLight("#FFFBEB", 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#F59E0B", 2.2);
    sunLight.position.set(10, 15, 8);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Warm Wooden Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: currentChapter <= 2 ? "#B45309" : currentChapter === 3 ? "#15803D" : "#78350F",
      roughness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Back Wall with Sunlit Window (For Room Chapters 1, 2, 5, 6)
    if (currentChapter <= 2 || currentChapter >= 5) {
      const wallGeo = new THREE.PlaneGeometry(24, 12);
      const wallMat = new THREE.MeshStandardMaterial({ color: "#FEF3C7", roughness: 0.9 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 5, -4);
      scene.add(wall);

      // Window Frame
      const windowFrameGeo = new THREE.BoxGeometry(4, 3, 0.1);
      const windowFrameMat = new THREE.MeshStandardMaterial({ color: "#78350F" });
      const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
      windowFrame.position.set(0, 4.5, -3.9);
      scene.add(windowFrame);

      // Windowpane Sky
      const paneGeo = new THREE.PlaneGeometry(3.6, 2.6);
      const paneMat = new THREE.MeshBasicMaterial({ color: "#7DD3FC" });
      const pane = new THREE.Mesh(paneGeo, paneMat);
      pane.position.set(0, 4.5, -3.8);
      scene.add(pane);

      // Wooden Table
      const tableTopGeo = new THREE.BoxGeometry(6, 0.3, 3);
      const tableMat = new THREE.MeshStandardMaterial({ color: "#92400E", roughness: 0.6 });
      const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
      tableTop.position.set(0, 1.1, 0);
      scene.add(tableTop);

      // Table Legs
      const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 8);
      const legPositions = [
        [-2.7, 0.55, -1.2],
        [2.7, 0.55, -1.2],
        [-2.7, 0.55, 1.2],
        [2.7, 0.55, 1.2],
      ];
      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, tableMat);
        leg.position.set(x, y, z);
        scene.add(leg);
      });

      // Steaming Tea Glass
      const cupGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.45, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.2 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(-1.8, 1.45, -0.6);
      scene.add(cup);

      // 3D Collectible Items on the Table (Chapter 1)
      if (currentChapter === 1) {
        // 1. Golden Key
        const keyGroup = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
        const keyMat = new THREE.MeshStandardMaterial({ color: "#FACC15", metalness: 0.8, roughness: 0.2 });
        const ring = new THREE.Mesh(ringGeo, keyMat);
        ring.rotation.x = Math.PI / 2;
        const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const shaft = new THREE.Mesh(shaftGeo, keyMat);
        shaft.position.set(0.3, 0, 0);
        shaft.rotation.z = Math.PI / 2;
        keyGroup.add(ring);
        keyGroup.add(shaft);
        keyGroup.position.set(-1.5, 1.35, 0.4);
        scene.add(keyGroup);

        // 2. Red/Orange Sun Cap
        const capGroup = new THREE.Group();
        const domeGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMat = new THREE.MeshStandardMaterial({ color: "#EF4444", roughness: 0.8 });
        const dome = new THREE.Mesh(domeGeo, capMat);
        const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16, 1, false, 0, Math.PI);
        const visor = new THREE.Mesh(visorGeo, capMat);
        visor.position.set(0, 0, 0.2);
        capGroup.add(dome);
        capGroup.add(visor);
        capGroup.position.set(0, 1.35, 0.4);
        scene.add(capGroup);

        // 3. Green Cloth Gamusa Bag
        const bagGroup = new THREE.Group();
        const bagBodyGeo = new THREE.BoxGeometry(0.6, 0.5, 0.3);
        const bagMat = new THREE.MeshStandardMaterial({ color: "#10B981", roughness: 0.7 });
        const bagBody = new THREE.Mesh(bagBodyGeo, bagMat);
        const handleGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 16, Math.PI);
        const handle = new THREE.Mesh(handleGeo, bagMat);
        handle.position.set(0, 0.3, 0);
        bagGroup.add(bagBody);
        bagGroup.add(handle);
        bagGroup.position.set(1.5, 1.45, 0.4);
        scene.add(bagGroup);
      }
    } else if (currentChapter === 3) {
      // Village Walking Path Scene
      const pathGeo = new THREE.PlaneGeometry(3.5, 30);
      const pathMat = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.8 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(0, 0.02, 0);
      scene.add(path);

      // Namghar Landmark
      const namgharGeo = new THREE.BoxGeometry(3, 2.5, 3);
      const namgharMat = new THREE.MeshStandardMaterial({ color: "#DC2626" });
      const namghar = new THREE.Mesh(namgharGeo, namgharMat);
      namghar.position.set(-4, 1.25, -2);
      scene.add(namghar);

      // Green Tea Bushes
      for (let i = -8; i <= 8; i += 3) {
        const bushGeo = new THREE.DodecahedronGeometry(0.8, 1);
        const bushMat = new THREE.MeshStandardMaterial({ color: "#166534" });
        const bush = new THREE.Mesh(bushGeo, bushMat);
        bush.position.set(3.5, 0.6, i);
        scene.add(bush);
      }
    } else if (currentChapter === 4) {
      // Marketplace Stalls
      const stallGeo = new THREE.BoxGeometry(2.5, 1.8, 2);
      const stallMat = new THREE.MeshStandardMaterial({ color: "#B45309" });
      const stall = new THREE.Mesh(stallGeo, stallMat);
      stall.position.set(-2.5, 0.9, -1);
      scene.add(stall);

      const canopyGeo = new THREE.ConeGeometry(2, 0.8, 4);
      const canopyMat = new THREE.MeshStandardMaterial({ color: "#EF4444" });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(-2.5, 2.2, -1);
      canopy.rotation.y = Math.PI / 4;
      scene.add(canopy);
    }

    // Animation Loop with Gentle Camera Sway
    let clock = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.015;
      camera.position.x = Math.sin(clock * 0.4) * 0.4;
      camera.lookAt(0, 1.2, 0);
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
      const payload: GameSessionPayload = {
        patientId: 1,
        gameType: "DAY_IN_MY_WORLD",
        durationSeconds,
        accuracyPercentage: finalAccuracy,
        spatialRecallScore: Math.round(finalAccuracy),
        motorReactionTimeMs: 780,
        hesitationCount: hesitationCountRef.current,
        difficultyLevel: currentChapter,
      };

      try {
        await api.post("/patients/1/sessions", payload);
      } catch {
        // Safe offline fallback
      }
    },
    [currentChapter]
  );

  // Start Journey
  const handleStartGame = () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();
    playSound("bell");
    speakVoice(getT("saathiWakeup", "Good morning! Let us remember the day together."));
  };

  // Chapter 1: Collect Item
  const handleCollectItem = (id: "key" | "cap" | "bag") => {
    playSound("correct");
    setCh1Items((prev) =>
      prev.map((it) => (it.id === id ? { ...it, collected: true } : it))
    );

    const updated = ch1Items.map((it) => (it.id === id ? { ...it, collected: true } : it));
    const allDone = updated.every((it) => it.collected);

    if (allDone) {
      setScore((s) => s + 20);
      playSound("fanfare");
      speakVoice(getT("ch1Complete", "Splendid! You have collected all three morning essentials."));
      setTimeout(() => {
        setCurrentChapter(2);
        speakVoice(getT("ch2Intro", "Before we head outside, let us place the right family memory into the album."));
      }, 2000);
    }
  };

  // Chapter 2: Choose Photo
  const handleChoosePhoto = (index: number) => {
    setCh2SelectedPhoto(index);
    if (index === 1) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh2Feedback("✓ Correct! The beautiful Majuli family reunion photo!");
      speakVoice(getT("ch2Success", "Wonderful! The family album is whole again."));
      setTimeout(() => {
        setCurrentChapter(3);
        setCh2Feedback(null);
        speakVoice(getT("ch3Intro", "Let us stroll down to the village market along the riverbank path."));
      }, 2200);
    } else {
      playSound("click");
      setCh2Feedback("Take a closer look at the traditional courtyard picture.");
    }
  };

  // Chapter 3: Spatial Path Decision
  const handlePathChoice = (choiceIndex: number) => {
    setCh3Choice(choiceIndex);
    if (choiceIndex === 0) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh3Feedback("✓ Correct! The peaceful riverbank road leading straight to the bazaar!");
      speakVoice(getT("ch3Success", "Excellent navigation! We have reached the market stalls safely."));
      setTimeout(() => {
        setCurrentChapter(4);
        setCh3Feedback(null);
        speakVoice(getT("ch4Intro", "Time to buy fresh groceries with our budget."));
      }, 2200);
    } else {
      playSound("click");
      setCh3Feedback("That path leads to the forest hills. Choose the riverbank road.");
    }
  };

  // Chapter 4: Market Payment & Change
  const handleMarketChangeAnswer = (ans: number) => {
    setCh4ChangeAnswer(ans);
    // Bill = 60 (Tea) + 80 (Rice) = 140. Paid = 200. Change = 60.
    if (ans === 60) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh4Feedback("✓ Correct! ₹200 - ₹140 = ₹60 returned perfectly!");
      speakVoice(getT("ch4Success", "Exact calculation! Your basket is packed with fresh groceries."));
      setTimeout(() => {
        setCurrentChapter(5);
        setCh4Feedback(null);
        speakVoice(getT("ch5Intro", "Back at home, let us complete our afternoon relaxation routine."));
      }, 2200);
    } else {
      playSound("click");
      setCh4Feedback("Total bill is ₹140 (₹60 tea + ₹80 rice). Out of ₹200, what is left?");
    }
  };

  // Chapter 5: Routine Decision
  const handleCh5Choice = (index: number) => {
    setCh5Selected(index);
    if (index === 0) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh5Feedback("✓ Perfect! Hydrating with clean water and relaxing on the verandah!");
      speakVoice(getT("ch5Success", "Very well done! You are refreshed and well-rested."));
      setTimeout(() => {
        setCurrentChapter(6);
        setCh5Feedback(null);
        speakVoice(getT("ch6Intro", "As the sun sets, let us recount our day's journey from morning to evening."));
      }, 2200);
    } else {
      playSound("click");
      setCh5Feedback("After a long walk, remember to drink fresh water and rest first.");
    }
  };

  // Chapter 6: Chronological Ordering
  const handleCh6Reconstruct = (stepName: string) => {
    playSound("click");
    if (ch6Slots.includes(stepName)) {
      setCh6Slots((prev) => prev.filter((s) => s !== stepName));
    } else {
      const next = [...ch6Slots, stepName];
      setCh6Slots(next);
      if (next.length === 4) {
        // Complete day
        playSound("fanfare");
        setScore(100);
        setIsCompleted(true);
        sendSessionTelemetry(100);
        speakVoice(getT("finalDayComplete", "A peaceful day fulfilled! You walked through every memory with clarity and joy."));
      }
    }
  };

  const handleRestart = () => {
    setCurrentChapter(1);
    setHasStarted(false);
    setIsCompleted(false);
    setScore(0);
    setCh1Memorized(false);
    setCh1Items([
      { id: "key", name: "House Key", emoji: "🔑", pos: [-2, 1.3, 0], collected: false },
      { id: "cap", name: "Sun Cap", emoji: "🧢", pos: [0, 1.3, 0], collected: false },
      { id: "bag", name: "Cloth Bag", emoji: "👜", pos: [2, 1.3, 0], collected: false },
    ]);
    setCh6Slots([]);
  };

  return (
    <div className="relative flex flex-col items-center p-3 sm:p-5 text-ink">
      {/* Floating Spoken Voice Subtitles (Positioned safely below navigation bars) */}
      {currentSubtitle && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border-3 border-black bg-amber-200 px-6 py-2 shadow-[4px_4px_0px_#000] animate-fade-in max-w-lg text-center pointer-events-none">
          <p className="font-serif text-sm sm:text-base font-black text-amber-950 flex items-center justify-center gap-2">
            <span>🗣️</span>
            <span>Saathi: &ldquo;{currentSubtitle}&rdquo;</span>
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex w-full items-center justify-between border-b-2 border-black/15 pb-2.5 mb-2">
        <Link
          href="/patient/games"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{getT("backToHub", "← Back to Therapy Suite")}</span>
        </Link>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-tea">
            <Sparkles className="h-3 w-3" />
            <span>3D Story Campaign</span>
          </div>
          <h1 className="font-serif text-lg sm:text-xl font-black text-ink">
            {getT("title", "A Day in My World")}
          </h1>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-100 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
          aria-label={isMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose-700" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-800" />
              <span>Voice ON</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Cinematic Scene Viewport (Compact Height to ensure full playability) */}
      <div className="w-full overflow-hidden rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] mb-3">
        <div ref={mountRef} className="w-full h-44 sm:h-52 bg-amber-100 block" />
      </div>

      {/* Narrative Interactive Play Area */}
      {!hasStarted ? (
        /* Start Screen */
        <div className="my-2 flex flex-col items-center text-center space-y-3 max-w-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-black bg-amber-300 text-amber-950 shadow-[3px_3px_0px_#000]">
            <Sun className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl font-black text-ink">
            {getT("welcomeTitle", "A Morning to Remember")}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-secondary leading-relaxed">
            {getT("welcomeDesc", "The morning sun fills the room with gentle warmth. Saathi is here to walk with you through every moment of the day.")}
          </p>

          <button
            type="button"
            onClick={handleStartGame}
            className="btn-tactile rounded-full border-3 border-black bg-amber-400 px-8 py-3 text-base sm:text-lg font-black text-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 cursor-pointer transition-transform active:translate-y-0.5"
          >
            {getT("beginDayButton", "Begin Morning Journey")} 🌅
          </button>
        </div>
      ) : isCompleted ? (
        /* Complete Screen */
        <div className="my-3 flex flex-col items-center text-center space-y-4 max-w-lg animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-emerald-200 text-emerald-950 shadow-[4px_4px_0px_#000]">
            <Award className="h-10 w-10 text-emerald-800" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {getT("finalDayCompleteTitle", "Journey Complete: The Memory Restored")}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-secondary">
            {getT("finalDayCompleteDesc", "You completed the entire 6-chapter journey alongside Saathi with flying colors.")}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-300 px-6 py-2.5 text-sm font-black text-black shadow-[3px_3px_0px_#000] hover:bg-amber-400 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{getT("reliveDayButton", "Relive the Day Again")}</span>
            </button>
            <Link
              href="/patient/games"
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-6 py-2.5 text-sm font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <span>{getT("backToHub", "← Back to Therapy Suite")}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Active Chapter Interactive Area */
        <div className="w-full space-y-3">
          {/* Chapter Stepper Ribbon */}
          <div className="flex items-center justify-between rounded-xl border-2 border-black bg-amber-100/90 px-3 py-1.5 text-xs font-bold">
            <span>
              📖 Chapter {currentChapter} of 6:{" "}
              <strong className="font-serif text-sm font-black text-ink">
                {currentChapter === 1
                  ? getT("ch1Title", "Morning Memory")
                  : currentChapter === 2
                  ? getT("ch2Title", "The Missing Photograph")
                  : currentChapter === 3
                  ? getT("ch3Title", "The Way to the Market")
                  : currentChapter === 4
                  ? getT("ch4Title", "The Market Mission")
                  : currentChapter === 5
                  ? getT("ch5Title", "Afternoon Routine")
                  : getT("ch6Title", "The Sunset Memory")}
              </strong>
            </span>
            <span className="font-serif font-black text-xs bg-surface px-2.5 py-0.5 rounded-lg border border-black">
              Score: {score}
            </span>
          </div>

          {/* CHAPTER 1: Memorize & Collect Morning Essentials */}
          {currentChapter === 1 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              {!ch1Memorized ? (
                <>
                  <h3 className="font-serif text-lg sm:text-xl font-black text-ink">
                    🔑 {getT("ch1MemorizeTitle", "Remember These Three Essentials")}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                    {getT("ch1MemorizeDesc", "Take a moment to look at your Key, Cap, and Cloth Bag before leaving the room.")}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 py-2 max-w-sm mx-auto">
                    {ch1Items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center rounded-xl border-2 border-black bg-surface p-3 shadow-[2px_2px_0px_#000]"
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <span className="font-serif text-xs font-black text-ink mt-1">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCh1Memorized(true);
                      playSound("click");
                      speakVoice(getT("ch1FindPrompt", "Now find your key, cap, and bag around the house to get ready for the day."));
                    }}
                    className="btn-tactile rounded-full border-3 border-black bg-amber-400 px-6 py-2.5 text-sm sm:text-base font-black text-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 cursor-pointer"
                  >
                    {getT("ch1ReadyButton", "I've Memorized Them")} ✓
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-lg sm:text-xl font-black text-ink">
                    🔍 {getT("ch1FindTitle", "Find & Pick Up the 3 Items")}
                  </h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    Tap each item to collect it into your bag:
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 py-2 max-w-sm mx-auto">
                    {ch1Items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.collected}
                        onClick={() => handleCollectItem(item.id)}
                        className={`btn-tactile flex flex-col items-center rounded-xl border-2 border-black p-3 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                          item.collected
                            ? "bg-emerald-100 opacity-60 cursor-not-allowed"
                            : "bg-surface hover:bg-amber-200"
                        }`}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <span className="font-serif text-xs font-black text-ink mt-1">
                          {item.collected ? "Collected ✓" : `Take ${item.name}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHAPTER 2: Missing Photograph */}
          {currentChapter === 2 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <ImageIcon className="h-5 w-5 text-tea" />
                {getT("ch2Prompt", "Choose the Family Photo for the Album")}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                {getT("ch2Subtext", "Look at the options and choose the peaceful courtyard family gathering.")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { id: 0, label: "Busy Train Station 🚉" },
                  { id: 1, label: "Majuli Family Courtyard 🏡" },
                  { id: 2, label: "Office Meeting Room 🏢" },
                ].map((ph) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => handleChoosePhoto(ph.id)}
                    className={`btn-tactile rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ch2SelectedPhoto === ph.id && ph.id === 1
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>

              {ch2Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch2Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 3: Spatial Road Navigation */}
          {currentChapter === 3 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <Compass className="h-5 w-5 text-tea" />
                {getT("ch3Question", "Choose the Riverbank Path")}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                You pass by the red Namghar temple. Which path leads to the river marketplace?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { id: 0, label: "Riverbank Path (Along Brahmaputra) ⛵" },
                  { id: 1, label: "Highway Overpass 🚗" },
                  { id: 2, label: "Dark Forest Trail 🌲" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePathChoice(p.id)}
                    className={`btn-tactile rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ch3Choice === p.id && p.id === 0
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {ch3Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch3Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 4: Market Shopping & Currency Calculation */}
          {currentChapter === 4 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-tea" />
                {getT("ch4Prompt", "Calculate the Correct Change")}
              </h3>
              <p className="text-xs font-bold text-ink-secondary">
                Items bought: ☕ Assam Tea (₹60) + 🍚 Joha Rice (₹80) = <strong>₹140 Total</strong>.
                <br />You give the shopkeeper a <strong>₹200 note</strong>. What change should you receive?
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1 max-w-sm mx-auto">
                {[40, 60, 80].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleMarketChangeAnswer(amt)}
                    className={`btn-tactile rounded-xl border-2 border-black p-3 text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ch4ChangeAnswer === amt && amt === 60
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    ₹{amt} Change
                  </button>
                ))}
              </div>

              {ch4Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch4Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 5: Routine Decision */}
          {currentChapter === 5 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink">
                💡 {getT("ch5Prompt", "Afternoon Rest & Hydration")}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                You have walked home with your fresh tea. What is the best step right now?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-md mx-auto">
                {[
                  { id: 0, label: "💧 Drink a glass of water & rest on verandah" },
                  { id: 1, label: "🏃 Go outside and run immediately" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCh5Choice(c.id)}
                    className={`btn-tactile rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ch5Selected === c.id && c.id === 0
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {ch5Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch5Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 6: Chronological Ordering */}
          {currentChapter === 6 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink">
                🌅 {getT("ch6Prompt", "Reconstruct Your Day Chronologically")}
              </h3>
              <p className="text-xs font-bold text-ink-secondary">
                Tap each memory in order from morning to evening:
              </p>

              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto pt-1">
                {[
                  "1. Morning Keys & Bag 🔑",
                  "2. Majuli Family Photo 🏡",
                  "3. River Market Walk ☕",
                  "4. Sunset Verandah Rest 🌅",
                ].map((step) => {
                  const isSelected = ch6Slots.includes(step);
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleCh6Reconstruct(step)}
                      className={`btn-tactile rounded-xl border-2 border-black p-2.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                        isSelected
                          ? "bg-emerald-200 text-emerald-950 border-emerald-700"
                          : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      {step} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-black text-tea-dark pt-1">
                {ch6Slots.length} of 4 moments recalled!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
