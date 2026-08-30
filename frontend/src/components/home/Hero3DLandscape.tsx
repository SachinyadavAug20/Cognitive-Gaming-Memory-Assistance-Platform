"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Compass,
  Maximize2,
  Minimize2,
  Sun,
  Sunset,
  Moon,
  Camera,
} from "lucide-react";
import { playTapFeedback } from "@/lib/sound";

type TimeOfDay = "morning" | "golden" | "night";
type CameraPreset = "panoramic" | "river" | "tea";

interface PresetConfig {
  sky: number;
  fog: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  ambientColor: number;
  ambientIntensity: number;
}

const ATMOSPHERE_CONFIGS: Record<TimeOfDay, PresetConfig> = {
  morning: {
    sky: 0xdbeafe,
    fog: 0xdbeafe,
    fogDensity: 0.022,
    sunColor: 0xfef08a,
    sunIntensity: 1.4,
    sunPos: [12, 18, 10],
    ambientColor: 0xffffff,
    ambientIntensity: 0.9,
  },
  golden: {
    sky: 0xfdba74,
    fog: 0xfdba74,
    fogDensity: 0.028,
    sunColor: 0xf97316,
    sunIntensity: 1.6,
    sunPos: [18, 8, -6],
    ambientColor: 0xfef3c7,
    ambientIntensity: 0.75,
  },
  night: {
    sky: 0x090d16,
    fog: 0x090d16,
    fogDensity: 0.035,
    sunColor: 0x93c5fd,
    sunIntensity: 0.7,
    sunPos: [-10, 15, 10],
    ambientColor: 0x1e293b,
    ambientIntensity: 0.5,
  },
};

const CAMERA_PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  panoramic: { pos: [0, 8.5, 16], target: [0, 1.5, 0] },
  river: { pos: [2.5, 2.8, 6.5], target: [0.5, 0.6, 0] },
  tea: { pos: [-7.5, 5.0, 7.0], target: [-3.5, 2.0, 0] },
};

