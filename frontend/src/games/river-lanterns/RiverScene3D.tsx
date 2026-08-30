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
  const lanternsRef = useRef<{ mesh: THREE.Group; target: RiverTarget; baseY: number; origZ: number }[]>([]);
  const ripplesRef = useRef<{ x: number; z: number; radius: number; maxRadius: number; strength: number }[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const origPositionsRef = useRef<Float32Array | null>(null);

  // Helper to create a dynamic texture with the photo and name
  const createLanternTexture = useCallback((target: RiverTarget) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Warm parchment background
    ctx.fillStyle = "#FFF7ED";
    ctx.fillRect(0, 0, 256, 256);

    // Golden frame border
    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 244, 244);

    // Name banner
    ctx.fillStyle = "#1B4D3E";
    ctx.fillRect(10, 190, 236, 56);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px serif";
    ctx.textAlign = "center";
    ctx.fillText(target.name.slice(0, 16), 128, 224);

    // Load photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 24, 24, 208, 160);
      texture.needsUpdate = true;
    };
    img.src = target.photoUrl;

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Trigger ripple impulse
  const addRipple = useCallback((worldX: number, worldZ: number) => {
    if (ripplesRef.current.length < 8) {
      ripplesRef.current.push({
        x: worldX,
        z: worldZ,
        radius: 0.2,
        maxRadius: 7.0,
        strength: 0.45,
      });
    }
  }, []);

  // Handle external camera motion coords
  useEffect(() => {
    if (!motionCoords || !cameraRef.current) return;
    const worldX = (motionCoords.x - 0.5) * 14;
    const worldZ = -12 + motionCoords.y * 16;
    addRipple(worldX, worldZ);
  }, [motionCoords, addRipple]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x181410); // Deep sunset river night
    scene.fog = new THREE.FogExp2(0x181410, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, -8);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. SUNSET ATMOSPHERIC LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffb07c, 0.6);
    scene.add(ambientLight);

    const sunsetLight = new THREE.DirectionalLight(0xfde68a, 1.4);
    sunsetLight.position.set(10, 15, -20);
    scene.add(sunsetLight);

    // 4. PROCEDURAL 3D RIVER WATER MESH
    const waterGeo = new THREE.PlaneGeometry(36, 60, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);
    waterGeo.translate(0, 0, -10);

    const origPos = new Float32Array(waterGeo.attributes.position.array);
    origPositionsRef.current = origPos;

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f3b30, // Deep tea river green
      roughness: 0.15,
      metalness: 0.7,
      flatShading: false,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 5. 3D FLOATING LANTERNS
    lanternsRef.current = [];
    const spacing = 18 / Math.max(1, targets.length);

    targets.forEach((target, i) => {
      const group = new THREE.Group();

      // Octagonal Lantern Body
      const bodyGeo = new THREE.CylinderGeometry(0.85, 0.7, 1.5, 8);
      const texture = createLanternTexture(target);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.75;
      group.add(body);

      // Brass Base & Pagoda Roof
      const capGeo = new THREE.ConeGeometry(1.05, 0.5, 8);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.2 });
      const roof = new THREE.Mesh(capGeo, brassMat);
      roof.position.y = 1.65;
      group.add(roof);

      const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.2, 8);
      const base = new THREE.Mesh(baseGeo, brassMat);
      base.position.y = 0.1;
      group.add(base);

      // Warm Point Light inside Lantern
      const light = new THREE.PointLight(0xf59e0b, 1.8, 8);
      light.position.set(0, 0.8, 0);
      group.add(light);

      // Positioning along river
      const xPos = (i - (targets.length - 1) / 2) * 4.2;
      const zPos = -18 + i * spacing;
      group.position.set(xPos, 0, zPos);

      scene.add(group);
      lanternsRef.current.push({ mesh: group, target, baseY: 0, origZ: zPos });
    });

    // 6. 3D FIREFLIES & SUNSET EMBERS
    const particleCount = 75;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      partPositions[p] = (Math.random() - 0.5) * 24;
      partPositions[p + 1] = 0.5 + Math.random() * 5;
      partPositions[p + 2] = -25 + Math.random() * 30;
    }
    partGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.22,
      transparent: true,
      opacity: 0.8,
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

      // Deform River Water Surface with Waves & Ripples
      if (waterMeshRef.current && origPositionsRef.current) {
        const posAttr = waterMeshRef.current.geometry.attributes.position;
        const posArr = posAttr.array as Float32Array;
        const origArr = origPositionsRef.current;

        for (let i = 0; i < posArr.length; i += 3) {
          const vx = origArr[i];
          const vz = origArr[i + 2];

          // Gentle base river current
          let wave =
            Math.sin(vx * 0.4 + time * 1.5) * 0.12 +
            Math.cos(vz * 0.3 + time * 1.2) * 0.15;

          // Dynamic expanding ripples
          for (const rip of ripplesRef.current) {
            const dx = vx - rip.x;
            const dz = vz - rip.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < rip.radius && dist > rip.radius - 1.2) {
              const falloff = 1.0 - rip.radius / rip.maxRadius;
              wave += Math.sin((dist - rip.radius) * 3) * rip.strength * falloff;
            }
          }

          posArr[i + 1] = wave; // Y displacement
        }
        posAttr.needsUpdate = true;
      }

      // Update and prune expanding ripples
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rip = ripplesRef.current[r];
        rip.radius += 0.08;
        if (rip.radius >= rip.maxRadius) {
          ripplesRef.current.splice(r, 1);
        }
      }

      // Bobbing & Swirling Lanterns
      lanternsRef.current.forEach((l, idx) => {
        const bob = Math.sin(time * 1.8 + idx * 1.5) * 0.14;
        l.mesh.position.y = l.baseY + bob;
        l.mesh.rotation.y = Math.sin(time * 0.5 + idx) * 0.15;
        l.mesh.rotation.z = Math.cos(time * 0.8 + idx) * 0.04;
      });

      // Drift Fireflies
      const pAttr = particles.geometry.attributes.position;
      const pArr = pAttr.array as Float32Array;
      for (let p = 0; p < pArr.length; p += 3) {
        pArr[p + 1] += Math.sin(time * 2 + p) * 0.005;
        pArr[p] += Math.cos(time + p) * 0.003;
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
  }, [targets, createLanternTexture]);

  // Click & Touch Raycasting on 3D Lanterns
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Trigger visual water ripple at world coords
    const worldX = x * 10;
    const worldZ = -4 - (1 - y) * 12;
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
      }
    } else {
      // Default to active target if tapped nearby
      if (targets[activeTargetIndex]) {
        onSelectTarget(targets[activeTargetIndex]);
      }
    }
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      className="relative w-full aspect-[4/3] max-h-[460px] rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_#000] cursor-pointer select-none bg-[#181410]"
    />
  );
}
