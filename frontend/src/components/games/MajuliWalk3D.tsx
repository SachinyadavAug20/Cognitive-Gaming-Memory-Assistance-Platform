"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

export function MajuliWalk3D() {
  const t = useTranslations("games.majuli");
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
        name: "Auniati Satra Namghar",
        nativeName: "আউনীআটী সত্ৰ নামঘৰ",
        description: "Sacred prayer hall with golden finial and brass bell chimes on the left riverbank.",
        position: [-6, 0, 8],
        side: "left",
        category: "namghar",
        emoji: "🛕",
        question: t("questionNamghar"),
        correctAnswer: "Auniati Satra Namghar",
        options: ["Auniati Satra Namghar", "Modern Highway", "Market Clock Tower"],
      },
      {
        id: "stilt_house",
        name: "Mising Bamboo Chang Ghar",
        nativeName: "মিচিং চাং ঘৰ",
        description: "Traditional raised bamboo stilt cottage built to stay safe above monsoon floods.",
        position: [6, 0, -2],
        side: "right",
        category: "stilt_house",
        emoji: "🏡",
        question: t("questionChangGhar"),
        correctAnswer: "Mising Bamboo Chang Ghar",
        options: ["Mising Bamboo Chang Ghar", "Brick Factory", "Concrete Apartment"],
      },
      {
        id: "river_ghat",
        name: "Kamalabari River Ferry Ghat",
        nativeName: "কমলাবাৰী ফেৰী ঘাট",
        description: "Peaceful wooden boat jetty overlooking the sunlit Brahmaputra River waters.",
        position: [0, 0, -14],
        side: "center",
        category: "river_ghat",
        emoji: "⛵",
        question: t("questionRiverGhat"),
        correctAnswer: "Kamalabari River Ghat",
        options: ["Kamalabari River Ghat", "Airport Terminal", "Railway Junction"],
      },
    ];
  }, [t]);

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
            <span className="rounded-full border-2 border-emerald-900/40 bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-950 shadow-sm">
              💬 {currentSubtitle}
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
                    +{score} Points
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-ink-secondary">
                    Landmarks Recognized Today:
                  </span>
                  {localizedLandmarks.map((lm) => (
                    <div key={lm.id} className="flex items-center gap-2 text-xs font-bold text-ink">
                      <span className="text-base">{lm.emoji}</span>
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
                    <span>Play Bihu Melody</span>
                  </button>
                  <span className="text-[11px] font-black text-ink-secondary">
                    Mindfulness Journey
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
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-400 text-base font-black">
                  🚶
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {t("currentLandmark")}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-ink">
                    Stop {currentStopIndex + 1} of {WALK_STOP_COORDS.length}
                  </div>
                </div>
              </div>

              {/* Angle Controls & Speaker Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
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
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border-3 border-black bg-surface/95 p-4 backdrop-blur-md shadow-[4px_4px_0px_#000] animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{activeLandmark.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
                        <MapPin className="h-3.5 w-3.5" /> {t("spatialPrompt")}
                      </div>
                      <p className="font-serif text-sm sm:text-base font-black text-ink mt-0.5">
                        {activeLandmark.question}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeLandmark.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerLandmark(opt)}
                            className="btn-tactile rounded-xl border-2 border-black bg-amber-100 px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer active:translate-y-0.5"
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
