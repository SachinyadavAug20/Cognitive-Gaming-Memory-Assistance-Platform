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
  onPointerMove?: (coords: { x: number; y: number }) => void;
  onHotspotActive?: (hotspot: MemoryHotspot | null) => void;
  onHotspotClick?: (hotspot: MemoryHotspot) => void;
}

export function Capsule3DScene({
  capsule,
  coords,
  colorFilter = "natural",
  onPointerMove,
  onHotspotActive,
  onHotspotClick,
}: Capsule3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const photoMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetLookRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const activeHotspotIdRef = useRef<string | null>(null);

  // Update target coordinates from props
  useEffect(() => {
    targetLookRef.current = coords;
  }, [coords]);

  // Update lights & atmosphere when colorFilter changes
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    if (colorFilter === "golden_hour") {
      sceneRef.current.background = new THREE.Color(0x1a1309);
      ambientLightRef.current.color.setHex(0xfde68a);
      ambientLightRef.current.intensity = 0.95;
      sunLightRef.current.color.setHex(0xf59e0b);
      sunLightRef.current.intensity = 1.45;
    } else if (colorFilter === "monsoon_emerald") {
      sceneRef.current.background = new THREE.Color(0x041f1e);
      ambientLightRef.current.color.setHex(0xa7f3d0);
      ambientLightRef.current.intensity = 0.9;
      sunLightRef.current.color.setHex(0x6ee7b7);
      sunLightRef.current.intensity = 1.25;
    } else if (colorFilter === "kodachrome") {
      sceneRef.current.background = new THREE.Color(0x18100e);
      ambientLightRef.current.color.setHex(0xffedd5);
      ambientLightRef.current.intensity = 1.0;
      sunLightRef.current.color.setHex(0xfb923c);
      sunLightRef.current.intensity = 1.5;
    } else if (colorFilter === "twilight") {
      sceneRef.current.background = new THREE.Color(0x0f172a);
      ambientLightRef.current.color.setHex(0xc084fc);
      ambientLightRef.current.intensity = 0.8;
      sunLightRef.current.color.setHex(0x818cf8);
      sunLightRef.current.intensity = 1.1;
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.9;
      sunLightRef.current.color.setHex(0xfef3c7);
      sunLightRef.current.intensity = 1.2;
    }
  }, [colorFilter]);

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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Dynamic Atmospheric & Sunlight Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.25);
    sunLight.position.set(3, 4, 3);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const warmFill = new THREE.PointLight(0xf59e0b, 0.8, 12);
    warmFill.position.set(-2.5, -1, 2);
    scene.add(warmFill);

    // 4. Spatial Curved Concave Mesh for True 3D Holographic Presence
    const planeGeo = new THREE.PlaneGeometry(3.6, 2.4, 40, 40);
    const posAttr = planeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      // Concave curvature pulls outer edges back, pushing focal center into 3D space
      const distSq = (px * px) / 3.24 + (py * py) / 1.44;
      posAttr.setZ(i, -distSq * 0.16 + 0.04);
    }
    planeGeo.computeVertexNormals();

    const textureLoader = new THREE.TextureLoader();
    let meshMaterial: THREE.MeshStandardMaterial;

    textureLoader.load(
      capsule.photoUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        meshMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.28,
          metalness: 0.04,
          side: THREE.FrontSide,
        });

        const mesh = new THREE.Mesh(planeGeo, meshMaterial);
        mesh.position.set(0, 0, 0);
        scene.add(mesh);
        photoMeshRef.current = mesh;
      },
      undefined,
      () => {
        // Fallback procedural canvas texture if image fails
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 340;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#1E5136";
          ctx.fillRect(0, 0, 512, 340);
          ctx.fillStyle = "#FAF3E0";
          ctx.font = "bold 26px serif";
          ctx.textAlign = "center";
          ctx.fillText(capsule.title, 256, 170);
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({ map: fallbackTex });
        const mesh = new THREE.Mesh(planeGeo, mat);
        scene.add(mesh);
        photoMeshRef.current = mesh;
      }
    );

    // 5. Interactive 3D Joy Trigger Hotspot Rings
    const hotspotMeshes: Array<{
      hotspot: MemoryHotspot;
      group: THREE.Group;
      ringMesh: THREE.Mesh;
      coreMesh: THREE.Mesh;
    }> = [];

    const hotspots = capsule.hotspots || [];
    hotspots.forEach((h) => {
      const group = new THREE.Group();
      // Map normalized coordinates [-1..1] to world coordinates
      const worldX = h.x * 1.55;
      const worldY = h.y * 1.05;
      // Slightly forward from the curved mesh
      const worldZ = 0.08;
      group.position.set(worldX, worldY, worldZ);

      // Outer glowing ring
      const ringGeo = new THREE.RingGeometry(0.065, 0.085, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);

      // Inner glowing pearl core
      const coreGeo = new THREE.CircleGeometry(0.035, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);

      group.add(ringMesh);
      group.add(coreMesh);
      scene.add(group);

      hotspotMeshes.push({ hotspot: h, group, ringMesh, coreMesh });
    });

    // 6. Multi-Layer Atmospheric Particle System (Foreground Floating Motes)
    const particleCount = 320;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      // Spread in front of and around the photo plane for high-depth parallax
      positions[i * 3 + 2] = Math.random() * 2.5 + 0.2;

      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] =
        capsule.atmosphereParticle === "gentle_rain"
          ? -0.045 - Math.random() * 0.035
          : (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    let pColor = 0xfde68a; // Golden sun motes default
    if (capsule.atmosphereParticle === "gentle_rain") pColor = 0x93c5fd;
    if (capsule.atmosphereParticle === "flower_petals") pColor = 0xf472b6;
    if (capsule.atmosphereParticle === "river_mist") pColor = 0xe0e7ff;
    if (capsule.atmosphereParticle === "fireflies") pColor = 0xa3e635;

    const particleMat = new THREE.PointsMaterial({
      color: pColor,
      size: capsule.atmosphereParticle === "gentle_rain" ? 0.038 : 0.065,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesMeshRef.current = particles;

    // 7. Ambient Deep Space Dust (Slow Background Parallax Layer)
    const bgStarCount = 180;
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
      size: 0.04,
      transparent: true,
      opacity: 0.45,
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // 8. Animation Loop with Parallax Smoothing & Hotspot Hover Raycast
    const clock = new THREE.Clock();
    let curX = 0;
    let curY = 0;

    const animate = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation towards target look coordinates
      curX += (targetLookRef.current.x - curX) * 0.075;
      curY += (targetLookRef.current.y - curY) * 0.075;

      if (cameraRef.current) {
        cameraRef.current.position.x = curX * 0.85;
        cameraRef.current.position.y = -curY * 0.5;
        cameraRef.current.position.z = 4.2 - Math.abs(curX) * 0.25;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Dynamic Sunlight position tracking head angle
      if (sunLightRef.current) {
        sunLightRef.current.position.x = 2.5 + curX * 1.8;
        sunLightRef.current.position.y = 3.5 - curY * 1.2;
      }

      // Subtle 3D plane breathing tilt & micro-rotation
      if (photoMeshRef.current) {
        photoMeshRef.current.rotation.y = curX * 0.14 + Math.sin(time * 0.7) * 0.012;
        photoMeshRef.current.rotation.x = -curY * 0.09 + Math.cos(time * 0.5) * 0.008;
      }

      // Background stars slow parallax
      bgStars.position.x = curX * 0.25;
      bgStars.position.y = -curY * 0.15;

      // Pulse and test proximity to hotspots
      let closestHotspot: MemoryHotspot | null = null;
      let minDistance = 999;

      hotspotMeshes.forEach(({ hotspot, group, ringMesh, coreMesh }) => {
        // Breathing pulse
        const pulse = 1 + Math.sin(time * 3 + hotspot.x) * 0.15;
        ringMesh.scale.set(pulse, pulse, pulse);

        // Distance from current gaze/pointer coordinates
        const dx = targetLookRef.current.x - hotspot.x;
        const dy = targetLookRef.current.y - hotspot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.32) {
          // Hovered / focused hotspot
          ringMesh.scale.set(1.4, 1.4, 1.4);
          (ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0xfbbf24);
          (coreMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);

          if (dist < minDistance) {
            minDistance = dist;
            closestHotspot = hotspot;
          }
        } else {
          (ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
          (coreMesh.material as THREE.MeshBasicMaterial).color.setHex(0xfef3c7);
        }
      });

      if (closestHotspot) {
        const found = closestHotspot as MemoryHotspot;
        if (activeHotspotIdRef.current !== found.id) {
          activeHotspotIdRef.current = found.id;
          onHotspotActive?.(found);
        }
      } else {
        if (activeHotspotIdRef.current !== null) {
          activeHotspotIdRef.current = null;
          onHotspotActive?.(null);
        }
      }

      // Drift atmospheric particles (high parallax speed)
      if (particlesMeshRef.current) {
        const posArr = particlesMeshRef.current.geometry.attributes.position
          .array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3] += velocities[i * 3] + Math.sin(time + i) * 0.0012;
          posArr[i * 3 + 1] += velocities[i * 3 + 1];
          posArr[i * 3 + 2] += velocities[i * 3 + 2];

          // Wrap boundary edges
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
    const handlePointerDown = () => {
      isDraggingRef.current = true;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

      if (onPointerMove) {
        onPointerMove({
          x: Math.max(-1, Math.min(1, normX)),
          y: Math.max(-1, Math.min(1, normY)),
        });
      }
    };

    const handleClick = () => {
      if (activeHotspotIdRef.current && onHotspotClick) {
        const found = hotspots.find((h) => h.id === activeHotspotIdRef.current);
        if (found) onHotspotClick(found);
      }
    };

    container.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("click", handleClick);
    container.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("touchend", handlePointerUp);
    container.addEventListener("touchmove", handlePointerMove);

    // Resize Observer
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
      container.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchend", handlePointerUp);
      container.removeEventListener("touchmove", handlePointerMove);

      planeGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      bgStarGeo.dispose();
      bgStarMat.dispose();
      hotspotMeshes.forEach(({ ringMesh, coreMesh }) => {
        ringMesh.geometry.dispose();
        (ringMesh.material as THREE.Material).dispose();
        coreMesh.geometry.dispose();
        (coreMesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [capsule, onHotspotActive, onHotspotClick, onPointerMove]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[440px] md:min-h-[540px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
    />
  );
}
