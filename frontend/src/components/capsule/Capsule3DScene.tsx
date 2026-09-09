"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type {
  MemoryCapsule,
  MemoryHotspot,
  MemoryColorFilter,
} from "@/types/capsule";

interface Capsule3DSceneProps {
  capsule: MemoryCapsule;
  coords: { x: number; y: number };
  colorFilter?: MemoryColorFilter;
  autopilot?: boolean;
  onPointerMove?: (coords: { x: number; y: number }) => void;
  onHotspotActive?: (hotspot: MemoryHotspot | null) => void;
  onHotspotClick?: (hotspot: MemoryHotspot) => void;
}

// Module-level texture cache to prevent image re-fetch and flicker on switch
const _textureCache = new Map<string, THREE.Texture>();
const _textureLoader = new THREE.TextureLoader();

function getCachedTexture(
  url: string,
  onLoaded: (tex: THREE.Texture) => void,
  onError: () => void
): THREE.Texture | null {
  if (_textureCache.has(url)) {
    const cached = _textureCache.get(url)!;
    onLoaded(cached);
    return cached;
  }
  _textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      _textureCache.set(url, texture);
      onLoaded(texture);
    },
    undefined,
    onError
  );
  return null;
}

export function Capsule3DScene({
  capsule,
  coords,
  colorFilter = "natural",
  autopilot = false,
  onPointerMove,
  onHotspotActive,
  onHotspotClick,
}: Capsule3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const photoMeshRef = useRef<THREE.Mesh | null>(null);
  const photoMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetLookRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeHotspotIdRef = useRef<string | null>(null);

  // Storing callbacks and values in refs so they never cause effect re-runs
  const onPointerMoveRef = useRef(onPointerMove);
  const onHotspotActiveRef = useRef(onHotspotActive);
  const onHotspotClickRef = useRef(onHotspotClick);
  const autopilotRef = useRef(autopilot);
  const capsuleRef = useRef(capsule);

  useEffect(() => {
    onPointerMoveRef.current = onPointerMove;
    onHotspotActiveRef.current = onHotspotActive;
    onHotspotClickRef.current = onHotspotClick;
    autopilotRef.current = autopilot;
    capsuleRef.current = capsule;
  });

  // Update target coordinates smoothly
  useEffect(() => {
    targetLookRef.current = coords;
  }, [coords]);

  // Update atmosphere lighting when colorFilter changes
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    if (colorFilter === "golden_hour") {
      sceneRef.current.background = new THREE.Color(0x18120b);
      ambientLightRef.current.color.setHex(0xfde68a);
      ambientLightRef.current.intensity = 0.92;
      sunLightRef.current.color.setHex(0xf59e0b);
      sunLightRef.current.intensity = 1.35;
    } else if (colorFilter === "monsoon_emerald") {
      sceneRef.current.background = new THREE.Color(0x041918);
      ambientLightRef.current.color.setHex(0xa7f3d0);
      ambientLightRef.current.intensity = 0.88;
      sunLightRef.current.color.setHex(0x6ee7b7);
      sunLightRef.current.intensity = 1.20;
    } else if (colorFilter === "kodachrome") {
      sceneRef.current.background = new THREE.Color(0x160f0d);
      ambientLightRef.current.color.setHex(0xffedd5);
      ambientLightRef.current.intensity = 0.95;
      sunLightRef.current.color.setHex(0xfb923c);
      sunLightRef.current.intensity = 1.40;
    } else if (colorFilter === "twilight") {
      sceneRef.current.background = new THREE.Color(0x0e1424);
      ambientLightRef.current.color.setHex(0xc084fc);
      ambientLightRef.current.intensity = 0.78;
      sunLightRef.current.color.setHex(0x818cf8);
      sunLightRef.current.intensity = 1.05;
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.88;
      sunLightRef.current.color.setHex(0xfef3c7);
      sunLightRef.current.intensity = 1.20;
    }
  }, [colorFilter]);

  // Update texture & hotspots in-place when capsule changes (ZERO WebGL teardown / flicker!)
  useEffect(() => {
    if (!photoMatRef.current || !sceneRef.current) return;

    // Load or apply cached texture
    getCachedTexture(
      capsule.photoUrl,
      (tex) => {
        if (photoMatRef.current) {
          photoMatRef.current.map = tex;
          photoMatRef.current.needsUpdate = true;
        }
      },
      () => {
        // Fallback procedural canvas
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 340;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#1E5136";
          ctx.fillRect(0, 0, 512, 340);
          ctx.fillStyle = "#FAF3E0";
          ctx.font = "bold 24px serif";
          ctx.textAlign = "center";
          ctx.fillText(capsule.title, 256, 170);
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        if (photoMatRef.current) {
          photoMatRef.current.map = fallbackTex;
          photoMatRef.current.needsUpdate = true;
        }
      }
    );

    // Rebuild Hotspots in the group without touching scene
    const group = hotspotsGroupRef.current;
    if (group) {
      // Clear previous children
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        if ("geometry" in obj) (obj as THREE.Mesh).geometry.dispose();
      }

      const hotspots = capsule.hotspots || [];
      hotspots.forEach((h) => {
        const sub = new THREE.Group();
        sub.position.set(h.x * 1.55, h.y * 1.05, 0.08);

        const ringGeo = new THREE.RingGeometry(0.065, 0.085, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.name = `ring_${h.id}`;

        const coreGeo = new THREE.CircleGeometry(0.035, 24);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0xfef3c7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.name = `core_${h.id}`;

        sub.add(ringMesh);
        sub.add(coreMesh);
        group.add(sub);
      });
    }
  }, [capsule.id, capsule.photoUrl]);

  // MOUNT ONCE: Initial WebGL scene creation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Dynamic Atmospheric & Sunlight Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.88);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.20);
    sunLight.position.set(3, 4, 3);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const warmFill = new THREE.PointLight(0xf59e0b, 0.75, 12);
    warmFill.position.set(-2.5, -1, 2);
    scene.add(warmFill);

    // 4. Spatial Curved Concave Mesh for True 3D Holographic Presence
    const planeGeo = new THREE.PlaneGeometry(3.6, 2.4, 32, 32);
    const posAttr = planeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      const distSq = (px * px) / 3.24 + (py * py) / 1.44;
      posAttr.setZ(i, -distSq * 0.14 + 0.03);
    }
    planeGeo.computeVertexNormals();

    const meshMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.28,
      metalness: 0.04,
      side: THREE.FrontSide,
    });
    photoMatRef.current = meshMaterial;

    const photoMesh = new THREE.Mesh(planeGeo, meshMaterial);
    photoMesh.position.set(0, 0, 0);
    scene.add(photoMesh);
    photoMeshRef.current = photoMesh;

    // Load initial texture
    getCachedTexture(
      capsuleRef.current.photoUrl,
      (tex) => {
        meshMaterial.map = tex;
        meshMaterial.needsUpdate = true;
      },
      () => {}
    );

    // 5. Hotspots Group
    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    // 6. Multi-Layer Atmospheric Particle System (Gentle, non-dizzying motes)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.random() * 2.5 + 0.2;

      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = -0.006 - Math.random() * 0.006;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesMeshRef.current = particles;

    // 7. Background Parallax Dust
    const bgStarCount = 90;
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarPos = new Float32Array(bgStarCount * 3);
    for (let i = 0; i < bgStarCount; i++) {
      bgStarPos[i * 3] = (Math.random() - 0.5) * 12;
      bgStarPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      bgStarPos[i * 3 + 2] = -2.5 - Math.random() * 3;
    }
    bgStarGeo.setAttribute("position", new THREE.BufferAttribute(bgStarPos, 3));
    const bgStarMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // 8. Animation Loop with Gentle Damping (Elderly-Friendly Calm Response)
    const startTime = performance.now();
    let curX = 0;
    let curY = 0;

    const animate = () => {
      const now = performance.now();
      const time = (now - startTime) * 0.001;

      if (autopilotRef.current) {
        const autoX = Math.sin(time * 0.22) * 0.45;
        const autoY = Math.cos(time * 0.15) * 0.25;
        curX += (autoX - curX) * 0.032;
        curY += (autoY - curY) * 0.032;
      } else {
        curX += (targetLookRef.current.x - curX) * 0.048;
        curY += (targetLookRef.current.y - curY) * 0.048;
      }

      if (cameraRef.current) {
        cameraRef.current.position.x = curX * 0.65;
        cameraRef.current.position.y = -curY * 0.40;
        cameraRef.current.position.z = 4.2 - Math.abs(curX) * 0.15;
        cameraRef.current.lookAt(0, 0, 0);
      }

      if (sunLightRef.current) {
        sunLightRef.current.position.x = 2.5 + curX * 1.5;
        sunLightRef.current.position.y = 3.5 - curY * 1.0;
      }

      if (photoMeshRef.current) {
        photoMeshRef.current.rotation.y = curX * 0.10 + Math.sin(time * 0.6) * 0.008;
        photoMeshRef.current.rotation.x = -curY * 0.07 + Math.cos(time * 0.4) * 0.006;
      }

      bgStars.position.x = curX * 0.2;
      bgStars.position.y = -curY * 0.1;

      // Pulse Hotspot Rings
      if (hotspotsGroupRef.current) {
        const currentHotspots = capsuleRef.current.hotspots || [];
        let closestHotspot: MemoryHotspot | null = null;
        let minDistance = 999;

        hotspotsGroupRef.current.children.forEach((subGroup, idx) => {
          const h = currentHotspots[idx];
          if (!h) return;

          const ring = subGroup.children[0] as THREE.Mesh | undefined;
          if (ring) {
            const pulse = 1 + Math.sin(time * 2.2 + idx) * 0.12;
            ring.scale.set(pulse, pulse, pulse);
          }

          const dx = targetLookRef.current.x - h.x;
          const dy = targetLookRef.current.y - h.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.28 && dist < minDistance) {
            minDistance = dist;
            closestHotspot = h;
          }
        });

        if (closestHotspot) {
          const found = closestHotspot as MemoryHotspot;
          if (activeHotspotIdRef.current !== found.id) {
            activeHotspotIdRef.current = found.id;
            onHotspotActiveRef.current?.(found);
          }
        } else {
          if (activeHotspotIdRef.current !== null) {
            activeHotspotIdRef.current = null;
            onHotspotActiveRef.current?.(null);
          }
        }
      }

      // Drift Particles
      if (particlesMeshRef.current) {
        const posArr = particlesMeshRef.current.geometry.attributes.position
          .array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3] += velocities[i * 3];
          posArr[i * 3 + 1] += velocities[i * 3 + 1];
          posArr[i * 3 + 2] += velocities[i * 3 + 2];

          if (posArr[i * 3 + 1] < -2.4) posArr[i * 3 + 1] = 2.4;
          if (posArr[i * 3 + 1] > 2.4) posArr[i * 3 + 1] = -2.4;
          if (posArr[i * 3] < -3.6) posArr[i * 3] = 3.6;
          if (posArr[i * 3] > 3.6) posArr[i * 3] = -3.6;
        }
        particlesMeshRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Pointer Drag & Click Handlers
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

      if (onPointerMoveRef.current) {
        onPointerMoveRef.current({
          x: Math.max(-1, Math.min(1, normX)),
          y: Math.max(-1, Math.min(1, normY)),
        });
      }
    };

    const handleClick = () => {
      if (activeHotspotIdRef.current && onHotspotClickRef.current) {
        const found = (capsuleRef.current.hotspots || []).find(
          (h) => h.id === activeHotspotIdRef.current
        );
        if (found) onHotspotClickRef.current(found);
      }
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("click", handleClick);
    container.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Window Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchmove", handlePointerMove);

      planeGeo.dispose();
      meshMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      bgStarGeo.dispose();
      bgStarMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []); // Mounted once: no re-renders or canvas teardowns!

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-shadow duration-500"
    />
  );
}
