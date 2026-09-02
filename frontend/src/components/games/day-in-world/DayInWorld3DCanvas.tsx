"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { DayChapter } from "./dayInWorldTypes";

interface DayInWorld3DCanvasProps {
  currentChapter: DayChapter;
}

export function DayInWorld3DCanvas({ currentChapter }: DayInWorld3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

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
        // Golden Key
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

        // Sun Cap
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

        // Cloth Gamusa Bag
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
      const canopyMat = new THREE.MeshStandardMaterial({ color: "#DC2626" });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(-2.5, 2.2, -1);
      canopy.rotation.y = Math.PI / 4;
      scene.add(canopy);
    }

    // Animation Loop (Gentle camera breathe)
    let angle = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      angle += 0.005;
      camera.position.x = Math.sin(angle) * 0.35;
      camera.lookAt(0, 1.2, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && container) {
        container.innerHTML = "";
      }
    };
  }, [currentChapter]);

  return (
    <div
      ref={mountRef}
      className="relative h-[220px] w-full rounded-2xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000]"
    />
  );
}