export function Hero3DLandscape() {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("panoramic");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Audio Context & Interval Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mutable references for live scene mutation without rebuild
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  const isRotatingRef = useRef(true);
  const isIntersectingRef = useRef(true);
  const isTabVisibleRef = useRef(true);

  const targetCamPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...CAMERA_PRESETS.panoramic.pos)
  );
  const targetCamLookRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...CAMERA_PRESETS.panoramic.target)
  );
  const currentCamLookRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...CAMERA_PRESETS.panoramic.target)
  );

  // Sync state to ref for zero-re-render animation loop
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  // In-place update of Time of Day (0ms overhead, no scene recreation)
  useEffect(() => {
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    if (!scene || !sun || !ambient) return;

    const cfg = ATMOSPHERE_CONFIGS[timeOfDay];
    scene.background = new THREE.Color(cfg.sky);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(cfg.fog);
      (scene.fog as THREE.FogExp2).density = cfg.fogDensity;
    }

    sun.color = new THREE.Color(cfg.sunColor);
    sun.intensity = cfg.sunIntensity;
    sun.position.set(...cfg.sunPos);

    ambient.color = new THREE.Color(cfg.ambientColor);
    ambient.intensity = cfg.ambientIntensity;
  }, [timeOfDay]);

  // In-place update of Camera Preset target (smooth lerping)
  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    targetCamPosRef.current.set(...preset.pos);
    targetCamLookRef.current.set(...preset.target);
  }, [cameraPreset]);

  // ── Single Mount Three.js Scene Setup ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const cfg = ATMOSPHERE_CONFIGS.morning;
    scene.background = new THREE.Color(cfg.sky);
    scene.fog = new THREE.FogExp2(cfg.fog, cfg.fogDensity);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...CAMERA_PRESETS.panoramic.pos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    // Clamp DPR to 1.25 for buttery smooth 60 FPS on all screens
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Optimized for flat-shading performance)
    const ambientLight = new THREE.AmbientLight(
      cfg.ambientColor,
      cfg.ambientIntensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(cfg.sunColor, cfg.sunIntensity);
    sunLight.position.set(...cfg.sunPos);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x166534, 0.6);
    scene.add(hemiLight);

    // 3. Central Pivot World Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 4. Meandering Brahmaputra River Plane
    const waterGeo = new THREE.PlaneGeometry(36, 36, 24, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.7,
      flatShading: true,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0;
    worldGroup.add(waterMesh);

    // 5. Majuli Sandbanks (Chars)
    const charGeo = new THREE.CylinderGeometry(2.8, 3.4, 0.25, 8);
    const charMat = new THREE.MeshStandardMaterial({
      color: 0xe0cda9,
      roughness: 0.9,
      flatShading: true,
    });
    const charMesh1 = new THREE.Mesh(charGeo, charMat);
    charMesh1.position.set(-1.5, 0.1, -2.5);
    worldGroup.add(charMesh1);

    const charMesh2 = new THREE.Mesh(charGeo, charMat);
    charMesh2.scale.set(0.6, 1, 0.8);
    charMesh2.position.set(2.8, 0.1, -6);
    worldGroup.add(charMesh2);

    // 6. Stepped Assam Tea Terraces (Left & Right Banks)
    const hillMatDark = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      flatShading: true,
    });
    const hillMatMid = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.8,
      flatShading: true,
    });
    const hillMatLight = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.75,
      flatShading: true,
    });

    const createTerraceHill = (
      x: number,
      z: number,
      r: number,
      h: number,
      mat: THREE.Material
    ) => {
      const geo = new THREE.ConeGeometry(r, h, 8);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      worldGroup.add(mesh);
      return mesh;
    };

    // Left Bank Tea Hills
    createTerraceHill(-7.5, -5, 5.5, 5.0, hillMatDark);
    createTerraceHill(-9.5, 2, 6.0, 5.8, hillMatMid);
    createTerraceHill(-6.5, 6, 4.5, 4.0, hillMatLight);

    // Right Bank Tea Hills
    createTerraceHill(7.5, -6, 5.8, 5.2, hillMatDark);
    createTerraceHill(9.0, 3, 6.2, 6.0, hillMatMid);
    createTerraceHill(6.5, 8, 4.2, 3.8, hillMatLight);

    // Distant Snow-Capped Himalayan Ridges (North Horizon)
    const himalayaMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.4,
      flatShading: true,
    });
    const himalayaMatSnow = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      flatShading: true,
    });

    createTerraceHill(0, -14, 9.0, 9.5, himalayaMat);
    const snowCap1 = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 3.2, 8),
      himalayaMatSnow
    );
    snowCap1.position.set(0, 8.0, -14);
    worldGroup.add(snowCap1);

    createTerraceHill(-9, -15, 8.0, 8.0, himalayaMat);
    createTerraceHill(9, -15, 8.5, 8.5, himalayaMat);

    // 7. InstancedMesh for 70 Tea Bushes (Extreme Performance: 1 Draw Call)
    const bushGeo = new THREE.DodecahedronGeometry(0.45);
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.85,
      flatShading: true,
    });
    const bushCount = 70;
    const bushInstanced = new THREE.InstancedMesh(bushGeo, bushMat, bushCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < bushCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (4.2 + (i * 0.35) % 4.5);
      const z = (i * 1.1) % 20 - 10;
      const y = 0.5 + (i % 4) * 0.4;
      const scale = 0.7 + (i % 3) * 0.3;

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, (i * 0.4) % Math.PI, 0);
      dummy.updateMatrix();
      bushInstanced.setMatrixAt(i, dummy.matrix);
    }
    bushInstanced.instanceMatrix.needsUpdate = true;
    worldGroup.add(bushInstanced);

    // 8. Traditional Stilt House (Chang Ghar)
    const hutGroup = new THREE.Group();
    const stiltMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.8,
      flatShading: true,
    });
    for (let sx = -0.5; sx <= 0.5; sx += 1.0) {
      for (let sz = -0.7; sz <= 0.7; sz += 1.4) {
        const stilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5),
          stiltMat
        );
        stilt.position.set(sx, 0.45, sz);
        hutGroup.add(stilt);
      }
    }
    const hutBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.8, 1.6),
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.7,
        flatShading: true,
      })
    );
    hutBody.position.set(0, 1.2, 0);
    hutGroup.add(hutBody);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 0.8, 4),
      new THREE.MeshStandardMaterial({
        color: 0x92400e,
        roughness: 0.9,
        flatShading: true,
      })
    );
    roof.position.set(0, 1.9, 0);
    roof.rotation.y = Math.PI / 4;
    hutGroup.add(roof);

    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    lantern.position.set(0.65, 1.0, 0.6);
    hutGroup.add(lantern);

    hutGroup.position.set(-4.5, 0.1, -1.0);
    hutGroup.rotation.y = 0.4;
    worldGroup.add(hutGroup);

    // 9. Traditional Wooden Canoe (Naao) with Japi Umbrella
    const boatGroup = new THREE.Group();
    const hullGeo = new THREE.BoxGeometry(0.9, 0.4, 2.6);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.6,
      flatShading: true,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    boatGroup.add(hull);

    const japi = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.3, 6),
      new THREE.MeshStandardMaterial({
        color: 0xfde047,
        roughness: 0.5,
        flatShading: true,
      })
    );
    japi.position.set(0, 0.42, 0.3);
    boatGroup.add(japi);

    boatGroup.position.set(0.6, 0.18, 1.5);
    worldGroup.add(boatGroup);

    // 10. Low-Poly Drifting Clouds
    const cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(1.0);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      flatShading: true,
    });
    for (let c = 0; c < 5; c++) {
      const singleCloud = new THREE.Group();
      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(p * 0.6, (p % 2) * 0.25, (p % 3) * 0.25);
        singleCloud.add(puff);
      }
      singleCloud.position.set(
        (c - 2) * 6.5,
        6.5 + (c % 2) * 0.9,
        (c % 3) * 5 - 6
      );
      cloudGroup.add(singleCloud);
    }
    worldGroup.add(cloudGroup);

    // 11. Mouse & Touch Orbit Handlers
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      worldGroup.rotation.y += deltaX * 0.005;
      worldGroup.rotation.x = Math.max(
        -0.2,
        Math.min(0.25, worldGroup.rotation.x + deltaY * 0.0025)
      );

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // 12. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 13. Page Visibility API: Auto-sleep when tab is hidden (0% GPU/Battery)
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 14. IntersectionObserver: Auto-sleep when scrolled offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 15. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-Sleep check: saves 100% GPU when offscreen or in background tab
      if (!isIntersectingRef.current || !isTabVisibleRef.current) return;

      const elapsed = clock.getElapsedTime();

      // Smooth Camera Lerping towards target preset
      camera.position.lerp(targetCamPosRef.current, 0.04);
      currentCamLookRef.current.lerp(targetCamLookRef.current, 0.04);
      camera.lookAt(currentCamLookRef.current);

      // Gentle auto-rotation
      if (isRotatingRef.current && !isDragging) {
        worldGroup.rotation.y += 0.0018;
      }

      // Gentle river rocking for the canoe
      boatGroup.position.y = 0.18 + Math.sin(elapsed * 2.2) * 0.05;
      boatGroup.rotation.z = Math.sin(elapsed * 1.6) * 0.04;
      boatGroup.rotation.x = Math.cos(elapsed * 1.9) * 0.03;
      boatGroup.position.z = 1.5 + Math.sin(elapsed * 0.6) * 0.3;

      // Drifting clouds
      cloudGroup.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Ambient Nature Audio Synthesizer
  const toggleAmbientAudio = useCallback(() => {
    playTapFeedback();
    if (isPlayingAudio) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (audioTimerRef.current) {
        clearInterval(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // 1. Water Ripples (Filtered Noise)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 380;
      bandpass.Q.value = 3.2;

      const waterGain = ctx.createGain();
      waterGain.gain.setValueAtTime(0.045, ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(waterGain);
      waterGain.connect(ctx.destination);
      whiteNoise.start();

      // 2. Pentatonic Bamboo Flute Notes
      const pentatonicNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
      let noteIndex = 0;

      const playFluteNote = () => {
        if (
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        )
          return;
        const noteFreq = pentatonicNotes[noteIndex % pentatonicNotes.length];
        noteIndex =
          (noteIndex + 1 + Math.floor(Math.random() * 2)) %
          pentatonicNotes.length;

        const osc = ctx.createOscillator();
        const fluteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        fluteGain.gain.setValueAtTime(0, ctx.currentTime);
        fluteGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.8);
        fluteGain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + 3.2
        );

        osc.connect(fluteGain);
        fluteGain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.3);
      };

      playFluteNote();
      audioTimerRef.current = setInterval(playFluteNote, 4200);
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio]);

  const toggleFullscreen = () => {
    playTapFeedback();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerWrapperRef}
      className={`w-full transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black/95 p-4 sm:p-8 flex flex-col justify-center items-center"
          : "rounded-3xl border-3 border-black bg-surface overflow-hidden shadow-[6px_6px_0px_#000]"
      }`}
    >
      {/* 3D Header HUD Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#F4EFE6] border-b-2 border-black">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-tea" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            3D Brahmaputra Basin // Living Heritage Landscape
          </span>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Time of Day Atmosphere Switcher */}
          <div className="flex items-center gap-0.5 bg-surface p-0.5 rounded-xl border-2 border-black shadow-xs">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setTimeOfDay("morning");
              }}
              title="Morning Dawn"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                timeOfDay === "morning"
                  ? "bg-tea text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setTimeOfDay("golden");
              }}
              title="Golden Twilight"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                timeOfDay === "golden"
                  ? "bg-marigold text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              <Sunset className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setTimeOfDay("night");
              }}
              title="Starlit Night"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                timeOfDay === "night"
                  ? "bg-slate-900 text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Camera View Angle Switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-surface p-0.5 rounded-xl border-2 border-black shadow-xs">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setCameraPreset("panoramic");
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer ${
                cameraPreset === "panoramic"
                  ? "bg-tea text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              Valley
            </button>
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setCameraPreset("river");
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer ${
                cameraPreset === "river"
                  ? "bg-tea text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              River
            </button>
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setCameraPreset("tea");
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer ${
                cameraPreset === "tea"
                  ? "bg-tea text-white"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              Tea Terraces
            </button>
          </div>

          {/* Orbit Toggle */}
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? "Pause orbit rotation" : "Resume orbit rotation"}
            className="p-1.5 rounded-xl border-2 border-black bg-surface text-ink text-xs font-black shadow-xs hover:bg-surface-muted transition-all cursor-pointer"
          >
            <Compass
              className={`h-3.5 w-3.5 text-tea ${isRotating ? "animate-spin" : ""}`}
            />
          </button>

          {/* Calming Audio Toggle */}
          <button
            type="button"
            onClick={toggleAmbientAudio}
            title={
              isPlayingAudio
                ? "Mute ambient nature audio"
                : "Listen to river water & bamboo flute"
            }
            className={`px-2 py-1 rounded-xl border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1 ${
              isPlayingAudio
                ? "bg-tea text-white"
                : "bg-surface text-ink hover:bg-surface-muted"
            }`}
          >
            {isPlayingAudio ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            <span className="text-[10px] hidden md:inline">
              {isPlayingAudio ? "Audio On" : "Calm Audio"}
            </span>
          </button>

          {/* Fullscreen Zen Mode */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Zen Mode"}
            className="p-1.5 rounded-xl border-2 border-black bg-surface text-ink text-xs font-black shadow-xs hover:bg-surface-muted transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        className={`relative w-full select-none cursor-grab active:cursor-grabbing overflow-hidden ${
          isFullscreen
            ? "h-[75vh] w-full max-w-6xl rounded-2xl border-3 border-white shadow-2xl"
            : "h-[380px] sm:h-[460px] md:h-[500px]"
        }`}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Ambient HUD Info Overlays */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-surface/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border-2 border-black text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🌿 Drag to rotate • Scroll to zoom</span>
        </div>

        <div className="absolute top-3 right-3 pointer-events-none bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border-2 border-black text-[10px] font-bold text-ink-secondary shadow-xs flex items-center gap-1">
          <Camera className="h-3 w-3 text-tea" />
          <span>Brahmaputra Valley, Upper Assam</span>
        </div>
      </div>
    </div>
  );
}
