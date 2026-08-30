"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface DrumScene3DProps {
  onDrumHit: (side: "left" | "right") => void;
  lastHitSide: "left" | "right" | null;
  lastHitTime: number;
}

export function DrumScene3D({
  onDrumHit,
  lastHitSide,
  lastHitTime,
}: DrumScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const leftHeadRef = useRef<THREE.Mesh | null>(null);
  const rightHeadRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<{ mesh: THREE.Mesh; opacity: number; scale: number }[]>([]);

  // Trigger visual drum deformation
  const triggerImpact = useCallback((side: "left" | "right") => {
    if (!sceneRef.current) return;
    const isLeft = side === "left";
    const xPos = isLeft ? -2.2 : 2.2;

    // Glowing Shockwave Ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    ringGeo.rotateY(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isLeft ? 0xf59e0b : 0xdc2626,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(xPos, 0, 0);
    sceneRef.current.add(ring);
    ringsRef.current.push({ mesh: ring, opacity: 0.9, scale: 1.0 });
  }, []);

  useEffect(() => {
    if (lastHitSide && lastHitTime > 0) {
      triggerImpact(lastHitSide);
    }
  }, [lastHitSide, lastHitTime, triggerImpact]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x181410); // Warm night acoustic space
    scene.fog = new THREE.FogExp2(0x181410, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 8.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    scene.add(ambientLight);

    const stageLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    stageLight.position.set(4, 8, 6);
    scene.add(stageLight);

    const drumGlow = new THREE.PointLight(0xf59e0b, 1.5, 10);
    drumGlow.position.set(0, 1, 3);
    scene.add(drumGlow);

    // 4. 3D BIHU DHOL BARREL BODY
    const drumGroup = new THREE.Group();

    // Wood Barrel (Curved Cylinder)
    const barrelGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.4, 32, 16);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x6b3008, roughness: 0.5, metalness: 0.1 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    drumGroup.add(barrel);

    // Red Lacquer Accent Ribbons
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const leftBand = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 8, 32), bandMat);
    leftBand.rotateY(Math.PI / 2);
    leftBand.position.x = -1.5;
    drumGroup.add(leftBand);

    const rightBand = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 8, 32), bandMat);
    rightBand.rotateY(Math.PI / 2);
    rightBand.position.x = 1.5;
    drumGroup.add(rightBand);

    // Leather Tension Thongs (W-Lacing)
    const laceMat = new THREE.LineBasicMaterial({ color: 0xe5e5e5, opacity: 0.8, transparent: true });
    const laceGeo = new THREE.BufferGeometry();
    const lacePos: number[] = [];
    const numPoints = 16;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const y1 = Math.sin(angle) * 1.25;
      const z1 = Math.cos(angle) * 1.25;
      const nextAngle = ((i + 1) / numPoints) * Math.PI * 2;
      const y2 = Math.sin(nextAngle) * 1.25;
      const z2 = Math.cos(nextAngle) * 1.25;

      lacePos.push(-2.1, y1, z1);
      lacePos.push(2.1, y2, z2);
    }
    laceGeo.setAttribute("position", new THREE.Float32BufferAttribute(lacePos, 3));
    const laces = new THREE.LineSegments(laceGeo, laceMat);
    drumGroup.add(laces);

    // 5. DRUM HEADS (COWHIDE / PARCHMENT)
    const headMatLeft = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const headGeoLeft = new THREE.CircleGeometry(1.18, 32);
    headGeoLeft.rotateY(-Math.PI / 2);
    const leftHead = new THREE.Mesh(headGeoLeft, headMatLeft);
    leftHead.position.x = -2.21;
    drumGroup.add(leftHead);
    leftHeadRef.current = leftHead;

    const headMatRight = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const headGeoRight = new THREE.CircleGeometry(1.18, 32);
    headGeoRight.rotateY(Math.PI / 2);
    const rightHead = new THREE.Mesh(headGeoRight, headMatRight);
    rightHead.position.x = 2.21;
    drumGroup.add(rightHead);
    rightHeadRef.current = rightHead;

    scene.add(drumGroup);

    // 6. ANIMATION LOOP
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle floating sway
      drumGroup.position.y = Math.sin(time * 1.5) * 0.08;
      drumGroup.rotation.y = Math.sin(time * 0.5) * 0.05;

      // Animate shockwave rings
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const r = ringsRef.current[i];
        r.scale += 0.08;
        r.mesh.scale.set(r.scale, r.scale, r.scale);
        r.opacity -= 0.035;
        (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, r.opacity);

        if (r.opacity <= 0) {
          scene.remove(r.mesh);
          r.mesh.geometry.dispose();
          ringsRef.current.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 7. RESIZE LISTENER
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
  }, []);

  // Raycasting on Drum Heads
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const normX = (event.clientX - rect.left) / rect.width;

    if (normX < 0.5) {
      onDrumHit("left");
    } else {
      onDrumHit("right");
    }
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      className="relative w-full aspect-[4/3] max-h-[440px] rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_#000] cursor-pointer select-none bg-[#181410]"
    />
  );
}
