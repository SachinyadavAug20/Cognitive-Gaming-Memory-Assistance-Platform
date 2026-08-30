"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface LoomScene3DProps {
  progressRows: number; // 0..10
  shuttlePosition: number; // -1 (left) to 1 (right)
  threadColor: string;
  onShuttlePass?: () => void;
}

export function LoomScene3D({
  progressRows,
  shuttlePosition,
  threadColor,
  onShuttlePass,
}: LoomScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const shuttleMeshRef = useRef<THREE.Group | null>(null);
  const clothMeshRef = useRef<THREE.Mesh | null>(null);
  const clothCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const clothTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Redraw procedural cloth canvas
  const updateClothTexture = useCallback(
    (rows: number, activeColor: string) => {
      const canvas = clothCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ivory raw silk background
      ctx.fillStyle = "#FDFBF7";
      ctx.fillRect(0, 0, 512, 512);

      // Vertical golden warp lines
      ctx.strokeStyle = "#E5D5BA";
      ctx.lineWidth = 2;
      for (let x = 8; x < 512; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Woven rows from bottom up
      const rowHeight = 44;
      for (let r = 0; r < rows; r++) {
        const y = 512 - (r + 1) * rowHeight;

        // Base weft band
        ctx.fillStyle = activeColor;
        ctx.fillRect(16, y, 480, rowHeight - 4);

        // Traditional Gos Phool / Diamond geometry motif
        ctx.fillStyle = "#F59E0B";
        for (let x = 32; x < 480; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x + 24, y + 4);
          ctx.lineTo(x + 40, y + rowHeight / 2 - 2);
          ctx.lineTo(x + 24, y + rowHeight - 8);
          ctx.lineTo(x + 8, y + rowHeight / 2 - 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (clothTextureRef.current) {
        clothTextureRef.current.needsUpdate = true;
      }
    },
    []
  );

  useEffect(() => {
    updateClothTexture(progressRows, threadColor);
  }, [progressRows, threadColor, updateClothTexture]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1612); // Workshop cedar atmosphere
    scene.fog = new THREE.FogExp2(0x1a1612, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. WARM LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffbe76, 1.2);
    sunLight.position.set(5, 10, 6);
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.2, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 4. WOODEN LOOM FRAME
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.8, metalness: 0.1 });
    const loomGroup = new THREE.Group();

    // Side Posts
    const postGeo = new THREE.BoxGeometry(0.3, 5, 0.3);
    const leftPost = new THREE.Mesh(postGeo, woodMat);
    leftPost.position.set(-3.2, 1, 0);
    loomGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, woodMat);
    rightPost.position.set(3.2, 1, 0);
    loomGroup.add(rightPost);

    // Cross Beams
    const beamGeo = new THREE.BoxGeometry(6.7, 0.3, 0.3);
    const topBeam = new THREE.Mesh(beamGeo, woodMat);
    topBeam.position.set(0, 3.4, 0);
    loomGroup.add(topBeam);

    const bottomBeam = new THREE.Mesh(beamGeo, woodMat);
    bottomBeam.position.set(0, -1.4, 0);
    loomGroup.add(bottomBeam);

    // Roller Cylinders
    const rollerGeo = new THREE.CylinderGeometry(0.2, 0.2, 6.2, 16);
    rollerGeo.rotateZ(Math.PI / 2);
    const topRoller = new THREE.Mesh(rollerGeo, woodMat);
    topRoller.position.set(0, 3.0, 0);
    loomGroup.add(topRoller);

    const bottomRoller = new THREE.Mesh(rollerGeo, woodMat);
    bottomRoller.position.set(0, -1.0, 0);
    loomGroup.add(bottomRoller);

    scene.add(loomGroup);

    // 5. WARP THREADS (GOLDEN SILK)
    const warpLinesGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const warpCount = 42;
    for (let i = 0; i < warpCount; i++) {
      const x = -2.6 + (i / (warpCount - 1)) * 5.2;
      linePositions.push(x, 3.0, 0.05);
      linePositions.push(x, -1.0, 0.05);
    }
    warpLinesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const warpMat = new THREE.LineBasicMaterial({ color: 0xd97706, opacity: 0.6, transparent: true });
    const warpLines = new THREE.LineSegments(warpLinesGeo, warpMat);
    scene.add(warpLines);

    // 6. PROCEDURAL CLOTH MESH
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    clothCanvasRef.current = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    clothTextureRef.current = texture;

    const clothGeo = new THREE.PlaneGeometry(5.2, 4.0);
    const clothMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const clothMesh = new THREE.Mesh(clothGeo, clothMat);
    clothMesh.position.set(0, 1.0, 0.06);
    scene.add(clothMesh);
    clothMeshRef.current = clothMesh;

    // 7. 3D WOODEN SHUTTLE (MAKU)
    const shuttleGroup = new THREE.Group();
    const shuttleBodyGeo = new THREE.ConeGeometry(0.22, 1.8, 8);
    shuttleBodyGeo.rotateZ(Math.PI / 2);
    const shuttleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, metalness: 0.3, roughness: 0.4 });
    const shuttleBody = new THREE.Mesh(shuttleBodyGeo, shuttleMat);
    shuttleGroup.add(shuttleBody);

    // Thread spool inside shuttle
    const spoolGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
    spoolGeo.rotateZ(Math.PI / 2);
    const spoolMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const spool = new THREE.Mesh(spoolGeo, spoolMat);
    shuttleGroup.add(spool);

    shuttleGroup.position.set(0, 0.4, 0.25);
    scene.add(shuttleGroup);
    shuttleMeshRef.current = shuttleGroup;

    // 8. ANIMATION LOOP
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth shuttle sliding towards shuttlePosition
      if (shuttleMeshRef.current) {
        const targetX = shuttlePosition * 2.3;
        shuttleMeshRef.current.position.x += (targetX - shuttleMeshRef.current.position.x) * 0.14;
        shuttleMeshRef.current.rotation.x = Math.sin(time * 3) * 0.08;
      }

      // Gentle camera breath
      camera.position.x = Math.sin(time * 0.4) * 0.15;
      camera.position.y = 4.5 + Math.cos(time * 0.5) * 0.08;
      camera.lookAt(0, 0.5, 0);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 9. RESIZE LISTENER
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
  }, [shuttlePosition]);

  return (
    <div
      ref={mountRef}
      onClick={onShuttlePass}
      className="relative w-full aspect-[4/3] max-h-[440px] rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_#000] cursor-pointer select-none bg-[#1A1612]"
    />
  );
}
