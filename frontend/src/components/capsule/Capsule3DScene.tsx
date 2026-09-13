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
  coords?: { x: number; y: number };
  colorFilter?: MemoryColorFilter;
  autopilot?: boolean;
  zenMode?: boolean;
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
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
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
  zenMode = false,
  onPointerMove,
  onHotspotActive,
  onHotspotClick,
}: Capsule3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const photoMeshRef = useRef<THREE.Mesh | null>(null);
  const frameMeshRef = useRef<THREE.Mesh | null>(null);
  const photoMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetLookRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeHotspotIdRef = useRef<string | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

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

  // Update target coordinates smoothly if external coords provided
  useEffect(() => {
    if (coords) {
      targetLookRef.current = coords;
    }
  }, [coords]);

  // Update atmosphere lighting when colorFilter changes
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    if (colorFilter === "golden_hour") {
      sceneRef.current.background = new THREE.Color(0x0c0d14);
      ambientLightRef.current.color.setHex(0xfde68a);
      ambientLightRef.current.intensity = 0.95;
      sunLightRef.current.color.setHex(0xf59e0b);
      sunLightRef.current.intensity = 1.35;
    } else if (colorFilter === "monsoon_emerald") {
      sceneRef.current.background = new THREE.Color(0x041918);
      ambientLightRef.current.color.setHex(0xa7f3d0);
      ambientLightRef.current.intensity = 0.90;
      sunLightRef.current.color.setHex(0x6ee7b7);
      sunLightRef.current.intensity = 1.25;
    } else if (colorFilter === "kodachrome") {
      sceneRef.current.background = new THREE.Color(0x120e0c);
      ambientLightRef.current.color.setHex(0xffedd5);
      ambientLightRef.current.intensity = 0.98;
      sunLightRef.current.color.setHex(0xfb923c);
      sunLightRef.current.intensity = 1.40;
    } else if (colorFilter === "twilight") {
      sceneRef.current.background = new THREE.Color(0x0a0c18);
      ambientLightRef.current.color.setHex(0xc084fc);
      ambientLightRef.current.intensity = 0.82;
      sunLightRef.current.color.setHex(0x818cf8);
      sunLightRef.current.intensity = 1.10;
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.92;
      sunLightRef.current.color.setHex(0xfef3c7);
      sunLightRef.current.intensity = 1.25;
    }
  }, [colorFilter]);

  // Helper to recompute framing size to fill viewport while preserving photo aspect ratio
  const updatePlaneFraming = () => {
    if (!photoMeshRef.current || !cameraRef.current) return;
    const tex = photoMatRef.current?.map;
    const img = tex?.image as HTMLImageElement | undefined;
    const imgAspect = img && img.width && img.height ? img.width / img.height : 1.5;

    const cam = cameraRef.current;
    const vFOV = THREE.MathUtils.degToRad(cam.fov);
    const distance = cam.position.z;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
    const visibleWidth = visibleHeight * cam.aspect;

    // Occupy generous proportion of screen without cropping or warping
    const marginFactor = zenMode ? 0.88 : 0.82;
    const maxH = visibleHeight * marginFactor;
    const maxW = visibleWidth * marginFactor;

    let planeW = maxW;
    let planeH = planeW / imgAspect;

    if (planeH > maxH) {
      planeH = maxH;
      planeW = planeH * imgAspect;
    }

    photoMeshRef.current.scale.set(planeW, planeH, 1);
    if (frameMeshRef.current) {
      frameMeshRef.current.scale.set(planeW * 1.025 + 0.04, planeH * 1.025 + 0.04, 1);
    }

    // Position Hotspots correctly scaled
    const group = hotspotsGroupRef.current;
    if (group) {
      const hotspots = capsuleRef.current.hotspots || [];
      group.children.forEach((subGroup, idx) => {
        const h = hotspots[idx];
        if (h) {
          subGroup.position.set((h.x * planeW) * 0.48, (h.y * planeH) * 0.48, 0.04);
        }
      });
    }
  };

  // Trigger resize & re-framing when zenMode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      resizeHandlerRef.current?.();
    }, 60);
    return () => clearTimeout(timer);
  }, [zenMode]);

  // Update texture & hotspots in-place when capsule changes
  useEffect(() => {
    if (!photoMatRef.current || !sceneRef.current) return;

    // Load or apply cached texture
    getCachedTexture(
      capsule.photoUrl,
      (tex) => {
        if (photoMatRef.current) {
          photoMatRef.current.map = tex;
          photoMatRef.current.needsUpdate = true;
          updatePlaneFraming();
        }
      },
      () => {
        // Fallback procedural canvas
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 420;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#1E5136";
          ctx.fillRect(0, 0, 640, 420);
          ctx.fillStyle = "#FAF3E0";
          ctx.font = "bold 28px serif";
          ctx.textAlign = "center";
          ctx.fillText(capsule.title, 320, 210);
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        if (photoMatRef.current) {
          photoMatRef.current.map = fallbackTex;
          photoMatRef.current.needsUpdate = true;
          updatePlaneFraming();
        }
      }
    );

    // Rebuild Hotspots in the group without touching scene
    const group = hotspotsGroupRef.current;
    if (group) {
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        if ("geometry" in obj) (obj as THREE.Mesh).geometry.dispose();
      }

      const hotspots = capsule.hotspots || [];
      hotspots.forEach((h) => {
        const sub = new THREE.Group();
        sub.position.set(h.x * 1.55, h.y * 1.05, 0.04);

        const ringGeo = new THREE.RingGeometry(0.06, 0.08, 32);
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
      updatePlaneFraming();
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

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);
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
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Dynamic Atmospheric & Sunlight Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.92);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.25);
    sunLight.position.set(3, 4, 3);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const warmFill = new THREE.PointLight(0xf59e0b, 0.70, 12);
    warmFill.position.set(-2.5, -1, 2);
    scene.add(warmFill);

    // 4. Clean, Unwarped Flat High-Res Photo Plane (Faithful Real-World Photo)
    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const meshMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.02,
      side: THREE.FrontSide,
    });
    photoMatRef.current = meshMaterial;

    const photoMesh = new THREE.Mesh(planeGeo, meshMaterial);
    photoMesh.position.set(0, 0, 0);
    scene.add(photoMesh);
    photoMeshRef.current = photoMesh;

    // Subtle Framed Matting Backing Plate
    const frameGeo = new THREE.PlaneGeometry(1, 1);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.05,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, -0.015);
    scene.add(frameMesh);
    frameMeshRef.current = frameMesh;

    // Load initial texture
    getCachedTexture(
      capsuleRef.current.photoUrl,
      (tex) => {
        meshMaterial.map = tex;
        meshMaterial.needsUpdate = true;
        updatePlaneFraming();
      },
      () => {}
    );

    // 5. Hotspots Group
    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    // 6. Multi-Layer Atmospheric Particle System (Gentle, non-dizzying motes)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.random() * 2.2 + 0.1;

      velocities[i * 3] = (Math.random() - 0.5) * 0.0015;
      velocities[i * 3 + 1] = -0.004 - Math.random() * 0.004;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.045,
      transparent: true,
      opacity: 0.50,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesMeshRef.current = particles;

    // 7. Background Parallax Dust
    const bgStarCount = 70;
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
      size: 0.03,
      transparent: true,
      opacity: 0.30,
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // Initial scale calculation
    updatePlaneFraming();

    // 8. Animation Loop with Gentle Damping (Elderly-Friendly Calm Response)
    const startTime = performance.now();
    let curX = 0;
    let curY = 0;

    const animate = () => {
      const now = performance.now();
      const time = (now - startTime) * 0.001;

      if (autopilotRef.current) {
        const autoX = Math.sin(time * 0.22) * 0.35;
        const autoY = Math.cos(time * 0.15) * 0.20;
        curX += (autoX - curX) * 0.032;
        curY += (autoY - curY) * 0.032;
      } else {
        curX += (targetLookRef.current.x - curX) * 0.048;
        curY += (targetLookRef.current.y - curY) * 0.048;
      }

      if (cameraRef.current) {
        // Very subtle camera shift to prevent disorientation
        cameraRef.current.position.x = curX * 0.35;
        cameraRef.current.position.y = -curY * 0.22;
        cameraRef.current.position.z = 3.8;
        cameraRef.current.lookAt(0, 0, 0);
      }

      if (photoMeshRef.current) {
        photoMeshRef.current.rotation.y = curX * 0.05;
        photoMeshRef.current.rotation.x = -curY * 0.035;
      }
      if (frameMeshRef.current && photoMeshRef.current) {
        frameMeshRef.current.rotation.copy(photoMeshRef.current.rotation);
      }

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

          if (posArr[i * 3 + 1] < -2.2) posArr[i * 3 + 1] = 2.2;
          if (posArr[i * 3 + 1] > 2.2) posArr[i * 3 + 1] = -2.2;
          if (posArr[i * 3] < -3.4) posArr[i * 3] = 3.4;
          if (posArr[i * 3] > 3.4) posArr[i * 3] = -3.4;
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
      if (rect.width <= 0 || rect.height <= 0) return;
      const normX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
      const normY = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));

      targetLookRef.current = { x: normX, y: normY };

      if (onPointerMoveRef.current) {
        onPointerMoveRef.current({
          x: normX,
          y: normY,
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

    // Robust Resize Observer: Handles both Window Resize and Container Dimension Changes (Zen Mode)
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw <= 0 || nh <= 0) return;

      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
      updatePlaneFraming();
    };
    resizeHandlerRef.current = handleResize;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchmove", handlePointerMove);

      planeGeo.dispose();
      frameGeo.dispose();
      meshMaterial.dispose();
      frameMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      bgStarGeo.dispose();
      bgStarMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-shadow duration-500"
    />
  );
}
