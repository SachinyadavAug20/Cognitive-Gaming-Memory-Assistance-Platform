"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export interface RiverTarget {
  id: string | number;
  name: string;
  relationOrType: string;
  photoUrl: string;
  notes: string;
}

interface RiverScene3DProps {
  targets: RiverTarget[];
  activeTargetIndex: number;
  motionCoords: { x: number; y: number } | null;
  onSelectTarget: (target: RiverTarget) => void;
}

export function RiverScene3D({
  targets,
  activeTargetIndex,
  motionCoords,
  onSelectTarget,
}: RiverScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lanternsRef = useRef<{
    mesh: THREE.Group;
    target: RiverTarget;
    baseY: number;
    targetZ: number;
    beacon: THREE.Mesh;
    halo: THREE.PointLight;
  }[]>([]);
  const ripplesRef = useRef<{ x: number; z: number; radius: number; maxRadius: number; strength: number }[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const origPositionsRef = useRef<Float32Array | null>(null);

  // Helper to create a dynamic texture with high-contrast photo and name
  const createLanternTexture = useCallback((target: RiverTarget) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Warm golden parchment
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(0, 0, 256, 256);

    // High-contrast gold & tea borders
    ctx.strokeStyle = "#B45309";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Name banner at bottom
    ctx.fillStyle = "#064E3B";
    ctx.fillRect(10, 185, 236, 60);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px serif";
    ctx.textAlign = "center";
    ctx.fillText(target.name.slice(0, 16), 128, 222);

    // Photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 24, 24, 208, 155);
      texture.needsUpdate = true;
    };
    img.src = target.photoUrl;

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Trigger ripple impulse on water
  const addRipple = useCallback((worldX: number, worldZ: number) => {
    if (ripplesRef.current.length < 10) {
      ripplesRef.current.push({
        x: worldX,
        z: worldZ,
        radius: 0.15,
        maxRadius: 8.0,
        strength: 0.55,
      });
    }
  }, []);

  // Handle external camera motion coords
  useEffect(() => {
    if (!motionCoords || !cameraRef.current) return;
    const worldX = (motionCoords.x - 0.5) * 12;
    const worldZ = -8 + motionCoords.y * 12;
    addRipple(worldX, worldZ);
  }, [motionCoords, addRipple]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. SCENE & CAMERA (Closer, warmer, clearer view)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1914); // Deep Brahmaputra sunset emerald-night
    scene.fog = new THREE.FogExp2(0x0a1914, 0.02);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 4.8, 9.5);
    camera.lookAt(0, 0.5, -4);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. SUNSET & RIVER LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    scene.add(ambientLight);

    const moonGlow = new THREE.DirectionalLight(0xfef08a, 1.8);
    moonGlow.position.set(8, 14, -10);
    scene.add(moonGlow);

    // 4. PROCEDURAL 3D RIVER WATER MESH
    const waterGeo = new THREE.PlaneGeometry(36, 48, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);
    waterGeo.translate(0, 0, -4);

    const origPos = new Float32Array(waterGeo.attributes.position.array);
    origPositionsRef.current = origPos;

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep tea green river water
      roughness: 0.1,
      metalness: 0.8,
      flatShading: false,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 5. 3D FLOATING LANTERNS (Enlarged & Prominently Positioned)
    lanternsRef.current = [];
    const count = targets.length;

    targets.forEach((target, i) => {
      const group = new THREE.Group();

      // Octagonal Lantern Body (Enlarged for high visibility)
      const bodyGeo = new THREE.CylinderGeometry(1.1, 0.9, 1.8, 8);
      const texture = createLanternTexture(target);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.9;
      group.add(body);

      // Brass Base & Pagoda Roof
      const capGeo = new THREE.ConeGeometry(1.35, 0.65, 8);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.2 });
      const roof = new THREE.Mesh(capGeo, brassMat);
      roof.position.y = 2.05;
      group.add(roof);

      const baseGeo = new THREE.CylinderGeometry(1.0, 1.15, 0.25, 8);
      const base = new THREE.Mesh(baseGeo, brassMat);
      base.position.y = 0.12;
      group.add(base);

      // Warm Point Light inside Lantern
      const light = new THREE.PointLight(0xf59e0b, 2.4, 10);
      light.position.set(0, 1.0, 0);
      group.add(light);

      // Pulsing Golden Beacon Ring above the Lantern
      const beaconGeo = new THREE.TorusGeometry(1.4, 0.08, 12, 24);
      beaconGeo.rotateX(Math.PI / 2);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: i === activeTargetIndex ? 0.9 : 0.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.7;
      group.add(beacon);

      // Positioning along river shore (Spaced cleanly within view)
      const xPos = (i - (count - 1) / 2) * 3.6;
      // Active target floats closer to the shore (Z = -2.5), others float slightly further (Z = -6)
      const initialZ = i === activeTargetIndex ? -2.2 : -5.8 - Math.abs(xPos) * 0.4;
      group.position.set(xPos, 0, initialZ);

      scene.add(group);
      lanternsRef.current.push({
        mesh: group,
        target,
        baseY: 0,
        targetZ: initialZ,
        beacon,
        halo: light,
      });
    });

    // 6. 3D GOLDEN RIVER EMBERS & FIREFLIES
    const particleCount = 90;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      partPositions[p] = (Math.random() - 0.5) * 22;
      partPositions[p + 1] = 0.4 + Math.random() * 4.5;
      partPositions[p + 2] = -16 + Math.random() * 20;
    }
    partGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 7. ANIMATION LOOP
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Deform River Water Surface
      if (waterMeshRef.current && origPositionsRef.current) {
        const posAttr = waterMeshRef.current.geometry.attributes.position;
        const posArr = posAttr.array as Float32Array;
        const origArr = origPositionsRef.current;

        for (let i = 0; i < posArr.length; i += 3) {
          const vx = origArr[i];
          const vz = origArr[i + 2];

          // Gentle Brahmaputra river swell
          let wave =
            Math.sin(vx * 0.35 + time * 1.6) * 0.14 +
            Math.cos(vz * 0.28 + time * 1.3) * 0.16;

          // Dynamic expanding ripples
          for (const rip of ripplesRef.current) {
            const dx = vx - rip.x;
            const dz = vz - rip.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < rip.radius && dist > rip.radius - 1.4) {
              const falloff = 1.0 - rip.radius / rip.maxRadius;
              wave += Math.sin((dist - rip.radius) * 3.5) * rip.strength * falloff;
            }
          }

          posArr[i + 1] = wave;
        }
        posAttr.needsUpdate = true;
      }

      // Update ripples
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rip = ripplesRef.current[r];
        rip.radius += 0.09;
        if (rip.radius >= rip.maxRadius) {
          ripplesRef.current.splice(r, 1);
        }
      }

      // Bobbing & Swirling Lanterns
      lanternsRef.current.forEach((l, idx) => {
        const isActive = idx === activeTargetIndex;
        const bob = Math.sin(time * 1.9 + idx * 1.4) * (isActive ? 0.18 : 0.12);
        l.mesh.position.y = l.baseY + bob;
        l.mesh.rotation.y = Math.sin(time * 0.6 + idx) * 0.2;
        l.mesh.rotation.z = Math.cos(time * 0.9 + idx) * 0.05;

        // Smoothly glide active lantern toward foreground
        const targetZ = isActive ? -2.0 : -6.0 - Math.abs(l.mesh.position.x) * 0.3;
        l.mesh.position.z += (targetZ - l.mesh.position.z) * 0.04;

        // Pulse Beacon on Active Target
        if (l.beacon) {
          const mat = l.beacon.material as THREE.MeshBasicMaterial;
          if (isActive) {
            const pulse = 0.65 + Math.sin(time * 4) * 0.35;
            mat.opacity = pulse;
            l.beacon.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1);
            l.halo.intensity = 2.8 + pulse * 1.2;
          } else {
            mat.opacity = 0.15;
            l.beacon.scale.set(1, 1, 1);
            l.halo.intensity = 1.5;
          }
        }
      });

      // Drift Fireflies
      const pAttr = particles.geometry.attributes.position;
      const pArr = pAttr.array as Float32Array;
      for (let p = 0; p < pArr.length; p += 3) {
        pArr[p + 1] += Math.sin(time * 2 + p) * 0.006;
        pArr[p] += Math.cos(time + p) * 0.004;
      }
      pAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 8. RESIZE LISTENER
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [targets, activeTargetIndex, createLanternTexture]);

  // Click & Touch Handler with Ultra-Forgiving Hitbox
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Trigger visual water ripple
    const worldX = x * 8;
    const worldZ = -2 - (1 - y) * 8;
    addRipple(worldX, worldZ);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const lanternMeshes = lanternsRef.current.map((l) => l.mesh);
    const intersects = raycaster.intersectObjects(lanternMeshes, true);

    if (intersects.length > 0) {
      let topMesh: THREE.Object3D | null = intersects[0].object;
      while (topMesh && topMesh.parent && topMesh.parent !== sceneRef.current) {
        topMesh = topMesh.parent;
      }
      const match = lanternsRef.current.find((l) => l.mesh === topMesh);
      if (match) {
        onSelectTarget(match.target);
        return;
      }
    }

    // Ultra-forgiving fallback: Tap anywhere on water catches the active target lantern!
    if (targets[activeTargetIndex]) {
      onSelectTarget(targets[activeTargetIndex]);
    }
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      className="relative w-full aspect-[16/10] sm:aspect-[4/3] max-h-[440px] rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_#000] cursor-pointer select-none bg-[#0a1914] touch-none"
    />
  );
}
